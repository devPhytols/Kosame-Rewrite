const { AuditLogEvent, EmbedBuilder, bold, inlineCode } = require('discord.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class guildBanRemoveEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'guildBanRemove';
    }
    async execute(ban) {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanRemove
        });

        const server = await this.client.database.guilds.findOne({ idS: ban.guild.id });
        const unbanLog = fetchedLogs.entries.first();
        const { executor, target } = unbanLog ?? {};

        // =====================> Logs Membros Desbanidos <=====================//
        if (target.id === ban.user.id) {
            if (server?.logs?.logsBan?.status) {
                const msgEmbedLog = new EmbedBuilder()
                    .setAuthor({ name: 'Usuário Desbanido', iconURL: ban.user.avatarURL({ size: 2048 }), url: null })
                    .setDescription(`<:link1:1118599477079572560><:r3:1118599658097344522> Nome do Usuario: ${bold(ban.user.globalName)}\n<:link3:1118599470326743131><:r2:1118599661406662776> ID do Usuario: ${inlineCode(ban.user.id)}\n\n<:ksr9:1243716543687299123> Banimento removido por ${bold(executor.globalName)}`)
                    .setColor(0xEF5351)
                    .setFooter({ text: ban.guild.name, iconURL: null })
                    .setTimestamp();
                try {
                    await this.client.channels.cache.get(server.logs.logsBan.channel).send({
                        embeds: [msgEmbedLog]
                    });
                } catch (error) {
                    if (error.code === 50013) {
                        return;
                    } else {
                        this.client.logger.error(`${error}`, '[Logs System] MemberBanRemove');
                    }
                }
            }
        } else {
            if (server?.logs?.logsBan?.status) {
                const msgEmbedLog = new EmbedBuilder()
                    .setAuthor({ name: 'Usuário Banido', iconURL: ban.user.avatarURL({ size: 2048 }), url: null })
                    .setDescription(`<:link1:1118599477079572560><:r3:1118599658097344522> Nome do Usuario: ${bold(ban.user.globalName)}\n<:link3:1118599470326743131><:r2:1118599661406662776> ID do Usuario: ${inlineCode(ban.user.id)}\n\n<:ksr9:1243716543687299123> Este usuário foi banido por ${bold(executor.globalName)}`)
                    .setColor(0xEF5351)
                    .setFooter({ text: ban.guild.name, iconURL: null })
                    .setTimestamp();
                try {
                    await this.client.channels.cache.get(server.logs.logsBan.channel).send({
                        embeds: [msgEmbedLog]
                    });
                } catch (error) {
                    if (error.code === 50013) {
                        return;
                    } else {
                        this.client.logger.error(`${error}`, '[Logs System] MemberBanRemove');
                    }
                }
            }
        }
    }
};