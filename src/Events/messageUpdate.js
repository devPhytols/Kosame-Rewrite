const { EmbedBuilder, bold, inlineCode, codeBlock } = require('discord.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class messageUpdateEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'messageUpdate';
    }
    async execute(oldMessage, newMessage) {
        // Verifica se os dados necessários existem
        if (!newMessage?.author || !newMessage?.guild || !oldMessage?.content) return;
        if (this.client.user.id === newMessage.author.id) return;
        if (newMessage.author.bot) return;

        // Ignora se o conteúdo não mudou (pode ser edição de embed/link preview)
        if (oldMessage.content === newMessage.content) return;

        const server = await this.client.database.guilds.findOne({ idS: newMessage.guild.id });
        if (server?.logs?.logsMsgEdit?.status) {
            const logChannel = this.client.channels.cache.get(server.logs.logsMsgEdit.channel);
            if (!logChannel) return;

            const msgEmbedLog = new EmbedBuilder()
                .setAuthor({ name: 'Mensagem Editada', iconURL: newMessage.author.avatarURL({ size: 2048 }), url: null })
                .setDescription(`<:link1:1118599477079572560><:y2:1118599757082918985> Nome do Usuario: ${bold(newMessage.author.tag)}\n<:link3:1118599470326743131><:y3:1118599754130141274> ID do Usuario: ${inlineCode(newMessage.author.id)}`)
                .addFields(
                    { name: 'Mensagem Anterior', value: codeBlock(oldMessage.content.slice(0, 1000)), inline: true },
                    { name: 'Nova Mensagem', value: codeBlock(newMessage.content.slice(0, 1000)), inline: true },
                    { name: 'Link da Mensagem', value: newMessage.url, inline: false }
                )
                .setColor(0xF7D914)
                .setFooter({ text: newMessage.guild.name, iconURL: null })
                .setTimestamp();
            try {
                await logChannel.send({ embeds: [msgEmbedLog] });
            } catch { }
        }
    }
};