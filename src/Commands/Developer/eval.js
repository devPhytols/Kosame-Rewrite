const { Command } = require('../../Structures/Structures');
const { inspect } = require('node:util');

module.exports = class Eval extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'eval';
        this.category = '🔩 Dev';
        this.description = '';
        this.usage = 'eval';
        this.aliases = ['ev'];

        this.enabled = true;
        this.guildOnly = true;
        this.config = {
            registerSlash: false
        };
    }

    // eslint-disable-next-line no-unused-vars
    async commandExecute({ message, args, prefix, author }) {
        if (!['236651138747727872'].includes(message.author.id)) return;

        if (!args[0]) return;

        const code = args.join(' ');
        if (!code) return;
        try {
            let result = await eval(code);
            if (typeof result !== 'string') result = inspect(result, { depth: 0 });

            message.reply({
                content: `\`\`\`js\n${result.slice(0, 1970)}\`\`\``
            });
        } catch (e) {
            message.reply({
                content: `\`\`\`js\n${e.stack.slice(0, 2000)}\`\`\``
            });
        }
    }
};
