/* eslint-disable no-sync */
/* eslint-disable no-inner-declarations */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, WebhookClient } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { AttachmentBuilder } = require('discord.js');
const { loadImage, registerFont, createCanvas } = require('canvas');
registerFont('src/Assets/fonts/Poppins-Bold.ttf', { family: 'Poppins' });
registerFont('src/Assets/fonts/Poppins-Light.ttf', { family: 'Poppins_Light' });
registerFont('src/Assets/fonts/OpenSans-Bold.ttf', { family: 'OpenSans' });
const { Util } = require('../../Utils/Util');
const userCooldownMap = new Map();
const cooldowns = new Map();
const fs = require('fs');
const path = require('path');

module.exports = class RankcoinsCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'rank';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha informações do Leaderboard de Coins e XP.';
        this.aliases = ['top'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'coins',
                required: false,
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Ranking de coins.'
            },
            {
                name: 'season',
                required: false,
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Ranking de Temporada.'
            },
            {
                name: 'xp',
                required: false,
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Ranking de XP.'
            },
            {
                name: 'crimes',
                required: false,
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Ranking de Criminosos.'
            }
        ];
    }

    /**
 * @param {Client} client
 * @param {Message} message
 * @param {User[]} args
 */
    async commandExecute({ message, args }) {

        if (!args[0])
            return message.reply(`${message.author}, forma correta de utilizar: **k!top <coins/xp>**`);

        if (args[0] == 'xp') {
            try {
                await require('mongoose')
                    .connection.collection('users')
                    .find({
                        'Exp.level': {
                            $gt: 90
                        }
                    })
                    .toArray((err, res) => {
                        if (err) throw err;

                        const Exp = res.map((x) => x.Exp).sort((x, f) => f.level - x.level);
                        const ranking = [...Exp.values()].findIndex((x) => x.id === message.author.id) + 1;

                        const EMBED = new EmbedBuilder()
                            .setTitle(`<:Rank:850212030563614753> ${this.client.user.username} - Ranking Global de XP`, this.client.user.displayAvatarURL())
                            .setDescription(Exp.map((x, f) => `**\`${f + 1}º\`** **${x.user}** ( Level: ${x.level} / XP: ${x.xp} )\n**\`ID:\`**: \`${x.id}\``).slice(0, 10).join('\n\n'))
                            .setFooter({ text: 'Não está no rank? continue utilizando o bot de ganhe XP!', iconURL: message.author.displayAvatarURL({ size: 2048 }) })
                            .setThumbnail(message.author.displayAvatarURL({ size: 2048 }));

                        message.reply({ embeds: [EMBED] }).catch();
                    });
            } catch (err) {
                console.log(`ERRO NO COMANDO RANK XP\nERROR: ${err}`);
            }
        }

        if (args[0] == 'season') {
            try {
                const client = this.client;
                // Verificação de bloqueio global do comando season
                try {
                    const clientDoc = await client.database.client.findOne({ _id: client.user.id });
                    if (clientDoc?.seasonLock) {
                        return message.reply(clientDoc.seasonLockMsg || 'O ranking de temporada está temporariamente indisponível.');
                    }
                } catch (e) {
                    // Silencie erros de leitura do clientDoc para não quebrar o comando
                }
                const cacheFile = path.join(__dirname, '../../leaderboardCache.json');

                // Carrega cache salvo em disco (se existir)
                let savedCache = [];
                try {
                    savedCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                } catch {
                    savedCache = [];
                }

                const usersData = await client.database.users.find({ bank: { $gt: 0 } })
                    .sort({ 'globalstats.score': -1 })
                    .limit(10);

                async function generateImage() {
                    const width = 2000;
                    const height = 1600;
                    const canvas = createCanvas(width, height);
                    const ctx = canvas.getContext('2d');
                    let backgroundImage = await loadImage('./src/Assets/img/default/general/rank.png');
                    ctx.drawImage(backgroundImage, 0, 0, width, height);
                    let startY = 480; // posição inicial vertical
                    let rowHeight = 105; // distância entre cada linha

                    ctx.font = '24px OpenSans';
                    for (let i = 0; i < usersData.length; i++) {
                        let user = await client.users.fetch(usersData[i].idU);
                        let money = usersData[i].bank;
                        let bets = usersData[i].globalstats.totalBets;
                        let wins = usersData[i].globalstats.wins;
                        let winRate = bets > 0 ? ((wins / bets) * 100).toFixed(0) + '%' : 'NaN%';

                        let y = startY + i * rowHeight;

                        // Nome (alinhado à esquerda)
                        ctx.font = 'Bold 50px OpenSans';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'left';
                        ctx.fillText(`${user.username}`, 370, y);

                        // Coins (alinhado à direita)
                        ctx.textAlign = 'right';
                        ctx.fillText(Util.toAbbrev(money), 950, y);

                        // Apostas (alinhado à direita)
                        ctx.fillText(bets, 1200, y);

                        // Ganhos (alinhado à direita)
                        ctx.fillText(wins, 1500, y);

                        // WR (alinhado à direita)
                        ctx.fillText(winRate, 1800, y);

                        // ======================= SETA =======================
                        const userCache = savedCache.find(u => u.id === user.id);
                        let arrow = '–';
                        let color = '#cccccc';

                        if (userCache) {
                            if (userCache.rank > i) {
                                arrow = '▲';
                                color = '#00ff00';
                            } else if (userCache.rank < i) {
                                arrow = '▼';
                                color = '#ff4444';
                            }
                        }

                        ctx.fillStyle = color;
                        ctx.textAlign = 'center';
                        ctx.font = 'Bold 40px OpenSans';
                        ctx.fillText(arrow, 301, y - 8);
                    }

                    // Atualiza cache em memória
                    const newCache = usersData.map((u, index) => ({
                        id: u.idU,
                        rank: index
                    }));

                    // Salva cache em JSON
                    fs.writeFileSync(cacheFile, JSON.stringify(newCache, null, 2));

                    return canvas.toBuffer('image/png', { quality: 1.0 });
                }

                const buffer = await generateImage();
                const attachment = new AttachmentBuilder(buffer, { name: 'kosame_cripto.png' });
                message.reply({ files: [attachment] });
            } catch (err) {
                console.log(`ERRO NO COMANDO RANK GLOBAL\nERROR: ${err}`);
            }
        }

        if (args[0] == 'coins') {
            try {
                // Dentro do comando
                const cooldownSeconds = 20;
                const now = Date.now();
                const guildId = message.guild.id;

                if (cooldowns.has(guildId)) {
                    const lastExecution = cooldowns.get(guildId);

                    const timeDifference = now - lastExecution;
                    const remainingCooldown = cooldownSeconds * 1000 - timeDifference;

                    if (remainingCooldown > 0) {
                        return message.reply(`Aguarde ${Math.ceil(remainingCooldown / 1000)} segundos antes de usar o comando novamente neste servidor.`).then((message) => setTimeout(() => message.delete(), 1000 * 10));
                    }
                }

                const userId1 = message.author.id;
                const server = message.guild;

                await this.client.database.users.aggregate([
                    { $sort: { bank: -1 } },
                    { $limit: 12 }
                ]).then(async (usuarios) => {
                    const userIdsArray = usuarios.map(user => user.idU);
                    const arrayCoins = usuarios.map(user => user.bank);

                    // Criando a Imagem
                    const canvas = createCanvas(800, 500);
                    const ctx = canvas.getContext('2d');
                    let BG = await loadImage('./src/Assets/img/default/general/si24sdR.png');
                    ctx.drawImage(BG, 0, 0, canvas.width, canvas.height);

                    // ------------------------------------------------------------------- //

                    let positionOne = 100;

                    for (let i = 0; i < userIdsArray.slice(0, 6).length; i++) {
                        const user = await this.client.users.fetch(userIdsArray[i]);
                        const userBank = arrayCoins[i];

                        const NAME = user.username.slice(0, 16);

                        ctx.font = '18px "Poppins_Light"';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'left';

                        ctx.fillText(NAME, 125, positionOne + 5);

                        ctx.font = '25px "Poppins"';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';

                        ctx.fillText(`${Util.toAbbrev(userBank)}`, 330, positionOne + 5);

                        ctx.font = '13px "Poppins"';

                        ctx.fillText('Coins', 330, positionOne + 20);

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(85, positionOne, 29, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();

                        const AVATAR = await loadImage(
                            user.displayAvatarURL({ extension: 'png', size: 1024 })
                        );

                        ctx.drawImage(AVATAR, 47.5, positionOne - 45, 75, 75);

                        ctx.restore();

                        positionOne = positionOne + 70;
                    }

                    let positionTwo = 100;

                    for (let userId of userIdsArray.slice(6, 12)) {
                        const index = userIdsArray.indexOf(userId);
                        const userBank = arrayCoins[index];
                        const user = await this.client.users.fetch(userId);

                        const NAME = user.username.slice(0, 16);

                        ctx.font = '18px "Poppins_Light"';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'left';

                        ctx.fillText(NAME, 520, positionTwo + 5);

                        ctx.font = '23px "Poppins"';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';

                        ctx.fillText(Util.toAbbrev(userBank), 720, positionTwo + 5);

                        ctx.font = '13px "Poppins"';

                        ctx.fillText('Coins', 720, positionTwo + 20);

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(480, positionTwo, 29, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();

                        const AVATAR = await loadImage(
                            user.displayAvatarURL({ dynamic: false, extension: 'png' })
                        );

                        ctx.drawImage(AVATAR, 447.5, positionTwo - 45, 75, 75);

                        ctx.restore();

                        positionTwo = positionTwo + 70;
                    }

                    // ------------------------------------------------------------------- //

                    const attach = new AttachmentBuilder(canvas.toBuffer('image/png', { quality: 1.0 }), { name: `Ranking_${message.author.tag}.png` });

                    message.reply({ files: [attach] }).catch();

                    cooldowns.set(guildId, now);
                    BG = null;
                });
            } catch (err) {
                console.log(`ERRO NO COMANDO RANKCOINS\nERROR: ${err}`);
            }
        }

        if (args[0] == 'meias') {
            try {
                // Verifica se o evento está pausado
                const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
                if (clientData?.eventoPausado) {
                    return message.reply('❄️ O Evento de Natal está pausado no momento. Aguarde!');
                }

                // Cooldown do comando
                const cooldownSeconds = 20;
                const now = Date.now();
                const guildId = message.guild.id;

                if (cooldowns.has(guildId + '_meias')) {
                    const lastExecution = cooldowns.get(guildId + '_meias');
                    const timeDifference = now - lastExecution;
                    const remainingCooldown = cooldownSeconds * 1000 - timeDifference;

                    if (remainingCooldown > 0) {
                        return message.reply(`Aguarde ${Math.ceil(remainingCooldown / 1000)} segundos antes de usar o comando novamente.`).then((msg) => setTimeout(() => msg.delete(), 1000 * 10));
                    }
                }

                // Busca usuários ordenados por total de meias
                const usersData = await this.client.database.users.find({ 'evento.moeda2': { $gt: 1 } })
                    .sort({ 'evento.moeda2': -1 })
                    .limit(12)
                    .lean();

                if (usersData.length === 0) {
                    return message.reply('Ainda não há usuários com meias natalinas no ranking!');
                }

                // Fetch todos os usuários em paralelo
                const userPromises = usersData.map(u => this.client.users.fetch(u.idU).catch(() => null));
                const users = await Promise.all(userPromises);

                // Criando a Imagem
                const canvas = createCanvas(800, 500);
                const ctx = canvas.getContext('2d');
                let BG = await loadImage('./src/Assets/img/default/general/ranknatal.png');
                ctx.drawImage(BG, 0, 0, canvas.width, canvas.height);

                // Carrega todos os avatares em paralelo
                const avatarPromises = users.map(user =>
                    user ? loadImage(user.displayAvatarURL({ extension: 'png', size: 128 })).catch(() => null) : Promise.resolve(null)
                );
                const avatars = await Promise.all(avatarPromises);

                // Layout
                const startY = 175;
                const rowHeight = 58;
                const leftAvatarX = 52, leftNameX = 85, leftMeiasX = 320;
                const rightAvatarX = 448, rightNameX = 480, rightMeiasX = 724;
                const avatarRadius = 25;

                for (let i = 0; i < Math.min(usersData.length, 12); i++) {
                    const user = users[i];
                    if (!user) continue;

                    const meias = usersData[i].evento?.moeda2 || 0;
                    const NAME = user.username.slice(0, 12);

                    const isLeftColumn = i < 6;
                    const rowIndex = isLeftColumn ? i : i - 6;
                    const y = startY + rowIndex * rowHeight;

                    const avatarX = isLeftColumn ? leftAvatarX : rightAvatarX;
                    const nameX = isLeftColumn ? leftNameX : rightNameX;
                    const meiasX = isLeftColumn ? leftMeiasX : rightMeiasX;

                    // Avatar circular
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(avatarX, y, avatarRadius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();

                    const AVATAR = avatars[i];
                    if (AVATAR) {
                        ctx.drawImage(AVATAR, avatarX - avatarRadius, y - avatarRadius, avatarRadius * 2, avatarRadius * 2);
                    }
                    ctx.restore();

                    // Nome do usuário
                    ctx.font = '18px "Poppins"';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'left';
                    ctx.fillText(NAME, nameX, y + 6);

                    // Quantidade de meias
                    ctx.font = 'Bold 20px "Poppins"';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'left';
                    ctx.fillText(`${Util.toAbbrev(meias)}`, meiasX, y + 6);
                }

                const attach = new AttachmentBuilder(canvas.toBuffer('image/png', { quality: 1.0 }), { name: `RankMeias_${message.author.tag}.png` });
                message.reply({ files: [attach] });

                cooldowns.set(guildId + '_meias', now);
                BG = null;
            } catch (err) {
                console.log(`ERRO NO COMANDO RANK MEIAS\nERROR: ${err}`);
            }
        }

        if (args[0] == 'crimes') {
            try {
                await require('mongoose').connection.collection('users').find({ 'crime.sucessos': { $gt: 2100 } })
                    .toArray((err, res) => {
                        if (err) throw err;

                        const crime = res.map((x) => x.crime).sort((x, f) => f.sucessos - x.sucessos);
                        const ranking = [...crime.values()].findIndex((x) => x.id === message.author.id) + 1;

                        const EMBED = new EmbedBuilder()
                            .setTitle('Kosame — Ranking Global de Criminosos', this.client.user.displayAvatarURL())
                            .setDescription(crime.map((x, f) => `**\`${f + 1}º\`** **${x.user}** ( Crimes: ${x.sucessos} )\n**\`ID:\`**: \`${x.id}\``).slice(0, 10).join('\n\n'))
                            .setThumbnail('https://cdn.discordapp.com/attachments/1015095138684522636/1015095821684981830/crimes.png');

                        message.reply({ embeds: [EMBED] }).catch();
                    });
            } catch (err) {
                console.log(`ERRO NO COMANDO RANK CRIMES\nERROR: ${err}`);
            }
        }

        if (args[0] === 'reps') {
            const usersCollection = require('mongoose').connection.collection('users');

            // Busca os top 20 por tamanho do array de reps
            const REPS = await usersCollection
                .find({ 'reps.size': { $gt: 2000 } })
                .sort({ 'reps.size': -1 })
                .project({ idU: 1, 'reps.size': 1 })
                .toArray();

            // Descobre a posição do autor (índice + 1)
            const userPosition = REPS.findIndex(doc => doc.idU === message.author.id) + 1;


            const members = await Promise.all(
                REPS.map(async (doc) => {
                    try {
                        const user = await this.client.users.fetch(doc.idU);
                        return {
                            user,
                            reps: doc.reps.size
                        };
                    } catch (err) {
                        // Usuário pode não existir mais
                        return null;
                    }
                })
            );

            // Remove nulos e pega top 10
            const repsMap = members
                .filter(Boolean)
                .sort((a, b) => b.reps - a.reps)
                .slice(0, 10);

            const TOP = new EmbedBuilder()
                .setTitle(`${this.client.user.username} — Ranking Global de Reps`)
                .setDescription(repsMap.map((x, i) =>
                    `\`${i + 1}º\` **${x.user.tag}** - ( ${Util.toAbbrev(x.reps)} Reps )\n\`ID:\` \`${x.user.id}\``).join('\n\n'))
                .setThumbnail('https://cdn.discordapp.com/attachments/1015095138684522636/1015096060936474655/reps.png')
                .setFooter({
                    text: userPosition
                        ? `Sua posição: ${userPosition}º • Continue coletando reputações!`
                        : 'Você ainda não está no ranking, continue coletando reputações!',
                    iconURL: message.author.displayAvatarURL({ size: 2048 })
                });

            message.reply({ embeds: [TOP] });
        }
    }
};
