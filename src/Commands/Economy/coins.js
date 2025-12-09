const { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType, WebhookClient, EmbedBuilder } = require('discord.js');
const { loadImage, registerFont, createCanvas } = require('canvas');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const fetch = require('node-fetch');
const userCooldownMap = new Map();
const webhook = new WebhookClient({ id: '1267275592215171115', token: 't3foKziDJeEv0CvHQJ7g_1m1Uc33OhX2uIQmdKiwxPr2nhJOIvmwwIkqOcmFGYcjQHTg' });
const webhook2 = new WebhookClient({ id: '1267275592215171115', token: 't3foKziDJeEv0CvHQJ7g_1m1Uc33OhX2uIQmdKiwxPr2nhJOIvmwwIkqOcmFGYcjQHTg' });
registerFont('src/Assets/fonts/Segoe Print.ttf', { family: 'Segoe Print' });
registerFont('src/Assets/fonts/Segoe UI.ttf', { family: 'Segoe UI' });
registerFont('src/Assets/fonts/Segoe UI Black.ttf', { family: 'Segoe UI Black' });
registerFont('src/Assets/fonts/Poppins-Bold.ttf', { family: 'Poppins' });
registerFont('src/Assets/fonts/Poppins-Light.ttf', { family: 'Poppins_Light' });

