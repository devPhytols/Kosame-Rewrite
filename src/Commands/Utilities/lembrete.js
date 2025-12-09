const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures.js');
const ms = require('ms');

module.exports = class lembreteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'lembrete';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Lembra de fazer algo daqui determinado tempo.';
        this.config = {
            devOnly: false,
            registerSlash: true,
            args: false
        };
        this.options = [
            {
                name: 'lembrete',
                description: 'Lembrar de:',
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {
        const userDb = await this.client.database.users.findOne({ idU: message.author.id });
        const reminder = args.join(' ');


        // if (message.author.id !== '236651138747727872') {
        //     return message.reply({ content: 'Esse comando está passando por uma atualização, tente novamente em alguns minutos!' });
        // }

        if (!args[0]) {
            const activeCount = userDb?.reminder?.myReminders?.length || 0;
            const embed = new ClientEmbed()
                .setColor('#ffffff')
                .setAuthor({ name: `Meus Lembretes - ${message.author.username}`, iconURL: message.guild.iconURL({ extension: 'png', size: 4096 }) })
                .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }))
                .setDescription('# <:reason:851589756289548308> Como funciona?\n-# <:ksm_set0:1367969325356683325> Utilize **k!lembrete <seu lembrete>** para agendar um lembrete para seus afazeres, após isso o bot irá perguntar para você todas as informações restantes.\n\n')
                .setFields(
                    {
                        name: '<:ksm_date:1426764386315272223> **Gerenciar seus lembretes**',
                        value: `\n- Você possui **${activeCount}** lembrete(s) ativo(s).\n-# Selecione uma das opções abaixo para continuar:`
                    }
                );

            const menu = new StringSelectMenuBuilder()
                .setCustomId('reminder')
                .setPlaceholder('🗒️・Selecione uma função:')
                .setOptions(
                    {
                        label: 'Lembretes ativos',
                        description: 'Exibe os seus lembretes ativos:',
                        emoji: '1371599117872005187',
                        value: 'reminders'
                    },
                    {
                        label: 'Remover lembrete',
                        description: 'Remove um dos lembretes ativos:',
                        emoji: '1391904712886059028',
                        value: 'remove'
                    });

            const row = new ActionRowBuilder().addComponents(menu);
            const msg = await message.reply({ embeds: [embed], components: [row], fetchReply: true });
            const filter = (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }

                return i.isStringSelectMenu() && i.message.id === msg.id;
            };
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 5, errors: ['time'] });

            collector.on('end', () => {
                msg.delete();
            });

            collector.on('collect', async (i) => {
                const list = userDb.reminder.myReminders;

                if (i.values[0] === 'reminders') {
                    if (!list.length) {
                        return i.reply({ content: `${message.author}, você não possui nenhum lembrete ativo.`, ephemeral: true });
                    } else {
                        const lembretes = list
                            .sort((x, y) => x.time - y.time)
                            .map((x, idx) => {
                                const when = Math.floor(x.time / 1000);
                                const text = x.reminder?.length > 50 ? x.reminder.slice(0, 50) + '...' : x.reminder;
                                const where = userDb.reminder.isDm ? 'DM' : `<#${x.channel}>`;
                                return `**${idx + 1}.** ${text} — ${where}\n<t:${when}:f> (<t:${when}:R>)`;
                            })
                            .join('\n\n');

                        const embedReminders = new ClientEmbed()
                            .setColor('#fa9d46')
                            .setAuthor({ name: `Seus Lembretes - ${i.user.tag}`, iconURL: i.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(lembretes)
                            .setFooter({ text: `Total: ${list.length} • Próximo: ${list.length ? new Date(list.sort((a,b)=>a.time-b.time)[0].time).toLocaleString() : '—'}` });

                        return i.reply({ embeds: [embedReminders], ephemeral: true });
                    }
                }

                if (i.values[0] === 'remove') {
                    if (!list.length) {
                        return i.reply({ content: `${message.author}, você não possui nenhum lembrete ativo.`, ephemeral: true });
                    } else {
                        const mapList = list.sort((x, y) => x.time - y.time).map((x) => x);

                        const listMenu = new StringSelectMenuBuilder()
                            .setCustomId('listMenu')
                            .setPlaceholder('🗒️・Selecione o ID do lembrete:')
                            .addOptions(
                                {
                                    label: 'Cancelar',
                                    description: 'Cancela a operação.',
                                    emoji: '❌',
                                    value: 'cancel'
                                }
                            );

                        mapList.forEach((x, i) => {
                            listMenu.addOptions({ label: `ID: ${i + 1}`, description: `Lembrete: ${x.reminder}`, value: String(i + 1), emoji: this.client.util.counter(i + 1) });
                        });

                        const listRow = new ActionRowBuilder().addComponents(listMenu);
                        const listMsg = await i.reply({ components: [listRow], ephemeral: true, fetchReply: true });
                        const filterList = (i) => {
                            if (i.user.id !== message.author.id) {
                                return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                            }

                            return i.isStringSelectMenu() && i.message.id === listMsg.id;
                        };
                        const listCollector = listMsg.createMessageComponentCollector({ filter: filterList, time: 60000 * 5, errors: ['time'] });

                        listCollector.on('end', (c, r) => {
                            if (c.size === 0 && r === 'time') {
                                listMsg.delete();
                            }
                        });

                        listCollector.on('collect', async (i) => {
                            listMenu.setDisabled(true);
                            await i.update({ components: [listRow] });

                            if (i.values[0] === 'cancel') {
                                return i.followUp({ content: 'Operação cancelada com sucesso!', ephemeral: true });
                            } else {
                                const lembreteId = parseInt(i.values[0] - 1);

                                i.followUp({ content: `${message.author}, lembrete removido com sucesso.\nID: **${i.values[0]}** ( \`${list[lembreteId].reminder}\` )`, ephemeral: true });

                                userDb.reminder.myReminders.pull(userDb.reminder.myReminders.find((f) => f.time == list[lembreteId].time));
                                userDb.save();
                            }
                        });
                    }
                }
            });
        } else {
            const timeMessage = await message.reply({ content: `${message.author}, agora digite o tempo que deseja que eu te lembre do lembrete.`, fetchReply: true });
            const collector = message.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, time: 60000 * 5, max: 1 });

            collector.on('end', () => {
                timeMessage.delete();
            });

            collector.on('collect', async (msg) => {
                if (['cancelar'].includes(msg.content.toLowerCase())) {
                    return msg.reply({ content: `${message.author}, lembrete cancelado com sucesso.` });
                } else {
                    const content = msg.content;

                    if (!ms(content)) {
                        return msg.reply(`${message.author}, o tempo inserido é inválido.`);
                    }

                    const dmButton = new ButtonBuilder()
                        .setCustomId('dm')
                        .setStyle('Secondary')
                        .setLabel('Privado')
                        .setEmoji('<:directmessages:1042895775211982938>');

                    const chatButton = new ButtonBuilder()
                        .setCustomId('chat')
                        .setStyle('Secondary')
                        .setLabel('Chat')
                        .setEmoji('<:chat:1042895773580398682>');

                    const cancelButton = new ButtonBuilder()
                        .setCustomId('cancel')
                        .setStyle('Secondary')
                        .setLabel('Cancelar')
                        .setEmoji('<:cancel:1042903400045613176>');

                    const buttonRow = new ActionRowBuilder().addComponents(dmButton, chatButton, cancelButton);
                    const buttonMsg = await msg.reply({ content: `${msg.author}, onde você deseja que eu lhe informe sobre o lembrete?`, components: [buttonRow], fetchReply: true });
                    const buttonFilter = (i) => {
                        if (i.user.id !== message.author.id) {
                            return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                        }

                        return i.isButton() && i.message.id === buttonMsg.id;
                    };
                    const buttonCollector = message.channel.createMessageComponentCollector({ filter: buttonFilter, time: 60000 * 5, errors: ['time'], max: 1 });

                    buttonCollector.on('end', (c) => {
                        if (c.size === 0) {
                            const components = [dmButton, chatButton];

                            components.forEach((x) => x.setDisabled(true));
                            buttonMsg.edit({ components: [buttonRow] });
                        }
                    });

                    buttonCollector.on('collect', (i) => {
                        const tempo = ms(content) + Date.now();

                        const embed = new ClientEmbed()
                            .setColor('#fa9d46')
                            .setTitle('<a:lembrete:1042905549651579030> Novo lembrete!')
                            .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                            .setDescription(`${message.author}, o seu lembrete foi adicionado a lista com sucesso!`)
                            .addFields(
                                {
                                    name: 'Lembrete:',
                                    value: `\`${reminder}\``,
                                    inline: true
                                },
                                {
                                    name: 'Tempo:',
                                    value: `<t:${Math.floor(tempo / 1000)}:f> (<t:${Math.floor(tempo / 1000)}:R>)`,
                                    inline: true
                                });

                        if (i.customId === 'cancel') {
                            buttonMsg.delete();
                            return i.reply({ content: 'Operação cancelada com sucesso.', ephemeral: true });
                        }

                        if (i.customId === 'dm') {
                            userDb.reminder.myReminders.push({
                                reminder: reminder,
                                time: tempo,
                                channel: message.channel.id
                            });
                            userDb.reminder.isDm = true;
                            userDb.save();

                            buttonMsg.delete();
                            embed.addFields({ name: 'Entrega:', value: 'Via privado (DM)', inline: true });
                            return i.reply({ content: 'Ok, irei avisa-lo \`via privado\`, lembre-se de ativar as mensagens diretas para que eu possa informá-lo.', embeds: [embed], ephemeral: true });
                        }

                        if (i.customId === 'chat') {
                            userDb.reminder.myReminders.push({
                                reminder: reminder,
                                time: tempo,
                                channel: message.channel.id
                            });
                            userDb.reminder.isDm = false;
                            userDb.save();

                            buttonMsg.delete();
                            embed.addFields({ name: 'Entrega:', value: `Canal: <#${message.channel.id}>`, inline: true });
                            return i.reply({ content: 'Ok, irei avisa-lo \`via chat\`, te vejo em breve!', embeds: [embed], ephemeral: true });
                        }
                    });
                }
            });
        }
    }
};