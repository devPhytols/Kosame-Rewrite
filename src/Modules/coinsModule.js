const { ClientEmbed } = require('../Structures/ClientEmbed');
const { WebhookClient } = require('discord.js');
const { type } = require('../Utils/Objects/vipTypes.js');

module.exports = class coinsModule {
    constructor(client) {
        this.client = client;
    }

    execute() {
        try {
            //this.checkUserBalances();
        } catch (err) {
            this.client.logger.error(err.message, coinsModule.name);
            return this.client.logger.warn(err.stack, coinsModule.name);
        }
    }


    async checkUserBalances() {
        try {
            const interval = setInterval(async () => {
                // Webhook para envio de rotina
                const webhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/1080475763301695629/6qTmm8XP5I5x-iMoZYiGWxxVudv6kNWH12RCj5uPu3w_qGzP8Z7gYgmoiryIfPR13uw_' });
                // Procura os usuários no banco de dados;
                const users = await this.client.database.users.find({ bank: { $gt: 280000000 } });
                const kosame = await this.client.database.client.findOne({ _id: '762320527637217312' });
                // Mapeia todos os usuários;
                for (const user of users) {
                    // Verifique se o usuário tem um saldo de pelo menos 400M de Coins
                    if (user.bank >= kosame.lastElite) {
                        // Verifique quando o usuário usou o bot pela última vez
                        const lastUsed = user.lastBet || new Date(0);
                        const now = new Date();
                        const hoursSinceLastUsed = Math.abs(now - lastUsed) / 36e5;

                        // Se tiver passado mais de 24 horas desde a última vez que o usuário usou o bot, retire 10% do saldo.
                        if (hoursSinceLastUsed > 24) {
                            const penalty = Math.floor(user.bank * 0.10);
                            user.bank -= penalty;
                            user.lastBet = now;
                            await user.save();

                            console.log(`Foi aplicado uma penalidade de -${penalty} Coins para ${user.Exp.user}.`);
                        }
                    }
                }
                // Verifique se todos os usuários foram verificados
                if (users.length > 0) {
                    clearInterval(interval);
                    console.log(`[Coins Module] Todos os usuários foram verificados.`);
                    webhook.send({ content: `[Coins Module] Todos os usuários foram verificados.` });
                    this.checkUserBalances(); // Reinicie o intervalo para continuar verificando os usuários
                }

            }, 1000 * 60 * 120); // Intervalo de 2 Horas;
        } catch (err) {
            this.client.logger.error('Erro ao verificar os saldos dos usuários:', err);
            webhook.send({ content: `[Coins Module] Erro ao verificar os saldos dos usuários.` });
        }
    }
};
