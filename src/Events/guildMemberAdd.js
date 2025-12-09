/* eslint-disable prefer-const */
const { Event } = require('../Structures/Structures.js');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { loadImage, registerFont, createCanvas } = require('canvas');
registerFont('src/Assets/fonts/Segoe Print.ttf', { family: 'Segoe Print' });
registerFont('src/Assets/fonts/Segoe UI.ttf', { family: 'Segoe UI' });
registerFont('src/Assets/fonts/Segoe UI Black.ttf', { family: 'Segoe UI Black' });

module.exports = class guildMemberAddEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'guildMemberAdd';
    }

    async execute(member) {
        try {
            // Var globais
            let afDias;
            let guild = member.guild;
            let server = await this.client.database.guilds.findOne({ idS: guild.id }).lean();
            let accAge = Math.abs(Date.now() - member.user.createdAt);
            let accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));
            let channel = server && server.welcome && server.welcome.channel ? this.client.channels.cache.get(server.welcome.channel) : null;
            let autobadge = (server && server.autobadge) || null;
            let badges = member.user.flags;

            // Verifica se o sistema de AutoBadge está como deveria
            if (autobadge && autobadge.status && autobadge.status === true) {
                // Verifica se Early Supporter está configurado
                if (autobadge.earlySupporter.role !== null) {
                    if (badges.has('PremiumEarlySupporter')) {
                        const role = guild.roles.cache.get(autobadge.earlySupporter.role);
                        if (role) {
                            member.roles.add(role);
                        }
                    }
                }
                // Verifica se Certified Developer está configurado
                if (autobadge.verifiedDeveloper.role !== null) {
                    if (badges.has('VerifiedDeveloper')) {
                        const role = guild.roles.cache.get(autobadge.verifiedDeveloper.role);
                        if (role) {
                            member.roles.add(role);
                        }
                    }
                }
                // Verifica se HypeSquad Events está configurado
                if (autobadge.hypeSquad.role !== null) {
                    if (badges.has('Hypesquad')) {
                        const role = guild.roles.cache.get(autobadge.hypeSquad.role);
                        if (role) {
                            member.roles.add(role);
                        }
                    }
                }
                // Verifica se Certified Moderator está configurado
                if (autobadge.certifiedModerator.role !== null) {
                    if (badges.has('CertifiedModerator')) {
                        const role = guild.roles.cache.get(autobadge.certifiedModerator.role);
                        if (role) {
                            member.roles.add(role);
                        }
                    }
                }
                // Verifica se Partner está configurado
                if (autobadge.partner.role !== null) {
                    if (badges.has('Partner')) {
                        const role = guild.roles.cache.get(autobadge.partner.role);
                        if (role) {
                            member.roles.add(role);
                        }
                    }
                }
            }

            // Verifica se o servidor existe, caso não, ele criará o documento
            if (!server) server = await new this.client.database.guilds({ idS: guild.id }).save();
            // Caso possua uma quantia de dias definida
            if (server.antifake) {
                afDias = server.antifake.dias;
            } else {
                afDias = 30; // Caso o tempo não esteja definido
            }

            const embedAntiFake = new EmbedBuilder()
                .setColor('#de3535')
                .setDescription(`<:kosame_outage:1020142851545387098> ${member} \`(${member.user.id})\` foi expulso do servidor!\n<:kosame_list:1020142889877131334> **Motivo:** Conta com menos de ${afDias} dias`);

            if (server && server.antifake && server.antifake.status) {
                if (accDays <= afDias) {
                    if (server.antifake.logsch === 'null') {
                        member.kick({ reason: 'Kosame Anti-Fake' });
                    } else {
                        this.client.channels.cache.get(server.antifake.logsch).send({ embeds: [embedAntiFake] }).then(member.kick({ reason: 'Kosame Anti-Fake' }));
                    }
                }
            }

            if (server.autorole.status) {
                member.roles.add(server.autorole.roles, 'Kosame AutoRole');
            }

            if (server.welcome.status) {
                // Inicia o processamento de imagens e criação do card 700x250
                const canvas = createCanvas(700, 250);
                const ctx = canvas.getContext('2d');

                // Desenhando Card
                let wFundo;
                try {
                    wFundo = await loadImage(server.welcome.background);
                } catch (error) {
                    console.error(`Erro ao carregar a imagem: ${error}`);
                    wFundo = await loadImage('https://i.imgur.com/ZXOGC2Z.jpg');
                }
                ctx.drawImage(wFundo, 0, 0, 700, 250);
                const wCard = await loadImage('./src/Assets/img/system/welcome-card.png');
                ctx.drawImage(wCard, 0, 0, 700, 250);

                // Escreve a Primeira Mensagem
                ctx.textAlign = 'left';
                ctx.font = '25px "Segoe UI Black"';
                ctx.fillStyle = server.welcome.colortext;
                ctx.fillText('Bem-vindo(a)', 363, 101);

                // Escreve a Segunda Mensagem
                ctx.textAlign = 'left';
                ctx.font = '25px "Segoe UI Black"';
                ctx.fillStyle = server.welcome.colortext;
                ctx.fillText(`${member.user.tag}`, 332, 155);

                // Escreve o Member Count
                ctx.textAlign = 'left';
                ctx.font = '25px "Segoe UI Black"';
                ctx.fillStyle = server.welcome.colortext;
                ctx.fillText(`#${member.guild.memberCount}`, 325, 213);

                // Desenhando Avatar
                ctx.arc(208, 126, 101, 0, Math.PI * 2, true);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#ececec';
                ctx.stroke();
                ctx.closePath();
                ctx.clip();

                const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg' }));
                ctx.drawImage(avatar, 90, 25, 220, 220);

                // Prepara a imagem e a envia no canal destinado
                const Attach = new AttachmentBuilder(canvas.toBuffer(),`KsW_${member.user.id}_.png`);
                if (channel) {
                    channel.send({ content: `${server.welcome.msg === 'null' ? `${member.user} acabou de entrar no servidor!` : server.welcome.msg
                        .replace(/{member}/g, `<@${member.id}>`)
                        .replace(/{name}/g, `${member.user.globalName}`)
                        .replace(/{total}/g, guild.memberCount)
                        .replace(/{guildName}/g, guild.name)}`, files: [Attach] });
                }
            }

        } catch (err) {
            this.client.logger.error(err.message, guildMemberAddEvent.name);
            return this.client.logger.warn(err.stack, guildMemberAddEvent.name);
        }
    }
};
