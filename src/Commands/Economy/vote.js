/* eslint-disable no-unused-vars */
const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'vote';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Vote na Kosame e receba até 50k em coins.';
        this.aliases = ['votar'];
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
    async commandExecute({ message, args }) {

        const botId = '762320527637217312'; //
        const uId = message.author.id; // get the author id
        const url = `https://top.gg/api/bots/${botId}/check?userId=${uId}`; // api endpoint

        const user = await this.client.database.users.findOne({ idU: message.author.id });

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        const vip = user.vip;
        const give = Math.floor(Math.random() * (1000000 - 8000000)) + 8000000;
        const cooldown = 4.68e7;
        let coins;
        if (vip.upgrade === 1) {
            coins = user.vip.hasVip ? give + 20000000 : give;
        } else if (vip.upgrade === 2) {
            coins = user.vip.hasVip ? give + 20000000 : give;
        } else if (vip.upgrade === 3) {
            coins = user.vip.hasVip ? give + 30000000 : give;
        } else if (vip.upgrade === 4) {
            coins = user.vip.hasVip ? give + 30000000 : give;
        } else if (vip.upgrade === 5) {
            coins = user.vip.hasVip ? give + 40000000 : give;
        } else if (vip.upgrade === 6) {
            coins = user.vip.hasVip ? give + 40000000 : give;
        } else if (vip.upgrade === 7) {
            coins = user.vip.hasVip ? give + 50000000 : give;
        } else if (vip.upgrade === 8) {
            coins = user.vip.hasVip ? give + 90000000 : give;
        } else if (vip.upgrade === 9) {
            coins = user.vip.hasVip ? give + 95000000 : give;
        } else if (vip.upgrade === 10) {
            coins = user.vip.hasVip ? give + 100000000 : give;
        } else {
            coins = user.vip.hasVip ? give + 50000 : give;
        }

        const vote = user.vote;
        const atual = user.coins;
        const time = cooldown - (Date.now() - vote);

        if (vote !== null && cooldown - (Date.now() - vote) > 0) {
            const EMBED1 = new ClientEmbed()
                .setAuthor({
                    name: `${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
                })
                .setDescription(`**Você já votou em mim hoje!**\n\nVolte em **${moment
                    .duration(time)
                    .format(
                        'h [Horas] m [Minutos] e s [Segundos]'
                    )}**`)
                .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015096506568691722/daily.png', { size: 1024 });

            return message.reply({ embeds: [EMBED1] });
        }

        message.reply('**Vote em mim em:** <https://top.gg/bot/762320527637217312/vote> **e receba coins de forma aleatória!**');

        await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { coins: coins + atual, vote: Date.now() } }
        );
    }
};
