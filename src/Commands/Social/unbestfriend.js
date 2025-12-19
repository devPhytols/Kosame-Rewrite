const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class UnbestfriendCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'unbestfriend';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Coloque um fim em sua amizade com seu melhor amigo.';
        this.aliases = ['unbf'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message }) {
        const doc = await this.client.database.users.findOne({ idU: message.author.id });

        if (!doc.bestfriend.has)
            return message.reply({ content: `${message.author} você não possui um(a) melhor amigo(a)!` });

        const par = await this.client.users.fetch(doc.bestfriend.user);

        // Container do pedido
        const container = new ContainerBuilder()
            .setAccentColor(0xf8bc07)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:ksm_triste:1451365725234003968> Desfazer Amizade')
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${message.author.tag}**, você quer acabar sua amizade com **\`${par.tag}\`**?`)
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_unbf')
                        .setEmoji('<:ksm_certo:1089754956321542234>')
                        .setLabel('Confirmar')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('cancel_unbf')
                        .setEmoji('<:ksm_errado:1089754955256176701>')
                        .setLabel('Cancelar')
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        const msg = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (interaction) => interaction.user.id === message.author.id,
            time: 15000
        });

        collector.on('collect', async (interaction) => {
            try {
                if (interaction.customId === 'confirm_unbf') {
                    collector.stop('confirmed');

                    // Container de confirmação
                    const confirmContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:ksm_triste:1451365725234003968> Amizade Desfeita')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${message.author.tag}** não quer mais ser melhor amigo(a) de **${par.tag}**.\n\n-# A amizade chegou ao fim.`)
                        );

                    await interaction.update({
                        components: [confirmContainer],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // Atualiza banco de dados
                    await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                        $set: { 'bestfriend.user': 'null', 'bestfriend.has': false, 'bestfriend.time': 0 }
                    });
                    await this.client.database.users.findOneAndUpdate({ idU: doc.bestfriend.user }, {
                        $set: { 'bestfriend.user': 'null', 'bestfriend.has': false, 'bestfriend.time': 0 }
                    });

                } else if (interaction.customId === 'cancel_unbf') {
                    collector.stop('cancelled');

                    // Container de cancelamento
                    const cancelContainer = new ContainerBuilder()
                        .setAccentColor(0x57F187)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:ksm_soquinho:1451365035468263640> Amizade Mantida')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${message.author.tag}** decidiu continuar sendo melhor amigo(a) de **${par.tag}**.\n\n-# A amizade prevaleceu! <:ksm_feliz:1451368376168616007>`)
                        );

                    await interaction.update({
                        components: [cancelContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch {
                // Ignora erros de API
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                try {
                    const timeoutContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:sandclock:1447764508235005994> Tempo Esgotado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('O tempo para confirmar acabou.\n\n-# O pedido foi cancelado.')
                        );

                    await msg.edit({
                        components: [timeoutContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch { }
            }
        });
    }
};
