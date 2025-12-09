const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');

module.exports = class afkCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'afk';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Define o usuário como afk.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'motivo',
                description: 'Insira um motivo:',
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
        const userDb = await this.client.database.users.findOne({ idU: message.author.id });
        const reason = args.join(' ') || null;

        userDb.set({
            'AFK.away': true,
            'AFK.reason': !reason ? reason : reason.length > 50 ? reason.substring(0, 50) + '...' : reason
        });
        userDb.save();
        await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            { $push: { 'AFK.servers': message.guild.id } }
        );

        return message.reply({ content: '<:afk:1042181014618898442> Você agora está **AFK**! O modo AFK será desativado quando você falar algo no chat!', fetchReply: true })
            .then((message) => setTimeout(() => message.delete(), 1000 * 20));
    }
};