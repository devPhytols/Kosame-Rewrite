const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util');
require('moment-duration-format');

module.exports = class TransacoesCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'transacoes';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja o histórico de transações de um usuário.';
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message, args }) {
        // Obtém o usuário (mencionado, por ID, ou o autor da mensagem)
        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        if (!user) {
            return message.reply({ content: '<:ksm_errado:1089754955256176701> Usuário não encontrado.', ephemeral: true });
        }

        // Busca os dados do usuário no banco de dados
        const userm = await this.client.database.users.findOne({ idU: user.id });
        if (!userm || userm.transfers.length === 0) {
            return message.reply({ content: '<:ksm_errado:1089754955256176701> Você não tem nenhuma transferência registrada.', ephemeral: true });
        }

        // Configurações do paginador
        const itemsPerPage = 5;
        const totalPages = Math.ceil(userm.transfers.length / itemsPerPage);
        let currentPage = 0;

        // Função para gerar o embed da página atual
        const generateEmbed = async (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const transfersToShow = userm.transfers.slice(start, end);

            const embed = new ClientEmbed() // Usando ClientEmbed
                .setColor('#edb021')
                .setTitle(`Últimas transferências de ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ extension: 'jpg', size: 2048 }))
                .setFooter({
                    text: `Página ${page + 1}/${totalPages} • Total de Transações: ${userm.transfers.length}`,
                    iconURL: user.displayAvatarURL(() => ({ dynamic: true }))
                });

            const promises = transfersToShow.map(async (transfer) => {
                const transferDate = new Date(transfer.date).toLocaleString('pt-BR');
                const [sender, receiver] = await Promise.all([
                    this.client.users.fetch(transfer.sender).catch(() => ({ tag: 'Usuário Desconhecido' })),
                    this.client.users.fetch(transfer.receiver).catch(() => ({ tag: 'Usuário Desconhecido' }))
                ]);

                // Verifica se o usuário enviou ou recebeu
                let actionText;
                let targetUser;
                if (transfer.sender === user.id) {
                    actionText = 'enviou';
                    targetUser = receiver.tag;
                } else if (transfer.receiver === user.id) {
                    actionText = 'recebeu';
                    targetUser = sender.tag;
                } else {
                    // Caso o usuário não seja nem o sender nem o receiver (improvável, mas para segurança)
                    actionText = 'enviou';
                    targetUser = receiver.tag;
                }

                // Ajusta a preposição (para/de)
                const preposition = actionText === 'enviou' ? 'para' : 'de';

                return {
                    name: `[${transferDate}]`,
                    value: `${actionText === 'enviou' ? '<:lose:1012117476328357988> ' : '<:win:1012117489968234596> '} **${actionText}** <:coins_k:1095790508363743392> **${Util.toAbbrev(transfer.amount)}** ${preposition} \`${targetUser}\``,
                    inline: false
                };
            });

            const fields = await Promise.all(promises);
            embed.addFields(fields);

            return embed;
        };

        // Cria os botões de navegação
        const row = new ActionRowBuilder()
            .addComponents(
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

        // Envia a primeira página
        const embed = await generateEmbed(currentPage);
        const reply = await message.reply({ embeds: [embed], components: [row] });

        // Configura o coletor de interações
        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {

            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: `${interaction.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }

            if (interaction.customId === 'previous') {
                currentPage--;
            } else if (interaction.customId === 'next') {
                currentPage++;
            }

            // Atualiza os botões
            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === totalPages - 1);

            // Gera o embed da nova página
            const newEmbed = await generateEmbed(currentPage);
            await interaction.update({ embeds: [newEmbed], components: [row] });
        });

        collector.on('end', () => {
            // Desativa os botões quando o coletor expira
            row.components.forEach(button => button.setDisabled(true));
            reply.edit({ components: [row] });
        });
    }
};