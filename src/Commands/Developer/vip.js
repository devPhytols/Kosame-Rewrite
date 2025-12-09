const { ApplicationCommandType, ApplicationCommandOptionType, WebhookClient, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const { type } = require('../../Utils/Objects/vipTypes.js');
const moment = require('moment');
const ms = require('ms');
require('moment-duration-format');

module.exports = class VipCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'vip';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '🔩 Dev';
        this.description = 'Veja informações e o tempo de duração do seu vip.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Veja as informações do VIP.',
                options: [
                    {
                        name: 'user',
                        description: 'Inserir o ID do usuário!',
                        type: ApplicationCommandOptionType.User,
                        required: false
                    }
                ]
            },
            {
                name: 'add',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Adiciona o VIP para um usuário.',
                options: [
                    {
                        name: 'user',
                        description: 'Inserir o ID do usuário!',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'time',
                        description: 'Inserir a duração do VIP!',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Remove o VIP de um usuário.',
                options: [
                    {
                        name: 'user',
                        description: 'Inserir o ID do usuário!',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    }
                ]
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {
        moment.locale('pt-BR');

        //const USER = this.client.users.cache.get(args[1]) || message.mentions?.users?.first() || message.author;
        const USER = message.mentions?.users?.first() || await this.client.users.fetch(args[1]).catch(() => message.author) || message.author;
        const user = await this.client.database.users.findOne({ idU: USER.id });
        const vip = user.vip;

        const Webhook = new WebhookClient({ id: '1380647784344060024', token: 'Fz4LnLLqZrtom5R_UlSm4nCGHujjMQgahYP8_13miRYrrK9lPtTUfkXc7sWlh4TWORJW' });
        const Webhook2 = new WebhookClient({ id: '1125114902059700234', token: 'kH5INStMUQHEdHYQpOiafQJKTDiANTHQWK7AjFgfcWoZF_C2nj3Q8C3bqfaH9nwbjRdq' });

        const EMBEDVIPADD = new ClientEmbed()
            .setAuthor({ name: 'Entrega de VIP efetuada!', iconURL: USER.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription(`**Servidor que foi Usado:** \`${message.guild.name}\`\n\n**VIP Entregue por:** \`${message.author.tag}\`\n\n**Data da Entrega:** \`${moment(Date.now()).format('L LT')}\`\n**Tempo:** \`${args[2]}\`\n\n**Comprador:** \`${USER.tag} | ${USER.id}\`\n`)
            .setThumbnail(USER.displayAvatarURL({ extension: 'jpg', size: 2048 }));

        const Embed1 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, a forma correta de utilizar é **k!vip info**, tente novamente!`);

        if (!args[0])
            return message.reply({ embeds: [Embed1] });

        if (['info'].includes(args[0].toLowerCase())) {
            const button = new ButtonBuilder()
                .setCustomId('infos')
                .setStyle('Secondary')
                .setLabel('Benefícios')
                .setEmoji('<:vipawards:1047297806169280552>');

            const embed = new ClientEmbed()
                .setAuthor({ name: `${USER.username}#${USER.discriminator}`, iconURL: USER.displayAvatarURL(() => ({ dynamic: true })) })
                .addFields(
                    {
                        name: '<:vipinfo:1047247009796599830> **Status VIP:**',
                        value: vip.hasVip ? `Ativo (${type[vip.upgrade].name})` : 'Não Possui'
                    });

            if (vip.hasVip) {
                embed
                    .setThumbnail(type[vip.upgrade].icon[1])
                    .addFields(
                        {
                            name: '<:vipacumulado:1047246775787982999> VIP Acumulado:',
                            value: moment.duration(Date.now() - vip.cooldown).format('Y [ano] M [meses] d [dias] h [horas] m [minutos]').replace('minsutos', 'minuto(s)')
                        },
                        {
                            name: '<:viprestante:1047247042210185317> VIP Restante:',
                            value: moment.duration(vip.date - Date.now()).format('Y [anos] M [meses] d [dias] h [horas] m [minutos]').replace('minsutos', 'minuto(s)')
                        });
            }

            const row = new ActionRowBuilder().addComponents(button);
            const msg = await message.reply({ embeds: [embed], components: vip.hasVip ? [row] : [], fetchReply: true, ephemeral: false });
            const filter = (i) => {
                if (i.user.id !== message.author.id) {
                    i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                    return false;
                }

                return i.isButton() && i.message.id === msg.id && i.user.id === message.author.id;
            };
            const collector = msg.createMessageComponentCollector({ filter, time: 60_000, errors: ['time'] });

            collector.on('end', (c, r) => {
                if (c.size !== 0 && r === 'time') {
                    button.setDisabled(true);

                    return msg.edit({ components: [row] });
                }
            });

            collector.on('collect', (i) => {
                if (i.customId === 'infos') {
                    const embed = new ClientEmbed()
                        .setTitle(`${type[vip.upgrade].icon[0]} Vip ${type[vip.upgrade].name}`)
                        .setThumbnail('https://cdn.discordapp.com/attachments/1093712281432510495/1109144713065406514/j1jr8K2.png');

                    if (vip.upgrade === 1) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +16k;\n<:ksmpoint:1047324976342118501> Work +2M;\n<:ksmpoint:1047324976342118501> Vote +20M;\n<:ksmpoint:1047324976342118501> XP 5x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **10M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame.');
                    }

                    if (vip.upgrade === 2) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +17k;\n<:ksmpoint:1047324976342118501> Work +3M;\n<:ksmpoint:1047324976342118501> Vote +20M;\n<:ksmpoint:1047324976342118501> XP 6x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **20M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;');
                    }

                    if (vip.upgrade === 3) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +18k;\n<:ksmpoint:1047324976342118501> Work +3M;\n<:ksmpoint:1047324976342118501> Vote +30M;\n<:ksmpoint:1047324976342118501> XP 7x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **30M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.');
                    }

                    if (vip.upgrade === 4) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +40k;\n<:ksmpoint:1047324976342118501> Work +4M;\n<:ksmpoint:1047324976342118501> Vote +30M;\n<:ksmpoint:1047324976342118501> XP 8x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **40M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.');
                    }

                    if (vip.upgrade === 5) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +18k;\n<:ksmpoint:1047324976342118501> Work +5M;\n<:ksmpoint:1047324976342118501> Vote +40M;\n<:ksmpoint:1047324976342118501> XP 10x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **50M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.');
                    }

                    if (vip.upgrade === 6) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +108k;\n<:ksmpoint:1047324976342118501> Work +8M;\n<:ksmpoint:1047324976342118501> Vote +40M;\n<:ksmpoint:1047324976342118501> XP 15x;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **60M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.\n<:ksmawrd:1047324975499059361> Acesso antecipado a novidades.\n<:ksmawrd:1047324975499059361> Loja de Molduras.');
                    }

                    if (vip.upgrade === 7) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +25M;\n<:ksmpoint:1047324976342118501> Work +18M;\n<:ksmpoint:1047324976342118501> Vote +50M;\n<:ksmpoint:1047324976342118501> XP 25x;\n<:ksmpoint:1047324976342118501> Mensal +220M;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **130M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.\n<:ksmawrd:1047324975499059361> Acesso antecipado a novidades.\n<:ksmawrd:1047324975499059361> Loja de Molduras.');
                    }

                    if (vip.upgrade === 8) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +95M;\n<:ksmpoint:1047324976342118501> Work +50M;\n<:ksmpoint:1047324976342118501> Vote +80M;\n<:ksmpoint:1047324976342118501> XP 35x;\n<:ksmpoint:1047324976342118501> Mensal +800M;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **400M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.\n<:ksmawrd:1047324975499059361> Acesso antecipado a novidades.\n<:ksmawrd:1047324975499059361> Loja de Molduras.');
                    }

                    if (vip.upgrade === 9) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +120M;\n<:ksmpoint:1047324976342118501> Work +80M;\n<:ksmpoint:1047324976342118501> Vote +90M;\n<:ksmpoint:1047324976342118501> XP 50x;\n<:ksmpoint:1047324976342118501> Semanal +300M;\n<:ksmpoint:1047324976342118501> Mensal +900M;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **600M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.\n<:ksmawrd:1047324975499059361> Acesso antecipado a novidades.\n<:ksmawrd:1047324975499059361> Loja de Molduras\n<:ksmawrd:1047324975499059361> Cor de letra no perfil personalizada.');
                    }

                    if (vip.upgrade === 10) {
                        embed.setDescription('<:ksmpoint:1047324976342118501> Daily +150M;\n<:ksmpoint:1047324976342118501> Work +100M;\n<:ksmpoint:1047324976342118501> Vote +120M;\n<:ksmpoint:1047324976342118501> XP 77x;\n<:ksmpoint:1047324976342118501> Semanal +500M;\n<:ksmpoint:1047324976342118501> Mensal +2000M;\n\n<:ksmawrd:1047324975499059361> \`k!recompensa\` com valor de **800M de coins** de 15 em 15 dias;\n<:ksmawrd:1047324975499059361> Participação inclusa aos sorteios do Vip;\n<:ksmawrd:1047324975499059361> Emblema evolutivo em seu perfil na Kosame;\n<:ksmawrd:1047324975499059361> Loja com desconto.\n<:ksmawrd:1047324975499059361> Card "Vip Onyx"\n<:ksmawrd:1047324975499059361> Acesso antecipado a novidades.\n<:ksmawrd:1047324975499059361> Loja de Molduras\n<:ksmawrd:1047324975499059361> Cor de letra no perfil personalizada.');
                    }

                    return i.reply({ embeds: [embed], ephemeral: true });
                }
            });
        }

        if (!['236651138747727872', '202938550360997888', '1348133269522350110', '752975738948550860', '848662735357083698', '522574474051059712', '1199229647943123014'].includes(message.author.id)) return;

        const PHYTOLS2 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, você deve mencionar/colocar o id do membro para dar o vip!`);

        const PHYTOLS3 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, você deve inserir o tempo do vip!\n\nUtilize: **m** para meses e **d** para dias`);

        const PHYTOLS4 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, a data inserida está errada!`);

        const PHYTOLS5 = new ClientEmbed()
            .setColor('#2deb62')
            .setDescription(`<:kosame_Correct:1010978511839842385> O usuário **${USER}** já possui **VIP**, portanto foi adicionado mais **dias** para o mesmo.\n<:KosameClock:852887278601764885> Duração: **${moment.duration(vip.date - Date.now()).format('y [ano(s)] M [meses] d [dias]')}**`);

        const PHYTOLS6 = new ClientEmbed()
            .setColor('#2deb62')
            .setDescription(`<:kosame_Correct:1010978511839842385> ${USER} Agora é um membro **VIP**!`);

        if (['add', 'adicionar', 'setar'].includes(args[0].toLowerCase())) {

            const allowedUsers = ['202938550360997888', '429679606946201600', '236651138747727872', '1348133269522350110']; // Substitua pelos IDs permitidos

            if (message.guild.id !== '834191314328485889' && !allowedUsers.includes(message.author.id)) {
                return message.reply('Este servidor não tem autorização para esse comando, os desenvolvedores foram informados!');
            }

            if (!USER) {
                return message.reply({ embeds: [PHYTOLS2] });
            } else if (!args[1]) {
                return message.reply({ embeds: [PHYTOLS3] });
            }

            const time = ms(args[2]);

            if (String(time) == 'undefined') {
                return message.reply({ embeds: [PHYTOLS4] });
            } else {
                if (vip.hasVip) {
                    message.reply({ embeds: [PHYTOLS5] });

                    Webhook.send({ embeds: [EMBEDVIPADD] });
                    Webhook2.send({ embeds: [EMBEDVIPADD] });
                    return await this.client.database.users.findOneAndUpdate({
                        idU: USER.id
                    }, {
                        $set: {
                            'vip.date': vip.date + time
                        }
                    });
                } else {
                    message.reply({ embeds: [PHYTOLS6] });

                    Webhook.send({ embeds: [EMBEDVIPADD] });
                    Webhook2.send({ embeds: [EMBEDVIPADD] });

                    await this.client.database.users.findOneAndUpdate({
                        idU: USER.id
                    }, {
                        $set: {
                            'vip.hasVip': true,
                            'vip.date': Date.now() + time,
                            'vip.cooldown': Date.now(),
                            'vip.upgrade': 1
                        }
                    });
                }
            }
        }

        if (['rm', 'remove', 'remover'].includes(args[0].toLowerCase())) {

            await this.client.database.users.findOneAndUpdate({
                idU: USER.id
            }, {
                $set: {
                    'vip.hasVip': false,
                    'vip.date': 0,
                    'vip.cooldown': 0,
                    'vip.upgrade': 1
                }
            });

            const PHYTOLS6 = new ClientEmbed()
                .setColor('#2deb62')
                .setDescription(`<:kosame_Correct:1010978511839842385> ${USER} Não é mais um membro **VIP**!`);

            message.reply({ embeds: [PHYTOLS6] });
        }
    }
};