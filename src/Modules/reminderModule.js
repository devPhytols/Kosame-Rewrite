/* eslint-disable no-unused-vars */
//const { ClientEmbed } = require('../Structures/ClientEmbed');
const { EmbedBuilder } = require('discord.js');

module.exports = class reminderModule {
    constructor(client) {
        this.client = client;
    }

    execute() {
        try {
            this.reminderInterval();
        } catch (err) {
            this.client.logger.error(err.message, reminderModule.name);
            return this.client.logger.warn(err.stack, reminderModule.name);
        }
    }

    // calcula shard responsável por um snowflake (guildId / channelId)
    getShardId(snowflake, totalShards) {
        return Number((BigInt(snowflake) >> 22n) % BigInt(totalShards));
    }

    reminderInterval() {
        setInterval(async () => {
            try {
                const now = Date.now();
                const coll = require('mongoose').connection.collection('users');
                // Busca apenas usuários com pelo menos um lembrete vencido
                const remindersList = await coll
                    .find({ 'reminder.myReminders': { $elemMatch: { time: { $lte: now } } } }, { projection: { idU: 1, 'reminder.myReminders': 1 } })
                    .toArray();

                if (!remindersList?.length) return;

                const shardId = this.client.shard?.ids?.[0] ?? 0;
                const totalShards = this.client.shard?.count ?? 27; // fallback: 4 shards

                // Não filtramos por shard aqui, faremos o roteamento correto no envio por GUILD ID
                const list = remindersList.map((x) => x.idU);
                this.reminderFind(list);
            } catch (err) {
                this.client.logger?.warn?.(`reminderInterval error: ${err.message}`, reminderModule.name);
            }
        }, 1000 * 5);
    }

    async reminderFind(list) {
        const shardId = this.client.shard?.ids?.[0] ?? 0;
        const totalShards = this.client.shard?.count ?? 27; // manter alinhado com reminderInterval

        for (const id of list) {
            const db = await this.client.database.users.findOne({ idU: id });
            if (!db?.reminder?.myReminders) continue;

            const now = Date.now();
            const dueReminders = db.reminder.myReminders.filter((x) => x.time <= now);
            if (!dueReminders.length) continue;

            const toProcess = [];
            const sent = [];

            const user = await this.client.users.fetch(id).catch(() => null);
            if (!user) continue;

            for (const x of dueReminders) {
                const embed = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setDescription(`# <:bonecakosame:1141035384592158770> Aqui está o seu lembrete!\n-# Olá, ${user} estou aqui para lembra-lo da sua atividade muito importante!\n\n- ${x.reminder}\n\n-# <a:KSM_48:1089762796494934166> Se você precisar de ajuda para lembrar de mais alguma atividade, por favor, me avise!`);

                // DM handling: apenas shard 0 envia DMs para evitar duplicidade
                if (db.reminder.isDm) {
                    if (shardId !== 0) continue;
                    try {
                        await user.send({ content: `${user}`, embeds: [embed] });
                        sent.push(x);
                    } catch {
                        // fallback: tentar no canal, requer fetch
                        const ch = await this.client.channels.fetch(x.channel).catch(() => null);
                        if (ch) {
                            await ch.send({ content: `${user}, não consegui enviar a mensagem em sua DM!`, embeds: [embed] }).catch(() => {});
                            sent.push(x);
                        }
                    }
                    continue;
                }

                // Guild channel reminders: roteamento por GUILD ID
                const channel = await this.client.channels.fetch(x.channel).catch(() => null);
                if (!channel || !channel.guild) continue;
                const requiredShard = this.getShardId(channel.guild.id, totalShards);
                if (requiredShard !== shardId) continue; // não é responsabilidade desta shard
                try {
                    await channel.send({ content: `${user}`, embeds: [embed] });
                    sent.push(x);
                } catch {}
            }

            if (sent.length) {
                await this.removeReminder(id, db, sent);
            }
        }
    }

    async removeReminder(id, doc, reminders) {
        // Remove todos os lembretes enviados numa única operação atômica usando $pull + $in
        const times = reminders.map((r) => r.time);
        await this.client.database.users.updateOne(
            { idU: id },
            { $pull: { 'reminder.myReminders': { time: { $in: times } } } }
        );
    }
};