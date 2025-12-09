const { Command } = require('../../Structures/Structures');

module.exports = class testCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'watch';
        this.category = '🔩 Dev';
        this.description = '';
        this.usage = '';
        this.aliases = ['wt'];

        this.config = {
            registerSlash: false
        };
    }

    // eslint-disable-next-line no-unused-vars
    async commandExecute({ message, args }) {
        if (!['236651138747727872'].includes(message.author.id)) return;

        if (args[0] == 'getchannels') {
            this.client.guilds.fetch(args[1]).then(guild => {
                guild.channels.cache.forEach(channel => {
                    message.reply(`Nome do canal: ${channel.name} (ID: ${channel.id}) - Tipo: ${channel.type}`);
                });
            }).catch(console.error);
        }

        if (args[0] == 'geturl') {
            const errorChannel = await this.client.channels.fetch(args[1]).catch(() => { });

            var invite = await errorChannel.createInvite({
                maxAge: 10 * 60 * 1000,
                maxUses: 10
            });

            message.reply({
                content: `\`\`\`js\n${invite}\`\`\``
            });
        }
    }
};
