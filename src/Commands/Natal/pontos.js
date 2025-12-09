const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class PontosCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'pontos';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja seu saldo de Meias Natalinas! 🎄';
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
        const userData = await this.client.database.users.findOne({ idU: message.author.id });

        const pontos = userData?.evento?.moeda1 || 0;
        const trocas = userData?.evento?.trocas || 0;

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('<:christmassock:1447757955415150743> Suas Meias Natalinas')
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription(
                `<:christmassock:1447757955415150743> **Meias Natalinas:** \`${pontos}\`\n` +
                `<:shop:1447715924982370497> **Trocas realizadas:** \`${trocas}\`\n\n` +
                `-# Use \`/lojinha\` para trocar seus pontos por itens!`
            )
            .setFooter({ text: `Evento de Natal Kosame 2025` });

        await message.reply({ embeds: [embed] });
    }
};
