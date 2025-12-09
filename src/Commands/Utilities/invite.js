const { ApplicationCommandType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'invite';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha o link de convite da Kosame.';
        this.aliases = ['convite', 'convidar'];
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
    commandExecute({ message }) {

        const invite = new ClientEmbed()
            .setColor(process.env.EMBED_COLOR)
            .setTitle('Meu Convite')
            .setThumbnail(this.client.user.displayAvatarURL(() => ({ dynamic: true })))
            .setDescription('Abaixo você encontra os meus links de convite,\nclique em qualquer um deles e você será redirecionado\npara uma url de convite!\n\n[**Me adicione**](https://discord.com/api/oauth2/authorize?client_id=762320527637217312&permissions=8&scope=bot%20applications.commands) ┆ [**Meu WebSite**](https://kosamebot.club/)\n\n[**Discord Bot List**](https://top.gg/bot/762320527637217312) ┆ [**Meu Servidor**](https://discord.gg/THS6HBgPzr)');

        message.reply({ embeds: [invite] });
    }
};