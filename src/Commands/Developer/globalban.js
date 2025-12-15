const { ApplicationCommandType, ApplicationCommandOptionType, WebhookClient, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class GlobalbanCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'globalban';
        this.category = '🔩 Dev';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Bane um usuário da Kosame.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'O usuário que você deseja banir.',
                required: true,
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {

        if (!['588058949211783184', '429679606946201600', '918536794167980032', '236651138747727872', '905478001972629514', '1348133269522350110'].includes(message.author.id)) return;

        const cliente = await this.client.database.client.findOne({ _id: this.client.user.id });
        const Webhook = new WebhookClient({ id: '1033947942895239168', token: 'rQokz-OWqGNh0ggWlsYAf_G-6mlXqOKnzTS5wfjz3LvTF-oK6LqOKSKqpIFmt-9og4zR' });

        const argumentos = args[0];

        if (!argumentos)
            return message.reply({ content: 'Você não colocou argumentos.' });

        const embedHook = new EmbedBuilder()
            .setColor('#e63225')
            .setDescription(`${message.author.tag} baniu **${argumentos}** da Kosame!`);

        const embedHookRemove = new EmbedBuilder()
            .setColor('#57eb44')
            .setDescription(`${message.author.tag} desbaniu **${argumentos}** da Kosame!`);

        const member = this.client.users.cache.get(args[0]) || message.mentions.users.first();

        if (member.id === '236651138747727872') {
            return message.reply({ content: 'Você não pode banir este usuário!' });
        }

        if (!member) {
            return message.reply({ content: `${message.author}, você deve inserir o ID/mencionar o membro que deseja inserir em minha lista de **\`Bans Globais\`**.` });
        } else if (cliente.blacklist.find((x) => x == member.id)) {
            await this.client.database.client.findOneAndUpdate(
                { _id: this.client.user.id },
                { $pull: { blacklist: member.id } }
            );
            return message.reply({ content: `${message.author}, o membro **\`${member.tag}\`** já estava em minha lista de **\`Bans Globais\`** portanto o removi.` }).then(Webhook.send({ embeds: [embedHookRemove] }));
        } else {
            await this.client.database.client.findOneAndUpdate(
                { _id: this.client.user.id },
                { $push: { blacklist: member.id } }
            );
            message.reply({ content: `${message.author}, o membro **\`${member.tag}\`** foi adicionado em minha lista de **\`Bans Globais\`** com sucesso..` }).then(Webhook.send({ embeds: [embedHook] }));
        }
    }
};
