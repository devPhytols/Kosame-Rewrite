const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'avatar';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha o avatar de um usuário.';
        this.aliases = ['av'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja ver o avatar.',
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

        if (message.guild.id === '834191314328485889') {
            return message.reply({ content: `${message.author}, infelizmente este comando não pode ser utilizado aqui!\n-# <:ksm_set0:1367969325356683325> Consulte o avatar do usuário utilizando o comando k!userinfo` });
        }

        const User =
            this.client.users.cache.get(args[0]) ||
            message.mentions?.users?.first() ||
            message.author;

        const Avatar = User.displayAvatarURL({
            extension: 'png',
            size: 2048
        });

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
};