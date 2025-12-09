const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const axios = require('axios');

module.exports = class KissCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'kiss';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Envie um beijo para alguém.';
        this.aliases = ['beijar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja beijar.',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {User[]} args 
     */
    async commandExecute({ message, args }) {
        const target =
            this.client.users.cache.get(args[0]) ||
            message.mentions?.users?.first();

        if (!target) {
            return message.reply({
                content: 'Você precisa mencionar alguém para beijar!',
                ephemeral: true
            });
        }

        if (target.id === message.author.id) {
            return message.reply({
                content: 'Você não pode beijar a si mesmo!',
                ephemeral: true
            });
        }

        // Puxa a imagem da API
        let imageUrl;
        try {
            const response = await axios.get('https://nekos.life/api/v2/img/kiss'); // Exemplo de API
            imageUrl = response.data.url;
        } catch (error) {
            console.error('Erro ao buscar imagem:', error);
            return message.reply({
                content: 'Houve um erro ao tentar buscar uma imagem de beijo. Tente novamente mais tarde.',
                ephemeral: true
            });
        }

        const embed = new ClientEmbed()
            .setColor('#ff69b4')
            .setDescription(`${message.author} deu um beijo em ${target}!`)
            .setImage(imageUrl)
            .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('retaliate')
                .setLabel('Retribuir')
                .setEmoji('<:ksmame:1313858214122754140>')
                .setStyle(ButtonStyle.Secondary)
        );

        const reply = await message.reply({
            content: `${target}`,
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        // Coletor de interação para o botão "Revidar"
        const collector = reply.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== target.id) {
                return interaction.reply({ content: `Eii ${interaction.user}, apenas ${target} pode revidar isso!`, ephemeral: true });
            }

            let retaliateImageUrl;
            try {
                const response = await axios.get('https://nekos.life/api/v2/img/kiss');
                retaliateImageUrl = response.data.url;
            } catch (error) {
                console.error('Erro ao buscar imagem de revidar:', error);
                return interaction.reply({
                    content: 'Houve um erro ao tentar buscar uma imagem de revidar.',
                    ephemeral: true
                });
            }

            const retaliateEmbed = new ClientEmbed()
                .setColor('#ff69b4')
                .setDescription(`${target} retribuiu o beijo de ${message.author}!`)
                .setImage(retaliateImageUrl)
                .setFooter({ text: `Retribuido por ${target.tag}`, iconURL: target.displayAvatarURL(() => ({ dynamic: true })) });

            await interaction.reply({ embeds: [retaliateEmbed] });
            row.components[0].setDisabled(true);
            reply.edit({ components: [row] });
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            reply.edit({ components: [row] });
        });
    }
};
