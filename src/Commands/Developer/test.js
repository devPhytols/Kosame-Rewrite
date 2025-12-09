const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');

module.exports = class testCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'test';
        this.category = '🔩 Dev';
        this.description = '';
        this.usage = '';
        this.aliases = ['t', 'atop'];

        this.config = {
            registerSlash: false
        };
    }

    // eslint-disable-next-line no-unused-vars
    async commandExecute({ message, args }) {
        // date = o tempo que ele vai ficar com vip;
        // cooldown = tempo que ele recebeu o vip;
        // upgrade = muda de acordo com o cooldown (o tempo que ele tem vip);

        if (!['236651138747727872', '588058949211783184'].includes(message.author.id)) return;

        const argumentos = await Util.notAbbrev(args[0]);

        if (!argumentos)
            return message.reply({ content: `${message.author}, Não consigo entender você!` });

        if (String(argumentos) === 'NaN')
            return message.reply(`${message.author}, Não consigo entender você!`);

        const userDB = await this.client.database.client.findOne({ _id: '762320527637217312' });

        userDB.set({
            'lastElite': argumentos
        }).save();

        message.reply({ content: `Obrigadaa!!! ${message.author}, agora ficarei atualizada nas apostas! <:d5_japinharisada:1089754417022128199>` })
    }
};
