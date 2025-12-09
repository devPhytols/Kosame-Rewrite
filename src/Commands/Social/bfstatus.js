const { ApplicationCommandType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const moment = require('moment');
require('moment-duration-format');

module.exports = class BfstatusCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'bfstatus';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Acompanhe o tempo e o estado do seu BestFriend.';
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

        if (!doc.bestfriend.has)
            return message.reply({ content: `${user} não possui um(a) melhor amigo(a)!` });

        const par = await this.client.users.fetch(doc.bestfriend.user);

        const Embed = new ClientEmbed()
            .setColor('#f8bc07')
            .setThumbnail(user.displayAvatarURL({ extension: 'jpg', size: 2048 }))
            .setDescription(`<:ID:842414207257149442> **Informações sobre:\n${user.tag}**\nㅤ`)
            .setFooter({ text: `Requisitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .addFields(
                {
                    name: '**<:bfriends:842146949288296478> Melhor Amigo(a):**',
                    value: `**${par.tag}**\n\`( ${par.id} )\`\nㅤ`
                },
                {
                    name: '<:bfstats:850721969741234187> **Melhores Amigos há:**',
                    value: `**${moment.duration(Date.now() - doc.bestfriend.time).format('Y [ano] M [meses] d [dias] h [horas] e m [minutos]').replace('minsutos', 'minuto(s)')}**\n\`( ${moment(doc.bestfriend.time).format('L LT')} )\``
                }
            );

        message.reply({ embeds: [Embed] });
    }
};