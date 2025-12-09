const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'serveravatar';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha o avatar de um membro do servidor.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O membro que você deseja ver o avatar.',
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {User[]} args 
 */
    commandExecute({ message, args }) {

        if (message.guild.id === '834191314328485889') return;

        const Member =
            message.guild.members.cache.get(args[0]) ||
            message.mentions?.members?.first() ||
            message.member;

        const Avatar = Member.displayAvatarURL({
            extension: 'png',
            size: 2048
        });

        if (Member.avatar === null) {
            const EMBED = new ClientEmbed()
                .setDescription(`${Member} não possui um avatar pesonalizado no servidor!`);

            message.reply({
                embeds: [EMBED],
                ephemeral: true
            });
        } else {
            const EMBED = new ClientEmbed()
                .setColor('#0e0e0e')
                .setTitle('<a:t_heart:836080580319510548> ' + ' Kosame')
                .setDescription(`Clique **[aqui](${Avatar})** para baixar o avatar.`)
                .setImage(Avatar)
                .setFooter({ text: `Avatar solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({
                embeds: [EMBED],
                ephemeral: true
            });
        }
    }
};