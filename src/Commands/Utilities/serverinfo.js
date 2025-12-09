/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { Command } = require('../../Structures/Structures.js');
const { ApplicationCommandType, ApplicationCommandOptionType, ShardClientUtil, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = class serverInfoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'serverinfo';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha informações de um servidor.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'servidor',
                description: 'Informe o id do servidor.',
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message, args }) {
        moment.locale('pt-BR');

        let guild;
        let id;
        const SnowflakeRegex = /^(?<id>\d{17,20})$/;
        if(args[0] && SnowflakeRegex.test(args[0])) {
            id = ShardClientUtil.shardIdForGuildId(args[0], process.env.SHARDCOUNT);
            guild = await this.client.shard.broadcastEval((client, { guildId }) => client.guilds.cache.get(guildId), { context: { guildId: args[0] }, shard: id });
        }
        if(!guild) {
            guild = message.guild.toJSON();
            id = ShardClientUtil.shardIdForGuildId(guild.id, process.env.SHARDCOUNT);
        }
        let infos = await this.client.shard.broadcastEval(async (client, { guildId }) => {
            let guild = client.guilds.cache.get(guildId);
            //await guild.members.fetch()
            let members = {
                count: guild.memberCount,
                users: guild.members.cache.filter(u => !u.user.bot).size,
                bots: guild.members.cache.filter(u => u.user.bot).size
            };
            let channels = {
                count: guild.channels.cache.size,
                textCount: guild.channels.cache.filter(u => [0, 5].includes(u.type)).size,
                threadCount: guild.channels.cache.filter(u => [12, 11, 10].includes(u.type)).size,
                categoryCount: guild.channels.cache.filter(u => u.type == 4).size,
                voiceCount: guild.channels.cache.filter(u => [2, 13].includes(u.type)).size
            };
            let emojis = {
                count: guild.emojis.cache.size,
                animated: guild.emojis.cache.filter(e => e.animated).size,
                common: guild.emojis.cache.filter(e => !e.animated).size
            };
            let verified = guild.verified;
            let partnered = guild.partnered;
            let vanity = await guild.fetchVanityData().catch(e => null);
            vanity = { uses: vanity?.uses, code: guild.vanityURLCode };
            return {
                members,
                channels,
                emojis,
                vanity,
                verified,
                partnered
            };
        }, { context: { guildId: guild.id }, shard: id });

        let defaultEmbed = () => {
            let b = guild.premiumSubscriptionCount;
            let boostsig = b == 0 ? '' : b == 1 ? '<:booster:1045506055658016818>' : b < 7 ? '<:booster:1045506055658016818>' : b < 14 ? '<:booster:1045506055658016818>' : '<:booster:1045506055658016818>';
            let embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(`${guild.name}`, { partnered: infos.partnered ? '<:partneredserver:1289936217340645377>' : '', verified: infos.verified ? '<:verifiedserver:1289936235594383491>' : '', boost: boostsig, guildName: guild.name });
            if(guild.icon) embed.setThumbnail(this.client.rest.cdn.icon(guild.id, guild.icon, {}));
            return embed;
        };

        // Adicionando Informações do Servidor
        guild.splashURL = () => guild.splash && this.client.rest.cdn.splash(guild.id, guild.splash, {});
        guild.bannerURL = () => guild.banner && this.client.rest.cdn.banner(guild.id, guild.banner, {});
        let emb = defaultEmbed();
        let owner = await this.client.users.fetch(guild.ownerId).catch(() => null);
        let images = guild.splash && guild.banner ? [`${guild.bannerURL()}?size=2048`, `${guild.splashURL()}?size=2048`] : guild.splash ? [`${guild.splashURL()}?size=2048`, `${guild.splashURL()}?size=2048`] : guild.banner ? [`${guild.bannerURL()}?size=2048`, `${guild.bannerURL()}?size=2048`] : [];
        //Adicionar Depois
        let b = guild.premiumSubscriptionCount;
        let boostsig = b == 0 ? '' : b == 1 ? '<:kosame_nitroboost:1006724073222590564>' : b < 7 ? '<:kosame_nitroboost:1006724073222590564>' : b < 14 ? '<:kosame_nitroboost:1006724073222590564>' : '<:kosame_nitroboost:1006724073222590564>';
        // Fim Adicionar Depois
        let roles = guild.roles.length;
        let createdAt = guild.createdTimestamp;
        let timestamp = Date.now()-guild.createdTimestamp;
        let ptier = guild.premiumTier;
        let emojislimit = guild.premiumTier == 0 ? 100 : guild.premiumTier == 1 ? 200 : guild.premiumTier == 2 ? 300 : 500;
        //Adicionar Depois
        //code
        // Fim Adicionar Depois
        emb.addFields(
            { name: '<:id_1:1021610174512906270> ID do Servidor:', value: `\`\`\`${guild.id}\`\`\``, inline: false },
            { name: '<:ksm_date:1426764386315272223> Data de Criação:', value: `${moment(createdAt).format('LLL')} **(${moment.duration(timestamp).format('Y [anos], M [meses]')})**`, inline: false },
            { name: '<:kosameuser:1033501780631376012> Proprietário:', value: `${owner ? owner.tag : 'Desconhecido'}`, inline: true },
            { name: '<:booster:1045506055658016818> Boosts:', value: `${boostsig} ${guild.premiumSubscriptionCount}`, inline: true },
            { name: ' ', value: ' ', inline: false },
            { name: '<:ksm_level:1426767032312922223> Boost Level:', value: `${ptier == 0 ? 'Nenhum' : ptier == 1 ? 'Nível 1' : ptier == 2 ? 'Nível 2' : 'Nível 3'}`, inline: true },
            { name: '<:ksm_dice:1426771721582809128> Cargos:', value: `${roles}`, inline: true },
            { name: '<:users:1045506922356424795> Usuários:', value: `${infos.members.users}`, inline: true }  
        );
        emb.setImage(images[0]);

        return message.reply({ embeds: [emb] });
    }
};
