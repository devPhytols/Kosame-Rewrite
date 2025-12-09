const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const moment = require('moment');
require('moment-duration-format');

module.exports = class TempoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'tempo';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja quando tempo falta para utilizar comandos.';
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {User[]} args 
 */
    async commandExecute({ message }) {

        const userDb = await this.client.database.users.findOne({ idU: message.author.id });

        // WORK
        const work = userDb.work.cooldown;
        const cooldown = 3.6e6;

        // DAILY
        const cooldowndaily = 8.64e7;
        const daily = userDb.daily;

        // CRIME
        const cooldownC = 600000;
        const crimeD = userDb.crime.time;

        // GF
        const cooldowngf = 1.8e6;
        const gf = userDb.gfcooldown;

        // FOFOCAR
        const cooldownbf = 1.8e6;
        const bf = userDb.bfcooldown;

        // SEMANAL
        const semanalcd = 6.048e8;
        const semanal = userDb.semanal;

        // MENSAL
        const mensalcd = 2.678e9;
        const mensal = userDb.mensal;

        // VOTAR
        const cooldownvote = 4.68e7;
        const vote = userDb.vote;

        // REPUTAÇÃO
        const rep = userDb.reps;
        const cooldownrep = 3.6e6 - (Date.now() - rep.time);

        const Embed = new ClientEmbed()
            .setAuthor({ name: 'Meus Intervalos', iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setThumbnail(message.author.displayAvatarURL(() => ({ dynamic: true })))
            .setDescription(`<:ksclock:1033946239550627861> **Crime:** ${crimeD !== null && cooldownC - (Date.now() - crimeD) > 0 ? `||${moment.duration(cooldownC - (Date.now() - crimeD)).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Daily:** ${daily !== null && cooldowndaily - (Date.now() - daily) > 0 ? `||${moment.duration(cooldowndaily - (Date.now() - daily)).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Reputação:** ${cooldownrep > 0 ? `||${moment.duration(cooldownrep).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Gf:** ${gf !== null && cooldowngf - (Date.now() - gf) > 0 ? `||${moment.duration(cooldowngf - (Date.now() - gf)).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Fofocar:** ${bf !== null && cooldownbf - (Date.now() - bf) > 0 ? `||${moment.duration(cooldownbf - (Date.now() - bf)).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Work:** ${work !== null && cooldown - (Date.now() - work) > 0 ? `||${moment.duration(cooldown - (Date.now() - work)).format('h [hora(s)] e m [minuto(s)]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Semanal:** ${semanal !== null && semanalcd - (Date.now() - semanal) > 0 ? `||${moment.duration(semanalcd - (Date.now() - semanal)).format('d [Dias] h [Horas] e m [Minutos]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Mensal:** ${mensal !== null && mensalcd - (Date.now() - mensal) > 0 ? `||${moment.duration(mensalcd - (Date.now() - mensal)).format('d [Dias] h [Horas] e m [Minutos]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}\n\n<:ksclock:1033946239550627861> **Vote:** ${vote !== null && cooldownvote - (Date.now() - vote) > 0 ? `||${moment.duration(cooldownvote - (Date.now() - vote)).format('d [Dias] h [Horas] e m [Minutos]').replace('minsuto(s)', 'minuto(s)')}||` : 'Já está pronto!'}`)
            .setFooter({ text: `Comando requisitado por ${message.author.tag}` });

        message.reply({
            embeds: [Embed]
        });
    }
};