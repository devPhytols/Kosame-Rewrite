const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');

module.exports = class ServericonCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'servericon';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha o ícone de um servidor.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'servidor',
                description: 'Informe o id do servidor.',
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 */
    commandExecute({ message, args }) {

        const Server = this.client.guilds.cache.get(args[0]) || message.guild;
        const Icone = Server.iconURL({
            extension: 'png',
            size: 2048
        });

        const EMBED = new ClientEmbed()
            .setColor('#0e0e0e')
            .setTitle('<a:t_heart:836080580319510548> ' + ' Kosame')
            .setDescription(`**[Baixar o icone de ${Server.name}](${Icone !== null ? `${Icone}` : 'https://i.imgur.com/mzEcguC.gif'})**`)
            .setImage(Icone !== null ? `${Icone}` : 'https://i.imgur.com/mzEcguC.gif')
            .setFooter({ text: `Comando solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({
            embeds: [EMBED],
            ephemeral: true
        });
    }
};