const { ApplicationCommandType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const moment = require('moment');
require('moment-duration-format');

module.exports = class StatusCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'status';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Acompanhe o tempo e o estado do seu casamento.';
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
    async commandExecute({ message, args }) {

        moment.locale('pt-BR');

        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        const doc = await this.client.database.users.findOne({ idU: user.id });

        if (!doc)
            return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

        if (!doc.marry.has)
            return message.reply({ content: `${user} não está casado(a) no momento!` });

        const par = await this.client.users.fetch(doc.marry.user);

        const Embed = new ClientEmbed()
            .setThumbnail(user.displayAvatarURL({ extension: 'jpg', size: 2048 }))
            .setDescription(`<:ID:842414207257149442> **Informações sobre:\n${user.tag}**\nㅤ`)
            .setFooter({ text: `Requisitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .addFields(
                {
                    name: '**<:weddingstats:842093765127831572> Parceiro(a):**',
                    value: `**${par.tag}**\n\`( ${par.id} )\`\nㅤ`
                },
                {
                    name: '<:marriage:842095491486842942> **Está casado(a) há:**',
                    value: `**${moment.duration(Date.now() - doc.marry.time).format('Y [ano] M [meses] d [dias] h [horas] e m [minutos]').replace('minsutos', 'minuto(s)')}**\n\`( ${moment(doc.marry.time).format('L LT')} )\``
                }
            );

        message.reply({ embeds: [Embed] });
    }
};