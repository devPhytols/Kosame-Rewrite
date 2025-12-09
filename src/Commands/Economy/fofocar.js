const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class FofocarCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'fofocar';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Conte uma fofoca para seu melhor amigo(a).';
        this.config = {
            registerSlash: true,
            giveXp : true
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

        const cooldown = 1.8e6;
        const gf = user.bfcooldown;
        const time = cooldown - (Date.now() - gf);

        if (!user.bestfriend.has) {
            return message.reply({ content: '<:kosame_wrong:1010978512825495613> Você precisa ter um(a) melhor amigo(a) para utilizar esse comando!' });
        }

		if (user.blockpay)
            return message.reply(`Você está com uma transação em andamento! Finalize...`)

        if (user.blockbet)
            return message.reply(`Você está com uma transação em andamento! Finalize...`)

        const embed = new EmbedBuilder(message.author)
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> Calma fofoqueiro, aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace('minsuto', 'minutos')}** para fofocar novamente!`);

        if (gf !== null && cooldown - (Date.now() - gf) > 0) {
            return message.reply({ embeds: [embed] });
        }

        const par = await this.client.users.fetch(user.bestfriend.user);
        const sorteiaMoney = Math.floor(Math.random() * (200000 - 2500000)) + 2500000;
        const sorteiaMoneyVip = Math.floor(Math.random() * (1000000 - 5000000)) + 5000000;
        const money = user.vip.hasVip ? sorteiaMoneyVip + 8000 : sorteiaMoney;
        const sucesso = 'sucesso';
        const broxa = 'broxa';
        const netCaiu = 'netCaiu';
        const resultadoAleatorio = [sucesso, broxa, sucesso, netCaiu, sucesso][Math.floor(Math.random() * 4)];

        if (resultadoAleatorio == sucesso) {
            user.coins = user.coins + money;
            user.bfcooldown = Date.now();
            user.save();
            message.reply({ content: `<:kosame_Correct:1010978511839842385> Você contou uma fofoca para \`${par.tag}\` e conseguiu (**${Util.toAbbrev(Math.floor(money))}**) coins.` });
        } else if (resultadoAleatorio == broxa) {
            user.bfcooldown = Date.now();
            user.save();
            message.reply({ content: `<:kosame_wrong:1010978512825495613> Você contou uma fofoca para \`${par.tag}\` mas era mentira e você não recebeu nenhum coin(s).` });
        } else {
            user.bfcooldown = Date.now();
            user.save();
            message.reply({ content: '<:kosame_wrong:1010978512825495613> Você contou uma fofoca que seu amigo já sabia e por isso não recebeu nada.' });
        }
    }
};
