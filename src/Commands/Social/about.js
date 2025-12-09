const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class AboutCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'about';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Troque a biografia do seu perfil.';
        this.aliases = ['sobremim', 'sobre', 'bio'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'mensagem',
                description: 'Informe a mensagem que deseja adicionar.',
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

        const aboutMe = args.join(' ').replace(/\n/g, '');
        const user = await this.client.database.users.findOne({ idU: message.author.id });

        if (!aboutMe)
            return message.reply({ content: `${message.author}, você não inseriu o que deseja colocar no seu sobre.` });

        if (aboutMe.length > 40)
            return message.reply({ content: `${message.author}, o seu sobre deve ter menos de 40 caracteres.` });

        if (user.about == aboutMe)
            return message.reply({ content: `${message.author}, o sobre que você inseriu é o mesmo setado atualmente.` });

        message.reply({ content: `${message.author}, a bio do seu perfil foi alterada com sucesso.` });

        await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { about: aboutMe } }
        );
    }
};