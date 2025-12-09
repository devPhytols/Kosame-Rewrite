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
    const now = Date.now();
    const key = `${guild.id}-${executor.id}`;
    const member = await guild.members.fetch(executor.id);
    const roles = member.roles.cache;
    // =====================> Verificação Adicional <=====================//
    if (!banLogs.has(key)) {
        banLogs.set(key, []);
    }
    // =====================> Adiciona o novo banimento no log <=====================//
    const log = banLogs.get(key);
    log.push(now);
    // =====================> Mantém apenas os banimentos dos últimos 5 minutos <=====================//
    const timeLimit = now - (5 * 60 * 1000);
    const recentBans = log.filter(timestamp => timestamp > timeLimit);
    banLogs.set(key, recentBans);
    // =====================> Verifica se o usuário baniu mais de 5 pessoas nos últimos 5 minutos <=====================//
    if (recentBans.length > 5) {
        try {
            for (const role of roles.values()) {
                await member.roles.remove(role, 'Baniu mais de 5 pessoas em 5 minutos');
            }
            console.log(`Todos os cargos do usuário ${executor.tag} foram removidos.`);
            console.log(`O usuário ${executor.tag} baniu mais de 5 usuários em menos de 5 minutos em ${guild.name}.`);
        } catch (error) {
            console.error(`Erro ao remover cargos do usuário ${executor.tag}`, 'AntiRaid');
        }
    }
}

async function monitorChannelDeletions(guild, executor) {
    const now = Date.now();
    const key = `${guild.id}-${executor.id}`;
    const member = await guild.members.fetch(executor.id);
    const roles = member.roles.cache;
    // =====================> Verificação Adicional <=====================//
    if (!channelDeletionLogs.has(key)) {
        channelDeletionLogs.set(key, []);
    }
    // =====================> Adiciona a nova deleção ao log <=====================//
    const log = channelDeletionLogs.get(key);
    log.push(now);
    // =====================> Mantém apenas as deleções dos últimos 5 minutos <=====================//
    const timeLimit = now - (5 * 60 * 1000);
    const recentDeletions = log.filter(timestamp => timestamp > timeLimit);
    channelDeletionLogs.set(key, recentDeletions);
    // =====================> Verifica se o usuário deletou mais de 3 canais nos últimos 5 minutos <=====================//
    if (recentDeletions.length > 3) {
        try {
            for (const role of roles.values()) {
                await member.roles.remove(role, 'Apagou mais de 3 canais em 5 minutos');
            }
            console.log(`Todos os cargos do usuário ${executor.tag} foram removidos.`);
            console.log(`O usuário ${executor.tag} deletou mais de 3 canais em menos de 5 minutos em ${guild.name}.`);
        } catch (error) {
            console.error(`Erro ao remover cargos do usuário ${executor.tag}`, 'AntiRaid');
        }
    }
}

module.exports = { monitorBans, monitorChannelDeletions };