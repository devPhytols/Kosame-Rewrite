// xpModule.js
module.exports = class xpModule {
    constructor(client) {
        this.client = client;
    }

    async execute(message, user, server, command) {
        if (!command.config.giveXp) return;

        const userId = message.author.id;
        const currentTime = Date.now();
        const cooldown = 10000; // 2 minutos

        // Reaproveitando 'user' se já estiver atualizado no cache
        const lastXp = user?.cooldowns?.lastXpTimestamp || 0;

        // Cooldown ativo
        if (currentTime - lastXp < cooldown) return;

        // Cálculo do XP
        const xpGuildGive = server.premium?.hasPremium ? (Math.floor(Math.random() * 21) + 15) : (Math.floor(Math.random() * 4) + 1);
        const xpUserGive = user.vip?.hasVip ? (Math.floor(Math.random() * 11) + 5) : (Math.floor(Math.random() * 2) + 1);
        const totalXp = xpGuildGive + xpUserGive;

        const newXp = user.Exp.xp + totalXp;
        const level = user.Exp.level;
        const nextLevel = user.Exp.nextLevel * level;
        const updates = {
            'Exp.xp': newXp,
            'Exp.user': message.author.tag,
            'cooldowns.lastXpTimestamp': currentTime
        };

        // Subir de nível
        if (newXp >= nextLevel) {
            updates['Exp.xp'] = 0;
            updates['Exp.level'] = level + 1;

            if (server.levelwarn) {
                message.react('⬆️').catch(() => {});
            }
        }

        // Verifica e corrige 'Exp.id' se não existir (caso muito raro membros antigos)
        if (!user.Exp.id) {
            updates['Exp.id'] = userId;
        }

        await this.client.database.users.updateOne(
            { idU: userId },
            { $set: updates }
        );

        //this.client.logger.info(`${message.author.tag} ganhou ${xpGuildGive + xpUserGive} XP (${xpGuildGive} servidor + ${xpUserGive} vip) | Total: ${totalXp}`, 'XP');

    }
};