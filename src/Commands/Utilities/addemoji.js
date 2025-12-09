const { ApplicationCommandType, ApplicationCommandOptionType, parseEmoji } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures');

module.exports = class AddemojiCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'addemoji';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Adiciona vários emojis a um servidor.';
        this.aliases = ['adde', 'ae'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'emoji',
                description: 'Informe o emoji que deseja adicionar.',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 */
    async commandExecute({ message, args }) {

        if (!message.member.permissions.has("ManageEmojisAndStickers"))
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa da permissão **\`MANAGE_EMOJIS\`** para utilizar esse comando.` });

        if (!args.length)
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, por favor, especifique o emoji que quer adicionar ao servidor!\n Lembrando que você pode adicionar vários emojis utilizando: **k!addemoji <emoji> <emoji> <emoji>**.` });

        if (args.length > 200)
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você está tentando adicionar uma quantidade muito alta de emoji, tente adicionar menos emojis por vez**.` });

        for (const emojis of args) {
            const getEmoji = parseEmoji(emojis);

            if (getEmoji.id) {
                const emojiExt = getEmoji.animated ? ".gif" : ".png";
                const emojiURL = `https://cdn.discordapp.com/emojis/${getEmoji.id + emojiExt}`;

                const EMBED = new ClientEmbed()
                    .setColor('#ffbafe')

                message.guild.emojis
                    .create({ attachment: emojiURL, name: getEmoji.name})
                    .then((emoji) =>
                    message.reply('Adicionando...').then(
                    message.channel.send({ embeds: [EMBED.setDescription(`<:emoji_2:835484262425165885> Você acabou de adicionar um emoji ao servidor!\n\n<:emoji_27:835278855123107840> **Emoji:** **${emoji}** \n<:emoji_27:835278855123107840> **Nome:** **${emoji.name}**`)] })));
            }
        }
    }
};