module.exports = class FofocarCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'coins';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '💸 Economia';
        this.description = 'Mostra o total de coins de um usuário.';
        this.cooldown = 25;
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja ver o total de coins.',
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /**
   * @param {Client} client
   * @param {Message} message
   * @param {User[]} args
   */
    async commandExecute({ message, args }) {

        try {
            const userId = message.author.id;
            const server = message.guild;

            webhook2.send(`**${message.author.tag}** | **(${userId})** | **${server.name}** | **(${server.id})** - **[VIEW] Alerta Flood**`);

            // Verifica se o usuário está no cooldown map
            if (userCooldownMap.has(userId)) {
                const { timestamp, commandCount } = userCooldownMap.get(userId);
                const timeSinceFirstCommand = Date.now() - timestamp;

                // Verifica se o tempo desde o primeiro comando é inferior a 60 segundos
                if (timeSinceFirstCommand < 60000) {
                // Aumenta o contador de comandos do usuário
                    userCooldownMap.set(userId, { timestamp, commandCount: commandCount + 1 });

                    // Se o contador de comandos for igual a 5, envia o ID do usuário via webhook
                    if (commandCount + 1 === 5) {
                        webhook.send(`**[ALERTA DE FLOOD] -  Possível Self-Bot**\n\n O Usuário **${message.author.tag}** | **(${userId})** floodou o comando 'k!coins' 5 vezes em menos de 60 segundos.\NServidor **${server.name}** | **(${server.id})**!`);
                    }
                } else {
                // Se o tempo desde o primeiro comando for superior a 60 segundos, remove o usuário do cooldown map
                    userCooldownMap.delete(userId);
                }
            } else {
            // Se o usuário não está no cooldown map, cria uma entrada para ele
                userCooldownMap.set(userId, { timestamp: Date.now(), commandCount: 1 });
            }

            //const USER = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
            //const USER = message.mentions?.users?.first() || await this.client.users.fetch(args[0] || message.author.id).catch(() => null);
            const USER = message.mentions?.users?.first() || await this.client.users.fetch(args[0]).catch(() => message.author) || message.author;

            if (USER.bot) return;

            const user = await this.client.database.users.findOne({ idU: USER.id });
            if (!user) return message.reply({ content: `${message.author}, este usuário não está registrado em minha database.` });

            if (user.profile.coinsgif === null || user.profile.coinsgif === "null") {
                const canvas = createCanvas(800, 400);
                const ctx = canvas.getContext('2d');
                const carteira = user.coins;
                const banco = user.bank;
                const total = carteira + banco;
                const uLayout = user.layouts;

                // Desenhando Fundo
                const Fundo = await loadImage(`${convertToCDN(user.profile.coinsbg)}`); //user.profile.coinsbg
                ctx.drawImage(Fundo, 0, 0, 800, 400);
                // Desenhando Background

                if (uLayout.white.equipped === true && uLayout.white.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebank.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.black.equipped === true && uLayout.black.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebank2.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.amoled.equipped === true && uLayout.amoled.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebankamoled.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.wamoled.equipped === true && uLayout.wamoled.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebankamoledw.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.purple.equipped === true && uLayout.purple.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebankPurple.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.cyan.equipped === true && uLayout.cyan.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebankCyan.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.rose.equipped === true && uLayout.rose.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebankRose.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.blueriver.equipped === true && uLayout.blueriver.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_BLUERIVER.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.red.equipped === true && uLayout.red.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_RED.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.yellow.equipped === true && uLayout.yellow.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_AMARELO.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.swampgreen.equipped === true && uLayout.swampgreen.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_SWAMPGREEN.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.pink.equipped === true && uLayout.pink.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_PINK.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.darkred.equipped === true && uLayout.darkred.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_BLACKRED.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.forestgreen.equipped === true && uLayout.forestgreen.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_FORESTGREEN.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.blueocean.equipped === true && uLayout.blueocean.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_BLUEOCEAN.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.gray.equipped === true && uLayout.gray.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/LAYOUTCOINS_GRAY.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else if (uLayout.gamoled.equipped === true && uLayout.gamoled.has === true) {
                    const background = await loadImage('./src/Assets/img/jpeg/KCOINSGAMOLED.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                } else {
                    const background = await loadImage('./src/Assets/img/jpeg/kosamebank.png');
                    ctx.drawImage(background, 0, 0, 800, 400);
                }

                const name = USER.globalName ? USER.globalName : USER.username;
                const displayName = name.length > 9 ? name.slice(0, 9) + ' ' : name;

                // Username
                ctx.textAlign = 'center';
                ctx.font = '25px "Segoe UI Black"';
                ctx.fillStyle = user.profile.textcolor;
                ctx.fillText(displayName, 520, 140);

                // Carteira/Banco/Total
                ctx.textAlign = 'left';
                ctx.font = '16px "Poppins"';
                ctx.fillText(`${Math.floor(carteira)}`, 348, 220);
                ctx.fillText(`${Math.floor(banco)}`, 516, 220);
                ctx.fillText(`${Math.floor(total)}`, 682, 220);

                // Carteira/Banco/Total
                ctx.textAlign = 'left';
                ctx.font = '23px "Segoe UI Black"';
                ctx.fillStyle = user.profile.textcolor;
                ctx.fillText(`${Util.toAbbrev(Math.floor(carteira))}`, 342, 252);
                ctx.fillText(`${Util.toAbbrev(Math.floor(banco))}`, 510, 252);
                ctx.fillText(`${Util.toAbbrev(Math.floor(total))}`, 672, 252);

                // Desenhando Avatar
                ctx.arc(143, 203, 106, 0, Math.PI * 2, true);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#1b1b1b'; //ececec
                ctx.stroke();
                ctx.closePath();
                ctx.clip();

                const avatar = await loadImage(USER.displayAvatarURL({ extension: 'png', size: 1024 }));
                ctx.drawImage(avatar, 34, 88, 220, 220);

                const attach = new AttachmentBuilder(canvas.toBuffer('image/png', { quality: 1.0 }), { name: `KsBank_${USER.tag}_.png` });

                message.reply({ files: [attach] });
            } else {
                let gifUrl = `${user.profile.coinsgif}`;
                const profile = user.profile;
                const carteira = user.coins;
                const banco = user.bank;
                const total = carteira + banco;
                const uLayout = user.layouts;
                let sendImage;

                if (uLayout.white.equipped === true && uLayout.white.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebank.png';
                } else if (uLayout.black.equipped === true && uLayout.black.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebank2.png';
                } else if (uLayout.amoled.equipped === true && uLayout.amoled.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebankamoled.png';
                } else if (uLayout.wamoled.equipped === true && uLayout.wamoled.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebankamoledw.png';
                } else if (uLayout.purple.equipped === true && uLayout.purple.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebankPurple.png';
                } else if (uLayout.cyan.equipped === true && uLayout.cyan.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebankCyan.png';
                } else if (uLayout.rose.equipped === true && uLayout.rose.has === true) {
                    sendImage = 'assets/img/jpeg/kosamebankRose.png';
                } else if (uLayout.blueriver.equipped === true && uLayout.blueriver.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_BLUERIVER.png';
                } else if (uLayout.red.equipped === true && uLayout.red.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_RED.png';
                } else if (uLayout.yellow.equipped === true && uLayout.yellow.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_AMARELO.png';
                } else if (uLayout.swampgreen.equipped === true && uLayout.swampgreen.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_SWAMPGREEN.png';
                } else if (uLayout.pink.equipped === true && uLayout.pink.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_PINK.png';
                } else if (uLayout.darkred.equipped === true && uLayout.darkred.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_BLACKRED.png';
                } else if (uLayout.forestgreen.equipped === true && uLayout.forestgreen.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_FORESTGREEN.png';
                } else if (uLayout.blueocean.equipped === true && uLayout.blueocean.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_BLUEOCEAN.png';
                } else if (uLayout.gray.equipped === true && uLayout.gray.has === true) {
                    sendImage = 'assets/img/jpeg/LAYOUTCOINS_GRAY.png';
                } else if (uLayout.gamoled.equipped === true && uLayout.gamoled.has === true) {
                    sendImage = 'assets/img/jpeg/KCOINSGAMOLED.png';
                } else {
                    sendImage = 'assets/img/jpeg/kosamebank.png';
                }

                if (gifUrl === 'null') {
                    gifUrl = 'https://i.imgur.com/CEWbWA7.gif';
                }

                // Monta os dados para enviar ao servidor remoto
                const userData = {
                    username: USER.username,
                    avatarUrl: USER.displayAvatarURL({ extension: 'png', size: 2048 }),
                    profile,
                    sendImage,
                    carteira,
                    banco,
                    total,
                    gifUrl
                };

                const response = await fetch('http://104.237.11.161:8000/generate-gif', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) throw new Error('Falha ao gerar GIF');
                
                const gifBuffer = await response.buffer();
                const filename = `KsBank_${USER.username}.gif`;
                
                const attachment = new AttachmentBuilder(gifBuffer, { name: filename });
                await message.reply({ files: [attachment] });
            }
        } catch (err) {
            if (err) {
                const embedSEMBG = new EmbedBuilder()
                    .setColor('#BA2845')
                    .setDescription('❌ Provavelmente o seu background personalizado foi excluído!\n\nAltere seu background do banco! *(k!perfilcf)*');

                return message.reply({ embeds: [embedSEMBG] });
            }
        }

    }
};

function convertToCDN(url) {
    return url
        .replace(/^https:\/\/api\.phytols\.dev/, 'https://ksm01.b-cdn.net')
        .replace(/^http:\/\/104\.237\.11\.161/, 'https://ksm01.b-cdn.net');
}
