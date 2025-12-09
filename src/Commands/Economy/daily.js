const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { type } = require('../../Utils/Objects/vipTypes.js');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class DailyCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'daily';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Resgata o seu prêmio diário.';
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

        const user = await this.client.database.users.findOne({ idU: message.author.id });
        const userXp = user.Exp.xp;
        const give = Math.floor(Math.random() * (500000 - 1000000)) + 1000000;
        const vip = user.vip;

        const cooldown = 8.64e7;
        let coins;
        let exibeExtra;
        let xpGive;
        if (vip.upgrade === 1) {
            exibeExtra = 10000000;
            xpGive = 30;
            coins = user.vip.hasVip ? give + 10000000 : give;
        } else if (vip.upgrade === 2) {
            exibeExtra = 15000000;
            xpGive = 30;
            coins = user.vip.hasVip ? give + 15000000 : give;
        } else if (vip.upgrade === 3) {
            exibeExtra = 16000000;
            xpGive = 40;
            coins = user.vip.hasVip ? give + 16000000 : give;
        } else if (vip.upgrade === 4) {
            exibeExtra = 18000000;
            xpGive = 50;
            coins = user.vip.hasVip ? give + 18000000 : give;
        } else if (vip.upgrade === 5) {
            exibeExtra = 20000000;
            xpGive = 60;
            coins = user.vip.hasVip ? give + 20000000 : give;
        } else if (vip.upgrade === 6) {
            exibeExtra = 25000000;
            xpGive = 70;
            coins = user.vip.hasVip ? give + 25000000 : give;
        } else if (vip.upgrade === 7) {
            exibeExtra = 25000000;
            xpGive = 130;
            coins = user.vip.hasVip ? give + 25000000 : give;
        } else if (vip.upgrade === 8) {
            exibeExtra = 95000000;
            xpGive = 230;
            coins = user.vip.hasVip ? give + 95000000 : give;
        } else if (vip.upgrade === 9) {
            exibeExtra = 120000000;
            xpGive = 330;
            coins = user.vip.hasVip ? give + 120000000 : give;
        } else if (vip.upgrade === 10) {
            exibeExtra = 150000000;
            xpGive = 330;
            coins = user.vip.hasVip ? give + 150000000 : give;
        } else {
            exibeExtra = 800000;
            xpGive = 40;
            coins = user.vip.hasVip ? give + 800000 : give;
        }

        const daily = user.daily;
        const atual = user.coins;
        const banco = user.bank;
        const time = cooldown - (Date.now() - daily);

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        //================= Verifcação do Tempo =================//

        if (daily !== null && cooldown - (Date.now() - daily) > 0) {
            const EMBED1 = new ClientEmbed()
                .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                .setDescription(`**Você já resgatou o daily!**\n\nVolte em **${moment.duration(time).format('h [Horas] m [Minutos] e s [Segundos]')}**`)
                .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015096506568691722/daily.png', { size: 1024 });

            return message.reply({ embeds: [EMBED1] });

        } else {
            const EMBED2 = new EmbedBuilder(message.author)
                .setColor('#FFFFFF')
                .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                .setDescription(`**<:coins:842208238631125053> Você ganhou **${coins}** coins + **${xpGive}** XP no daily!**\n${user.vip.hasVip ? `<:vipinfo:1047247009796599830> +${Util.toAbbrev(exibeExtra)} coins **(VIP ${type[vip.upgrade].name})**!\n\n` : ''}<:kosamebank:1009206036294545428> Agora você possui **${Util.toAbbrev(atual + coins + banco)}** coins.`)
                .setFooter({ text: 'Sabia que agora você pode apostar eles? utilize k!apostar' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109148220694745138/s337k4z.png', { size: 1024 });

            message.reply({ embeds: [EMBED2] });

            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                {
                    $inc: { coins: coins },
                    $set: { daily: Date.now(), 'Exp.xp': userXp + xpGive }
                }
            );
        }
    }
};
