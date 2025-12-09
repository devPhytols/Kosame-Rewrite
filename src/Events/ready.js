/* eslint-disable prefer-const */
/* eslint-disable no-sync */
const { ActivityType } = require('discord.js');
const { Event } = require('../Structures/Structures.js');
const fs = require('fs');

module.exports = class readyEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'clientReady';
    }

    execute() {
        try {
            const activityArray = [
                `😍 k!help | ${this.client.shard.count} Clusters`,
                `😍 Dúvidas? use k!help | ${this.client.shard.count} Clusters`,
                `☕ k!help | ${this.client.shard.count} Clusters`,
                '😁 Visite meu website em https://www.kosame.site'
            ];

            const time = 45;
            let x = 0;

            this.client.user?.setStatus('idle');
            setInterval(() => {
                const activity = activityArray[x++ % activityArray.length];
                this.client.user?.setActivity(activity, { type: ActivityType.Custom });
            }, 2000 * time);

            //===============> Módulos <===============//

            //===============> Coins:
            //new (require('../Modules/coinsModule.js'))(this.client).execute();
            //===============> AFK:
            //new (require('../Modules/reminderModule.js'))(this.client).execute();
            //===============> VIP:
            new (require('../Modules/vipModule.js'))(this.client).execute();
            //=========================================//
            //===============> Giveaway:
            new (require('../Modules/giveawayModule.js'))(this.client).execute();
            //=========================================//
            //===============> Evento de Natal:
            new (require('../Modules/natalModule.js'))(this.client).execute();
            //=========================================//
            this.client.logger.info(`${this.client.user.username} has been loaded completely and it's in ${this.client.guilds.cache.size} guilds.`, 'Ready');

        } catch (err) {
            this.client.logger.error(err.message, readyEvent.name);
            return this.client.logger.warn(err.stack, readyEvent.name);
        }
    }
};
