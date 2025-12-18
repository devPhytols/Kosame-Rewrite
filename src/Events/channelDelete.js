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
        // Verifica se o canal tem guild (não é DM)
        if (!channel?.guild) return;

        if (!channel.guild.members.me?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
            await this.client.database.guilds.findOneAndUpdate(
                { idS: channel.guild.id },
                { $set: { 'antiraid.status': false } }
            ).catch(() => { });
            return;
        }

        try {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete
            });

            const server = await this.client.database.guilds.findOne({ idS: channel.guild.id });
            const deletionLog = fetchedLogs.entries.first();

            if (!deletionLog) return;

            const { executor } = deletionLog;
            if (!executor) return;

            // Anti-raid: monitora deleções de canais
            if (server?.antiraid?.status) {
                monitorChannelDeletions(channel.guild, executor);
            }
        } catch (err) {
            // Ignora erros silenciosamente (falta de permissão, etc)
        }
    }
};