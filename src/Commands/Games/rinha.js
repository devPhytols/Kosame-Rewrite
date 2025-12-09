/* eslint-disable prefer-const */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
//const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const cooldowns = new Map();
const moment = require('moment');
require('moment-duration-format');

module.exports = class EmojiFightCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'emojifight';
        this.description = 'Participe de uma rinha de emoji apostando Coins.';
        this.aliases = ['rinha'];
        this.config = {
            registerSlash: true
        };
        this.emojis = ['🐧', '🐥', '🐸', '🦖', '🦊', '🐺', '🐱', '🐝', '🐰', '🐼', '🐻', '🦄', '🐨', '🐷', '🦁', '🐮', '🐶', '🐯', '🐵', '🦇'];
    }

    async commandExecute({ message, args }) {
        const accAge = Math.abs(Date.now() - message.author.createdAt);
        const accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));

        if (accDays <= 15) {
            return message.reply({ content: 'Eii, a sua conta é muito nova para transferir coins, aguarde alguns dias e junte suas economias!' });
        }

        const guildId = message.guild.id;

        // Verifica se o servidor está no cooldown
        if (cooldowns.has(guildId)) {
            const remainingTime = (cooldowns.get(guildId) - Date.now()) / 1000;
            return message.reply(`Já existe uma rinha ativa, aguarde ${remainingTime.toFixed(1)} segundos.`);
        }

        const uSrc = await this.client.database.users.findOne({ idU: message.author.id });
        const entryCost = await Util.notAbbrev(args[0]);
        const maxPlayers = 20;
        const participants = [];

        // Cooldown
        let cooldown = 45000;
        let pay = uSrc.rinha;
        let time = cooldown - (Date.now() - pay);

        const EMBED1 = new EmbedBuilder()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, Aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace('minsuto', 'minutos')}** para jogar novamente!`);

        if (pay !== null && cooldown - (Date.now() - pay) > 0) {
            return message.reply({ embeds: [EMBED1] });
        }

        if (!args[0]) {
            return message.reply({ content: `${message.author}, você precisa fornecer o valor para participar. *k!rinha 5M*` });
        } else if (String(entryCost) === 'NaN') {
            return message.reply({ content: `${message.author}, o valor fornecido é inválido.` });
        } else if (entryCost < 100000) {
            return message.reply({ content: `${message.author}, você não pode criar uma rinha com menos de 100k Coins.` });
        } else if (entryCost > uSrc.bank) {
            return message.reply({ content: `${message.author}, você não possui essa quantia de coins!` });
        }

        // Adiciona o servidor ao cooldown
        cooldowns.set(guildId, Date.now() + 15000); // 5000ms = 5 segundos

        setTimeout(() => {
            cooldowns.delete(guildId);
        }, 15000);

        const embed = new EmbedBuilder()
            .setTitle('<:ksm_vs:1282088406662385755> Rinha de Emoji')
            .setThumbnail('https://i.imgur.com/w11zL4l.png')
            .setDescription(
                `<:coins_k:846487970612903976> **Preço para participar da rinha:** ${entryCost.toLocaleString()} **(${entryCost})** Coins\n` +
                '<:bagcoins:846485891156279297> **Prêmio:** O valor total será somado com base na quantidade de participantes!\n\n' +
                `Para participar, clique no botão abaixo! (Limite de ${maxPlayers} jogadores)\n\n` +
                'O vencedor será revelado após 60 segundos ou quando atingirmos o limite de participantes!'
            )
            .setColor('#FFFFFF');

        const joinButton = new ButtonBuilder()
            .setCustomId('join_fight')
            .setLabel('Participar')
            .setEmoji('1282090011201896490')
            .setStyle(ButtonStyle.Secondary);
        const drawButton = new ButtonBuilder()
            .setCustomId('draw_fight')
            .setLabel('Sortear')
            .setEmoji('1391904695085301853')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(joinButton);

        const msg = await message.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const filter = i => i.customId === 'join_fight';

        const collector = msg.createMessageComponentCollector({
            filter,
            time: 20000
        });

        let processing = false;
        collector.on('collect', async i => {
            // Acknowledge quickly to avoid "interaction failed" when many users click at once
            try { await i.deferUpdate(); } catch {}

            if (processing) return; // simple guard to serialize updates
            processing = true;
            const uVerify = await this.client.database.users.findOne({ idU: i.user.id });

            if (participants.length >= maxPlayers) {
                // Garante que cliques extras não sejam processados mesmo em corrida
                processing = false;
                return;
            }

            if (participants.some(p => p.id === i.user.id)) {
                processing = false;
                return;
            }

            if (uVerify.blockpay) {
                processing = false;
                return;
            }

            if (uVerify.blockbet) {
                processing = false;
                return;
            }

            if (uVerify.bank < entryCost) {
                processing = false;
                return;
            }

            const emoji = this.emojis[participants.length];
            participants.push({ id: i.user.id, tag: i.user.tag, emoji });
            const totalPrize = participants.length * entryCost;

            await this.client.database.users.findOneAndUpdate(
                { idU: i.user.id },
                { $inc: { bank: -entryCost } }
            );

            embed.setDescription(
                `<:coins_k:846487970612903976> **Preço para participar da rinha:** ${entryCost.toLocaleString()} Coins\n` +
                `<:bagcoins:846485891156279297> **Prêmio:** ${totalPrize.toLocaleString()} Coins acumuladas até agora!\n\n` +
                `**Participantes (${participants.length}/${maxPlayers}):**\n${participants.map(p => `${p.emoji} <@${p.id}>`).join('\n')}\n\n` +
                'Clique no botão abaixo para participar!'
            );

            try {
                await msg.edit({ embeds: [embed], components: [row] });
            } catch {}

            if (participants.length >= maxPlayers) {
                try {
                    joinButton.setDisabled(true);
                    // Show draw button for 10 seconds
                    drawButton.setDisabled(false);
                    await msg.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(joinButton, drawButton)] });
                } catch {}
                collector.stop('full');
                // Create a 10s window to press draw
                const drawCollector = msg.createMessageComponentCollector({
                    filter: (x) => x.customId === 'draw_fight',
                    time: 10000,
                    max: 1
                });
                let resolved = false;
                drawCollector.on('collect', async (press) => {
                    try { await press.deferUpdate(); } catch {}
                    if (resolved) return;
                    resolved = true;
                    try {
                        joinButton.setDisabled(true);
                        drawButton.setDisabled(true);
                        await msg.edit({ components: [new ActionRowBuilder().addComponents(joinButton, drawButton)] });
                    } catch {}
                    await resolveFight();
                });
                drawCollector.on('end', async () => {
                    if (resolved) return;
                    resolved = true;
                    try {
                        joinButton.setDisabled(true);
                        drawButton.setDisabled(true);
                        await msg.edit({ components: [new ActionRowBuilder().addComponents(joinButton, drawButton)] });
                    } catch {}
                    await resolveFight();
                });
            }
            processing = false;
        });

        let ended = false;
        collector.on('end', async (col, reason) => {
            if (ended) return; // prevent double processing
            ended = true;
            try {
                joinButton.setDisabled(true);
                await msg.edit({ components: [new ActionRowBuilder().addComponents(joinButton)] });
            } catch {}
            // If ended because full, resolution will be handled by drawCollector window
            if (reason === 'full') return;
            await resolveFight();
        });

        const resolveFight = async () => {
            const totalPrize = participants.length * entryCost;
            const winner = participants[Math.floor(Math.random() * participants.length)];
            if (participants.length < 3) {
                await this.client.database.users.updateMany(
                    { idU: { $in: participants.map(p => p.id) } },
                    { $inc: { bank: entryCost }, $set: { rinha: Date.now() } }
                );
                try { await msg.edit({ content: 'Houveram menos de 3 participantes, portanto ninguém venceu!', embeds: [], components: [] }); } catch {}
                return;
            }
            if (participants.length === 1) {
                await this.client.database.users.updateOne(
                    { idU: winner.id },
                    { $inc: { bank: totalPrize }, $set: { rinha: Date.now() } }
                );
                try { await msg.edit({ content: 'Só houve um participante, portanto ninguém venceu!', embeds: [], components: [] }); } catch {}
                return;
            }
            embed.setDescription(`A rinha de emoji acabou!\n\n🎉 **Vencedor:** ${winner.emoji} <@${winner.id}> ganhou ${totalPrize.toLocaleString()} Coins!`);
            try { await msg.edit({ embeds: [embed], components: [] }); } catch {}
            await this.client.database.users.updateOne(
                { idU: winner.id },
                { $inc: { bank: totalPrize }, $set: { rinha: Date.now() } }
            );
        };
    }
};