const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const ms = require('ms');

module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'mute';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para mutar um usuário no servidor.';
        this.aliases = ['mutar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'Informe a pessoa que deseja mutar.',
                required: true,
                type: ApplicationCommandOptionType.User
            },
            {
                name: 'tempo',
                description: 'Insira o tempo da punição. Exemplo: [1m (1 Minuto) | 2d (2 Dias)].',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {User[]} args 
     */
    async commandExecute({ message, args }) {

        const guild = message.guild;
        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });
        const kickMember = message.guild.members.cache.get(args[0]) || message.mentions?.members?.first() || message.member;
        
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para mutar alguém!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa da permissão de mutar membros para utilizar esse comando!` });
        } else if (message.guild.members.me.roles.highest.position <= kickMember.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do meu, não posso aplicar uma punição.` });
        } else if (message.member.roles.highest.position <= kickMember.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do seu, você nao pode aplicar uma punição.` });
        } else if (!args[0]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar quem deseja mutar!` });
        } else if (!args[1]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar o tempo do mute (Exemplo: [30s, 1d])!` });
        } else if (kickMember.id === this.client.user.id) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não pode me utilizar para me mutar, seu bobinho!` });
        } else if (kickMember.id === message.author.id) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não pode se punir, isso é muita burrice, mencione alguém!` });
        } else {
            const tempoMute = ms(args[1]);

            if (tempoMute > 2419200000)
                return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você só pode mutar um usuário até 28 dias!` });

            const puxaInfo = await this.client.users.fetch(kickMember.id, { cache: true });
            const userMuted = message.guild.members.cache.get(kickMember.id);

            const embedKick = new ClientEmbed()
                .setColor('#2E3035')
                .setDescription(`<:kmute:1021620452109598721> O Moderador **${message.author.tag}** mutou o usuário **${puxaInfo.tag}** no servidor!`);

            const row = new ActionRowBuilder();

            const expulsarMembro = new ButtonBuilder()
                .setCustomId('expulsar')
                .setLabel('Mutar Membro')
                .setStyle('Success');

            const cancelarKick = new ButtonBuilder()
                .setCustomId('cancelar')
                .setLabel('Cancelar')
                .setStyle('Danger');

            row.addComponents([expulsarMembro, cancelarKick]);
            const msg = await message.reply({ content: `Você tem certeza que deseja mutar ${kickMember} no servidor?`, components: [row], fetchReply: true });
            const filter = (i) => {
                return i.isButton() && i.message.id === msg.id;
            };
            const collector = msg.createMessageComponentCollector({ filter: filter, time: 20000, errors: ['time'], max: 1 });

            collector.on('collect', (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }

                if (i.customId === 'expulsar') {
                    i.update({ content: `${message.author}`, embeds: [embedKick], components: [] }).then(() => {
                        if (server.logs.status) {
                            const channel = guild.channels.cache.get(server.logs.channel);
                            channel.send({ embeds: [embedKick] });
                        }
                    });
                    userMuted.timeout(tempoMute, 'Kosame Mute');
                }

                if (i.customId === 'cancelar') {
                    i.update({ content: `${message.author} Você cancelou a punição!`, components: [] });
                }
            });

            collector.on('end', (c, r) => {
                if (c.size === 0 && r === 'time') {
                    msg.edit({ content: `O tempo para confirmar acabou!`, embeds: [], components: [] });
                }
            });
        }
    }
};