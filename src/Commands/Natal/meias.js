const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class MeiasCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'meias';
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
    async commandExecute({ message, args }) {
        // Verifica se o evento está pausado
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        if (clientData?.eventoPausado) {
            return message.reply('❄️ O Evento de Natal está pausado no momento. Aguarde!');
        }

        let user = message.mentions?.users?.first() || await this.client.users.fetch(args[0] || message.author.id).catch(() => null);

        const userData = await this.client.database.users.findOne({ idU: user.id });

        const pontos = userData?.evento?.moeda1 || 0;
        const trocas = userData?.evento?.trocas || 0;

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setThumbnail(user.displayAvatarURL())
            .setDescription(
                `<:christmassock:1447757955415150743> **Meias Natalinas:** \`${pontos}\`\n` +
                `<:shop:1447715924982370497> **Trocas realizadas:** \`${trocas}\`\n\n` +
                `-# Você pode trocar suas meias por itens na lojinha!`
            )
            .setFooter({ text: `Evento de Natal Kosame 2025` });

        await message.reply({ embeds: [embed] });
    }
};
