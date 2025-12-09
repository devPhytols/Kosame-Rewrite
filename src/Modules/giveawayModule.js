/* eslint-disable no-sync */
const fs = require('fs');

module.exports = class giveawayModule {
    constructor(client) {
        this.client = client;
        this.scheduled = new Set(); // messageIDs scheduled by this shard
    }

    execute() {
        try {
            if (!fs.existsSync('./giveaways')) fs.mkdirSync('./giveaways');
            this.loop();
        } catch (err) {
            this.client.logger?.error?.(err.message, 'giveawayModule');
            this.client.logger?.warn?.(err.stack, 'giveawayModule');
        }
    }

    getShardId(snowflake, totalShards) {
        return Number((BigInt(snowflake) >> 22n) % BigInt(totalShards));
    }

    loop() {
        setInterval(async () => {
            try {
                const shardId = this.client.shard?.ids?.[0] ?? 0;
                const totalShards = this.client.shard?.count ?? 28;

                const files = fs.readdirSync('./giveaways');
                for (const name of files) {
                    const filePath = `./giveaways/${name}`;
                    let data;
                    try {
                        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    } catch {
                        continue;
                    }

                    // Cleanup old ended giveaways
                    if (data.ended && data.endedAt && Date.now() - data.endedAt > 7 * 24 * 60 * 60 * 1000) {
                        try { fs.unlinkSync(filePath); } catch {}
                        continue;
                    }

                    if (data.ended) continue;

                    // Route by guild shard to avoid duplicate scheduling
                    const responsible = this.getShardId(data.guildID, totalShards);
                    if (responsible !== shardId) continue;

                    const id = data.messageID;
                    if (this.scheduled.has(id)) continue;

                    const remaining = data.timestamp - Date.now();
                    if (remaining <= 0) {
                        this.finish(id);
                        this.scheduled.add(id);
                        continue;
                    }

                    setTimeout(() => {
                        this.finish(id);
                    }, remaining);
                    this.scheduled.add(id);
                }
            } catch (err) {
                this.client.logger?.warn?.(`giveaway loop error: ${err.message}`, 'giveawayModule');
            }
        }, 10000);
    }

    async finish(messageID) {
        try {
            await this.client.commands.get('giveaway').endGiveaway(messageID);
        } catch (e) {
            // swallow; endGiveaway handles persistence
        } finally {
            this.scheduled.delete(messageID);
        }
    }
};
