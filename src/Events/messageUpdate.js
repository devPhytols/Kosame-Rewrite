const { EmbedBuilder, bold, inlineCode, codeBlock } = require('discord.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class messageUpdateEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'messageUpdate';
    }
    async execute(oldMessage, newMessage) {
        if (this.client.user === newMessage.author) return;
        // if (newMessage.author.bot) return;
        const server = await this.client.database.guilds.findOne({ idS: newMessage.guild.id });
        if (server?.logs?.logsMsgEdit?.status) {
            const msgEmbedLog = new EmbedBuilder()
                .setAuthor({ name: 'Mensagem Editada', iconURL: newMessage.author.avatarURL({ size: 2048 }), url: null })
                .setDescription(`<:link1:1118599477079572560><:y2:1118599757082918985> Nome do Usuario: ${bold(newMessage.author.tag)}\n<:link3:1118599470326743131><:y3:1118599754130141274> ID do Usuario: ${inlineCode(newMessage.author.id)}`)
                .addFields(
                    { name: 'Mensagem Anterior', value: codeBlock(oldMessage.content), inline: true },
                    { name: 'Nova Mensagem', value: codeBlock(newMessage.content), inline: true },
                    { name: 'Link da Mensagem', value: newMessage.url, inline: false }
                )
                .setColor(0xF7D914)
                .setFooter({ text: newMessage.guild.name, iconURL: null })
                .setTimestamp();
            try {
                await this.client.channels.cache.get(server.logs.logsMsgEdit.channel).send({
                    embeds: [msgEmbedLog]
                });
            } catch (error) {
                if (error.code === 50013) {
                    return;
                }
            }
        }
    }
};