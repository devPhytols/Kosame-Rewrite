const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { type } = require('../../Utils/Objects/vipTypes.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class SemanalCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'semanal';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Resgata o Prêmio Semanal.';
        this.config = {
            registerSlash: true,
            giveXp: true
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message }) {

        const user = await this.client.database.users.findOne({
            idU: message.author.id
        });

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        //================= Imports =================//

        const vip = user.vip;
        const give = Math.floor(Math.random() * (10000000 - 100000000)) + 100000000;
        const cooldown = 6.048e8; // 6.048e8
        let coins;
        let exibeCoins;
        if (vip.upgrade === 1) {
            exibeCoins = 10000000;
            coins = user.vip.hasVip ? give + 10000000 : give;
        } else if (vip.upgrade === 2) {
            exibeCoins = 20000000;
            coins = user.vip.hasVip ? give + 20000000 : give;
        } else if (vip.upgrade === 3) {
            exibeCoins = 30000000;
            coins = user.vip.hasVip ? give + 30000000 : give;
        } else if (vip.upgrade === 4) {
            exibeCoins = 40000000;
            coins = user.vip.hasVip ? give + 40000000 : give;
        } else if (vip.upgrade === 5) {
            exibeCoins = 80000000;
            coins = user.vip.hasVip ? give + 80000000 : give;
        } else if (vip.upgrade === 6) {
            exibeCoins = 90000000;
            coins = user.vip.hasVip ? give + 90000000 : give;
        } else if (vip.upgrade === 7) {
            exibeCoins = 120000000;
            coins = user.vip.hasVip ? give + 120000000 : give;
        } else if (vip.upgrade === 8) {
            exibeCoins = 220000000;
            coins = user.vip.hasVip ? give + 220000000 : give;
        } else if (vip.upgrade === 9) {
            exibeCoins = 300000000;
            coins = user.vip.hasVip ? give + 300000000 : give;
        } else if (vip.upgrade === 10) {
            exibeCoins = 500000000;
            coins = user.vip.hasVip ? give + 500000000 : give;
        } else {
            exibeCoins = 4000000;
            coins = user.vip.hasVip ? give + 4000000 : give;
        }

        const semanal = user.semanal;
        const atual = user.coins;
        const banco = user.bank;
        const time = cooldown - (Date.now() - semanal);

        //================= Verifcação do Tempo =================//

        if (semanal !== null && cooldown - (Date.now() - semanal) > 0) {
            const EMBED1 = new EmbedBuilder(message.author)
                .setAuthor({
                    name: `${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
                })
                .setDescription(
                    `**Você já resgatou o semanal!**\n\nVolte em **${moment
                        .duration(time)
                        .format('d [Dias] h [Horas] e m [Minutos]')}**`
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109148107364651068/9wEaSjg.png', { size: 1024 });

            return message.reply({ embeds: [EMBED1] });
        } else {
            const EMBED2 = new EmbedBuilder(message.author)
                .setAuthor({
                    name: `${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
                })
                .setDescription(
                    `<:coins:842208238631125053> **Você ganhou **${coins}** coins no semanal!**\n${user.vip.hasVip
                        ? `<:vipinfo:1047247009796599830> +${Util.toAbbrev(exibeCoins)} coins **(VIP ${type[vip.upgrade].name})**!\n\n`
                        : ''
                    }<:kosamebank:1009206036294545428> Agora você possui **${Util.toAbbrev(
                        atual + coins + banco
                    )}** coins
        `
                )
                .setFooter({ text: 'Sabia que agora você pode apostar eles? utilize k!apostar' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109148107364651068/9wEaSjg.png', { size: 1024 });

            message.reply({ embeds: [EMBED2] });

            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { coins: coins + atual, semanal: Date.now() } }
            );
        }
    }
};
