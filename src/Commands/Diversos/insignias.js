const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { InsigniaTypes } = require('../../Utils/Objects/InsigniaTypes');

module.exports = class InsigniasCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'insignias';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja e gerencie o seu inventário de insignias.';
        this.aliases = ['insignits'];
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {User[]} args 
     */
    async commandExecute({ message }) {
        const user = await this.client.database.users.findOne({ idU: message.author.id });
        const totalInsignias = user.insignias.length;
        if (totalInsignias <= 0) {
            return message.reply({ content: 'Você atualmente não possui nenhuma insignia personalizada!', ephemeral: true });
        }

        // ===> Cria a embed inicial <=== //
        const embed = new ClientEmbed()
            .setColor('#bb63f3')
            .setTitle('Gerenciamento de Insígnias')
            .setDescription(`> Bem-Vindo(a) ao seu inventário de Insignias, rápido e prático. para começar você pode conferir algumas informações abaixo e configurar em tempo real o seu inventário!\n\n<a:setinha:1013543431085240371> Você possui um total de **${totalInsignias}** insígnias.`)
            .addFields(
                { name: '<:ksm_okk:1316584887364616264> Insígnias Equipadas:', value: user.equippedInsignias.length ? user.equippedInsignias.map(code => `• ${InsigniaTypes[code].name}`).join('\n') : 'Nenhuma.' },
                { name: '<:ksm_wait:1316584577384583258> Insígnias Disponíveis:', value: user.insignias.length ? user.insignias.map(code => `• ${InsigniaTypes[code]?.name || 'Desconhecida'}`).join('\n') : 'Nenhuma.' }
            )
            .setThumbnail('https://i.imgur.com/3S8QmB8.png');

        // ===> Cria o menu de seleção para equipar/desequipar <=== //
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('manage-insignias')
            .setPlaceholder('Selecione uma insígnia')
            .addOptions(
                user.insignias.map(code => ({
                    label: InsigniaTypes[code]?.name || 'Insígnia Desconhecida',
                    description: InsigniaTypes[code]?.description || 'Sem descrição.',
                    value: code
                }))
            );
        const row = new ActionRowBuilder().addComponents(selectMenu);
        const msg = await message.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });
        // ===> Cria o coletor de interações <=== //
        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id && i.customId === 'manage-insignias',
            time: 60000
        });
        collector.on('collect', async (menuInteraction) => {
            if (menuInteraction.user.id !== message.author.id) {
                return menuInteraction.reply({
                    content: `Eii ${menuInteraction.user}, essa interação não é sua!`,
                    ephemeral: true
                });
            }

            const uSrc = await this.client.database.users.findOne({ idU: message.author.id });
            const selectedCode = menuInteraction.values[0];

            if (!uSrc.insignias.includes(selectedCode)) {
                return menuInteraction.reply({
                    content: 'Você não possui essa insígnia para equipá-la!',
                    ephemeral: true
                });
            }

            // ===> Verifica se a insígnia está equipada <=== //
            const isEquipped = uSrc.equippedInsignias.includes(selectedCode);
            if (isEquipped) {
                // ===> Desequipe a insígnia <=== //
                uSrc.equippedInsignias = uSrc.equippedInsignias.filter(code => code !== selectedCode);
                await menuInteraction.reply({
                    content: `Você desequipou a insígnia **${InsigniaTypes[selectedCode].name}**.`,
                    ephemeral: true
                });
            } else {
                // ===> Verifica se já possui 4 insígnias equipadas  <=== //
                if (uSrc.equippedInsignias.length >= 3) {
                    return menuInteraction.reply({
                        content: 'Você só pode equipar até 3 insígnias.',
                        ephemeral: true
                    });
                }
                // ===> Equipa a insígnia  <=== //
                uSrc.equippedInsignias.push(selectedCode);
                await menuInteraction.reply({
                    content: `Você equipou a insígnia **${InsigniaTypes[selectedCode].name}**.`,
                    ephemeral: true
                });
            }
            // ===> Salva as alterações no banco de dados <=== //
            await uSrc.save();
            // ===> Atualiza a embed  <=== //
            const updatedEmbed = new ClientEmbed()
                .setColor('#bb63f3')
                .setTitle('Gerenciamento de Insígnias')
                .setDescription(`> Bem-Vindo(a) ao seu inventário de Insignias, rápido e prático. para começar você pode conferir algumas informações abaixo e configurar em tempo real o seu inventário!\n\n<a:setinha:1013543431085240371> Você possui um total de **${totalInsignias}** insígnias.`)
                .addFields(
                    { name: '<:ksm_okk:1316584887364616264> Insígnias Equipadas:', value: uSrc.equippedInsignias.length ? uSrc.equippedInsignias.map(code => `• ${InsigniaTypes[code].name}`).join('\n') : 'Nenhuma.' },
                    { name: '<:ksm_wait:1316584577384583258> Insígnias Disponíveis:', value: uSrc.insignias.length ? uSrc.insignias.map(code => `• ${InsigniaTypes[code]?.name || 'Desconhecida'}`).join('\n') : 'Nenhuma.' }
                )
                .setThumbnail('https://i.imgur.com/3S8QmB8.png');

            await msg.edit({
                embeds: [updatedEmbed]
            });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};