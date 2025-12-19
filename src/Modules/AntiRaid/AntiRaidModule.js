/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js');
const banLogs = new Collection();
const channelDeletionLogs = new Collection();

/**
 * Parametros do Modulo Principal
 * @param {Guild} guild - Servidor do banimento
 * @param {User} executor - Usuário que efetuou o ban
 * @param {User} target - Membro que foi banido
 */
async function monitorBans(guild, executor, target) {
    try {
        const now = Date.now();
        const key = `${guild.id}-${executor.id}`;
        const member = await guild.members.fetch(executor.id).catch(() => null);

        // Se o membro não existe mais no servidor, ignora
        if (!member) return;

        const roles = member.roles.cache;

        if (!banLogs.has(key)) {
            banLogs.set(key, []);
        }

        const log = banLogs.get(key);
        log.push(now);

        const timeLimit = now - (5 * 60 * 1000);
        const recentBans = log.filter(timestamp => timestamp > timeLimit);
        banLogs.set(key, recentBans);

        if (recentBans.length > 5) {
            for (const role of roles.values()) {
                await member.roles.remove(role, 'Baniu mais de 5 pessoas em 5 minutos').catch(() => { });
            }
            console.log(`Todos os cargos do usuário ${executor.tag} foram removidos.`);
            console.log(`O usuário ${executor.tag} baniu mais de 5 usuários em menos de 5 minutos em ${guild.name}.`);
        }
    } catch (error) {
        // Ignora erros silenciosamente
    }
}

async function monitorChannelDeletions(guild, executor) {
    try {
        const now = Date.now();
        const key = `${guild.id}-${executor.id}`;
        const member = await guild.members.fetch(executor.id).catch(() => null);

        // Se o membro não existe mais no servidor, ignora
        if (!member) return;

        const roles = member.roles.cache;

        if (!channelDeletionLogs.has(key)) {
            channelDeletionLogs.set(key, []);
        }

        const log = channelDeletionLogs.get(key);
        log.push(now);

        const timeLimit = now - (5 * 60 * 1000);
        const recentDeletions = log.filter(timestamp => timestamp > timeLimit);
        channelDeletionLogs.set(key, recentDeletions);

        if (recentDeletions.length > 3) {
            for (const role of roles.values()) {
                await member.roles.remove(role, 'Apagou mais de 3 canais em 5 minutos').catch(() => { });
            }
            console.log(`Todos os cargos do usuário ${executor.tag} foram removidos.`);
            console.log(`O usuário ${executor.tag} deletou mais de 3 canais em menos de 5 minutos em ${guild.name}.`);
        }
    } catch (error) {
        // Ignora erros silenciosamente
    }
}

module.exports = { monitorBans, monitorChannelDeletions };