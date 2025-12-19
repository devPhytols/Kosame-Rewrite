const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class BestfriendCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'bestfriend';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Torne-se melhor amigo(a) de alguém na Kosame.';
        this.aliases = ['bf'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'A pessoa que será seu melhor amigo(a).',
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

        if (doc.bestfriend.has)
            return message.reply({ content: `${message.author}, você já possui um melhor amigo.` });

        if (!user)
            return message.reply({ content: `${message.author}, você deve mencionar quem será seu melhor amigo.` });

        if (user.id === message.author.id)
            return message.reply({ content: `${message.author}, você não pode ser seu próprio melhor amigo.` });

        const target = await this.client.database.users.findOne({ idU: user.id });

        if (!target)
            return message.reply({ content: `${message.author}, este usuário não está registrado em minha database.` });

        if (target.bestfriend.has)
            return message.reply({ content: `${message.author}, o usuário já é melhor amigo de **\`${await this.client.users.fetch(target.bestfriend.user).then((x) => x.tag)}\`**.` });

        // Container do pedido de melhor amigo
        const container = new ContainerBuilder()
            .setAccentColor(0xf8bc07)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:ksm_soquinho:1451365035468263640> Pedido de Melhor Amigo')
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${message.author.tag}** pediu para ser melhor amigo(a) de ${user}!\n\n-# ${user.tag}, você aceita?`)
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('bf_accept')
                        .setEmoji('<:ksm_certo:1089754956321542234>')
                        .setLabel('Aceitar')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('bf_decline')
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
                if (interaction.customId === 'bf_accept') {
                    collector.stop('accepted');

                    // Container de aceito
                    const acceptContainer = new ContainerBuilder()
                        .setAccentColor(0xf8bc07)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:ksm_soquinho:1451365035468263640> Amizade Confirmada!')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} aceitou o pedido de **${message.author.tag}**!\n\n<:ksm_feliz:1451368376168616007> **Agora vocês são melhores amigos!**\n-# Use \`k!status\` para ver informações`)
                        );

                    await interaction.update({
                        components: [acceptContainer],
                        flags: MessageFlags.IsComponentsV2
                    });

                    // Atualiza o banco de dados
                    await this.client.database.users.findOneAndUpdate(
                        { idU: message.author.id },
                        { $set: { 'bestfriend.user': user.id, 'bestfriend.has': true, 'bestfriend.time': Date.now() } }
                    );
                    await this.client.database.users.findOneAndUpdate(
                        { idU: user.id },
                        { $set: { 'bestfriend.user': message.author.id, 'bestfriend.has': true, 'bestfriend.time': Date.now() } }
                    );

                } else if (interaction.customId === 'bf_decline') {
                    collector.stop('declined');

                    // Container de recusado
                    const declineContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:ksm_triste:1451365725234003968> Pedido Recusado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} recusou o pedido de melhor amigo de **${message.author.tag}**.\n\n-# Talvez na próxima...`)
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
                    const timeoutContainer = new ContainerBuilder()
                        .setAccentColor(0x808080)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:sandclock:1447764508235005994> Tempo Esgotado')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${user} não respondeu ao pedido a tempo.\n\n-# O pedido expirou.`)
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