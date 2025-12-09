/* eslint-disable no-unused-vars */
const { PermissionFlagsBits, AuditLogEvent, EmbedBuilder, bold, inlineCode } = require('discord.js');
const { monitorChannelDeletions } = require('../Modules/AntiRaid/AntiRaidModule.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class channelDeleteEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'channelDelete';
    }
    async execute(channel) {

        if (!channel.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await this.client.database.guilds.findOneAndUpdate(
                { idS: channel.guild.id },
                { $set: { 'antiraid.status': false } }
            );
            return;
        }

        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelDelete
        });

        const server = await this.client.database.guilds.findOne({ idS: channel.guild.id });
        const deletionLog = fetchedLogs.entries.first();
        const { executor } = deletionLog;

        // =====================> Logs Membros Banidos <=====================//
        if (deletionLog) {
            if (server.antiraid.status) {
                monitorChannelDeletions(channel.guild, executor);
            }
            // if (server.logs.logsBan.status) {
            //     const msgEmbedLog = new EmbedBuilder()
            //         .setAuthor({ name: 'Usuário Banido', iconURL: executor.user.avatarURL({ size: 2048 }), url: null })
            //         .setDescription(`<:link1:1118599477079572560><:r3:1118599658097344522> Nome do Usuario: ${bold(executor.user.globalName)}\n<:link3:1118599470326743131><:r2:1118599661406662776> ID do Usuario: ${inlineCode(executor.user.id)}\n\n<:ksr9:1243716543687299123> Este usuário foi banido por ${bold(executor.globalName)}`)
            //         .setColor(0xEF5351)
            //         .setFooter({ text: ban.guild.name, iconURL: null })
            //         .setTimestamp();
            //     try {
            //         await this.client.channels.cache.get(server.logs.logsBan.channel).send({
            //             embeds: [msgEmbedLog]
            //         });
            //     } catch (error) {
            //         this.logger.error(`${error}`, '[Logs System] MemberBanAdd');
            //     }
            // }
        }
    }
};