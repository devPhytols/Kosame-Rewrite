const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'prefix';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Altere o prefixo da Kosame em seu servidor.';
        this.aliases = ['prefixo'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'prefixo',
                description: 'Informe o novo prefixo para definir.',
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

        if (!message.member.permissions.has('ManageGuild'))
            return message.reply({ content: 'Você não tem permissão para executar este comando.' });

        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });

        const prefixo = args[0];

        if (!prefixo) {
            return message.reply({ content: `${message.author}, você não inseriu nenhum prefixo para eu alterar.` });
        } else if (prefixo.length > 5) {
            return message.reply({ content: `${message.author}, você deve inserir um prefixo com no máximo 5 caracteres.` });
        } else if (prefixo == server.prefix) {
            return message.reply({ content: `${message.author}, não foi possível alterar o prefixo, poís o prefixo inserido é o mesmo setado atualmente, tente novamente.`});
        } else {
            message.reply({ content: `${message.author}, meu prefixo em seu servidor foi alterado para **\`${prefixo}\`** com sucesso.` });
    
            await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { prefix: prefixo } }
            );
        }

    }
};