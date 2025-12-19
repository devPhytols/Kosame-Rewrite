const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class DivorceCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'divorce';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Se divorcie do seu companheiro na Kosame.';
        this.aliases = ['divorcio', 'divorciar'];
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

        if (!doc.marry.has)
            return message.reply({ content: `${message.author}, você não está casado.` });

        const par = await this.client.users.fetch(doc.marry.user);

        // Container do pedido de divórcio
        const container = new ContainerBuilder()
            .setAccentColor(0xFF4B4E)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# 💔 Pedido de Divórcio')
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${message.author.tag}**, você quer se divorciar de **\`${par.tag}\`**?`)
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_divorce')
                        .setLabel('Confirmar')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_divorce')
                        .setLabel('Cancelar')
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        const prompt = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = prompt.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000,
            filter: (interaction) => interaction.user.id === message.author.id
        });

        collector.on('collect', async (interaction) => {
            try {
                if (interaction.customId === 'confirm_divorce') {
                    collector.stop('confirmed');

                    // Container de confirmação
                    const confirmContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# 💔 Divórcio Realizado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${message.author.tag}** se divorciou de **${par.tag}**.\n\n-# O casamento chegou ao fim.`)
                        );

                    await interaction.update({
                        components: [confirmContainer],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // Atualiza banco de dados
                    await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                        $set: { 'marry.user': 'null', 'marry.has': false, 'marry.time': 0 }
                    });
                    await this.client.database.users.findOneAndUpdate({ idU: doc.marry.user }, {
                        $set: { 'marry.user': 'null', 'marry.has': false, 'marry.time': 0 }
                    });

                } else if (interaction.customId === 'cancel_divorce') {
                    collector.stop('cancelled');

                    // Container de cancelamento
                    const cancelContainer = new ContainerBuilder()
                        .setAccentColor(0x57F187)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# ✅ Divórcio Cancelado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${message.author.tag}** decidiu continuar casado com **${par.tag}**.\n\n-# O amor prevaleceu! 💕`)
                        );

                    await interaction.update({
                        components: [cancelContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch {
                // Ignora erros de API temporários
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                try {
                    const timeoutContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# ⏰ Tempo Esgotado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('O tempo para confirmar o divórcio acabou.\n\n-# O pedido foi cancelado.')
                        );

                    await prompt.edit({
                        components: [timeoutContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch { }
            }
        });
    }
};
