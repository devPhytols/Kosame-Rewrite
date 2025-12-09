const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');

module.exports = class DepositCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'deposit';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Realize o deposito dos seus coins';
        this.cooldown = 15;
        this.aliases = ['dep'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'coins',
                description: 'Quantidade de coins que você deseja depositar.',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        const user = await this.client.database.users.findOne({ idU: message.author.id });
        const coinsInicial = user.coins;
        const coins = await Util.notAbbrev(args[0]);
      
        if (user.blockpay)
            return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

        if (user.blockbet)
            return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

        if (!args[0])
            return message.reply({ content: `${message.author}, modo correto de utilizar o comando: **k!depositar <quantia/all>**` });

        if (['all', 'tudo'].includes(args[0].toLowerCase())) {

            if (user.blockpay)
                return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

            if (user.blockbet)
                return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

            const targetEnd = await this.client.database.users.findOne({ idU: message.author.id });
            const coinsFinal = targetEnd.coins;

            if (user.coins == 0) {
                return message.reply({ content: `${message.author}, você não possui coins para depositar.` });
            } else if (coinsFinal !== coinsInicial) {
                return message.reply({ content: `${message.author}, você foi roubado antes de depositar :(... tente novamente!` });
            } else {
                message.reply({ content: `<:bankmoney:846485261730840576><:deposit:846485198669611089> Você depositou **${Util.toAbbrev(user.coins)} coins** com sucesso!` });
                await this.client.database.users.updateOne(
                    { idU: message.author.id },
                    {
                        $inc: {
                            bank: user.coins
                        },
                        $set: {
                            coins: 0
                        }
                    }
                );
            }

            const coinsDeposito1 = await this.client.database.users.findOne({ idU: message.author.id });
            const verificaDeposito1 = coinsDeposito1.coins;

            if (verificaDeposito1 > 0) {
                await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                    $set: {
                        coins: 0
                    }});
            }
            return;
        }

        const targetEnds = await this.client.database.users.findOne({ idU: message.author.id });
        const coinsFinal1 = targetEnds.coins;

        if (coins < 0) {
            return message.reply({ content: 'Não é possível depositar menos de 1 coins.' });
        } else if (isNaN(coins)) {
            return message.reply({ content: 'Modo correto de utilizar o comando: **k!depositar <quantia/all>**' });
        } else if (coins > user.coins) {
            return message.reply({ content: 'Você não possui essa quantia para depositar.' });
        } else if (coinsFinal1 !== coinsInicial) {
            return message.reply({ content: `${message.author}, você foi roubado antes de depositar :(... tente novamente!` });
        } else {
            message.reply({ content: `<:bankmoney:846485261730840576><:deposit:846485198669611089> Você depositou **${Util.toAbbrev(coins)} coins** com sucesso.` });

        await this.client.database.users.updateOne(
            { idU: message.author.id },
            {
                $inc: {
                    coins: -coins,
                    bank: coins
                }
            }
        );
        }
    }
};