/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-sync */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-undef */
const { PermissionFlagsBits, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const fs = require('fs');
const moment = require('moment');
require('moment-duration-format');

module.exports = class GiveawayCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'giveaway';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Acompanhe o tempo e o estado do seu BestFriend.';
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        moment.locale('pt-BR');
        const command = args[0];
        if(command == 'create') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);
            let time = args[1];
            const winners = args[2];
            const prize = args.slice(3).join(' ');
            if(!time || !winners || !prize) return message.reply('Modo de usar: \`giveaway create <tempo> <ganhadores> <premio>\`');
            function convertArgsToTime(args) {
                var SECONDS_PATTERN = '([0-9]+) ?(s|seg|segs)';
                var MINUTES_PATTERN = '([0-9]+) ?(min|m|mins|minutos|minutes)';
                var YEAR_PATTERN = '([0-9]+) ?(y|a|anos|years)';
                var MONTH_PATTERN = '([0-9]+) ?(month(s)?|m(e|ê)s(es)?)';
                var WEEK_PATTERN = '([0-9]+) ?(w|semana|semanas|weaks)';
                var DAY_PATTERN = '([0-9]+) ?(d|dias|days)';
                var HOUR_PATTERN = '([0-9]+) ?(h|hour|hora|horas|hours)';
                var DATE_FORMAT = /(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/;
                var HOUR_FORMAT = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
                let timeInMs = 0;
                if (DATE_FORMAT.test(args[0])) {
                    let t = HOUR_FORMAT.test(args[1]) ? moment(args.toString().toLowerCase().replace(/,/g, ' '), 'DDMMYYYY HH:mm') : moment(args.toString().toLowerCase().replace(/,/g, ' '), 'DDMMYYYY');
                    t = Date.parse(t) + ms('3h');
                    return t - Date.now() > 0 ? t - Date.now() : 1;
                }
                if (HOUR_FORMAT.test(args[0])) {
                    args = args.toString().toLowerCase().replace(/,/g, ' ');
                    let t = moment.parseZone(args, 'HH:mm');
                    t = Date.parse(t) + ms('3h');
                    return t - Date.now() > 0 ? t - Date.now() : 1;
                } 
                args = args.toString().toLowerCase().replace(/,/g, ' ');
                const yearValue = args.match(YEAR_PATTERN);

                if (yearValue) {
                    timeInMs += moment().add(`${yearValue[1]}`, 'years') - Date.now();
                }

                const monthValue = args.match(MONTH_PATTERN);

                if (monthValue) {
                    timeInMs += moment().add(`${monthValue[1]}`, 'months') - Date.now();
                }

                const weekValue = args.match(WEEK_PATTERN);

                if (weekValue) {
                    timeInMs += moment().add(`${weekValue[1]}`, 'weeks') - Date.now();
                }

                const dayValue = args.match(DAY_PATTERN);

                if (dayValue) {
                    timeInMs += moment().add(`${dayValue[1]}`, 'days') - Date.now();
                }

                const hourValue = args.match(HOUR_PATTERN);

                if (hourValue) {
                    timeInMs += moment().add(`${hourValue[1]}`, 'hours') - Date.now();
                }

                const minutesValue = args.match(MINUTES_PATTERN);

                if (minutesValue) {
                    timeInMs += 60000 * minutesValue[1];
                }

                const secondsValue = args.match(SECONDS_PATTERN);

                if (secondsValue) {
                    timeInMs += 1000 * secondsValue[1];
                }

                return timeInMs;
            }
            time = convertArgsToTime(time);
            if(!time || time < 10000) return message.reply('Tempo inválido!');
            if(!winners || winners < 1 || isNaN(winners)) return message.reply('Número de ganhadores inválido!');
            const timestamp = parseInt((Date.now() + time) / 1000);
            const embed = new ClientEmbed()
                .setColor('#ffffff')
                .setTimestamp()
                .setDescription(`**<:giveawg:1371599103741526056> Sorteio Ativo:** ${prize}\n\n<:owng:1371599110578110514>  **Iniciado por:** <@${message.author.id}>\n<a:timeg:1371599117872005187> **Tempo restante:** <t:${timestamp}:R>\n<:userg:1371599112587186297> **Participantes:** 0\n<:winnerg:1371599113493286922> **Vencedores:** ${winners}`);
            const btn = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway')
                    .setLabel('Participar (0)')
                    .setStyle('Primary')
                    .setEmoji('1367312172228673694')
            );
            const msg = await message.channel.send({ embeds: [embed], components: [btn] });
            const giveawayData = {
                timestamp: Date.now() + time,
                winners: winners,
                prize: prize,
                guildID: message.guild.id,
                channelID: message.channel.id,
                messageID: msg.id,
                authorID: message.author.id,
                ended: false,
                users: []
            };
            fs.writeFileSync(`./giveaways/${msg.id}.json`, JSON.stringify(giveawayData));
            message.delete();
        }
        if(command == 'end' || command == 'reroll') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);
            const gw = args[1];
            if(!gw) return message.reply('ID do sorteio inválido!');
            if(!fs.existsSync(`./giveaways/${gw}.json`)) return message.reply('Sorteio não encontrado!');
            let ganhadores = parseInt(args[2]);
            this.endGiveaway(gw, ganhadores);
        }
    }
    async endGiveaway(gw, reroll) {
        this.client.gwCache.splice(this.client.gwCache.indexOf(gw), 1);
        const giveawayData = JSON.parse(fs.readFileSync(`./giveaways/${gw}.json`, 'utf8'));
        let msg;
        try {
            msg = await this.client.guilds.fetch(giveawayData.guildID)
                .then((guild) => guild.channels.fetch(giveawayData.channelID)
                    .then((channel) => channel.messages.fetch(giveawayData.messageID)));
        } catch (e) {
            giveawayData.ended = true;
            fs.writeFileSync(`./giveaways/${gw}.json`, JSON.stringify(giveawayData));
            console.log('Erro ao finalizar sorteio ', e);
            return;
        }
        const newBtn = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel(`Participar! (${giveawayData.users.length})`)
            .setEmoji('1367312172228673694')
            .setCustomId('finalizado')
            .setStyle('Secondary')
            .setDisabled(true));
        let array = giveawayData.users;
        let ganhadores = giveawayData.winners;
        ganhadores = reroll && !isNaN(reroll) ? reroll : ganhadores > giveawayData.users.length ? giveawayData.users.length : ganhadores;
        const total = array.length;
        const vencedores = giveawayData.ganhadores == 1 ? '<:winnerg:1371599113493286922> **Vencedor(a)' : '<:winnerg:1371599113493286922> **Vencedores';
        var array2 = [];
        for(let o = 0; o < ganhadores; o++) {
            const random = parseInt(Math.random()*array.length);
            array2.push(array[random]);
            array = array.filter(user => user != array[random]);
        }
        let content;
        if (ganhadores == 1) content = `<@${array2}> Ganhou **${giveawayData.prize}**! 🎉`;
        else content = `${array2.map(i => `<@${i}>`).join(', ')} Ganharam **${giveawayData.prize}**! 🎉`;
        if(reroll && !isNaN(reroll)) return msg.reply({ content: content });
        const newEmbed = new ClientEmbed()
            .setTitle(giveawayData.prize)
            .setTimestamp()
            .setDescription(`<:watchg:1371599107218735154> **Finalizado há:** <t:${parseInt(Date.now() / 1000)}:R> (<t:${parseInt(Date.now() / 1000)}:f>)\n<:owng:1371599110578110514> **Criado por:** <@${giveawayData.authorID}>\n<:userg:1371599112587186297> **Participantes:** ${giveawayData.users.length}\n${vencedores}:** ${total == 0 ? 'Ninguém' : array2.map(i => `<@${i}>`).join(', ')}`);
        giveawayData.ended = true;
        giveawayData.endedAt = Date.now();
        fs.writeFileSync(`./giveaways/${gw}.json`, JSON.stringify(giveawayData));
        await msg.edit({ embeds: [newEmbed], components: [newBtn] }).catch(e => {});
        await msg.reply({ content: total > 0 ? `${content}` : 'Ninguém participou do sorteio!' }).catch(e => {});
    }
};