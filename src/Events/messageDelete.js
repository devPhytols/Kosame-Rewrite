const { EmbedBuilder, bold, inlineCode, codeBlock, hyperlink } = require('discord.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class messageDeleteEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'messageDelete';
    }
    async execute(message) {
        // Verifica se os dados necessários existem
        if (!message?.author || !message?.guild) return;
        if (this.client.user.id === message.author.id) return;
        if (message.author.bot) return;

        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });
        if (server?.logs?.logsMsgDelete?.status) {
            const logChannel = this.client.channels.cache.get(server.logs.logsMsgDelete.channel);
            if (!logChannel) return;

            const attachment = message.attachments.first();
            const url = attachment ? attachment.url : null;
            const msgEmbedLog = new EmbedBuilder()
                .setAuthor({ name: 'Mensagem Deletada', iconURL: message.author.avatarURL({ size: 2048 }), url: null })
                .setDescription(`<:link1:1118599477079572560><:r3:1118599658097344522> Nome do Usuario: ${bold(message.author.tag)}\n<:link3:1118599470326743131><:r2:1118599661406662776> ID do Usuario: ${inlineCode(message.author.id)}`);
            if (!message.content) {
                msgEmbedLog.addFields(
                    { name: 'Mensagem', value: bold('Sem Conteúdo'), inline: true }
                );
            } else {
                msgEmbedLog.addFields(
                    { name: 'Mensagem', value: codeBlock(message.content.slice(0, 1000)), inline: true }
                );
            }
            if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)) {
                msgEmbedLog.setImage(url);
            }
            if (url != null) {
                msgEmbedLog.addFields(
                    { name: 'Link do Attachment', value: bold(hyperlink('Baixar Conteúdo', url)), inline: false }
                );
            }
            msgEmbedLog.setFooter({ text: message.guild.name, iconURL: null })
                .setColor(0xEF5351)
                .setTimestamp();
            try {
                await logChannel.send({ embeds: [msgEmbedLog] });
            } catch { }
        }
    }
}