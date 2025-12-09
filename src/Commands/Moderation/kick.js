const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'kick';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para expulsar pessoas de seu servidor.';
        this.aliases = ['expulsar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'Informe a pessoa que deseja banir.',
                required: true,
                type: ApplicationCommandOptionType.User
            },
            {
                name: 'motivo',
                description: 'Informe o motivo do banimento.',
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
        const userAuthor = await this.client.database.users.findOne({ idU: message.author.id });
        const kickMember = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
        const kickReason = args.slice(1).join(' ');

        // Verificando permissões do bot
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para expulsar alguém!` });
        }
        // Verificando permissões do executor
        else if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        }
        // Verificando a posição do cargo do bot e do executor
        else if (message.guild.members.me.roles.highest.position <= kickMember.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do meu, não posso aplicar uma punição.` });
        } else if (message.member.roles.highest.position <= kickMember.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do seu, você não pode aplicar uma punição.` });
        }
        // Verificando se o usuário foi fornecido
        else if (!args[0]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar quem deseja expulsar!` });
        }
        // Verificando se o autor tenta se expulsar
        else if (kickMember.id === message.author.id) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não pode se expulsar!` });
        }

        const puxaInfo = await this.client.users.fetch(kickMember.id, { cache: true });

        const embedKick = new ClientEmbed()
            .setColor('#2E3035')
            .setImage(!userAuthor.bans.imgkick ? 'https://i.imgur.com/i4fNJYf.png' : userAuthor.bans.imgkick)
            .setDescription(`> O Moderador **${message.author.tag}** expulsou o usuário **${puxaInfo.tag}** do servidor, confira abaixo as informações da punição.\n\n<:information:1021614558995025930> **Informações**\n\n<:user:1021614370691747890>  **Usuário:** ${puxaInfo.tag}\n<:id_1:1021610174512906270>  **ID do Usuário:** \`${kickMember.id}\`\n<:reasonban:1021617811778437160>  **Motivo:** ${!kickReason ? 'Nenhum' : kickReason}\n<:moderadorban:1021614372369477672>  **Moderador:** ${message.author.tag}`);

        const row = new ActionRowBuilder();

        const expulsarMembro = new ButtonBuilder()
            .setCustomId('expulsar')
            .setLabel('Expulsar Membro')
            .setStyle('Success');

        const cancelarKick = new ButtonBuilder()
            .setCustomId('cancelar')
            .setLabel('Cancelar')
            .setStyle('Danger');

        row.addComponents([expulsarMembro, cancelarKick]);

        const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id;
        };

        const msg = await message.reply({ content: `Você tem certeza que deseja expulsar ${kickMember} do servidor?`, components: [row], fetchReply: true });

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
                    message.guild.members.kick(kickMember.id, !kickReason ? 'Nenhum' : kickReason.toUpperCase());
                    break;
                }

                case 'cancelar': {
                    x.update({ content: `${message.author} Você cancelou a punição!`, components: [] });
                    break;
                }
            }
        });
    }
};