const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class MarryCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'marry';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Inicie um matrimônio com outra pessoa na Kosame.';
        this.aliases = ['casar', 'casamento'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'A pessoa que será seu companheiro.',
                required: true,
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {User[]} args 
     */
    async commandExecute({ message, args }) {
        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        const doc = await this.client.database.users.findOne({ idU: message.author.id });

        if (doc.marry.has)
            return message.reply({ content: `${message.author}, você já está casado.` });

        if (!user)
            return message.reply({ content: `${message.author}, você deve mencionar com quem deseja casar.` });

        if (user.id === message.author.id)
            return message.reply({ content: `${message.author}, você não pode casar com você mesmo.` });

        const target = await this.client.database.users.findOne({ idU: user.id });

        if (!target)
            return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

        if (target.marry.has)
            return message.reply({ content: `${message.author}, o(a) membro(a) já está casado com o(a) **\`${await this.client.users.fetch(target.marry.user).then((x) => x.tag)}\`**.` });

        // Container do pedido de casamento
        const container = new ContainerBuilder()
            .setAccentColor(0xFF4B4E)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:ksmmarry:1451361735398133853> Pedido de Casamento')
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${message.author.tag}** convidou ${user} para um jantar romântico e o(a) pediu em casamento!\n\n-# ${user.tag}, você aceita?`)
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('marry_accept')
                        .setEmoji('<:ksm_certo:1089754956321542234>')
                        .setLabel('Aceitar')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('marry_decline')
                        .setEmoji('<:ksm_errado:1089754955256176701>')
                        .setLabel('Recusar')
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        const msg = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
            filter: (interaction) => interaction.user.id === user.id
        });

        collector.on('collect', async (interaction) => {
            try {
                if (interaction.customId === 'marry_accept') {
                    collector.stop('accepted');

                    // Container de aceito
                    const acceptContainer = new ContainerBuilder()
                        .setAccentColor(0xF55978)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:ksmmarry:1451361735398133853> Casamento Realizado!')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} aceitou o pedido de **${message.author.tag}**!\n\n💕 **Agora vocês estão casados!**\n-# Use \`k!status\` para ver informações do casal`)
                        );

                    await interaction.update({
                        components: [acceptContainer],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // Atualiza o banco de dados
                    await this.client.database.users.findOneAndUpdate(
                        { idU: message.author.id },
                        { $set: { 'marry.user': user.id, 'marry.has': true, 'marry.time': Date.now() } }
                    );
                    await this.client.database.users.findOneAndUpdate(
                        { idU: user.id },
                        { $set: { 'marry.user': message.author.id, 'marry.has': true, 'marry.time': Date.now() } }
                    );

                } else if (interaction.customId === 'marry_decline') {
                    collector.stop('declined');

                    // Container de recusado
                    const declineContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# 💔 Pedido Recusado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} recusou o pedido de casamento de **${message.author.tag}**.\n\n-# Talvez na próxima...`)
                        );

                    await interaction.update({
                        components: [declineContainer],
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
                    // Container de timeout
                    const timeoutContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# ⏰ Tempo Esgotado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} não respondeu ao pedido de casamento a tempo.\n\n-# O pedido expirou.`)
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