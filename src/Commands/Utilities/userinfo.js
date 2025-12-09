/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { ApplicationCommandType, ApplicationCommandOptionType, StringSelectMenuBuilder, UserSelectMenuBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const fetch = require('node-fetch');
const moment = require('moment');
require('moment-precise-range-plugin');
require('moment-duration-format');

module.exports = class UserinfoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'userinfo';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha informações sobre a conta do usuário.';
        this.aliases = ['ui'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja visualizar.',
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
        moment.locale('pt-BR');
        let user = message.author;
        if (args[0]) {
            user = message.mentions.users.first();
            if (!user) user = await this.client.users.fetch(args[0]).catch(() => message.author) || message.author;
        }
        const userData = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`).then(res => res.json()).then(json => json[0]);
        let insig = (time) => {
            return {
                1: '<:boost1:942750520139989032>',
                [`${Date.parse(moment(time).add('2', 'months'))}`]: '<:boost2:942750527056404510>',
                [`${Date.parse(moment(time).add('3', 'months'))}`]: '<:boost3:942750520622321694>',
                [`${Date.parse(moment(time).add('6', 'months'))}`]: '<:boost4:942750523558346774>',
                [`${Date.parse(moment(time).add('9', 'months'))}`]: '<:boost5:942750524455936020>',
                [`${Date.parse(moment(time).add('12', 'months'))}`]: '<:boost6:942750519653449738>',
                [`${Date.parse(moment(time).add('15', 'months'))}`]: '<:boost7:942750527723307089>',
                [`${Date.parse(moment(time).add('18', 'months'))}`]: '<:boost8:942750525936533554>',
                [`${Date.parse(moment(time).add('24', 'months'))}`]: '<:boost9:942750522182623282>'
            };
        };
        let insigNitro = (time) => {
            return {
                1: '<:kosamedcnitro:1033504977592795207>',
                [`${Date.parse(moment(time).add('1', 'months'))}`]: '<:ksm_bronze:1353410759240978563>',
                [`${Date.parse(moment(time).add('3', 'months'))}`]: '<:ksm_silver:1353410710926921830>',
                [`${Date.parse(moment(time).add('6', 'months'))}`]: '<:ksm_gold:1353410718329995374>',
                [`${Date.parse(moment(time).add('12', 'months'))}`]: '<:ksm_platinum:1353410714554863807>',
                [`${Date.parse(moment(time).add('24', 'months'))}`]: '<:ksm_diamond:1353411261416738846>',
                [`${Date.parse(moment(time).add('36', 'months'))}`]: '<:ksm_emerald:1353411200595005532>',
                [`${Date.parse(moment(time).add('60', 'months'))}`]: '<:ksm_ruby:1353410712772415499>',
                [`${Date.parse(moment(time).add('72', 'months'))}`]: '<:ksm_opal:1353410716559868007>'
            };
        };
        let list = [];
        if (userData.userData.premium_type) list.push(Object.entries(insigNitro(userData.userData?.premium_since)).filter((b) => b[0] <= Date.now()).slice(-1)[0][1]);
        let flags = user.flags?.toArray();
        if (flags.includes('Spammer')) list.push('<:_:1278755283807764541>');
        if (flags.includes('Staff')) list.push('<:_:1278755282213802078>');
        if (flags.includes('Partner')) list.push(' <:Discord_Partner:942750522794991677>');
        if (flags.includes('CertifiedModerator')) list.push(' <:Certified_Moderator:942750518680371271>');
        if (flags.includes('Hypesquad')) list.push('<:Hypesquad_Events:949813177871376425>');
        if (flags.includes('HypeSquadOnlineHouse3')) list.push('<:Balance:852564599370416159>');
        if (flags.includes('HypeSquadOnlineHouse2')) list.push('<:Brilliance:852564641497219091>');
        if (flags.includes('HypeSquadOnlineHouse1')) list.push('<:Bravery:852564557104414730>');
        if (flags.includes('BugHunterLevel1')) list.push('<:_:906947177358688327>');
        if (flags.includes('BugHunterLevel2')) list.push('<:_:906947514693992528>');
        if (flags.includes('ActiveDeveloper')) list.push(' <:Active_Developer:1043986056300740678>');
        if (flags.includes('VerifiedDeveloper')) list.push('<:Bot_Developer:942750521456984144>');
        if (flags.includes('PremiumEarlySupporter')) list.push('<:Early_Supporter:993671403339522048>');
        if (flags.includes('VerifiedBot')) list.push('<:_:906991703611809843>');
        if (userData.userData.badges.find(x => x.id == 'legacy_username')) list.push('<:ksm_pomelo:1353342622936334350>');
        if (userData.userData.badges.find(x => x.id == 'quest_completed')) list.push('<:ksm_quest:1353342621480648835>');
        if (userData.userData.premium_guild_since) {
            let badge = Object.entries(insig(userData.userData?.premium_guild_since)).filter((b) => b[0] <= Date.now()).slice(-1);
            list.push(badge[0][1]);
        }
        list = list.join(' ');
        let member = await message.guild.members.fetch(user.id).catch(e => { });
        function getTime(number, display) {
            if (isNaN(number)) return 0;
            let time = moment.preciseDiff(Date.now() - number, Date.now(), true);
            let content = [];
            let count = display ? display <= 1 ? 1 : display : 3;
            if (time.years == 1) {
                content.push(`${time.years} ano`);
                count--;
            } else if (time.years > 1) {
                content.push(`${time.years} anos`);
                count--;
            }
            if (time.months == 1 && count > 0) {
                content.push(`${time.months} mês`);
                count--;
            } else if (time.months > 1 && count > 0) {
                content.push(`${time.months} meses`);
                count--;
            }
            if (time.days == 1 && count > 0) {
                content.push(`${time.days} dia`);
                count--;
            } else if (time.days > 1 && count > 0) {
                content.push(`${time.days} dias`);
                count--;
            }
            if (time.hours == 1 && count > 0) {
                content.push(`${time.hours} hora`);
                count--;
            } else if (time.hours > 1 && count > 0) {
                content.push(`${time.hours} horas`);
                count--;
            }
            if (time.minutes == 1 && count > 0) {
                content.push(`${time.minutes} minuto`);
                count--;
            } else if (time.minutes > 1 && count > 0) {
                content.push(`${time.minutes} minutos`);
                count--;
            }
            if (time.seconds == 1 && count > 0) {
                content.push(`${time.seconds} segundo`);
                count--;
            } else if (time.seconds > 1 && count > 0) {
                content.push(`${time.seconds} segundos`);
                count--;
            }
            if (content.length == 0) content.push(`${number} millissegundos`);
            return content.join(' ');
        }

        const buildEmbed = (u, uData, memberObj) => {
            const embed = new EmbedBuilder()
                .setColor('#2E3035')//\u200B
                .setAuthor({ name: `${u.tag} (${u.globalName})`, iconURL: u.displayAvatarURL(() => ({ dynamic: true })) })
                .setDescription(`**Badges:** ${list}`)
                .addFields([
                    {
                        name: '<:kosameid:1033500632864260107> Discord ID:',
                        value: `\`\`\`\n${u.id}\n\`\`\``,
                        inline: true
                    },
                    {
                        name: '<:kosameuser:1033501780631376012> Nickname:',
                        value: `\`\`\`\n@${u.username}\n\`\`\``,
                        inline: true
                    },
                    {
                        name: '<:kosamecalendar:1033502791995502662> Data de criação:',
                        value: `${moment(u.createdAt).format('LLL')} (**${moment.duration(u.createdAt - Date.now()).format('y [anos]').slice(1)}**)`
                    }
                ])
                .setThumbnail(u.displayAvatarURL(() => ({ dynamic: true })))
                .setFooter({ text: `Comando solicitado por ${message.author.tag}` });
            if (memberObj) embed.addFields([
                {
                    name: '<:kosamenot:1033503412857356378> Data de entrada no servidor:',
                    value: `${moment(memberObj.joinedAt).format('LLL')} (**${moment.duration(memberObj.joinedAt - Date.now()).format('d [dias] h [horas]').slice(1)}**)`,
                    inline: false
                }
            ]);
            if (uData.userData.premium_guild_since) embed.addFields([{
                name: '<:kosamesin:1033508763744862339> Impulsionando servidor desde:',
                value: `${moment(uData.userData.premium_guild_since).format('LLL')} (**${getTime(Date.now() - new Date(uData.userData.premium_guild_since).getTime(), 2)}**)`,
                inline: false
            }]);
            if (uData.premium_since) embed.addFields([{
                name: `${Object.entries(insig(userData.userData?.premium_guild_since)).filter((b) => b[0] <= Date.now()).slice(-1)[0][1]} Assinante Nitro desde:`,
                value: `${moment(uData.premium_since).format('LLL')} (**${moment.duration(uData.premium_since - Date.now()).format('y [anos] d [dias]').slice(1)}**)`,
                inline: false
            }]);
            if (uData.userData.premium_guild_since) {
                embed.addFields([
                    {
                        name: `${Object.entries(insig(userData.userData?.premium_guild_since)).filter((b) => b[0] <= Date.now()).slice(-1)[0][1]} Insígnia de impulso atual`,
                        value: `há ${getTime(Date.now() - new Date(uData.userData.premium_guild_since).getTime(), 2)}`,
                        inline: true
                    }
                ]);
                let badge = Object.entries(insig(userData.userData?.premium_guild_since)).filter((b) => b[0] < Date.now()).slice(-1);
                let pbadge = Object.entries(insig(userData.userData?.premium_guild_since))[Object.entries(insig(userData.userData?.premium_guild_since)).findIndex((x) => x[0] == badge[0][0]) + 1];
                if (pbadge) embed.addFields([{
                    name: `${pbadge[1]} Próxima insígnia de impulso`,
                    value: `em ${getTime(pbadge[0] - Date.now(), 2)}`,
                    inline: true
                }]);

                embed.addFields([{
                    name: ' ',
                    value: ' ',
                    inline: false
                }]);
            }
            if (uData.userData.premium_since) {
                embed.addFields([
                    {
                        name: `${Object.entries(insigNitro(userData.userData.premium_since)).filter((b) => b[0] <= Date.now()).slice(-1)[0][1]} Insígnia de nitro atual`,
                        value: `há ${getTime(Date.now() - new Date(uData.userData.premium_since).getTime(), 2)}`,
                        inline: true
                    }
                ]);
                let badge = Object.entries(insigNitro(userData.userData?.premium_since)).filter((b) => b[0] < Date.now()).slice(-1);
                let pbadge = Object.entries(insigNitro(userData.userData.premium_since))[Object.entries(insigNitro(userData.userData.premium_since)).findIndex((x) => x[0] == badge[0][0]) + 1];
                if (pbadge) embed.addFields([{
                    name: `${pbadge[1]} Próxima insígnia de nitro`,
                    value: `em ${getTime(pbadge[0] - Date.now(), 2)}`,
                    inline: true
                }]);
            }
            return embed;
        };

        const buildUserSelect = (authorId) => {
            return new ActionRowBuilder().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId(`ui_user_select:${authorId}`)
                    .setPlaceholder('Veja as informações de outras pessoas.')
                    .setMinValues(1)
                    .setMaxValues(1)
            );
        };

        let menu = new StringSelectMenuBuilder()
            .setCustomId('ui')
            .setPlaceholder('Mais informações')
            .addOptions([
                {
                    'type': 1,
                    'label': 'Avatar',
                    'value': `avatar_${user.id}`,
                    'description': `Visualize o avatar de ${user.username}.`,
                    'emoji': {
                        'id': '1223694440640680047',
                        'name': 'Icon_Channel_Media'
                    }
                },
                {
                    'type': 1,
                    'label': 'Evolução do Impulso',
                    'value': `boost_${user.id}`,
                    'description': `Visualize o progresso do impulso de ${user.username}.`,
                    'emoji': {
                        'id': '1233719063759294575',
                        'name': 'boost'
                    }
                },
                {
                    'type': 1,
                    'label': 'Evolução do Nitro',
                    'value': `nitro_${user.id}`,
                    'description': `Visualize o progresso do nitro de ${user.username}.`,
                    'emoji': {
                        'id': '1353409370624364544',
                        'name': 'ksm_nitro_evo'
                    }
                },
                {
                    'type': 1,
                    'label': 'Bio/Pronome',
                    'value': `bio_${user.id}`,
                    'description': `Visualize o sobre mim/bio ou pronome do perfil de ${user.username}.`,
                    'emoji': {
                        'id': '1261886523541028987',
                        'name': 'sobre'
                    }
                },
                {
                    'type': 1,
                    'label': 'Cores do perfil',
                    'value': `cores_${user.id}`,
                    'description': `Visualize os códigos HEX das cores do perfil de ${user.username}.`,
                    'emoji': {
                        'id': '1223694620807139470',
                        'name': 'Icon_Edit'
                    }
                },
                {
                    'type': 1,
                    'label': 'Nomes anteriores',
                    'value': `usernames_${user.id}`,
                    'description': `Visualize os nomes anteriores de ${user.username}.`,
                    'emoji': {
                        'id': '1223694438904365177',
                        'name': 'Icon_Summaries'
                    }
                },
                {
                    'type': 1,
                    'label': 'Icons antigos',
                    'value': `avatars_${user.id}`,
                    'description': `Visualize os avatares antigos de ${user.username}.`,
                    'emoji': {
                        'id': '1223694439764197579',
                        'name': 'Icon_Media'
                    }
                },
                {
                    'type': 1,
                    'label': 'Ultima mensagem',
                    'value': `lastMsg_${user.id}`,
                    'description': `Visualize a ultima mensagem detectada de ${user.username}.`,
                    'emoji': {
                        'id': '1223694620400287984',
                        'name': 'Icon_Channel_Forum'
                    }
                },
                {
                    'type': 1,
                    'label': 'Ultima mensagem editada',
                    'value': `lastMsgEdited_${user.id}`,
                    'description': `Visualize a ultima mensagem editada detectada de ${user.username}.`,
                    'emoji': {
                        'id': '1353409368065835153',
                        'name': 'ksm_edited_message'
                    }
                },
                {
                    'type': 1,
                    'label': 'Ultima mensagem deletada',
                    'value': `lastMsgDeleted_${user.id}`,
                    'description': `Visualize a ultima mensagem deletada detectada de ${user.username}.`,
                    'emoji': {
                        'id': '1353409365776011314',
                        'name': 'ksm_deleted_message'
                    }
                },
                {
                    'type': 1,
                    'label': 'Ultima call',
                    'value': `lastVoice_${user.id}`,
                    'description': `Visualize a ultima call detectada de ${user.username}.`,
                    'emoji': {
                        'id': '1223693172417368074',
                        'name': 'Icon_Channel_Voice'
                    }
                },
                {
                    'type': 1,
                    'label': 'Servidores',
                    'value': `guilds_${user.id}`,
                    'description': `Visualize os servidores que ${user.username} já foi visto.`,
                    'emoji': {
                        'id': '1203995832089710612',
                        'name': 'guild'
                    }
                }
            ]);
        const builtEmbed = buildEmbed(user, userData, member);
        const userSelect = buildUserSelect(message.author.id);
        message.reply({ embeds: [builtEmbed], components: [new ActionRowBuilder().addComponents(menu), userSelect] });
    }
};