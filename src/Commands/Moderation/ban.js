const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'ban';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para banir pessoas de seu servidor.';
        this.aliases = ['banir'];
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

        // Tenta pegar o usuário do servidor, se não encontrar, tenta pegar pelo ID
        const banMember = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
        const banReason = args.slice(1).join(' ');

        if (!args[0]) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você precisa especificar quem deseja banir!` });
        } else if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para banir alguém!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        } else if (message.guild.members.me.roles.highest.position <= banMember?.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do meu, não posso aplicar uma punição.` });
        } else if (message.member.roles.highest.position <= banMember?.roles.highest.position) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, este usuário possui cargos iguais ou acima do seu, você não pode aplicar uma punição.` });
        } else if (banMember?.id === this.client.user.id) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não pode me utilizar para me banir, seu bobinho!` });
        } else if (banMember?.id === message.author.id) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não pode se banir, isso é muita burrice, mencione alguém!` });
        }

        // Se o banMember não for encontrado no servidor, tenta banir pelo ID
        const banMemberInfo = banMember || await this.client.users.fetch(args[0]); // Busca o usuário pelo ID se ele não estiver no servidor

        const embedBan = new ClientEmbed()
            .setColor('#2E3035')
            .setImage(userAuthor.bans.imagembg ? userAuthor.bans.imagembg : 'https://i.imgur.com/i4fNJYf.png')
            .setDescription(`> O Moderador **${message.author.tag}** baniu o usuário **${banMemberInfo.tag || banMemberInfo.username}** do servidor, confira abaixo as informações do banimento.\n\n<:information:1021614558995025930> **Informações**\n\n<:user:1021614370691747890>  **Usuário:** ${banMemberInfo.tag || banMemberInfo.username}\n<:id_1:1021610174512906270>  **ID do Usuário:** \`${banMemberInfo.id}\`\n<:reasonban:1021617811778437160>  **Motivo:** ${banReason || 'Nenhum'}\n<:moderadorban:1021614372369477672>  **Moderador:** ${message.author.tag}`);

        const row = new ActionRowBuilder();
        const banirMembro = new ButtonBuilder()
            .setCustomId('banir')
            .setLabel('Banir Membro')
            .setStyle('Success');

        const cancelarBan = new ButtonBuilder()
            .setCustomId('cancelar')
            .setLabel('Cancelar')
            .setStyle('Danger');

        row.addComponents([banirMembro, cancelarBan]);

        const filter = (interaction) => interaction.isButton() && interaction.message.id === msg.id;
        const msg = await message.reply({ content: `Você tem certeza que deseja banir ${banMemberInfo.tag || banMemberInfo.username}?`, components: [row], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (x) => {
            if (x.user.id !== message.author.id) {
                return x.reply({ content: `${x.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }

            switch (x.customId) {
                case 'banir': {
                    await x.update({ content: `${message.author}`, embeds: [embedBan], components: [] });

                    if (server.logs.status) {
                        const channel = guild.channels.cache.get(server.logs.channel);
                        channel.send({ embeds: [embedBan] });
                    }

                    try {
                    // Banir o usuário mesmo que ele não esteja no servidor
                        await message.guild.bans.create(banMemberInfo.id, { reason: banReason || 'Nenhum' });
                    } catch (error) {
                        console.error('Erro ao banir usuário:', error);
                        message.reply({ content: 'Ocorreu um erro ao tentar banir o usuário.', ephemeral: true });
                    }
                    break;
                }

                case 'cancelar': {
                    await x.update({ content: `${message.author} Você cancelou o banimento!`, components: [] });
                    break;
                }
            }
        });
    }

};