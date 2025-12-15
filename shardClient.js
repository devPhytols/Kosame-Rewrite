const { ShardingManager } = require('discord.js');
const { Logger } = require('./src/Utils/Util.js');
require('dotenv').config();

class Shard extends ShardingManager {
    constructor() {
        super('./src/KosameLauncher.js', {
            mode: 'process',
            totalShards: 4,
            respawn: true,
            execArgv: ['--trace-warnings'],
            shardArgs: ['--ansi', '--color'],
            token: process.env.CLIENT_TOKEN
        });

        this.logger = new Logger();
    }

    initialize() {
        console.clear();

        this.on('shardCreate', (shard) => {
            shard.on('spawn', () => {
                this.logger.warn(`Starting Shard: [${shard.id}]`, 'Shard');
            });
            shard.on('ready', () => {
                this.logger.info(`Shard [${shard.id}] started!`, 'Shard');
            });
            shard.on('disconnect', () => {
                this.logger.error(`Shard [${shard.id}] disconnected.`, 'Shard');
            });
            shard.on('reconnecting', () => {
                this.logger.warn(`Reconnecting Shard: [${shard.id}]`, 'Shard');
            });
            shard.on('resume', () => {
                this.logger.warn(`Shard: [${shard.id}] reconnected successfully`, 'Shard');
            });
            shard.on('death', () => {
                this.logger.error(`Shard [${shard.id}] died!` , 'Shard');
            });
            shard.on('error', (err) => {
                this.logger.error(`Shard [${shard.id}] throw an error: ${err.stack}`, 'Shard');
            });
        });

        this.spawn({ timeout: 1000 * 60 * 8 }).catch(e => console.error(e));
    }
}

new Shard().initialize();