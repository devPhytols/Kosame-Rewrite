const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class DiscrimCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'discrim';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Mostra uma lista de pessoas com a tag fornecida.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'tag',
                description: 'Informe a tag que deseja pesquisar.',
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
    commandExecute({ message, args }) {

        const userDiscrim = args.length ? args[0] : message.author.discriminator;
        
        function fullName(user, escape = true) {
            user = user.user || user;

            const username = user.username || user.name, discrim = user.discriminator || user.discrim;

            if (!username) {
                return user.id;
            }

            if (escape) {
                username.replace(/\\/g, '\\\\').replace(/`/g, `\`${String.fromCharCode(8203)}`);
            }

            return `${username}#${discrim}`;
        }

        let users = this.client.users.cache.filter((u) => u.discriminator === userDiscrim).map((u) => fullName(u));

        if (!users || !users.length)
            return message.reply(`Não consegui encontrar nenhum resultado, certifique-se de utilizar de forma correta! (Exemplo: k!discrim 0001)`);

        users = users.slice(0, 10);
        const Embed = new ClientEmbed()
            .setColor(parseInt(('00000' + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6), 16))
            .setDescription(users.join('\n'));

        return message.reply({ embeds: [Embed] });
    }
};