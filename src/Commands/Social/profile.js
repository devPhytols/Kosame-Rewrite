/* eslint-disable prefer-const */
const { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { InsigniaTypes } = require('../../Utils/Objects/InsigniaTypes');
const { Util } = require('../../Utils/Util');
const { loadImage, registerFont, createCanvas } = require('canvas');
const axios = require('axios');
const moment = require('moment');
require('moment-duration-format');
registerFont('src/Assets/fonts/Segoe Print.ttf', { family: 'Segoe Print' });
registerFont('src/Assets/fonts/Segoe UI.ttf', { family: 'Segoe UI' });
registerFont('src/Assets/fonts/Segoe UI Black.ttf', { family: 'Segoe UI Black' });

module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'profile';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Exibe o perfil do usuário mencionado.';
        this.cooldown = 30;
        this.aliases = ['perfil'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja ver o perfil.',
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
        try{

            //const uSrc = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
            const uSrc = message.mentions?.users?.first() || await this.client.users.fetch(args[0] || message.author.id).catch(() => null);
            const user = await this.client.database.users.findOne({ idU: uSrc.id });
            const client = await this.client.database.client.findOne({ _id: this.client.user.id });
            let uLayout = user.layouts;

            if (!user)
                return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

            const cooldown = 0;
            const perfilcd = user.profile.cooldown;
            const time = cooldown - (Date.now() - perfilcd);

            const EMBED1 = new ClientEmbed(message.author)
                .setColor('#BA2845')
                .setDescription(`<:emoji_012:839153898774069268> Aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace('minsuto', 'minutos')}** para usar esse comando novamente!`);

            if (perfilcd !== null && cooldown - (Date.now() - perfilcd) > 0)
                return message.reply({ embeds: [EMBED1] }).then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                }).catch(() => { });

            const vip = user.vip;
            const userLayout = user.profile.layout;
            const canvas = createCanvas(800, 600);
            const ctx = canvas.getContext('2d');

            const coins = user.coins;
            const bank = user.bank;
            const nextLevel = user.Exp.nextLevel * user.Exp.level;

            if (userLayout === 'https://i.imgur.com/MmPq48V.png') {
                user.set({
                    'profile.layout': './src/Assets/img/default/profiles/jTD2ju8.png'
                });
            }

            // if (userLayout.startsWith("https://i.imgur.com/")) {
            //   // Substitui o início da URL por "./src/Assets/img/default/profiles/"
            //   userLayout = "./src/Assets/img/default/profiles/" + userLayout.substring(22);
            // }

            const background = await loadImage(`${user.profile.layout}`);
            const backgroundbanido = await loadImage('./src/Assets/img/default/general/V46Z7YI.png');
            const background2 = await loadImage(`${convertToCDN(user.profile.imagembg)}`);
            const name = uSrc.globalName ? uSrc.globalName : uSrc.username;
            const displayName = name.length > 9 ? name.slice(0, 9) + ' ' : name;

            ctx.drawImage(background2, 0, -45, 800, 446);
            ctx.drawImage(background, 0, 0, 800, 600);

            // NOME DE USUÁRIO
            ctx.textAlign = 'left';
            ctx.font = '50px "Segoe UI Black"';
            ctx.fillStyle = `${user.profile.textcolor}`;
            await Util.renderEmoji(ctx, displayName, 300, 296);

            if (user.marry.has) {
                const marryBlack = await loadImage('./src/Assets/img/jpeg/marryed.png');
                const marryAmoled = await loadImage('./src/Assets/img/jpeg/marryed4M0L3D.png');
                const marryAmoledwhite = await loadImage('./src/Assets/img/jpeg/marryed4M0L3Dw.png');
                const marryWhite = await loadImage('./src/Assets/img/jpeg/marryed2.png');
                const marryPurple = await loadImage('./src/Assets/img/jpeg/marryPurple.png');
                const marryRose = await loadImage('./src/Assets/img/jpeg/marryRose.png');
                const marryCyan = await loadImage('./src/Assets/img/jpeg/marryCyan.png');
                const MRBLUEOCEAN = await loadImage('./src/Assets/img/jpeg/MRBLUEOCEAN.png');
                const MRBLUERIVER = await loadImage('./src/Assets/img/jpeg/MRBLUERIVER.png');
                const MRDARKRED = await loadImage('./src/Assets/img/jpeg/MRDARKRED.png');
                const MRFORESTGREEN = await loadImage('./src/Assets/img/jpeg/MRFORESTGREEN.png');
                const MRGAMOLED = await loadImage('./src/Assets/img/jpeg/MRGAMOLED.png');
                const MRGRAY = await loadImage('./src/Assets/img/jpeg/MRGRAY.png');
                const MRPINK = await loadImage('./src/Assets/img/jpeg/MRPINK.png');
                const MRRED = await loadImage('./src/Assets/img/jpeg/MRRED.png');
                const MRSWAMPGREEN = await loadImage('./src/Assets/img/jpeg/MRSWAMPGREEN.png');
                const MRYELLOW = await loadImage('./src/Assets/img/jpeg/MRYELLOW.png');
                const MRDUDA = await loadImage('./src/Assets/img/jpeg/marryMindNight.png');

                if (uLayout.white.equipped === true && uLayout.white.has === true) {
                    ctx.drawImage(marryWhite, 293, 523, 407, 60);
                } else if (uLayout.black.equipped === true && uLayout.black.has === true) {
                    ctx.drawImage(marryBlack, 293, 523, 407, 60);
                } else if (uLayout.purple.equipped === true && uLayout.purple.has === true) {
                    ctx.drawImage(marryPurple, 293, 523, 407, 60);
                } else if (uLayout.cyan.equipped === true && uLayout.cyan.has === true) {
                    ctx.drawImage(marryCyan, 293, 523, 407, 60);
                } else if (uLayout.rose.equipped === true && uLayout.rose.has === true) {
                    ctx.drawImage(marryRose, 293, 523, 407, 60);
                } else if (uLayout.amoled.equipped === true && uLayout.amoled.has === true) {
                    if (uSrc.id === '1348133269522350110') {
                        ctx.drawImage(MRDUDA, 293, 523, 407, 60);
                    } else {
                        ctx.drawImage(marryAmoled, 293, 523, 407, 60);
                    }
                    // ctx.drawImage(marryAmoled, 293, 523, 407, 60);
                } else if (uLayout.wamoled.equipped === true && uLayout.wamoled.has === true) {
                    ctx.drawImage(marryAmoledwhite, 293, 523, 407, 60);
                } else if (uLayout.blueocean.equipped === true && uLayout.blueocean.has === true) {
                    ctx.drawImage(MRBLUEOCEAN, 293, 523, 407, 60);
                } else if (uLayout.blueriver.equipped === true && uLayout.blueriver.has === true) {
                    ctx.drawImage(MRBLUERIVER, 293, 523, 407, 60);
                } else if (uLayout.darkred.equipped === true && uLayout.darkred.has === true) {
                    ctx.drawImage(MRDARKRED, 293, 523, 407, 60);
                } else if (uLayout.forestgreen.equipped === true && uLayout.forestgreen.has === true) {
                    ctx.drawImage(MRFORESTGREEN, 293, 523, 407, 60);
                } else if (uLayout.gamoled.equipped === true && uLayout.gamoled.has === true) {
                    ctx.drawImage(MRGAMOLED, 293, 523, 407, 60);
                } else if (uLayout.gray.equipped === true && uLayout.gray.has === true) {
                    ctx.drawImage(MRGRAY, 293, 523, 407, 60);
                } else if (uLayout.pink.equipped === true && uLayout.pink.has === true) {
                    ctx.drawImage(MRPINK, 293, 523, 407, 60);
                } else if (uLayout.red.equipped === true && uLayout.red.has === true) {
                    ctx.drawImage(MRRED, 293, 523, 407, 60);
                } else if (uLayout.swampgreen.equipped === true && uLayout.swampgreen.has === true) {
                    ctx.drawImage(MRSWAMPGREEN, 293, 523, 407, 60);
                } else if (uLayout.yellow.equipped === true && uLayout.yellow.has === true) {
                    ctx.drawImage(MRYELLOW, 293, 523, 407, 60);
                } else {
                    ctx.drawImage(marryWhite, 293, 523, 407, 60);
                }

                ctx.font = '23px "Segoe UI Black"';
                await Util.renderEmoji(
                    ctx,
                    // await this.client.users.fetch(user.marry.user).then((x) => x.username.length > 12 ? x.username.slice(0, 12) + ' ' : x.username),
                    await this.client.users.fetch(user.marry.user).then(x => { 
                        const name = x.globalName ? x.globalName : x.username; 
                        return name.length > 12 ? name.slice(0, 12) + ' ' : name;
                    }),
                    360,
                    562
                );
            }

            if (user.bestfriend.has) {
                const bfBlack = await loadImage('./src/Assets/img/jpeg/bestfriend.png');
                const bfAmoled = await loadImage('./src/Assets/img/jpeg/bf4M0L3D.png');
                const bfAmoledwhite = await loadImage('./src/Assets/img/jpeg/bf4M0L3Dw.png');
                const bfWhite = await loadImage('./src/Assets/img/jpeg/bestfriend2.png');
                const bfPurple = await loadImage('./src/Assets/img/jpeg/bfPurple.png');
                const bfRose = await loadImage('./src/Assets/img/jpeg/bfRose.png');
                const bfCyan = await loadImage('./src/Assets/img/jpeg/bfCyan.png');
                const BFBLUEOCEAN = await loadImage('./src/Assets/img/jpeg/BFBLUEOCEAN.png');
                const BFBLUERIVER = await loadImage('./src/Assets/img/jpeg/BFBLUERIVER.png');
                const BFDARKRED = await loadImage('./src/Assets/img/jpeg/BFDARKRED.png');
                const BFFORESTGREEN = await loadImage('./src/Assets/img/jpeg/BFFORESTGREEN.png');
                const BFGAMOLED = await loadImage('./src/Assets/img/jpeg/BFGAMOLED.png');
                const BFGRAY = await loadImage('./src/Assets/img/jpeg/BFGRAY.png');
                const BFPINK = await loadImage('./src/Assets/img/jpeg/BFPINK.png');
                const BFRED = await loadImage('./src/Assets/img/jpeg/BFRED.png');
                const BFSWAMPGREEN = await loadImage('./src/Assets/img/jpeg/BFSWAMPGREEN.png');
                const BFYELLOW = await loadImage('./src/Assets/img/jpeg/BFYELLOW.png');
                const BFDUDA = await loadImage('./src/Assets/img/jpeg/bfMindNight.png');

                if (uLayout.white.equipped === true && uLayout.white.has === true) {
                    ctx.drawImage(bfWhite, 547, 523, 260, 60);
                } else if (uLayout.black.equipped === true && uLayout.black.has === true) {
                    ctx.drawImage(bfBlack, 547, 523, 260, 60);
                } else if (uLayout.purple.equipped === true && uLayout.purple.has === true) {
                    ctx.drawImage(bfPurple, 547, 523, 260, 60);
                } else if (uLayout.cyan.equipped === true && uLayout.cyan.has === true) {
                    ctx.drawImage(bfCyan, 547, 523, 260, 60);
                } else if (uLayout.rose.equipped === true && uLayout.rose.has === true) {
                    ctx.drawImage(bfRose, 547, 523, 260, 60);
                } else if (uLayout.amoled.equipped === true && uLayout.amoled.has === true) {
                    if (uSrc.id === '1348133269522350110') {
                        ctx.drawImage(BFDUDA, 547, 523, 260, 60);
                    } else {
                        ctx.drawImage(bfAmoled, 547, 523, 260, 60);
                    }
                    // ctx.drawImage(bfAmoled, 547, 523, 260, 60);
                } else if (uLayout.wamoled.equipped === true && uLayout.wamoled.has === true) {
                    ctx.drawImage(bfAmoledwhite, 547, 523, 260, 60);
                } else if (uLayout.blueocean.equipped === true && uLayout.blueocean.has === true) {
                    ctx.drawImage(BFBLUEOCEAN, 547, 523, 260, 60);
                } else if (uLayout.blueriver.equipped === true && uLayout.blueriver.has === true) {
                    ctx.drawImage(BFBLUERIVER, 547, 523, 260, 60);
                } else if (uLayout.darkred.equipped === true && uLayout.darkred.has === true) {
                    ctx.drawImage(BFDARKRED, 547, 523, 260, 60);
                } else if (uLayout.forestgreen.equipped === true && uLayout.forestgreen.has === true) {
                    ctx.drawImage(BFFORESTGREEN, 547, 523, 260, 60);
                } else if (uLayout.gamoled.equipped === true && uLayout.gamoled.has === true) {
                    ctx.drawImage(BFGAMOLED, 547, 523, 260, 60);
                } else if (uLayout.gray.equipped === true && uLayout.gray.has === true) {
                    ctx.drawImage(BFGRAY, 547, 523, 260, 60);
                } else if (uLayout.pink.equipped === true && uLayout.pink.has === true) {
                    ctx.drawImage(BFPINK, 547, 523, 260, 60);
                } else if (uLayout.red.equipped === true && uLayout.red.has === true) {
                    ctx.drawImage(BFRED, 547, 523, 260, 60);
                } else if (uLayout.swampgreen.equipped === true && uLayout.swampgreen.has === true) {
                    ctx.drawImage(BFSWAMPGREEN, 547, 523, 260, 60);
                } else if (uLayout.yellow.equipped === true && uLayout.yellow.has === true) {
                    ctx.drawImage(BFYELLOW, 547, 523, 260, 60);
                } else {
                    ctx.drawImage(bfWhite, 547, 523, 260, 60);
                }

                ctx.font = '23px "Segoe UI Black"';
                await Util.renderEmoji(
                    ctx,
                    // await this.client.users.fetch(user.bestfriend.user).then((x) => x.username.length > 12 ? x.username.slice(0, 12) + ' ' : x.username),
                    await this.client.users.fetch(user.bestfriend.user).then(x => { 
                        const name = x.globalName ? x.globalName : x.username; 
                        return name.length > 12 ? name.slice(0, 12) + ' ' : name;
                    }),
                    615,
                    562
                );
            }

            // EXIBINDO OS EMBLEMAS
            const slot1 = await loadImage(String(user.profile.slot1 == 'null' ? './src/Assets/img/default/slots/sbrNHAY.png' : user.profile.slot1 ));
            ctx.drawImage(slot1, 55, 400, 189, 51);

            const slot2 = await loadImage(String(user.profile.slot2 == 'null' ? './src/Assets/img/default/slots/sbrNHAY.png' : user.profile.slot2 ));
            ctx.drawImage(slot2, 55, 456, 189, 51);

            const slot3 = await loadImage(String(user.profile.slot3 == 'null' ? './src/Assets/img/default/slots/sbrNHAY.png' : user.profile.slot3 ));
            ctx.drawImage(slot3, 55, 512, 189, 51);

            // EXIBINDO AS INSIGNIAS VIP
            let vipInsignia;
            let InsigniaVIP;
            //let hasSpecificRole = this.client.guilds.cache.get('834191314328485889').members.cache.get(uSrc.id).roles.cache.has('852624816506011719');

            // let guild = await this.client.guilds.fetch('834191314328485889');
            // let member = await guild.members.fetch(uSrc.id).catch(() => null);

            if (!['429679606946201600', '1348133269522350110'].includes(uSrc.id)) {
                if (vip.hasVip && vip.bLevel == 1) {
                    vipInsignia = './src/Assets/img/default/vips/XuRizwQ.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 2) {
                    vipInsignia = './src/Assets/img/default/vips/hgZpLam.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(vip.hasVip && InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 3) {
                    vipInsignia = './src/Assets/img/default/vips/uyLhMm1.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 4) {
                    vipInsignia = './src/Assets/img/default/vips/rp0z1Rn.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 5) {
                    vipInsignia = './src/Assets/img/default/vips/d5XeOdo.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 6) {
                    vipInsignia = './src/Assets/img/default/vips/vip6.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 7) {
                    vipInsignia = './src/Assets/img/default/vips/vip7.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 8) {
                    vipInsignia = './src/Assets/img/default/vips/vip8.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 9) {
                    vipInsignia = './src/Assets/img/default/vips/vip9.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 10) {
                    vipInsignia = './src/Assets/img/default/vips/onyx.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else if (vip.hasVip && vip.bLevel == 100) {
                    vipInsignia = './src/Assets/img/default/vips/RMoKp9h.png';
                    InsigniaVIP = await loadImage(String(vipInsignia));
                    ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                } else {
                    if (vip.hasVip && vip.upgrade === 1) {
                        vipInsignia = './src/Assets/img/default/vips/XuRizwQ.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 2) {
                        vipInsignia = './src/Assets/img/default/vips/hgZpLam.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 3) {
                        vipInsignia = './src/Assets/img/default/vips/uyLhMm1.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 4) {
                        vipInsignia = './src/Assets/img/default/vips/rp0z1Rn.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 5) {
                        vipInsignia = './src/Assets/img/default/vips/d5XeOdo.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 6) {
                        vipInsignia = './src/Assets/img/default/vips/vip6.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 7) {
                        vipInsignia = './src/Assets/img/default/vips/vip7.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 8) {
                        vipInsignia = './src/Assets/img/default/vips/vip8.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 9) {
                        vipInsignia = './src/Assets/img/default/vips/vip9.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    } else if (vip.hasVip && vip.upgrade === 10) {
                        vipInsignia = './src/Assets/img/default/vips/onyx.png';
                        InsigniaVIP = await loadImage(String(vipInsignia));
                        ctx.drawImage(InsigniaVIP, 729, 258, 35, 35);
                    }
                }
            }
            
            const insignias = user.equippedInsignias; // Obtém os códigos das insígnias do banco de dados
            const insigniaSize = 35; // Tamanho da insígnia
            const startX = user.vip.hasVip ? 729 - 40 : 729;
            const startY = 258;                      
            const spacing = 40; // Espaçamento entre as insígnias
            
            // Verifica se o usuário é booster
            const rivixBooster = await axios.get(`https://api.phytols.dev/api/v2/kosame/${uSrc.id}`);
            const isBooster = rivixBooster.data.some(data => data.isBooster); // Verifica se o usuário é booster

            for (let i = 0; i < insignias.length; i++) {
                const insigniaCode = insignias[i]; // Código da insígnia
            
                // Se a insígnia for 'booster', verifica se o usuário realmente é booster
                if (insigniaCode === 'booster' && !isBooster) continue;
            
                // Obtém a insígnia com base no código
                const insignia = InsigniaTypes[insigniaCode];
            
                if (!insignia) continue; // Ignora se o código da insígnia não estiver no mapeamento
            
                const insigniaPath = insignia.imagePath; // Caminho da imagem da insígnia
                
                // Verifica se o caminho da imagem está correto
                if (!insigniaPath) continue; 
            
                // Carrega a imagem da insígnia
                const insigniaImage = await loadImage(insigniaPath);
                const x = startX - i * spacing; // Subtração para mover as insígnias para a esquerda
                ctx.drawImage(insigniaImage, x, startY, insigniaSize, insigniaSize); // Renderiza a insígnia
            }
            
            

            // EXIBINDO A QUANTIA DE COINS E XP
            ctx.textAlign = 'left';
            ctx.font = '25px "Segoe UI Black"';
            ctx.fillStyle = `${user.profile.textcolor}`;
            ctx.fillText(`${Util.toAbbrev(Math.floor(coins + bank))}`, 620, 493);
            ctx.fillText(`${Util.toAbbrev(user.reps.size)} Reps`, 365, 493);
            ctx.fillText(`Level: ${user.Exp.level}`, 365, 428);
            ctx.fillText(`${Util.toAbbrev(user.Exp.xp)}/${Util.toAbbrev(nextLevel)}`, 620, 428);

            // EXIBINDO O SOBRE MIM
            ctx.font = '25px "Segoe UI"';
            await Util.renderEmoji(ctx, String(user.about == 'null' ? 'Use k!sobremim <msg> para alterar!' : user.about), 254, 339);

            // DESENHANDO O AVATAR
            ctx.save();
            ctx.beginPath();
            ctx.arc(163, 239, 106, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Verifica se o avatar personalizado é válido (não é null ou string vazia)
            const avatarURL = user.profile.customAv && user.profile.customAv !== 'null' ? convertToCDN(user.profile.customAv) : uSrc.displayAvatarURL({ extension: 'png', size: 1024 });
            // Carrega a imagem do avatar
            const avatar = await loadImage(avatarURL);
            ctx.drawImage(avatar, 56, 125, 220, 220);
            ctx.restore();

            if (user.profile.moldura && user.profile.moldura !== 'null') {
                const moldura = await loadImage(`${user.profile.moldura}`);
                ctx.drawImage(moldura, 0, 0, 800, 600);
            }

            if (client.blacklist.some((x) => x == uSrc.id)) ctx.drawImage(backgroundbanido, 0, 0, 800, 600);

            const attach = new AttachmentBuilder(canvas.toBuffer('image/png', { quality: 1.0 }), { name: `Profile_${uSrc.tag}_.png` });

            message.reply({ files: [attach] });

            user.profile.cooldown = Date.now();
            user.save();

        } catch (err) {
            if (err) {
                console.log('ERRO NO PERFIL: ', err);
                const embedSEMBG = new ClientEmbed()
                    .setColor('#BA2845')
                    .setDescription('❌ Provavelmente o seu background personalizado foi excluído!\n\nUtilize: k!buybg reset');

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