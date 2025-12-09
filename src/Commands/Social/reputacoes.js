const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures.js');
require('moment-duration-format');

module.exports = class ReputacoesCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'reputacoes';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja o histórico de reputações de um usuário.';
        this.aliases = ['reps'];
        this.config = { registerSlash: false };
        this.options = [];
    }

    async commandExecute({ message, args }) {
        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        if (!user) return message.reply({ content: 'Usuário não encontrado.', ephemeral: true });

        const userm = await this.client.database.users.findOne({ idU: user.id });
        if (!userm || !userm.reps?.history?.length) {
            return message.reply({ content: 'Você não tem nenhuma reputação registrada.', ephemeral: true });
        }

        const history = userm.reps.history.slice().reverse(); // últimos 20 ou menos, já limitado no rep command
        const itemsPerPage = 5;
        const totalPages = Math.ceil(history.length / itemsPerPage);
        let currentPage = 0;

        const generateEmbed = async (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const items = history.slice(start, end);

            const embed = new ClientEmbed()
                .setColor('#edb021')
                .setTitle(`Histórico de reputações de ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ extension: 'jpg', size: 2048 }))
                .setFooter({
                    text: `Página ${page + 1}/${totalPages} • Total de Reputações: ${userm.reps.size}`,
                    iconURL: user.displayAvatarURL(() => ({ dynamic: true }))
                });

            const fields = await Promise.all(items.map(async (rep) => {
                const sender = await this.client.users.fetch(rep.sender).catch(() => ({ tag: 'Usuário Desconhecido' }));
                const receiver = await this.client.users.fetch(rep.receiver).catch(() => ({ tag: 'Usuário Desconhecido' }));
                const date = new Date(rep.date).toLocaleString('pt-BR');

                // Define se o usuário enviou ou recebeu
                let actionText, targetUser, emoji;
                if (rep.sender === user.id) {
                    actionText = 'enviou';
                    targetUser = receiver.tag;
                    emoji = '<:lose:1012117476328357988>'; // emoji para "enviou"
                } else {
                    actionText = 'recebeu';
                    targetUser = sender.tag;
                    emoji = '<:win:1012117489968234596>'; // emoji para "recebeu"
                }

                const preposition = actionText === 'enviou' ? 'para' : 'de';

                return {
                    name: `[${date}]`,
                    value: `${emoji} **${actionText}** ${preposition} \`${targetUser}\``,
                    inline: false
                };
            }));

            embed.addFields(fields);
            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('<:kslanterior:1194481419028799599>')
                .setLabel('Anterior')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('<:kslproximo:1194481422287786057>')
                .setLabel('Próximo')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1)
        );

        const embed = await generateEmbed(currentPage);
        const reply = await message.reply({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'previous') currentPage--;
            else if (interaction.customId === 'next') currentPage++;

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === totalPages - 1);

            const newEmbed = await generateEmbed(currentPage);
            await interaction.update({ embeds: [newEmbed], components: [row] });
        });

        collector.on('end', () => {
            row.components.forEach(button => button.setDisabled(true));
            reply.edit({ components: [row] });
        });
    }
};
