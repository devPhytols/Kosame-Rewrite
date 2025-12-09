const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class ServerbanCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'serverban';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '🔩 Dev';
        this.description = 'Bane um servidor da Kosame.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'servidor',
                description: 'O usuário que você deseja banir.',
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

        if (!['429679606946201600', '853082312899821598', '955460764720828426', '918536794167980032', '236651138747727872', '202938550360997888', '1348133269522350110'].includes(message.author.id)) return;

        const cliente = await this.client.database.client.findOne({ _id: this.client.user.id });
        const servidor = args[0];

        if (!servidor)
            return message.reply({ content: `${message.author}, você deve inserir o ID do servidor que deseja banir.` });

        if (cliente.Sban.find((x) => x == servidor)) {
            await this.client.database.client.findOneAndUpdate(
                { _id: this.client.user.id },
                { $pull: { Sban: servidor } }
            );

            return message.reply({ content: `${message.author}, o servidor **\`${servidor}\`** já estava em minha lista banimentos portanto o removi.` });
        } else {
            await this.client.database.client.findOneAndUpdate(
                { _id: this.client.user.id },
                { $push: { Sban: servidor } }
            );

            message.reply({ content: `${message.author}, o servidor **\`${servidor}\`** foi adicionado em minha lista de banimentos com sucesso.` });
        }
    }
};
