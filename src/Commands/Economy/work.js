const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { type } = require('../../Utils/Objects/vipTypes.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class WorkCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'work';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Trabalhe para receber o seu salário.';
        this.aliases = ['trabalhar'];
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

        const user = await this.client.database.users.findOne({ idU: message.author.id }).lean();
        const vip = user.vip;
        const verifyXP = Math.floor(Math.random() * (80 - 15 + 1)) + 12;
        const verifyUserXP = Math.floor(Math.random() * 20) + 1;
        const verifyMoney = Math.ceil(user.work.level * 2 * user.work.coins + 1000000);
        const uXP = user.Exp.xp;
        const xp = user.vip.hasVip ? verifyXP + 90 : verifyXP;
        const xpProfile = user.vip.hasVip ? uXP + 90 : uXP + verifyUserXP;
        const work = user.work.cooldown;
        const cooldown = 3.6e6;

        // Verifica se tem XP duplo ativo
        const xpDuploAtivo = (user?.evento?.cooldown || 0) > Date.now();

        let money;
        let exibeMoney;
        if (vip.upgrade === 1) {
            exibeMoney = 2000000;
            money = user.vip.hasVip ? verifyMoney + 2000000 : verifyMoney;
        } else if (vip.upgrade === 2) {
            exibeMoney = 3000000;
            money = user.vip.hasVip ? verifyMoney + 3000000 : verifyMoney;
        } else if (vip.upgrade === 3) {
            exibeMoney = 3000000;
            money = user.vip.hasVip ? verifyMoney + 3000000 : verifyMoney;
        } else if (vip.upgrade === 4) {
            exibeMoney = 4000000;
            money = user.vip.hasVip ? verifyMoney + 4000000 : verifyMoney;
        } else if (vip.upgrade === 5) {
            exibeMoney = 5000000;
            money = user.vip.hasVip ? verifyMoney + 5000000 : verifyMoney;
        } else if (vip.upgrade === 6) {
            exibeMoney = 8000000;
            money = user.vip.hasVip ? verifyMoney + 8000000 : verifyMoney;
        } else if (vip.upgrade === 7) {
            exibeMoney = 18000000;
            money = user.vip.hasVip ? verifyMoney + 18000000 : verifyMoney;
        } else if (vip.upgrade === 8) {
            exibeMoney = 50000000;
            money = user.vip.hasVip ? verifyMoney + 50000000 : verifyMoney;
        } else if (vip.upgrade === 9) {
            exibeMoney = 80000000;
            money = user.vip.hasVip ? verifyMoney + 80000000 : verifyMoney;
        } else if (vip.upgrade === 10) {
            exibeMoney = 100000000;
            money = user.vip.hasVip ? verifyMoney + 100000000 : verifyMoney;
        } else {
            exibeMoney = 1000000;
            money = user.vip.hasVip ? verifyMoney + 1000000 : verifyMoney;
        }

        const nextlevel = user.work.nextLevel * user.work.level;

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (work !== null && cooldown - (Date.now() - work) > 0) {
            return message.reply({ content: `<:daily:842204620977864734> Você deve esperar **${moment.duration(cooldown - (Date.now() - work)).format('h [hora(s)], m [minuto(s)] e s [segundos]').replace('minsuto(s)', 'minuto(s)')}** até poder trabalhar novamente` });
        } else {
            if (user.work.exp + xp > nextlevel) {
                message.reply({ content: `Sua empresa acaba de subir para um novo nível! **${user.work.level + 1}**.` });
                await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                    $set: {
                        'work.cooldown': Date.now(),
                        'work.exp': 0,
                        coins: user.coins + money,
                        'work.level': user.work.level + 1
                    }
                });
            } else {
                // Aplica XP duplo se ativo
                const xpFinal = xpDuploAtivo ? xp * 2 : xp;
                const xpProfileFinal = xpDuploAtivo ? xpProfile * 2 : xpProfile;
                const xpDuploMsg = xpDuploAtivo ? `\n<:santaclaus2:1447757902201749615> **XP Duplo ativo!** (+${xp} bônus)` : '';

                const embedPegaWork = new EmbedBuilder(message.author)
                    .setColor('#FFFFFF')
                    .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                    .setDescription(`<:work:846536054399303700> **Você trabalhou e recebeu:**\n<:coins:842208238631125053> ${Util.toAbbrev(money)} coins + ${xpFinal} de XP\n${user.vip.hasVip ? `<:vipinfo:1047247009796599830> +${Util.toAbbrev(exibeMoney)} coins + 80 XP **(VIP ${type[vip.upgrade].name})**!` : ''}${xpDuploMsg}`)
                    .setFooter({ text: 'Sabia que agora você pode apostar eles? utilize k!apostar' })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109148372549509170/8WS3Yxj.png', { size: 1024 });

                message.reply({ embeds: [embedPegaWork] });
                await this.client.database.users.findOneAndUpdate({
                    idU: message.author.id
                }, {
                    $inc: { coins: money },
                    $set: {
                        'Exp.xp': xpProfileFinal,
                        'work.cooldown': Date.now(),
                        'work.exp': user.work.exp + xpFinal > nextlevel ? 0 : user.work.exp + xpFinal
                    }
                });
            }
        }
        return;
    }
};
