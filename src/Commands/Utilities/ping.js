const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'ping';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Imformações sobre a latência da Kosame.';
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 */
    async commandExecute({ message }) {

        const startDB = process.hrtime();
        const userDb = await this.client.database.users.findOne({ idU: message.author.id }).lean();
        const coins = userDb.coins;
        const stopDB = process.hrtime(startDB);
        const pingDB = Math.round((stopDB[0] * 1e9 + stopDB[1]) / 1e6) + 'ms';

        message.reply({ 
            content: `🏓 **|** Clusters: **${this.client.shard.count}**\n<:mongo:999777526769524736> **|** Database: **${pingDB}**\n⚡ **|** API: **${this.client.ws.ping}ms**`, 
            ephemeral: true 
        });
    }
};