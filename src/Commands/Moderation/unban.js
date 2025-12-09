const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class UnbanCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'unban';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para desbanir pessoas de seu servidor.';
        this.aliases = ['desbanir'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'Informe a pessoa que deseja desbanir.',
                required: true,
                type: ApplicationCommandOptionType.User
            },
            {
                name: 'motivo',
                description: 'Informe o motivo do desbanimento.',
                required: false,
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
        const banReason = args.slice(1).join(' ');

        // Tenta pegar o usuário do servidor, se não encontrar, tenta pegar pelo ID
        const banMember = message.guild.members.cache.get(args[0]) || await this.client.users.fetch(args[0]);

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para desbanir alguém!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        } else if (!args[0]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar quem deseja desbanir!` });
        } 

        const embedUnban = new ClientEmbed()
            .setColor('#2E3035')
            .setDescription(`O Moderador **${message.author.tag}** desbaniu o usuário **${banMember.tag || banMember.username}** do servidor!`);

        const row = new ActionRowBuilder();
        const unbanMembro = new ButtonBuilder()
            .setCustomId('unban')
            .setLabel('Desbanir Membro')
            .setStyle('Success');

        const cancelarUnban = new ButtonBuilder()
            .setCustomId('cancelar')
            .setLabel('Cancelar')
            .setStyle('Danger');

        row.addComponents([unbanMembro, cancelarUnban]);

        const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id;
        };

        const msg = await message.reply({ content: `Você tem certeza que deseja desbanir **${banMember.tag || banMember.username}**?`, components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (x) => {
            if (x.user.id !== message.author.id) {
                return x.reply({ content: `${x.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }
        
            switch (x.customId) {
                case 'unban': {
                    try {
                        // Tenta desbanir o usuário, mesmo que ele não esteja mais no servidor
                        await message.guild.members.unban(banMember.id, banReason || 'Nenhum');
                        x.update({ content: `${message.author}`, embeds: [embedUnban], components: [] });
                    } catch (error) {
                        // Verificar se o erro é o "Unknown Ban"
                        if (error.message.includes('Unknown Ban')) {
                            x.update({ content: `${message.author}, o usuário já foi desbanido ou não estava banido.`, embeds: [embedUnban], components: [] });
                        } else {
                            // Caso seja outro erro, exibe a mensagem de erro
                            console.error('Erro ao desbanir usuário:', error);
                            x.reply({ content: 'Ocorreu um erro ao tentar desbanir o usuário.', ephemeral: true });
                        }
                    }
                    break;
                }

                case 'cancelar': {
                    x.update({ content: `${message.author} Você cancelou o desbanimento!`, components: [] });
                    break;
                }
            }
        });
    }
};