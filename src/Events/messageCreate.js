/* eslint-disable prefer-const */
const { Event } = require('../Structures/Structures.js');
const { ClientEmbed } = require('../Structures/ClientEmbed.js');
const { Collection, PermissionFlagsBits, WebhookClient } = require('discord.js');
const moment = require('moment');
const coldoownGuild = new Set();

module.exports = class messageCreateEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'messageCreate';
    }

    async execute(message) {
        moment.locale('pt-BR');

        try {
            if (message.author.bot || !message.guild) return;
            if (message.guild.id !== '1447705346586968186') return;

            const server = await this.client.getData(message.guild.id, 'guild');
            const user = await this.client.getData(message.author.id, 'user');
            const client = await this.client.getData(this.client.user.id, 'client');
            const prefix = server.prefix || 'k!';

            if (message.content.startsWith(prefix)) {
                const [name, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
                const command = this.client.commands.get(name) || this.client.commands.find((command) => command.aliases && command.aliases.includes(name));

                if (command) {
                    //===============> Cooldowns <===============//

                    if (!this.client.cooldowns.has(command.name)) {
                        this.client.cooldowns.set(command.name, new Collection());
                    }

                    //console.log(`Cooldown do Comando ${command.name}:`, command.cooldown || 2);
                    const now = Date.now();
                    const timestamps = this.client.cooldowns.get(command.name);
                    const cooldownAmount = ((command.cooldown || 7) * 1000) * (user.vip?.hasVip ? 0.5 : 1);

                    if (timestamps?.has(message.author.id)) {
                        const time = timestamps?.get(message.author.id);

                        if (time && now < time + cooldownAmount) {
                            const timeLeft = (time + cooldownAmount - now) / 1000;
                            return void message.reply({ content: `<:ksm_clock:1362577298468901027> Aguarde **${timeLeft.toFixed(1)} segundo(s)** para usar o comando **${command.name}** novamente. ${user.vip.hasVip ? '' : '\n-# <:ksm_alert:1362577294551552200> Você pode reduzir o tempo de espera se tornando [Membro VIP](https://kosame.site).'}` }).catch(() => undefined);
                        }
                    }

                    let cmdDb = await this.client.database.command.findOne({ _id: command.name });
                    if (!cmdDb) {
                        cmdDb = await new this.client.database.command({ _id: command.name }).save();
                        this.client.logger.success(`O comando: (${command.name}) foi cadastrado com sucesso!`, 'Comando');
                    }

                    if (coldoownGuild.has(message.guild.id)) {
                        return message.reply(`<:ksm_eita:1367974827868033106> **Eii** ${message.author}, notei um pequeno fluxo de uso nesse servidor!\n-# ㅤ<:ksm_set0:1367969325356683325> Você já pode utilizar o comando novamente.`);
                    }

                    if (!['848662735357083698', '429679606946201600', '955460764720828426', '918536794167980032', '236651138747727872', '202938550360997888'].includes(message.author.id)) {
                        if (client.manutenção) {
                            return message.reply(`<:ksm_man:1367969327155777627> **Olá** ${message.author}, estou passando por uma pequena atualização!\n-# ㅤ<:ksm_set0:1367969325356683325> Tente utilizar novamente em alguns minutos...`);
                        }

                        if (cmdDb.manutenção) {
                            return message.reply(`<:kosame_outage:1089663591050903612> **Olá** ${message.author}, o comando **${command.name}** está sendo atualizado!\n-# ㅤ<:ksm_set0:1367969325356683325> Tente utilizar novamente em alguns minutos...`);
                        }
                    }

                    if (client.blacklist.some((x) => x == message.author.id)) {
                        return message.reply(`<:ksm_banned:1367976072141996132> **Vish** ${message.author}... acho que você está **banido**, provavelmente tentou trapacear de alguma forma!\n-# ㅤ<:ksm_set0:1367969325356683325> Você pode saber mais [clicando aqui](https://kosame.site).`);
                    }

                    if (client.Sban.some((x) => x == message.guild.id)) {
                        return message.reply(`${message.author}, esse servidor está **\`banido\`** de meu sistema, provavelmente foi utilizado para cometer algum ato que vai contra as minhas diretrizes de uso, caso deseje uma revogação do banimento, visite o meu servidor: https://discord.gg/THS6HBgPzr`);
                    }

                    const commandBlock = await server.cmdblock;

                    if (commandBlock.status) {
                        if (!commandBlock.cmds.some((x) => x === command.name)) {
                            if (!commandBlock.channels.some((x) => x === message.channel.id)) {
                                if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                    return message.reply(commandBlock.msg).then((msg) => {
                                        setTimeout(() => msg.delete(), 3000);
                                    }).catch(() => { });
                                }
                            }
                        }
                    }

                    if (!this.client.developers.includes(message.author.id) && !this.client.team.includes(message.author.id)) {
                        timestamps?.set(message.author.id, now);
                        setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
                    }

                    await message.channel.sendTyping();

                    // Execução:
                    const commandExecute = new Promise((resolve, reject) => {
                        try {
                            resolve(command.commandExecute({ message, args, prefix }));
                        } catch (err) {
                            reject(err);
                        }
                    });

                    commandExecute.then(() => {
                        new (require('../Modules/xpModule.js'))(this.client).execute(message, user, server, command);
                    });

                    // Erro no comando:
                    commandExecute.catch(async (err) => {
                        this.client.logger.error(err.message, command.name);
                        this.client.logger.warn(err.stack, command.name);

                        const webhookClient = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/1380648184753160304/_FoQgTbraSHwys5KygL_ohH22ZSvUJWZaZ0r6BtOeB9GQwmE_MifqJLuJT-hqvizZ7S_' });

                        const invites = await message.guild.invites.fetch();
                        const invite = invites.first()

                        const errorEmbed = new ClientEmbed()
                            .setAuthor({ name: 'Log - Erros', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(`**Comando:** \`${command.name}\`\n**Servidor:** \`${message.guild.name}\` \`(${message.guild.id})\`\n**Convite:** ${invite.url}`)
                            .addFields({ name: 'Erro:', value: '```js\n' + err.stack + '\n```' });

                        await webhookClient.send({ embeds: [errorEmbed] }).catch(() => { });

                        return message.reply({
                            content: `${message.author}, ocorreu um erro ao executar o comando \`${command.name}\`, a equipe de desenvolvedores já está ciente do problema, aguarde alguns minutos para poder utilizar o comando novamente.`
                        }).then((msg) => setTimeout(() => msg.delete().catch(() => { }), 1000 * 10));
                    });

                    if (!['429679606946201600', '918536794167980032', '202938550360997888', '420728110326218755', '588058949211783184'].includes(message.author.id)) {
                        coldoownGuild.add(message.guild.id);

                        setTimeout(() => {
                            coldoownGuild.delete(message.guild.id);
                        }, 700);
                    }

                }
            }

            //===============> Módulos <===============//

            //===============> AFK:
            new (require('../Modules/afkModule.js'))(this.client).execute(message, user);

            //===============> Anti-Invites:
            new (require('../Modules/inviteModule.js'))(this.client).execute(message, server);

        } catch (err) {
            this.client.logger.error(err.message, messageCreateEvent.name);
            return this.client.logger.warn(err.stack, messageCreateEvent.name);
        }
    }
};
