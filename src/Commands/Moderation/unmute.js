const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
require('moment-duration-format');

module.exports = class UnmuteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'unmute';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para desmutar um usuário no servidor.';
        this.aliases = ['mutar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'Informe a pessoa que deseja desmutar.',
                required: true,
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

        const guild = message.guild;
        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });
        const kickMember = message.guild.members.cache.get(args[0]) || message.mentions?.members?.first() || message.member;

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para mutar alguém!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa da permissão de mutar membros para utilizar esse comando!` });
        } else if (!args[0]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar quem deseja desmutar!` });
        } else {
            const puxaInfo = await this.client.users.fetch(kickMember.id, { cache: true });
            const userMuted = message.guild.members.cache.get(kickMember.id);

            const embedKick = new ClientEmbed()
                .setColor('#2E3035')
                .setDescription(`<:kmute:1021620452109598721> O Moderador **${message.author.tag}** desmutou o usuário **${puxaInfo.tag}** no servidor!`);

            const row = new ActionRowBuilder();

            const expulsarMembro = new ButtonBuilder()
                .setCustomId('expulsar')
                .setLabel('Desmutar Membro')
                .setStyle('Success');

            const cancelarKick = new ButtonBuilder()
                .setCustomId('cancelar')
                .setLabel('Cancelar')
                .setStyle('Danger');

            row.addComponents([expulsarMembro, cancelarKick]);

            const msg = await message.reply({ content: `Você tem certeza que deseja desmutar ${kickMember} no servidor?`, components: [row], fetchReply: true });
            const filter = (interaction) => {
                return interaction.isButton() && interaction.message.id === msg.id;
            };
            const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', (x) => {
                if (x.user.id !== message.author.id) {
                    return x.reply({ content: `${x.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }

                switch (x.customId) {
                    case 'expulsar': {
                        x.update({ content: `${message.author}`, embeds: [embedKick], components: [] }).then(() => {
                            if (server.logs.status) {
                                const channel = guild.channels.cache.get(server.logs.channel);
                                channel.send({ embeds: [embedKick] });
                            }
                        });
                        userMuted.timeout(1, 'Kosame Unmute');
                        break;
                    }

                    case 'cancelar': {
                        x.update({ content: `${message.author} Você cancelou a ação!`, components: [] });
                        break;
                    }
                }
            });
        }
    }
};