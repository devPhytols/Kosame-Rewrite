const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { type } = require('../../Utils/Objects/vipTypes.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class MensalCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'mensal';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Resgata o seu prêmio mensal.';
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
        const give = Math.floor(Math.random() * (50000000 - 150000000)) + 150000000;
        const cooldown = 2.678e9; // 2.678e9
        let coins;
        let exibeCoins;
        if (vip.upgrade === 1) {
            exibeCoins = 20000000;
            coins = user.vip.hasVip ? give + 20000000 : give;
        } else if (vip.upgrade === 2) {
            exibeCoins = 30000000;
            coins = user.vip.hasVip ? give + 30000000 : give;
        } else if (vip.upgrade === 3) {
            exibeCoins = 50000000;
            coins = user.vip.hasVip ? give + 50000000 : give;
        } else if (vip.upgrade === 4) {
            exibeCoins = 60000000;
            coins = user.vip.hasVip ? give + 60000000 : give;
        } else if (vip.upgrade === 5) {
            exibeCoins = 80000000;
            coins = user.vip.hasVip ? give + 80000000 : give;
        } else if (vip.upgrade === 6) {
            exibeCoins = 150000000;
            coins = user.vip.hasVip ? give + 150000000 : give;
        } else if (vip.upgrade === 7) {
            exibeCoins = 220000000;
            coins = user.vip.hasVip ? give + 220000000 : give;
        } else if (vip.upgrade === 8) {
            exibeCoins = 800000000;
            coins = user.vip.hasVip ? give + 800000000 : give;
        } else if (vip.upgrade === 9) {
            exibeCoins = 900000000;
            coins = user.vip.hasVip ? give + 900000000 : give;
        } else if (vip.upgrade === 10) {
            exibeCoins = 2000000000;
            coins = user.vip.hasVip ? give + 2000000000 : give;
        } else {
            exibeCoins = 7000000;
            coins = user.vip.hasVip ? give + 7000000 : give;
        }

        const mensal = user.mensal;
        const atual = user.coins;
        const banco = user.bank;
        const time = cooldown - (Date.now() - mensal);

        //================= Verifcação do Tempo =================//

        if (user.Exp.level < 5) {
            return message.reply('Você ainda não pode utilizar esse tipo de comando, atinja o level 5 para que possa utiliza-lo.');
        }

        if (mensal !== null && cooldown - (Date.now() - mensal) > 0) {
            const EMBED1 = new EmbedBuilder(message.author)
                .setAuthor({
                    name: `${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
                })
                .setDescription(
                    `**Você já resgatou o mensal!**\n\nVolte em **${moment
                        .duration(time)
                        .format('d [Dias] h [Horas] e m [Minutos]')}**`
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109147920873291958/W62CxVX.png', { size: 1024 });

            return message.reply({ embeds: [EMBED1] });
        } else {
            const EMBED2 = new EmbedBuilder(message.author)
                .setAuthor({
                    name: `${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
                })
                .setDescription(
                    `<:coins:842208238631125053> **Você ganhou **${coins}** coins no mensal!**\n${user.vip.hasVip
                        ? `<:vipinfo:1047247009796599830> +${Util.toAbbrev(exibeCoins)} coins **(VIP  ${type[vip.upgrade].name})**!\n\n`
                        : ''
                    }<:kosamebank:1009206036294545428> Agora você possui **${Util.toAbbrev(
                        atual + coins + banco
                    )}** coins
        `
                )
                .setFooter({ text: 'Sabia que agora você pode apostar eles? utilize k!apostar' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109147920873291958/W62CxVX.png', { size: 1024 });

            message.reply({ embeds: [EMBED2] });

            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { coins: coins + atual, mensal: Date.now() } }
            );
        }
    }
};
