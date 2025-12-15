/* eslint-disable no-sync */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
const { Event } = require('../Structures/Structures.js');
const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const coldoownUser = new Set();
const coldoownGuild = new Set();
const moment = require('moment');
const fs = require('fs');
const ms = require('ms');
const editGwButton = {};
require('moment-duration-format');

module.exports = class interactionCreateEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'interactionCreate';
    }

    async execute(interaction) {
        try {
            if (interaction.user.bot || !interaction.guild) return;
            if (interaction.guild.id !== '1447705346586968186') return;

            let server = await this.client.database.guilds.findOne({ idS: interaction.guild.id });
            let client = await this.client.database.client.findOne({ _id: this.client.user.id });
            let user = await this.client.database.users.findOne({ idU: interaction.user.id });

            if (!server) server = await new this.client.database.guilds({ idS: interaction.guild.id }).save();
            if (!client) client = await new this.client.database.client({ _id: this.client.user.id }).save();
            if (!user) user = await new this.client.database.users({ idU: interaction.user.id }).save();

            //===============> Comandos <===============//

            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
                const command = this.client.commands.get(interaction.commandName);
                const args = [];

                interaction.options.data.forEach((option) => {
                    if (option.type === ApplicationCommandOptionType.Subcommand) {
                        if (option.name) {
                            args.push(option.name);
                        }

                        option.options?.forEach(x => {
                            if (x.value) {
                                args.push(x.value);
                            }
                        });
                    } else if (option.value) {
                        args.push(option.value);
                    }
                });

                const message = interaction;
                message.edit = interaction.editReply;
                message.author = interaction.user;
                message.delete = interaction.deleteReply;

                let cmdDb = await this.client.database.command.findOne({ _id: command.name });
                if (!cmdDb) {
                    cmdDb = await new this.client.database.command({ _id: command.name }).save();
                    this.client.logger.success(`O comando: (${command.name}) teve a sua documentação criada com sucesso!`, 'Comando');
                }

                const xp = user.Exp.xp;
                const level = user.Exp.level;
                const nextLevel = user.Exp.nextLevel * level;

                if (user.Exp.id == 'null') {
                    await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, { $set: { 'Exp.id': message.author.id } });
                }

                if (xp >= nextLevel) {
                    await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, { $set: { 'Exp.xp': 0, 'Exp.level': level + 1 } });

                    if (server.levelwarn) {
                        try {
                            if (typeof message.react === 'function') {
                                await message.react('⬆️');
                            }
                        } catch (err) {
                            // Ignora erros de reação em interações de slash (não há mensagem para reagir)
                        }
                    }
                }

                if (!this.client.developers.includes(message.author.id)) {
                    if (cmdDb.manutenção) {
                        return message.reply({ content: `${message.author}, o comando **\`${command.name}\`** está em manutenção no momento.` });
                    }

                    if (client.manutenção) {
                        return message.reply({ content: `<:ksm_man:1367969327155777627> **Olá** ${message.author}, estou passando por uma pequena atualização!\n-# ㅤ<:ksm_set0:1367969325356683325> Tente utilizar novamente em alguns minutos...` });
                    }
                }

                if (client.blacklist.some((x) => x == message.author.id)) {
                    return message.reply({ content: `<:ksm_banned:1367976072141996132> **Vish** ${message.author}... acho que você está **banido**, provavelmente tentou trapacear de alguma forma!\n-# ㅤ<:ksm_set0:1367969325356683325> Você pode saber mais [clicando aqui](https://kosame.site).` });
                }

                if (client.Sban.some((x) => x == message.guild.id)) {
                    return message.reply({ content: `${message.author}, esse servidor está **\`banido\`** de meu sistema, provavelmente foi utilizado para cometer algum ato que vai contra as minhas diretrizes de uso, caso deseje uma revogação do banimento, visite o meu servidor: https://discord.gg/THS6HBgPzr` });
                }

                if (coldoownUser.has(message.author.id))
                    return message.reply({
                        content: `${message.author}, você deve aguardar alguns **segundos** para usar outro comando em barra.`,
                        flags: MessageFlags.Ephemeral
                    });
                if (coldoownGuild.has(message.guild.id))
                    return message.reply({
                        content: `<:ksm_eita:1367974827868033106> **Calma!** ${message.author}, muitas pessoas usaram o comando ao mesmo tempo que você!\n-# ㅤ<:ksm_set0:1367969325356683325> Você já pode utilizar o comando novamente.`,
                        flags: MessageFlags.Ephemeral
                    });

                const cb = await server.cmdblock;

                if (cb.status) {
                    if (!cb.cmds.some((x) => x === command.name)) {
                        if (!cb.channels.some((x) => x === message.channel.id)) {
                            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                return message.reply(cb.msg);
                            }
                        }
                    }
                }

                if (!['429679606946201600', '918536794167980032', '236651138747727872', '918536794167980032', '202938550360997888', '420728110326218755'].includes(message.author.id)) {
                    coldoownUser.add(message.author.id);
                    coldoownGuild.add(message.guild.id);

                    setTimeout(() => {
                        coldoownUser.delete(message.author.id);
                    }, 9500);
                    setTimeout(() => {
                        coldoownGuild.delete(message.guild.id);
                    }, 1000);
                }

                // Execução:
                const commandExecute = new Promise((resolve, reject) => {
                    try {
                        resolve(command.commandExecute({ message, args }));
                    } catch (err) {
                        reject(err);
                    }
                });

                // Erro no comando:
                commandExecute.catch(async (err) => {
                    this.client.logger.error(err.message, command.name);
                    this.client.logger.warn(err.stack, command.name);

                    const errorChannel = await this.client.channels.fetch('1090751084793970759').catch(() => { });
                    if (errorChannel) {
                        const errorEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Log - Erros', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(`**Comando:** \`${command.name}\`\n**Servidor:** \`${message.guild.name}\` \`(${message.guild.id})\``)
                            .setFields({ name: 'Erro:', value: '```js' + '\n' + err.stack + '\n' + '```' });

                        errorChannel.send({ embeds: [errorEmbed] });
                    }

                    return message.reply({ content: `${message.author}, ocorreu um erro ao executar o comando \`${command.name}\`, a equipe de desenvolvedores já está ciente do problema, aguarde alguns minutos para poder utilizar o comando novamente.` })
                        .then((message) => setTimeout(() => message.delete(), 1000 * 10));
                });
            }

            if (interaction.commandName == 'giveaway') {
                if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`, flags: MessageFlags.Ephemeral });
                let modal = new ModalBuilder()
                    .setCustomId('giveaway')
                    .setTitle('Novo Sorteio');
                let duration = new TextInputBuilder()
                    .setCustomId('duration')
                    .setLabel('Duração do sorteio')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2);
                let winners = new TextInputBuilder()
                    .setCustomId('winners')
                    .setLabel('Quantidade de ganhadores')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                let prize = new TextInputBuilder()
                    .setCustomId('prize')
                    .setLabel('Prêmio do sorteio')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(
                    new ActionRowBuilder().addComponents(duration),
                    new ActionRowBuilder().addComponents(winners),
                    new ActionRowBuilder().addComponents(prize)
                );
                await interaction.showModal(modal);
            }

            //===============> Modal <===============//
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'giveaway') {
                    let duration = interaction.fields.getTextInputValue('duration');
                    let time = convertArgsToTime(duration);
                    let winners = interaction.fields.getTextInputValue('winners');
                    if (!time || time < 10000) return interaction.reply({ content: 'Tempo inválido!', flags: MessageFlags.Ephemeral });
                    if (!winners || winners < 1 || isNaN(winners)) return interaction.reply({ content: 'Número de ganhadores inválido!', flags: MessageFlags.Ephemeral });
                    let prize = interaction.fields.getTextInputValue('prize');
                    let embed = new EmbedBuilder()
                        .setTitle(prize)
                        .setColor('#ffffff')
                        .setTimestamp()
                        .setDescription(`Termina em: <t:${Date.now() + time}:R> (<t:${Date.now() + time}:f>)\nCriado por: <@${interaction.user.id}>\nEntradas: **0**\nVencedores: **${winners}**`);
                    let btn = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('giveaway')
                            .setLabel('Participar (0)')
                            .setStyle('Primary')
                            .setEmoji('🎉')
                    );
                    let msg = await interaction.channel.send({ embeds: [embed], components: [btn] });
                    let giveawayData = {
                        timestamp: Date.now() + time,
                        winners: winners,
                        prize: prize,
                        guildID: interaction.guild.id,
                        channelID: interaction.channel.id,
                        messageID: msg.id,
                        authorID: interaction.user.id,
                        ended: false,
                        users: []
                    };
                    fs.writeFileSync(`./giveaways/${msg.id}.json`, JSON.stringify(giveawayData));
                    await interaction.reply({ content: '🎉 Sorteio criado com sucesso!', flags: MessageFlags.Ephemeral });
                }

                if (interaction.customId === 'modalPcf') {
                    const regex = /^(http(s)?:\/\/|www\.).*(\.jpg|\.png)/g;
                    const banner = interaction.fields.getTextInputValue('profilebanner');

                    if (!regex.test(banner)) {
                        return interaction.update({
                            content: `${interaction.user}, você não forneceu uma URL válida para o banner!`,
                            embeds: [],
                            components: [],
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    const bgFormatted = convertWebpToPng(banner);
                    let newImageUrl;

                    if (bgFormatted.includes('imgur.com')) {
                        newImageUrl = bgFormatted;
                    } else {
                        console.log('Link não é do Imgur, realizando upload.');
                        newImageUrl = await uploadImageFromUrl(bgFormatted); // Usa a função de upload
                    }

                    await this.client.database.users.findOneAndUpdate(
                        { idU: interaction.user.id },
                        { $set: { 'profile.imagembg': newImageUrl } }
                    );

                    return interaction.update({
                        content: `${interaction.user}, o seu perfil foi atualizado!`,
                        embeds: [],
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (interaction.customId === 'modalCoins') {
                    const regex = /^(http(s)?:\/\/|www\.).*(\.jpg|\.png)/g;
                    const banner = interaction.fields.getTextInputValue('coinsbanner');

                    if (!regex.test(banner)) {
                        return interaction.update({
                            content: `${interaction.user}, você não forneceu uma URL válida para o banner!`,
                            embeds: [],
                            components: [],
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const bannerFormatted = convertWebpToPng(banner);
                    let newImageUrl;
                    if (bannerFormatted.includes('imgur.com')) {
                        newImageUrl = bannerFormatted;
                    } else {
                        console.log('Link não é do Imgur, realizando upload.');
                        newImageUrl = await uploadImageFromUrl(bannerFormatted); // Usa a função de upload
                    }

                    await this.client.database.users.findOneAndUpdate(
                        { idU: interaction.user.id },
                        { $set: { 'profile.coinsbg': newImageUrl } }
                    );

                    return interaction.update({
                        content: `${interaction.user}, o seu banner foi atualizado!`,
                        embeds: [],
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (interaction.customId === 'modalWelcome') {
                    const regex = /^(http(s)?:\/\/|www\.).*(\.jpg|\.png)/g;
                    const wFundo = interaction.fields.getTextInputValue('welcomeImg');
                    const wMsg = interaction.fields.getTextInputValue('welcomeMsg');

                    if (!regex.test(wFundo)) {
                        return interaction.update({
                            content: `${interaction.user}, você não forneceu uma URL válida!`,
                            embeds: [],
                            components: [],
                            ephemeral: false
                        });
                    }
                    const newImageUrl = await wFundo;

                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: interaction.guild.id },
                        { $set: { 'welcome.background': newImageUrl, 'welcome.msg': wMsg } }
                    );

                    return interaction.update({
                        content: `${interaction.user}, o sistema foi atualizado com sucesso!`,
                        embeds: [],
                        components: [],
                        ephemeral: false
                    });
                }

                if (interaction.customId === 'modalBan') {
                    const regex = /^(http(s)?:\/\/|www\.).*(\.jpg|\.png|\.gif)/g;
                    const bFundo = interaction.fields.getTextInputValue('imgBan');

                    if (!regex.test(bFundo)) {
                        return interaction.update({
                            content: `${interaction.user}, você não forneceu uma URL válida!`,
                            embeds: [],
                            components: [],
                            ephemeral: false
                        });
                    }

                    await this.client.database.users.findOneAndUpdate(
                        { idU: interaction.user.id },
                        { $set: { 'bans.imagembg': bFundo } }
                    );

                    return interaction.update({
                        content: `${interaction.user}, a imagem de banimentos foi configurada!`,
                        embeds: [],
                        components: [],
                        ephemeral: false
                    });
                }
            }

            //===============> Interação Para UserInfo <===============//
            // UserSelectMenu (native user selector)
            if (interaction.isUserSelectMenu && interaction.isUserSelectMenu()) {
                if (interaction.customId.startsWith('ui_user_select')) {
                    try {
                        const parts = interaction.customId.split(':');
                        const authorId = parts[1];
                        if (authorId && interaction.user.id !== authorId) {
                            return interaction.reply({ content: 'Eiii, essa interação não é sua!', flags: MessageFlags.Ephemeral });
                        }

                        const selMember = interaction.members?.first?.();
                        const selUser = selMember?.user || interaction.users?.first?.();
                        const selectedUser = selUser || (interaction.values && interaction.values[0] ? await this.client.users.fetch(interaction.values[0]).catch(() => null) : null);
                        if (!selectedUser) return interaction.reply({ content: 'Usuário inválido.', flags: MessageFlags.Ephemeral });

                        const infoMenu = new StringSelectMenuBuilder()
                            .setCustomId('ui')
                            .setPlaceholder('Mais informações')
                            .addOptions([
                                { type: 1, label: 'Avatar', value: `avatar_${selectedUser.id}`, description: `Visualize o avatar de ${selectedUser.username}.`, emoji: { id: '1223694440640680047', name: 'Icon_Channel_Media' } },
                                { type: 1, label: 'Evolução do Impulso', value: `boost_${selectedUser.id}`, description: `Visualize o progresso do impulso de ${selectedUser.username}.`, emoji: { id: '1233719063759294575', name: 'boost' } },
                                { type: 1, label: 'Evolução do Nitro', value: `nitro_${selectedUser.id}`, description: `Visualize o progresso do nitro de ${selectedUser.username}.`, emoji: { id: '1353409370624364544', name: 'ksm_nitro_evo' } },
                                { type: 1, label: 'Bio/Pronome', value: `bio_${selectedUser.id}`, description: `Visualize o sobre mim/bio ou pronome do perfil de ${selectedUser.username}.`, emoji: { id: '1261886523541028987', name: 'sobre' } },
                                { type: 1, label: 'Cores do perfil', value: `cores_${selectedUser.id}`, description: `Visualize os códigos HEX das cores do perfil de ${selectedUser.username}.`, emoji: { id: '1223694620807139470', name: 'Icon_Edit' } },
                                { type: 1, label: 'Nomes anteriores', value: `usernames_${selectedUser.id}`, description: `Visualize os nomes anteriores de ${selectedUser.username}.`, emoji: { id: '1223694438904365177', name: 'Icon_Summaries' } },
                                { type: 1, label: 'Icons antigos', value: `avatars_${selectedUser.id}`, description: `Visualize os avatares antigos de ${selectedUser.username}.`, emoji: { id: '1223694439764197579', name: 'Icon_Media' } },
                                { type: 1, label: 'Ultima mensagem', value: `lastMsg_${selectedUser.id}`, description: `Visualize a ultima mensagem detectada de ${selectedUser.username}.`, emoji: { id: '1223694620400287984', name: 'Icon_Channel_Forum' } },
                                { type: 1, label: 'Ultima mensagem editada', value: `lastMsgEdited_${selectedUser.id}`, description: `Visualize a ultima mensagem editada detectada de ${selectedUser.username}.`, emoji: { id: '1353409368065835153', name: 'ksm_edited_message' } },
                                { type: 1, label: 'Ultima mensagem deletada', value: `lastMsgDeleted_${selectedUser.id}`, description: `Visualize a ultima mensagem deletada detectada de ${selectedUser.username}.`, emoji: { id: '1353409365776011314', name: 'ksm_deleted_message' } },
                                { type: 1, label: 'Ultima call', value: `lastVoice_${selectedUser.id}`, description: `Visualize a ultima call detectada de ${selectedUser.username}.`, emoji: { id: '1223693172417368074', name: 'Icon_Channel_Voice' } },
                                { type: 1, label: 'Servidores', value: `guilds_${selectedUser.id}`, description: `Visualize os servidores que ${selectedUser.username} já foi visto.`, emoji: { id: '1203995832089710612', name: 'guild' } }
                            ]);

                        // Build detailed user info for the main ephemeral embed
                        let userData = null;
                        try {
                            userData = await fetch(`http://104.237.11.161:7777/api/ui/${selectedUser.id}`).then(res => res.json()).then(json => json[0]);
                        } catch { }
                        const member = await interaction.guild.members.fetch(selectedUser.id).catch(() => null);

                        const insig = (time) => ({
                            1: '<:boost1:942750520139989032>',
                            [`${Date.parse(moment(time).add('2', 'months'))}`]: '<:boost2:942750527056404510>',
                            [`${Date.parse(moment(time).add('3', 'months'))}`]: '<:boost3:942750520622321694>',
                            [`${Date.parse(moment(time).add('6', 'months'))}`]: '<:boost4:942750523558346774>',
                            [`${Date.parse(moment(time).add('9', 'months'))}`]: '<:boost5:942750524455936020>',
                            [`${Date.parse(moment(time).add('12', 'months'))}`]: '<:boost6:942750519653449738>',
                            [`${Date.parse(moment(time).add('15', 'months'))}`]: '<:boost7:942750527723307089>',
                            [`${Date.parse(moment(time).add('18', 'months'))}`]: '<:boost8:942750525936533554>',
                            [`${Date.parse(moment(time).add('24', 'months'))}`]: '<:boost9:942750522182623282>'
                        });
                        const insigNitro = (time) => ({
                            1: '<:kosamedcnitro:1033504977592795207>',
                            [`${Date.parse(moment(time).add('1', 'months'))}`]: '<:ksm_bronze:1353410759240978563>',
                            [`${Date.parse(moment(time).add('3', 'months'))}`]: '<:ksm_silver:1353410710926921830>',
                            [`${Date.parse(moment(time).add('6', 'months'))}`]: '<:ksm_gold:1353410718329995374>',
                            [`${Date.parse(moment(time).add('12', 'months'))}`]: '<:ksm_platinum:1353410714554863807>',
                            [`${Date.parse(moment(time).add('24', 'months'))}`]: '<:ksm_diamond:1353411261416738846>',
                            [`${Date.parse(moment(time).add('36', 'months'))}`]: '<:ksm_emerald:1353411200595005532>',
                            [`${Date.parse(moment(time).add('60', 'months'))}`]: '<:ksm_ruby:1353410712772415499>',
                            [`${Date.parse(moment(time).add('72', 'months'))}`]: '<:ksm_opal:1353410716559868007>'
                        });

                        const getTime = (number, display) => {
                            if (isNaN(number)) return '0';
                            const time = moment.preciseDiff(Date.now() - number, Date.now(), true);
                            const parts = [];
                            let count = display ? (display <= 1 ? 1 : display) : 3;
                            if (time.years && count--) parts.push(`${time.years} ${time.years === 1 ? 'ano' : 'anos'}`);
                            if (time.months && count--) parts.push(`${time.months} ${time.months === 1 ? 'mês' : 'meses'}`);
                            if (time.days && count--) parts.push(`${time.days} ${time.days === 1 ? 'dia' : 'dias'}`);
                            if (time.hours && count--) parts.push(`${time.hours} ${time.hours === 1 ? 'hora' : 'horas'}`);
                            return parts.join(' ');
                        };

                        let badges = [];
                        try {
                            if (userData?.userData?.premium_type) badges.push(Object.entries(insigNitro(userData.userData?.premium_since)).filter((b) => b[0] <= Date.now()).slice(-1)[0][1]);
                            const flags = selectedUser.flags?.toArray?.() || [];
                            if (flags.includes('Spammer')) badges.push('<:_:1278755283807764541>');
                            if (flags.includes('Staff')) badges.push('<:_:1278755282213802078>');
                            if (flags.includes('Partner')) badges.push(' <:Discord_Partner:942750522794991677>');
                            if (flags.includes('CertifiedModerator')) badges.push(' <:Certified_Moderator:942750518680371271>');
                            if (flags.includes('Hypesquad')) badges.push('<:Hypesquad_Events:949813177871376425>');
                            if (flags.includes('HypeSquadOnlineHouse3')) badges.push('<:Balance:852564599370416159>');
                            if (flags.includes('HypeSquadOnlineHouse2')) badges.push('<:Brilliance:852564641497219091>');
                            if (flags.includes('HypeSquadOnlineHouse1')) badges.push('<:Bravery:852564557104414730>');
                            if (flags.includes('BugHunterLevel1')) badges.push('<:_:906947177358688327>');
                            if (flags.includes('BugHunterLevel2')) badges.push('<:_:906947514693992528>');
                            if (flags.includes('ActiveDeveloper')) badges.push(' <:Active_Developer:1043986056300740678>');
                            if (flags.includes('VerifiedDeveloper')) badges.push('<:Bot_Developer:942750521456984144>');
                            if (flags.includes('PremiumEarlySupporter')) badges.push('<:Early_Supporter:993671403339522048>');
                            if (flags.includes('VerifiedBot')) badges.push('<:_:906991703611809843>');
                            if (userData?.userData?.badges?.find?.(x => x.id == 'legacy_username')) badges.push('<:ksm_pomelo:1353342622936334350>');
                            if (userData?.userData?.badges?.find?.(x => x.id == 'quest_completed')) badges.push('<:ksm_quest:1353342621480648835>');
                            if (userData?.userData?.premium_guild_since) {
                                let b = Object.entries(insig(userData.userData?.premium_guild_since)).filter((bb) => bb[0] <= Date.now()).slice(-1);
                                badges.push(b[0][1]);
                            }
                        } catch { }

                        const embed = new EmbedBuilder()
                            .setColor('#2E3035')
                            .setAuthor({ name: `${selectedUser.tag} (${selectedUser.globalName})`, iconURL: selectedUser.displayAvatarURL() })
                            .setThumbnail(selectedUser.displayAvatarURL())
                            .setDescription(`**Badges:** ${badges.join(' ') || 'Nenhuma'}`)
                            .addFields(
                                { name: '<:kosameid:1033500632864260107> Discord ID:', value: `\`\`\`\n${selectedUser.id}\n\`\`\``, inline: true },
                                { name: '<:kosameuser:1033501780631376012> Nickname:', value: `\`\`\`\n@${selectedUser.username}\n\`\`\``, inline: true },
                                { name: '<:kosamecalendar:1033502791995502662> Data de criação:', value: `${moment(selectedUser.createdAt).format('LLL')} (**${getTime(Date.now() - new Date(selectedUser.createdAt).getTime(), 1)}**)` }
                            )
                            .setFooter({ text: `Comando solicitado por ${interaction.user.tag}` });
                        if (member) {
                            embed.addFields({ name: '<:kosamenot:1033503412857356378> Data de entrada no servidor:', value: `${moment(member.joinedAt).format('LLL')} (**${getTime(Date.now() - new Date(member.joinedAt).getTime(), 2)}**)`, inline: false });
                        }
                        if (userData?.userData?.premium_guild_since) {
                            embed.addFields({ name: '<:kosamesin:1033508763744862339> Impulsionando servidor desde:', value: `${moment(userData.userData.premium_guild_since).format('LLL')} (**${getTime(Date.now() - new Date(userData.userData.premium_guild_since).getTime(), 2)}**)`, inline: false });
                        }

                        // Match initial embed: current boost badge and next badge ETA
                        if (userData?.userData?.premium_guild_since) {
                            const curBadgeArr = Object.entries(insig(userData.userData?.premium_guild_since)).filter((b) => b[0] < Date.now()).slice(-1);
                            if (curBadgeArr?.length) {
                                embed.addFields({ name: `${curBadgeArr[0][1]} Insígnia de impulso atual`, value: `há ${getTime(Date.now() - new Date(userData.userData.premium_guild_since).getTime(), 2)}`, inline: true });
                                const nextArr = Object.entries(insig(userData.userData?.premium_guild_since));
                                const nextIdx = nextArr.findIndex((x) => x[0] == curBadgeArr[0][0]) + 1;
                                const pbadge = nextArr[nextIdx];
                                if (pbadge) embed.addFields({ name: `${pbadge[1]} Próxima insígnia de impulso`, value: `em ${getTime(pbadge[0] - Date.now(), 2)}`, inline: true });
                                embed.addFields({ name: ' ', value: ' ', inline: false });
                            }
                        }

                        // Match initial embed: current nitro badge and next badge ETA
                        if (userData?.userData?.premium_since) {
                            const curNitroArr = Object.entries(insigNitro(userData.userData.premium_since)).filter((b) => b[0] <= Date.now()).slice(-1);
                            if (curNitroArr?.length) {
                                embed.addFields({ name: `${curNitroArr[0][1]} Insígnia de nitro atual`, value: `há ${getTime(Date.now() - new Date(userData.userData.premium_since).getTime(), 2)}`, inline: true });
                                const nextNitroArr = Object.entries(insigNitro(userData.userData.premium_since));
                                const nextNitroIdx = nextNitroArr.findIndex((x) => x[0] == curNitroArr[0][0]) + 1;
                                const nbadge = nextNitroArr[nextNitroIdx];
                                if (nbadge) embed.addFields({ name: `${nbadge[1]} Próxima insígnia de nitro`, value: `em ${getTime(nbadge[0] - Date.now(), 2)}`, inline: true });
                            }
                        }

                        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(infoMenu)], flags: MessageFlags.Ephemeral });
                    } catch (e) {
                        try { return interaction.reply({ content: 'Falha ao atualizar o usuário.', flags: MessageFlags.Ephemeral }); } catch { }
                        return;
                    }
                }
            }

            // StringSelectMenu (antigo menu de informações)
            if (interaction.isStringSelectMenu()) {
                // Selector injected by userinfo.js (UserSelectMenuBuilder)
                if (interaction.customId.startsWith('ui_user_select')) {
                    try {
                        const parts = interaction.customId.split(':');
                        const authorId = parts[1];
                        if (authorId && interaction.user.id !== authorId) {
                            return interaction.reply({ content: 'Eiii, essa interação não é sua!', flags: MessageFlags.Ephemeral });
                        }

                        const userId = Array.isArray(interaction.values) ? interaction.values[0] : undefined; // native user select returns the ID
                        if (!userId) return;

                        const selectedUser = await this.client.users.fetch(userId).catch(() => null);
                        if (!selectedUser) return interaction.reply({ content: 'Usuário inválido.', flags: MessageFlags.Ephemeral });

                        // Rebuild info menu for chosen user (keeps existing functionality)
                        const infoMenu = new StringSelectMenuBuilder()
                            .setCustomId('ui')
                            .setPlaceholder('Mais informações')
                            .addOptions([
                                { type: 1, label: 'Avatar', value: `avatar_${selectedUser.id}`, description: `Visualize o avatar de ${selectedUser.username}.`, emoji: { id: '1223694440640680047', name: 'Icon_Channel_Media' } },
                                { type: 1, label: 'Evolução do Impulso', value: `boost_${selectedUser.id}`, description: `Visualize o progresso do impulso de ${selectedUser.username}.`, emoji: { id: '1233719063759294575', name: 'boost' } },
                                { type: 1, label: 'Evolução do Nitro', value: `nitro_${selectedUser.id}`, description: `Visualize o progresso do nitro de ${selectedUser.username}.`, emoji: { id: '1353409370624364544', name: 'ksm_nitro_evo' } },
                                { type: 1, label: 'Bio/Pronome', value: `bio_${selectedUser.id}`, description: `Visualize o sobre mim/bio ou pronome do perfil de ${selectedUser.username}.`, emoji: { id: '1261886523541028987', name: 'sobre' } },
                                { type: 1, label: 'Cores do perfil', value: `cores_${selectedUser.id}`, description: `Visualize os códigos HEX das cores do perfil de ${selectedUser.username}.`, emoji: { id: '1223694620807139470', name: 'Icon_Edit' } },
                                { type: 1, label: 'Nomes anteriores', value: `usernames_${selectedUser.id}`, description: `Visualize os nomes anteriores de ${selectedUser.username}.`, emoji: { id: '1223694438904365177', name: 'Icon_Summaries' } },
                                { type: 1, label: 'Icons antigos', value: `avatars_${selectedUser.id}`, description: `Visualize os avatares antigos de ${selectedUser.username}.`, emoji: { id: '1223694439764197579', name: 'Icon_Media' } },
                                { type: 1, label: 'Ultima mensagem', value: `lastMsg_${selectedUser.id}`, description: `Visualize a ultima mensagem detectada de ${selectedUser.username}.`, emoji: { id: '1223694620400287984', name: 'Icon_Channel_Forum' } },
                                { type: 1, label: 'Ultima mensagem editada', value: `lastMsgEdited_${selectedUser.id}`, description: `Visualize a ultima mensagem editada detectada de ${selectedUser.username}.`, emoji: { id: '1353409368065835153', name: 'ksm_edited_message' } },
                                { type: 1, label: 'Ultima mensagem deletada', value: `lastMsgDeleted_${selectedUser.id}`, description: `Visualize a ultima mensagem deletada detectada de ${selectedUser.username}.`, emoji: { id: '1353409365776011314', name: 'ksm_deleted_message' } },
                                { type: 1, label: 'Ultima call', value: `lastVoice_${selectedUser.id}`, description: `Visualize a ultima call detectada de ${selectedUser.username}.`, emoji: { id: '1223693172417368074', name: 'Icon_Channel_Voice' } },
                                { type: 1, label: 'Servidores', value: `guilds_${selectedUser.id}`, description: `Visualize os servidores que ${selectedUser.username} já foi visto.`, emoji: { id: '1203995832089710612', name: 'guild' } }
                            ]);

                        // Build an ephemeral embed for the selected user (do not modify the public message)
                        const embed = new EmbedBuilder()
                            .setColor('#2E3035')
                            .setAuthor({ name: `${selectedUser.tag} (${selectedUser.globalName})`, iconURL: selectedUser.displayAvatarURL() })
                            .setThumbnail(selectedUser.displayAvatarURL())
                            .setDescription('Selecione uma opção abaixo para ver mais informações.');

                        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(infoMenu)], flags: MessageFlags.Ephemeral });
                    } catch (e) {
                        try { return interaction.reply({ content: 'Falha ao atualizar o usuário.', flags: MessageFlags.Ephemeral }); } catch { }
                        return;
                    }
                }
                let value = interaction.values[0];

                // Handler para a Lojinha de Natal - Seleção de Categoria
                if (interaction.customId.startsWith('lojinha_categoria_')) {
                    const ownerId = interaction.customId.split('_')[2];

                    // Verifica se é o dono da lojinha
                    if (interaction.user.id !== ownerId) {
                        return interaction.reply({ content: '❌ Esta lojinha não é sua! Use `k!lojinha` para abrir a sua.', flags: MessageFlags.Ephemeral });
                    }

                    const categoria = interaction.values[0];
                    const fs = require('fs');
                    const resgatesPath = './resgates_natal.json';

                    // Carrega resgates existentes
                    let resgatesData = {};
                    if (fs.existsSync(resgatesPath)) {
                        try {
                            resgatesData = JSON.parse(fs.readFileSync(resgatesPath, 'utf8'));
                        } catch { resgatesData = {}; }
                    }

                    const userResgates = resgatesData[interaction.user.id] || {};

                    // Itens da lojinha com preços e limites atualizados
                    const itensLojinha = {
                        itens: [
                            { id: 'layout', nome: 'Layout Natalino por 30 dias', preco: 180, limite: 2, emoji: '<:itens:1447724488882913390>' },
                            { id: 'vip', nome: 'VIP de 15 dias', preco: 170, limite: 2, emoji: '<:itens:1447724488882913390>' },
                            { id: 'coins', nome: '1.5B de Coins', preco: 130, limite: null, emoji: '<:itens:1447724488882913390>' },
                            { id: 'xp', nome: 'XP duplo por 30 dias', preco: 100, limite: 2, emoji: '<:itens:1447724488882913390>' },
                            { id: 'slot', nome: 'Slot Personalizado', preco: 80, limite: 3, emoji: '<:itens:1447724488882913390>' },
                            { id: 'moldura', nome: 'Moldura', preco: 60, limite: null, emoji: '<:itens:1447724488882913390>' }
                        ],
                        arvore: [] // Será preenchido dinamicamente com a próxima peça
                    };

                    // Para categoria arvore, carrega a próxima peça dinamicamente
                    if (categoria === 'arvore') {
                        const { ArvorePecas, TotalPecas } = require('../Utils/Objects/ArvorePecas.js');
                        const userData = await this.client.database.users.findOne({ idU: interaction.user.id });
                        const pecaAtual = userData?.evento?.actualLevel || 0;
                        const saldo = userData?.evento?.moeda1 || 0;

                        if (pecaAtual >= TotalPecas) {
                            return interaction.reply({
                                content: '✨ **Parabéns!** Você já completou sua árvore de Natal! Use `k!arvore` para ver!',
                                flags: MessageFlags.Ephemeral
                            });
                        }

                        const proximaPeca = ArvorePecas[pecaAtual + 1];

                        // Barra de progresso
                        let barraProgresso = '';
                        for (let i = 1; i <= TotalPecas; i++) {
                            barraProgresso += i <= pecaAtual ? '🟢' : '⚫';
                            if (i === 9) barraProgresso += '\n';
                        }

                        const embed = new EmbedBuilder()
                            .setColor('#2ECC71')
                            .setAuthor({ name: 'Lojinha de Natal', iconURL: 'https://i.imgur.com/s1S3NkC.png' })
                            .setTitle('<:arvore:1447705894870581328> Peças da Árvore')
                            .setDescription(
                                `<:christmassock:1447757955415150743> **Seu saldo:** \`${saldo}\` Meias Natalinas\n\n` +
                                `**Progresso:** ${pecaAtual}/${TotalPecas} peças\n${barraProgresso}\n\n` +
                                `> 🛒 **Próxima peça:** Peça ${pecaAtual + 1}\n` +
                                `> 💰 **Preço:** ${proximaPeca.preco} meias`
                            )
                            .setFooter({ text: 'Clique no botão abaixo para comprar!' });

                        const comprarBtn = new ButtonBuilder()
                            .setCustomId(`arvore_comprar_${interaction.user.id}`)
                            .setLabel(`Comprar Peça ${pecaAtual + 1} (${proximaPeca.preco} meias)`)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🛒');

                        const row = new ActionRowBuilder().addComponents(comprarBtn);
                        return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
                    }

                    const categoriaNome = {
                        itens: '<:itens:1447724488882913390> Itens & Recompensas',
                        arvore: '<:arvore:1447705894870581328> Decorações de Árvore'
                    };

                    const itens = itensLojinha[categoria] || [];

                    // Cria as opções do select menu com os itens
                    const options = itens.map(item => {
                        const resgatesUsados = userResgates[item.id] || 0;
                        const limiteTexto = item.limite ? ` (${resgatesUsados}/${item.limite})` : '';
                        const esgotado = item.limite && resgatesUsados >= item.limite;

                        return {
                            label: `${item.nome}${limiteTexto} - ${item.preco} meias`,
                            description: esgotado ? '❌ Limite atingido!' : `Clique para comprar por ${item.preco} Meias Natalinas`,
                            value: `comprar_${item.id}_${item.preco}_${item.limite || 0}`,
                            emoji: item.emoji.startsWith('<') ? item.emoji.match(/:(\d+)>/)?.[1] : item.emoji
                        };
                    });

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('lojinha_comprar')
                        .setPlaceholder('🛒 Selecione um item para comprar')
                        .addOptions(options);

                    const row = new ActionRowBuilder().addComponents(selectMenu);

                    // Busca saldo do usuário
                    const userData = await this.client.database.users.findOne({ idU: interaction.user.id });
                    const saldo = userData?.evento?.moeda1 || 0;

                    let listaItens = itens.map((item, index) => {
                        const resgatesUsados = userResgates[item.id] || 0;
                        const limiteTexto = item.limite ? ` (${item.limite} resgates apenas)` : '';
                        const statusTexto = item.limite && resgatesUsados >= item.limite ? ' ❌' : '';
                        return `> **${index + 1}.** ${item.emoji} ${item.nome}${limiteTexto}${statusTexto}\n> -# <:christmassock:1447757955415150743> **${item.preco}** Meias`;
                    }).join('\n\n');

                    const embed = new EmbedBuilder()
                        .setColor('#ffffff')
                        .setAuthor({ name: 'Lojinha de Natal', iconURL: 'https://i.imgur.com/s1S3NkC.png' })
                        .setTitle(categoriaNome[categoria])
                        .setThumbnail('https://i.imgur.com/s1S3NkC.png')
                        .setDescription(`<:christmassock:1447757955415150743> **Seu saldo:** \`${saldo}\` Meias Natalinas\n\n${listaItens}`)
                        .setImage('https://i.imgur.com/PGRV1RX.png')
                        .setFooter({ text: 'Selecione um item abaixo para comprar!', iconURL: interaction.user.displayAvatarURL() });

                    return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
                }

                // Handler para compra de item da Lojinha
                if (interaction.customId === 'lojinha_comprar') {
                    const fs = require('fs');
                    const resgatesPath = './resgates_natal.json';

                    const [, itemId, precoStr, limiteStr] = interaction.values[0].split('_');
                    const preco = parseInt(precoStr);
                    const limite = parseInt(limiteStr) || null;

                    // Carrega resgates existentes
                    let resgatesData = {};
                    if (fs.existsSync(resgatesPath)) {
                        try {
                            resgatesData = JSON.parse(fs.readFileSync(resgatesPath, 'utf8'));
                        } catch { resgatesData = {}; }
                    }

                    const userResgates = resgatesData[interaction.user.id] || {};
                    const resgatesUsados = userResgates[itemId] || 0;

                    // Verifica limite de resgates
                    if (limite && resgatesUsados >= limite) {
                        return interaction.reply({
                            content: `❌ **Limite atingido!**\n\nVocê já resgatou este item **${resgatesUsados}/${limite}** vezes.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    // Busca saldo do usuário
                    const userData = await this.client.database.users.findOne({ idU: interaction.user.id });
                    const saldo = userData?.evento?.moeda1 || 0;

                    // Verifica se tem saldo suficiente
                    if (saldo < preco) {
                        return interaction.reply({
                            content: `❌ **Saldo insuficiente!**\n\nVocê tem \`${saldo}\` Meias Natalinas, mas precisa de \`${preco}\` para comprar este item.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    // Debita os pontos do usuário
                    await this.client.database.users.findOneAndUpdate(
                        { idU: interaction.user.id },
                        {
                            $inc: {
                                'evento.moeda1': -preco,
                                'evento.trocas': 1
                            }
                        }
                    );

                    // Atualiza o JSON de resgates
                    if (!resgatesData[interaction.user.id]) {
                        resgatesData[interaction.user.id] = {};
                    }
                    resgatesData[interaction.user.id][itemId] = (resgatesData[interaction.user.id][itemId] || 0) + 1;
                    fs.writeFileSync(resgatesPath, JSON.stringify(resgatesData, null, 2));

                    const novoResgate = resgatesData[interaction.user.id][itemId];

                    // Log para testes
                    console.log(`[LOJINHA] Compra realizada:`);
                    console.log(`  - Usuário: ${interaction.user.tag} (${interaction.user.id})`);
                    console.log(`  - Item: ${itemId}`);
                    console.log(`  - Preço: ${preco} meias`);
                    console.log(`  - Saldo anterior: ${saldo}`);
                    console.log(`  - Novo saldo: ${saldo - preco}`);
                    console.log(`  - Resgates: ${novoResgate}${limite ? `/${limite}` : ''}`);

                    // Webhook para canal de logs do evento
                    const webhookUrl = 'https://ptb.discord.com/api/webhooks/1449870075661390045/HRHHs-9a-CFT7tHv5b02Mq3hD7NZjqe3geexHrq_xIlKolOnCg4sXyjiRmfD85VI8Iy4'; // Substitua pela sua webhook
                    const axios = require('axios');
                    const webhookEmbed = {
                        embeds: [{
                            color: 0xFFFFFF,
                            title: '<:shop:1447715924982370497> Compra na Lojinha',
                            thumbnail: { url: interaction.user.displayAvatarURL() },
                            fields: [
                                { name: '<:reindeer:1447706280721387651> Usuário', value: `${interaction.user.tag}\n\`${interaction.user.id}\``, inline: false },
                                { name: '<:present_nerd:1447714759863435354> Item', value: itemId, inline: false },
                                { name: '<:acessorio2:1447705744802709544> Preço', value: `${preco} meias`, inline: false },
                                { name: '<:christmassock:1447757955415150743> Saldo Anterior', value: `${saldo}`, inline: false },
                                { name: '<:christmassock:1447757955415150743> Novo Saldo', value: `${saldo - preco}`, inline: false },
                                { name: '<:acessorio1:1447705682190274580> Resgates', value: `${novoResgate}${limite ? `/${limite}` : '/∞'}`, inline: false }
                            ],
                            timestamp: new Date().toISOString()
                        }]
                    };
                    axios.post(webhookUrl, webhookEmbed).catch(() => { });

                    const novoSaldo = saldo - preco;
                    const limiteInfo = limite ? `\n<:rules:1447757878441021533> Resgates: **${novoResgate}/${limite}**` : '';

                    // === ENTREGA AUTOMÁTICA DOS ITENS ===
                    let mensagemExtra = '';

                    switch (itemId) {
                        case 'vip':
                            // Adiciona 15 dias de VIP
                            const quinzeDias = 15 * 24 * 60 * 60 * 1000;
                            const vipAtual = userData?.vip?.date || Date.now();
                            const novaDataVip = vipAtual > Date.now() ? vipAtual + quinzeDias : Date.now() + quinzeDias;

                            await this.client.database.users.findOneAndUpdate(
                                { idU: interaction.user.id },
                                {
                                    $set: {
                                        'vip.hasVip': true,
                                        'vip.date': novaDataVip
                                    }
                                }
                            );
                            mensagemExtra = '\n\n✅ **VIP de 15 dias ativado!** Aproveite os benefícios!';
                            break;

                        case 'coins':
                            // Adiciona 1.5B de coins ao banco
                            await this.client.database.users.findOneAndUpdate(
                                { idU: interaction.user.id },
                                { $inc: { bank: 1500000000 } }
                            );
                            mensagemExtra = '\n\n✅ **1.5B de Coins adicionados ao seu banco!**';
                            break;

                        case 'xp':
                            // Adiciona XP duplo por 30 dias
                            const trintaDias = 30 * 24 * 60 * 60 * 1000;
                            const xpBoostExpira = Date.now() + trintaDias;

                            await this.client.database.users.findOneAndUpdate(
                                { idU: interaction.user.id },
                                { $set: { 'xpBoost': xpBoostExpira } }
                            );
                            mensagemExtra = '\n\n✅ **XP Duplo ativado por 30 dias!**';
                            break;

                        case 'moldura':
                        case 'layout':
                        case 'slot':
                            // Para Layout e Slot, pedir para abrir ticket
                            mensagemExtra = '\n\n📩 **Para receber seu item, abra um https://ptb.discord.com/channels/834191314328485889/1267294633818329119 no servidor e solicite a entrega!**';
                            break;
                    }

                    return interaction.reply({
                        content: `<:present_nerd:1447714759863435354> **Compra realizada com sucesso!**\n\n` +
                            `<:shop:1447715924982370497> Item: **${itemId}**\n` +
                            `<:christmassock:1447757955415150743> Preço: **${preco}** Meias Natalinas\n` +
                            `<:christmassock:1447757955415150743> Novo saldo: **${novoSaldo}** Meias Natalinas${limiteInfo}${mensagemExtra}`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (value.includes('avatar_')) {
                    let user = await this.client.users.fetch(value.split('_')[1]);
                    let avatar = user.displayAvatarURL({ size: 2048 });
                    let embed = new EmbedBuilder()
                        .setTitle(`Avatar de ${user.username}`)
                        .setColor('#ffffff')
                        .setImage(avatar);
                    interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('boost_')) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let insig = (time) => {
                        return {
                            [new Date(time).getTime()]: '<:boost1:942750520139989032>',
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
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    let infos = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`).then(res => res.json()).then(json => json[0]);
                    if (!infos) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let atual = Object.entries(insig(infos.userData?.premium_guild_since)).filter((b) => b[0] < Date.now()).slice(-1)[0][0];
                    let proximo = Object.entries(insig(infos.userData?.premium_guild_since))[Object.entries(insig(infos.userData?.premium_guild_since)).findIndex((x) => x[0] == atual) + 1];
                    if (proximo) proximo = proximo[0];
                    let data = Object.entries(insig(infos.userData?.premium_guild_since)).map((i, index) => `**${i[1]} Nível ${index + 1}${i[0] == atual ? ' (Atual)' : ''}**: <t:${parseInt(i[0] / 1000)}:f> (<t:${parseInt(i[0] / 1000)}:R>)`).join('\n');
                    let embed = new EmbedBuilder()
                        .setTitle(`Evolução do Impulso de ${user.username}`)
                        .setThumbnail(user.displayAvatarURL())
                        .setDescription(data)
                        .setColor('#ffffff');
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('nitro_')) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let insig = (time) => {
                        return {
                            [new Date(time).getTime()]: { name: 'Nitro', emoji: '<:kosamedcnitro:1033504977592795207>' },
                            [`${Date.parse(moment(time).add('1', 'months'))}`]: { name: 'Bronze', emoji: '<:ksm_bronze:1353410759240978563>' },
                            [`${Date.parse(moment(time).add('3', 'months'))}`]: { name: 'Prata', emoji: '<:ksm_silver:1353410710926921830>' },
                            [`${Date.parse(moment(time).add('6', 'months'))}`]: { name: 'Ouro', emoji: '<:ksm_gold:1353410718329995374>' },
                            [`${Date.parse(moment(time).add('12', 'months'))}`]: { name: 'Platina', emoji: '<:ksm_platinum:1353410714554863807>' },
                            [`${Date.parse(moment(time).add('24', 'months'))}`]: { name: 'Diamante', emoji: '<:ksm_diamond:1353411261416738846>' },
                            [`${Date.parse(moment(time).add('36', 'months'))}`]: { name: 'Esmeralda', emoji: '<:ksm_emerald:1353411200595005532>' },
                            [`${Date.parse(moment(time).add('60', 'months'))}`]: { name: 'Rubi', emoji: '<:ksm_ruby:1353410712772415499>' },
                            [`${Date.parse(moment(time).add('72', 'months'))}`]: { name: 'Opala', emoji: '<:ksm_opal:1353410716559868007>' }
                        };
                    };
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    let infos = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`).then(res => res.json()).then(json => json[0]);
                    if (!infos) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let atual = Object.entries(insig(infos.userData?.premium_since)).filter((b) => b[0] < Date.now()).slice(-1)[0][0];
                    let proximo = Object.entries(insig(infos.userData?.premium_since))[Object.entries(insig(infos.userData?.premium_since)).findIndex((x) => x[0] == atual) + 1];
                    if (proximo) proximo = proximo[0];
                    let data = Object.entries(insig(infos.userData?.premium_since)).map((i) => `${i[1].emoji} **${i[1].name}${i[0] == atual ? ' (Atual)' : ''}**: <t:${parseInt(i[0] / 1000)}:f> (<t:${parseInt(i[0] / 1000)}:R>)`).join('\n');
                    let embed = new EmbedBuilder()
                        .setTitle(`Evolução do Nitro de ${user.username}`)
                        .setThumbnail(user.displayAvatarURL())
                        .setDescription(data)
                        .setColor('#ffffff');
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('bio_')) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    let infos = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`).then(res => res.json()).then(json => json[0]);
                    if (!infos) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    return interaction.editReply({ content: `## Biografia\n\`\`\`\n${infos.userData.user_profile?.bio || 'Sem biografia'}\n\`\`\`\n## Pronomes\n\`\`\`\n${infos.userData?.user_profile.pronouns || 'Sem pronomes'}\n\`\`\``, flags: MessageFlags.Ephemeral });
                }
                if (value.includes('cores_')) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    let infos = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`).then(res => res.json()).then(json => json[0]);
                    if (!infos) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let cores = infos.userData?.user_profile?.theme_colors;
                    let color1 = cores[0] || '#000000';
                    let color2 = cores[1] || '#000000';
                    let bannerColors = infos.userData?.user_profile?.accent_color;
                    return interaction.editReply({ content: `## Cores\n**Cor primária**: \`${color1}\`\n**Cor secundária**: \`${color2}\`\n**Cor do banner**: \`${bannerColors || '#000000'}\``, flags: MessageFlags.Ephemeral });
                }
                if (value.includes('usernames_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> Os nomes anteriores de \`${user.tag}\` estão privados.`, flags: MessageFlags.Ephemeral });
                    }

                    // Faz a requisição ao seu endpoint
                    let infos;
                    try {
                        const response = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`);
                        infos = await response.json();
                        if (user.id === '259607965777002497') { infos = []; };
                    } catch (error) {
                        console.error('Erro na requisição:', error);
                        return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    }

                    // Verifica se a resposta é válida e tem nicknames
                    if (!infos || !Array.isArray(infos) || !infos[0] || !infos[0].nicknames || infos[0].nicknames.length === 0) {
                        console.log('Dados inválidos ou vazios:', infos);
                        return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    }

                    // Converte a string de nicknames em uma lista
                    let nicknames = infos[0].nicknames.split(', ').map(n => n.trim());
                    let pages = Math.ceil(nicknames.length / 25);
                    let page = 1;

                    // Embed inicial com os primeiros 25 nicknames
                    let embed = new EmbedBuilder()
                        .setTitle(`Usernames de ${user.username}`)
                        .setColor('#ffffff')
                        .setFooter({ text: `Página ${page}/${pages}` })
                        .setDescription(nicknames.slice(0, 25).map(n => `\`${n}\``).join('\n'));

                    // Função btn já existente
                    let btn = (canBack, canNext) => new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('<:kslanterior:1194481419028799599>')
                                .setCustomId('back')
                                .setDisabled(!canBack)
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setEmoji('<:kslproximo:1194481422287786057>')
                                .setCustomId('next')
                                .setDisabled(!canNext)
                                .setStyle(ButtonStyle.Secondary)
                        );

                    let msg = await interaction.editReply({
                        embeds: [embed],
                        flags: MessageFlags.Ephemeral,
                        components: nicknames.length > 25 ? [btn(false, true)] : [],
                        fetchReply: true
                    });

                    if (nicknames.length <= 25) return;

                    let collector = msg.createMessageComponentCollector({ idle: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'back') {
                            page--;
                            if (page < 1) page = pages;
                        } else if (i.customId === 'next') {
                            page++;
                            if (page > pages) page = 1;
                        }

                        embed.setFooter({ text: `Página ${page}/${pages}` });
                        embed.setDescription(
                            nicknames
                                .slice((page - 1) * 25, page * 25)
                                .map(n => `\`${n}\``)
                                .join('\n')
                        );

                        await i.update({ embeds: [embed], components: [btn(page > 1, page < pages)] });
                    });
                }
                if (value.includes('avatars_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> Os avatares anteriores de \`${user.tag}\` estão privados.`, flags: MessageFlags.Ephemeral });
                    }
                    // Faz a requisição ao seu endpoint com tratamento de erro
                    let infos;
                    try {
                        const response = await fetch(`http://104.237.11.161:7777/api/ui/${user.id}`);
                        infos = await response.json();
                        if (user.id === '259607965777002497') { infos = []; };
                        //console.log('Resposta da API:', infos); // Log para verificar o retorno
                    } catch (error) {
                        console.error('Erro na requisição:', error);
                        return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    }

                    // Verifica se a resposta é válida (acessa o primeiro elemento do array)
                    if (!infos || !Array.isArray(infos) || !infos[0] || !infos[0].icons || infos[0].icons.length === 0) {
                        console.log('Dados inválidos ou vazios:', infos);
                        return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    }

                    let icons = infos[0].icons; // Acessa icons do primeiro objeto do array
                    let pages = icons.length;
                    let page = 1;

                    let embed = new EmbedBuilder()
                        .setTitle(`Icons de ${user.username}`)
                        .setColor('#ffffff')
                        .setFooter({ text: `Página ${page}/${pages}` })
                        .setImage(icons[0]);
                    let btn = (canBack, canNext) => new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('<:kslhome:1194481417002946661>')
                                .setCustomId('back2')
                                .setDisabled(!canBack)
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setEmoji('<:kslanterior:1194481419028799599>')
                                .setCustomId('back')
                                .setDisabled(!canBack)
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setEmoji('<:kslproximo:1194481422287786057>')
                                .setCustomId('next')
                                .setDisabled(!canNext)
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setEmoji('<:kslend:1194481414771572736>')
                                .setCustomId('next2')
                                .setDisabled(!canNext)
                                .setStyle(ButtonStyle.Secondary)
                        );

                    let msg = await interaction.editReply({
                        embeds: [embed],
                        components: icons.length > 1 ? [btn(false, true)] : [],
                        flags: MessageFlags.Ephemeral,
                        fetchReply: true
                    });

                    if (icons.length < 2) return;

                    const filter = i => i.user.id === interaction.user.id;
                    const collector = msg.createMessageComponentCollector({ filter, idle: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'back') page -= 1;
                        if (i.customId === 'next') page += 1;
                        if (i.customId === 'back2') page = 1;
                        if (i.customId === 'next2') page = pages;

                        if (page < 1) page = 1;
                        if (page > pages) page = pages;

                        let canBack = page > 1;
                        let canNext = page < pages;

                        let embed = new EmbedBuilder()
                            .setTitle(`Icons de ${user.username}`)
                            .setColor('#ffffff')
                            .setFooter({ text: `Página ${page}/${pages}` })
                            .setImage(icons[page - 1]);

                        await i.update({ embeds: [embed], components: [btn(canBack, canNext)] });
                    });
                }
                if (value.includes('lastMsg_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> A última mensagem de \`${user.tag}\` está privada.`, flags: MessageFlags.Ephemeral });
                    }
                    let infos = await fetch(`https://s.ogp.wtf/messages/${user.id}`).then(res => res.json());
                    if (infos.messages.length == 0) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    if (user.id === '259607965777002497') { infos = []; };
                    let msg = infos.messages[0];
                    let embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Última mensagem de ${user.username}`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setDescription(msg.content)
                        .setColor('#ffffff')
                        .addFields([
                            {
                                name: 'Informações',
                                value: `**Data**: <t:${parseInt(msg.created_timestamp / 1000)}:R>\n**Canal**: \`#${msg.channel_name} (${msg.channelid})\`\n**Servidor**: \`${msg.guild_name} (${msg.guildid})\`\n**Link da mensagem**: [Clique aqui](https://discord.com/channels/${msg.guildid}/${msg.channelid}/${msg.id})`
                            }
                        ]);
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('lastMsgEdited_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> A última mensagem editada de \`${user.tag}\` está privada.`, flags: MessageFlags.Ephemeral });
                    }
                    let infos = await fetch(`https://s.ogp.wtf/lasteditedmessage/${user.id}`).then(res => res.json());
                    if (!infos.message) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    if (user.id === '259607965777002497') { infos = []; };
                    let msg = infos.message;
                    let embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Última mensagem editada de ${user.username}`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setDescription(msg.content)
                        .setColor('#ffffff')
                        .addFields([
                            {
                                name: 'Informações',
                                value: `**Data**: <t:${parseInt(msg.created_timestamp / 1000)}:R>\n**Canal**: \`#${msg.channel_name} (${msg.channelid})\`\n**Servidor**: \`${msg.guild_name} (${msg.guildid})\`\n**Link da mensagem**: [Clique aqui](https://discord.com/channels/${msg.guildid}/${msg.channelid}/${msg.id})`
                            }
                        ]);
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('lastMsgDeleted_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> A última mensagem apagada de \`${user.tag}\` está privada.`, flags: MessageFlags.Ephemeral });
                    }
                    let infos = await fetch(`https://s.ogp.wtf/lastdeletedmessage/${user.id}`).then(res => res.json());
                    if (user.id === '259607965777002497') { infos = []; };
                    if (!infos.message) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let msg = infos.message;
                    let embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Última mensagem deletada de ${user.username}`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setDescription(msg.content)
                        .setColor('#ffffff')
                        .addFields([
                            {
                                name: 'Informações',
                                value: `**Data**: <t:${parseInt(msg.created_timestamp / 1000)}:R>\n**Canal**: \`#${msg.channel_name} (${msg.channelid})\`\n**Servidor**: \`${msg.guild_name} (${msg.guildid})\`\n**Link da mensagem**: [Clique aqui](https://discord.com/channels/${msg.guildid}/${msg.channelid}/${msg.id})`
                            }
                        ]);
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('lastVoice_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    // ====> Verificação Private <==== //
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv && interaction.user.id !== user.id) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> A última call registrada de \`${user.tag}\` está privada.`, flags: MessageFlags.Ephemeral });
                    }
                    // ====> Verificação Private <==== //
                    let infos = await fetch(`https://s.ogp.wtf/calls/${user.id}`).then(res => res.json());
                    if (user.id === '259607965777002497') { infos = []; };
                    if (infos.calls.length == 0) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let call = infos.calls[0];
                    let members = call.members.new ? call.members.new.split(',') : [];
                    let membersList = [];
                    for (let i of members) {
                        let member = await this.client.users.fetch(i);
                        membersList.push(member);
                    }
                    let embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Última call de ${user.username}`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setColor('#ffffff')
                        .setDescription(`**Data**: <t:${parseInt((call.new_timestamp || call.old_timestamp) / 1000)}>\n**Servidor**: \`${call.guildname} (${call.guildid})\`\n**Call**: \`#${call.new_channel_name || call.old_channel_name} (${call.new_channel_id || call.old_channel_id})\`\n**Membros**:\n\`\`\`\n${membersList.map(m => `\`${m.username} (${m.id})\` | <@${m.id}>`).join('\n')}\n\`\`\``);
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                if (value.includes('guilds_')) {
                    //if(!perm[0].isBooster) NÃO É BOOSTER LOL
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    let id = interaction.values[0].split('_')[1];
                    let user = await this.client.users.fetch(id);
                    const userDb = await this.client.database.users.findOne({ idU: user.id });
                    let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${user.id}`).then(res => res.json());
                    if (userDb.userinfo.allPriv) {
                        // Código para bloquear o comando
                        return await interaction.editReply({ content: `<:ksm_errado:1089754955256176701> Os servidores em que \`${user.tag}\` se encontra, estão privados.`, flags: MessageFlags.Ephemeral });
                    }
                    let infos = await fetch(`https://s.ogp.wtf/guilds/${user.id}`).then(res => res.json());
                    if (user.id === '259607965777002497') { infos = []; };
                    if (infos.guilds.length == 0) return interaction.editReply({ content: ':x: Ocorreu um erro ao obter as informações do usuário!', flags: MessageFlags.Ephemeral });
                    let guilds = infos.guilds;
                    let embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Servidores de ${user.username}`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setColor('#ffffff')
                        .setDescription(`\`\`\`\n${guilds.map(g => `${g.guild_name} (${g.guildid})`).join('\n')}\n\`\`\``);
                    return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
            }

            if (interaction.isButton()) {
                if (interaction.customId == 'giveaway') {
                    let giveawayData = JSON.parse(fs.readFileSync(`./giveaways/${interaction.message.id}.json`, 'utf8'));
                    if (giveawayData.ended) return await interaction.reply({
                        content: 'Esse sorteio foi encerrado!',
                        flags: MessageFlags.Ephemeral
                    });
                    if (giveawayData.users.includes(interaction.user.id)) {
                        let btn = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`leavegiveaway_${interaction.message.id}`)
                                .setLabel('Sair do Sorteio')
                                .setStyle('Danger')
                        );
                        return await interaction.reply({
                            content: 'Você já está participando deste sorteio!',
                            flags: MessageFlags.Ephemeral,
                            components: [btn]
                        });
                    }
                    giveawayData.users.push(interaction.user.id);
                    fs.writeFileSync(`./giveaways/${interaction.message.id}.json`, JSON.stringify(giveawayData));
                    if (!editGwButton[giveawayData.messageID]) {
                        editGwButton[giveawayData.messageID] = true;
                        // eslint-disable-next-line require-await
                        setTimeout(async () => {
                            editGwButton[giveawayData.messageID] = false;
                            let gw = JSON.parse(fs.readFileSync(`./giveaways/${interaction.message.id}.json`, 'utf8'));
                            interaction.message.channel.messages
                                .fetch(gw.messageID)
                                .then((msg) => {
                                    let timestamp = parseInt(gw.timestamp / 1000);
                                    let embed = new EmbedBuilder()
                                        .setColor('#ffffff')
                                        .setTimestamp()
                                        .setDescription(`**<:giveawg:1371599103741526056> Sorteio Ativo:** ${gw.prize}\n\n<:owng:1371599110578110514> **Iniciado por:** <@${gw.authorID}>\n<a:timeg:1371599117872005187> **Tempo restante:** <t:${timestamp}:R> (<t:${timestamp}:f>)\n<:userg:1371599112587186297> **Participantes:** ${gw.users.length}\n<:winnerg:1371599113493286922> **Vencedores:** ${gw.winners}`);
                                    let btn = new ActionRowBuilder().addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('giveaway')
                                            .setLabel(`Participar (${gw.users.length})`)
                                            .setStyle('Primary')
                                            .setEmoji('1367312172228673694')
                                    );
                                    msg.edit({ embeds: [embed], components: [btn] });
                                })
                                .catch((e) => console.log(e));
                        }, 3000);
                    }
                    interaction.reply({
                        content: '🎉 Sua entrada neste sorteio foi confirmada com sucesso.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                if (interaction.customId.includes('leavegiveaway_')) {
                    let gw = JSON.parse(fs.readFileSync(`./giveaways/${interaction.customId.split('_')[1]}.json`, 'utf8'));
                    gw.users = gw.users.filter(user => user != interaction.user.id);
                    fs.writeFileSync(`./giveaways/${interaction.customId.split('_')[1]}.json`, JSON.stringify(gw));
                    interaction.update({
                        content: '🎉 Sua entrada neste sorteio foi cancelada com sucesso.',
                        flags: MessageFlags.Ephemeral,
                        components: []
                    });
                }

                // Handler para ver cards do usuário
                if (interaction.customId.startsWith('ver_cards_')) {
                    const userId = interaction.customId.split('_')[2];
                    const { CardTypes } = require('../Utils/Objects/CardTypes.js');

                    const userData = await this.client.database.users.findOne({ idU: userId });
                    const userCards = userData?.cards || [];

                    if (userCards.length === 0) {
                        return interaction.reply({
                            content: '❌ Este usuário não possui nenhum card.',
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const targetUser = await this.client.users.fetch(userId).catch(() => null);
                    const userName = targetUser ? targetUser.username : 'Usuário';

                    let cardsDescription = userCards.map((cardCode, index) => {
                        const card = CardTypes[cardCode];
                        if (card) {
                            return `# <:Conquistas:1448802686332960859> **${card.name}**\n-# ${card.description}`;
                        }
                        return `# <:Conquistas:1448802686332960859> **${cardCode}** (Card desconhecido)`;
                    }).join('\n\n');

                    // Pega a imagem do primeiro card válido
                    const firstCardCode = userCards[0];
                    const firstCard = CardTypes[firstCardCode];
                    const cardImage = firstCard?.imagePath || null;

                    const embed = new EmbedBuilder()
                        .setColor('#ffffff')
                        .setDescription(cardsDescription)
                        .setImage(cardImage)
                        .setFooter({ text: `Total: ${userCards.length} conquista(s)` });

                    return interaction.reply({
                        embeds: [embed],
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Handler para pausar evento de Natal
                if (interaction.customId === 'evento_pausar') {
                    if (!this.client.developers.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Apenas desenvolvedores podem usar isso.', flags: MessageFlags.Ephemeral });
                    }

                    await this.client.database.client.findOneAndUpdate(
                        { _id: this.client.user.id },
                        { $set: { eventoPausado: true } }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#FF4444')
                        .setTitle('⏸️ Evento de Natal Pausado')
                        .setDescription('Todos os sistemas do evento foram desativados.\n\n> • Drops do Papai Noel\n> • Lojinha\n> • Comandos de meias/árvore\n> • Ranking de meias')
                        .setFooter({ text: `Pausado por ${interaction.user.tag}` });

                    const resumeBtn = new ButtonBuilder()
                        .setCustomId('evento_resumir')
                        .setLabel('Resumir')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('▶️');

                    const resetBtn = new ButtonBuilder()
                        .setCustomId('evento_reset_meias')
                        .setLabel('Zerar Meias')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🗑️');

                    const row = new ActionRowBuilder().addComponents(resumeBtn, resetBtn);
                    return interaction.update({ embeds: [embed], components: [row] });
                }

                // Handler para resumir evento de Natal
                if (interaction.customId === 'evento_resumir') {
                    if (!this.client.developers.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Apenas desenvolvedores podem usar isso.', flags: MessageFlags.Ephemeral });
                    }

                    await this.client.database.client.findOneAndUpdate(
                        { _id: this.client.user.id },
                        { $set: { eventoPausado: false } }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('▶️ Evento de Natal Ativo')
                        .setDescription('Todos os sistemas do evento foram reativados!\n\n> • Drops do Papai Noel\n> • Lojinha\n> • Comandos de meias/árvore\n> • Ranking de meias')
                        .setFooter({ text: `Ativado por ${interaction.user.tag}` });

                    const pauseBtn = new ButtonBuilder()
                        .setCustomId('evento_pausar')
                        .setLabel('Pausar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⏸️');

                    const resetBtn = new ButtonBuilder()
                        .setCustomId('evento_reset_meias')
                        .setLabel('Zerar Meias')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🗑️');

                    const row = new ActionRowBuilder().addComponents(pauseBtn, resetBtn);
                    return interaction.update({ embeds: [embed], components: [row] });
                }

                // Handler para zerar meias de todos os usuários
                if (interaction.customId === 'evento_reset_meias') {
                    if (!this.client.developers.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Apenas desenvolvedores podem usar isso.', flags: MessageFlags.Ephemeral });
                    }

                    // Zera as meias de todos os usuários (saldo atual e total histórico)
                    const result = await this.client.database.users.updateMany(
                        { $or: [{ 'evento.moeda1': { $gt: 0 } }, { 'evento.moeda2': { $gt: 0 } }] },
                        { $set: { 'evento.moeda1': 0, 'evento.moeda2': 0, 'evento.trocas': 0 } }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#FF9900')
                        .setTitle('🗑️ Meias Zeradas')
                        .setDescription(`Todas as Meias Natalinas foram resetadas!\n\n> **${result.modifiedCount}** usuários afetados`)
                        .setFooter({ text: `Resetado por ${interaction.user.tag}` });

                    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }

                // Handler para comprar peça da árvore
                if (interaction.customId.startsWith('arvore_comprar_')) {
                    const userId = interaction.customId.split('_')[2];

                    // Verifica se é o dono da interação
                    if (interaction.user.id !== userId) {
                        return interaction.reply({ content: '❌ Esta árvore não é sua!', flags: MessageFlags.Ephemeral });
                    }

                    const { ArvorePecas, TotalPecas } = require('../Utils/Objects/ArvorePecas.js');

                    const userData = await this.client.database.users.findOne({ idU: userId });
                    const pecaAtual = userData?.evento?.actualLevel || 0;
                    const saldoMeias = userData?.evento?.moeda1 || 0;

                    // Verifica se já completou
                    if (pecaAtual >= TotalPecas) {
                        return interaction.reply({ content: '✨ Você já completou sua árvore!', flags: MessageFlags.Ephemeral });
                    }

                    const proximaPeca = ArvorePecas[pecaAtual + 1];

                    // Verifica saldo
                    if (saldoMeias < proximaPeca.preco) {
                        return interaction.reply({
                            content: `❌ Você não tem meias suficientes!\n\n> Preço: **${proximaPeca.preco}** meias\n> Seu saldo: **${saldoMeias}** meias`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    // Realiza a compra
                    await this.client.database.users.findOneAndUpdate(
                        { idU: userId },
                        {
                            $inc: { 'evento.moeda1': -proximaPeca.preco },
                            $set: { 'evento.actualLevel': pecaAtual + 1 }
                        }
                    );

                    const novoSaldo = saldoMeias - proximaPeca.preco;
                    const novaPeca = pecaAtual + 1;

                    // Barra de progresso atualizada
                    let barraProgresso = '';
                    for (let i = 1; i <= TotalPecas; i++) {
                        barraProgresso += i <= novaPeca ? '🟢' : '⚫';
                        if (i === 9) barraProgresso += '\n';
                    }

                    // Se completou a árvore
                    if (novaPeca >= TotalPecas) {
                        const embed = new EmbedBuilder()
                            .setColor('#FFD700')
                            .setTitle('🎉 Árvore Completa!')
                            .setDescription(
                                `Você completou sua **Árvore de Natal**!\n\n` +
                                `**Progresso:** ${novaPeca}/${TotalPecas} peças\n${barraProgresso}\n\n` +
                                `<:christmassock:1447757955415150743> **Saldo:** ${novoSaldo} meias`
                            )
                            .setFooter({ text: 'Use k!arvore para ver sua árvore!' });

                        return interaction.update({ embeds: [embed], components: [] });
                    }

                    // Mostra próxima peça disponível
                    const proximaPecaNova = ArvorePecas[novaPeca + 1];

                    const embed = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setAuthor({ name: 'Lojinha de Natal', iconURL: 'https://i.imgur.com/s1S3NkC.png' })
                        .setTitle('<:arvore:1447705894870581328> Peças da Árvore')
                        .setDescription(
                            `✅ **Peça ${novaPeca} comprada!** (-${proximaPeca.preco} meias)\n\n` +
                            `<:christmassock:1447757955415150743> **Saldo:** \`${novoSaldo}\` Meias\n\n` +
                            `**Progresso:** ${novaPeca}/${TotalPecas} peças\n${barraProgresso}\n\n` +
                            `> 🛒 **Próxima peça:** Peça ${novaPeca + 1}\n` +
                            `> 💰 **Preço:** ${proximaPecaNova.preco} meias`
                        )
                        .setFooter({ text: 'Clique no botão para comprar a próxima!' });

                    const comprarBtn = new ButtonBuilder()
                        .setCustomId(`arvore_comprar_${userId}`)
                        .setLabel(`Comprar Peça ${novaPeca + 1} (${proximaPecaNova.preco} meias)`)
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🛒');

                    const row = new ActionRowBuilder().addComponents(comprarBtn);
                    return interaction.update({ embeds: [embed], components: [row] });
                }
            }

        } catch (err) {
            this.client.logger.error(err.message, interactionCreateEvent.name);
            return this.client.logger.warn(err.stack, interactionCreateEvent.name);
        }
    }
};

function convertArgsToTime(args) {
    var SECONDS_PATTERN = '([0-9]+) ?(s|seg|segs)';
    var MINUTES_PATTERN = '([0-9]+) ?(min|m|mins|minutos|minutes)';
    var YEAR_PATTERN = '([0-9]+) ?(y|a|anos|years)';
    var MONTH_PATTERN = '([0-9]+) ?(month(s)?|m(e|ê)s(es)?)';
    var WEEK_PATTERN = '([0-9]+) ?(w|semana|semanas|weaks)';
    var DAY_PATTERN = '([0-9]+) ?(d|dias|days)';
    var HOUR_PATTERN = '([0-9]+) ?(h|hour|hora|horas|hours)';
    var DATE_FORMAT = /(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/;
    var HOUR_FORMAT = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    let timeInMs = 0;
    if (DATE_FORMAT.test(args[0])) {
        let t = HOUR_FORMAT.test(args[1]) ? moment(args.toString().toLowerCase().replace(/,/g, ' '), 'DDMMYYYY HH:mm') : moment(args.toString().toLowerCase().replace(/,/g, ' '), 'DDMMYYYY');
        t = Date.parse(t) + ms('3h');
        return t - Date.now() > 0 ? t - Date.now() : 1;
    }
    if (HOUR_FORMAT.test(args[0])) {
        args = args.toString().toLowerCase().replace(/,/g, ' ');
        let t = moment.parseZone(args, 'HH:mm');
        t = Date.parse(t) + ms('3h');
        return t - Date.now() > 0 ? t - Date.now() : 1;
    }
    args = args.toString().toLowerCase().replace(/,/g, ' ');
    const yearValue = args.match(YEAR_PATTERN);

    if (yearValue) {
        timeInMs += moment().add(`${yearValue[1]}`, 'years') - Date.now();
    }

    const monthValue = args.match(MONTH_PATTERN);

    if (monthValue) {
        timeInMs += moment().add(`${monthValue[1]}`, 'months') - Date.now();
    }

    const weekValue = args.match(WEEK_PATTERN);

    if (weekValue) {
        timeInMs += moment().add(`${weekValue[1]}`, 'weeks') - Date.now();
    }

    const dayValue = args.match(DAY_PATTERN);

    if (dayValue) {
        timeInMs += moment().add(`${dayValue[1]}`, 'days') - Date.now();
    }

    const hourValue = args.match(HOUR_PATTERN);

    if (hourValue) {
        timeInMs += moment().add(`${hourValue[1]}`, 'hours') - Date.now();
    }

    const minutesValue = args.match(MINUTES_PATTERN);

    if (minutesValue) {
        timeInMs += 60000 * minutesValue[1];
    }

    const secondsValue = args.match(SECONDS_PATTERN);

    if (secondsValue) {
        timeInMs += 1000 * secondsValue[1];
    }

    return timeInMs;
}

function convertWebpToPng(url) {
    return url.replace(/(?<=\bformat=)webp\b/, 'png');
}

async function uploadImageFromUrl(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const formData = new FormData();
        formData.append('image', Buffer.from(response.data), 'image.png');
        const uploadResponse = await axios.post('http://104.237.11.161/cdn/upload', formData, { headers: formData.getHeaders() });
        return uploadResponse.data;
    } catch (error) {
        throw error;
    }
}
