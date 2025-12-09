/* eslint-disable prefer-const */
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { type } = require('../../Utils/Objects/vipTypes.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const talkedRecently = new Set();
const moment = require('moment');
require('moment-duration-format');

module.exports = class RecompensaCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'recompensa';
        this.type = ApplicationCommandType.ChatInput;
        this.description = '[VIP] Resgate a sua recompensa do plano vip.';
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
        const carteira = user.coins;
        const banco = user.bank;
        const vip = user.vip;
        const userXp = user.Exp.xp;

        let cooldown = 1.296e9;
        let cdRecompensa = user.recompensa;
        let time = cooldown - (Date.now() - cdRecompensa);

        let recompensa;
        let xpGive;

        if (vip.upgrade === 1) {
            recompensa = 10000000;
            xpGive = 35;
        } else if (vip.upgrade === 2) {
            recompensa = 20000000;
            xpGive = 45;
        } else if (vip.upgrade === 3) {
            recompensa = 30000000;
            xpGive = 55;
        } else if (vip.upgrade === 4) {
            recompensa = 40000000;
            xpGive = 65;
        } else if (vip.upgrade === 5) {
            recompensa = 50000000;
            xpGive = 75;
        } else if (vip.upgrade === 6) {
            recompensa = 60000000;
            xpGive = 85;
        } else if (vip.upgrade === 7) {
            recompensa = 130000000;
            xpGive = 95;
        } else if (vip.upgrade === 8) {
            recompensa = 400000000;
            xpGive = 150;
        } else if (vip.upgrade === 9) {
            recompensa = 600000000;
            xpGive = 420;
        } else if (vip.upgrade === 10) {
            recompensa = 800000000;
            xpGive = 420;
        } else {
            recompensa = 1500000;
            xpGive = 40;
        }

        if (!vip.hasVip)
            return message.reply({ content: `${message.author}, você precisa ser VIP para utilizar este comando!` });

        if (talkedRecently.has(message.author.id))
            return message.reply('<:emoji_012:839153898774069268> Aguarde para usar esse comando novamente!');

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (cdRecompensa !== null && cooldown - (Date.now() - cdRecompensa) > 0) {
            const EMBED1 = new ClientEmbed()
                .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                .setDescription(`Sua recompensa só estará disponível novamente em **${moment.duration(time).format('d [Dias] h [Horas] e m [Minutos]')}**`)
                .setThumbnail('https://i.imgur.com/m2PpS46.png', { size: 1024 });

            return message.reply({ embeds: [EMBED1] });
        }
        talkedRecently.add(message.author.id);

        setTimeout(() => {
            // Remove o usuario do cooldown após 20 segundos
            talkedRecently.delete(message.author.id);
        }, 15000);
        const resgatarBtn = new ButtonBuilder()
            .setCustomId('resgatar')
            .setLabel('Clique aqui e receba a sua recompensa agora!')
            .setStyle('Primary');

        const embedPremio = new ClientEmbed()
            .setColor('#4b93e5')
            .setDescription(`<:coins:842208238631125053> Você resgatou a sua recompensa e recebeu **${Util.toAbbrev(recompensa)} coins** + **${xpGive} XP!**\n\n<:vipinfo:1047247009796599830> **(Benefício VIP ${type[vip.upgrade].name})**!\n\n<:kosamebank:1009206036294545428> Agora você possui **${Util.toAbbrev(carteira + banco + recompensa)} coins.**`)
            .setThumbnail('https://i.imgur.com/3XgkBrt.png', { size: 1024 });

        const embedTimeout = new ClientEmbed()
            .setColor('#f02626')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription('Acabou o tempo para resgatar!');

        const buttonRow = new ActionRowBuilder().addComponents([resgatarBtn]);
        const msg = await message.reply({ content: 'https://cdn.discordapp.com/attachments/1049828336773382255/1049828366183833701/recompensa.gif', components: [buttonRow], fetchReply: true });
        const filter = (i) => {
            return i.isButton() && i.message.id === msg.id;
        };
        const copoCollector = msg.createMessageComponentCollector({ filter: filter, time: 10000, errors: ['time'], max: 1 });

        copoCollector.on('end', (c) => {
            if (c.size === 0) {
                const components = [resgatarBtn];

                components.forEach((x) => x.setDisabled(true));
                msg.edit({ content: `${message.author}`, embeds: [embedTimeout], components: [buttonRow] });
            }
        });

        copoCollector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }

            if (i.customId === 'resgatar') {
                if (cdRecompensa !== null && cooldown - (Date.now() - cdRecompensa) > 0) {
                    const EMBED1 = new ClientEmbed()
                        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                        .setDescription(`Sua recompensa só estará disponível novamente em **${moment.duration(time).format('d [Dias] h [Horas] e m [Minutos]')}**`)
                        .setThumbnail('https://i.imgur.com/m2PpS46.png', { size: 1024 });

                    return message.reply({ embeds: [EMBED1] });
                }

                await this.client.database.users.findOneAndUpdate(
                    { idU: message.author.id },
                    {
                        $inc: { coins: recompensa },
                        $set: {
                            'Exp.xp': userXp + xpGive,
                            recompensa: Date.now()
                        }
                    }
                );
                return i.update({ content: `${message.author}`, embeds: [embedPremio], components: [] });
            }
        });
    }
};
