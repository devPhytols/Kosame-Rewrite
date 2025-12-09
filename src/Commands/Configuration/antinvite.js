const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class AntinviteCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'antinvite';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Configure o sistema de Anti Invite da Kosame.';
        this.aliases = ['ai'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'canal',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Defina um canal por vez para permitir divulgações.',
                options: [
                    {
                        name: 'channel',
                        description: 'Insira o canal aqui!',
                        type: ApplicationCommandOptionType.Channel,
                        required: true
                    }
                ]
            },
            {
                name: 'mensagem',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Defina a mensagem de bloqueio que será enviada.',
                options: [
                    {
                        name: 'msg',
                        description: 'Insira a mensagem de bloqueio aqui!',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: 'cargo',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Permite que o cargo divulge no servidor.',
                options: [
                    {
                        name: 'role',
                        description: 'Insira o cargo aqui.',
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            },
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Informações do sistema de Anti-Invite.'
            },
            {
                name: 'on',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Liga o sistema de Anti-Invite.'
            },
            {
                name: 'off',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Desliga o sistema de Anti-Invite.'
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });
      
        if (!message.member.permissions.has('ManageGuild'))
            return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);
      
        const anti = doc.antinvite;
      
        const EMBED = new EmbedBuilder()
            .setAuthor({ name: 'Kosame Ant-Invite', iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
            .setColor(`${anti.status ? '#6E86CF' : '#FFFFFF'}`)
            .setDescription(`> Seja bem vindo(a) ao meu sistema de Anti-Invite, o sistema promete livrar o seu servidor de divulgações externas, protegendo o seu servidor de pessoas maliciosas.\n\n<a:setinha:1013543500823920671> O sistema se encontra ${anti.status ? '**Ativado**' : '**Desativado**'}\n<a:setinha:1013543500823920671> Você tem **${anti.roles.length}** cargos com permissões!\n<a:setinha:1013543500823920671> Você definiu **${anti.channels.length}** canais para divulgações!\n<a:setinha:1013543500823920671> A mensagem atual é: ${anti.msg === 'null' ? '*Mensagem Padrão*' : `*${anti.msg}*`}\n\n<:kosame_exclamation:1020155210162774026> Utilize k!help antinvite para aprender a utilizar!`)
            .setFooter({ text: `Comando solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setThumbnail(this.client.user.displayAvatarURL({ extension: 'jpg', size: 2048 }));
      
        if (!args[0]) 
            return message.reply({ embeds: [EMBED] });
      
        if (['info'].includes(args[0].toLowerCase())) {
            message.reply({ embeds: [EMBED] });
        }
      
        if (['msg', 'message', 'mensagem'].includes(args[0].toLowerCase())) {
            const msg = args.slice(1).join(' ');
      
            if (!msg)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não inseriu a mensagem para o sistema!`);
      
            if (msg.length > 100)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você deve inserir uma mensagem de até **100 caracteres**!`);
      
            if (msg === anti.msg)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, a mensagem que você inseriu é a mesma atualmente utilizada!`);
      
            message.reply(`<:emoji_2:835484262425165885> ${message.author}, a mensagem foi alterada com sucesso!`);
      
            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antinvite.msg': msg } }
            );
        }
      
        if (['on', 'ligar', 'ativar'].includes(args[0].toLowerCase())) {
            if (anti.status)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o sistema de **Ant-Invite** já se encontra ativado!`);
        
            message.reply(`<:emoji_2:835484262425165885> ${message.author}, sistema **ativado** com sucesso!`);
        
            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antinvite.status': true } }
            );
        }
      
        if (['off', 'desligar', 'desativar'].includes(args[0].toLowerCase())) {
            if (!anti.status)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o sistema de **Ant-Invite** já se encontra desativado!`);
        
            message.reply(`<:emoji_2:835484262425165885> ${message.author}, sistema **desativado** com sucesso!`);
        
            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antinvite.status': false } }
            );
        }
      
        if (['cargos', 'roles', 'cargo', 'role'].includes(args[0].toLowerCase())) {
            const role = message.guild.roles.cache.get(args[1]) || message.mentions?.roles?.first();
        
            if (!role)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você deve inserir o **ID** ou **MENCIONAR** o cargo que deseja adicionar!`);
        
            if (anti.roles.some((x) => x === role.id))
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o cargo já estava configurado em minha lista, portanto eu removi!`).then(async () => {
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: message.guild.id },
                        { $pull: { 'antinvite.roles': role.id } }
                    );
                });
        
            if (anti.roles.length >= 15)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você chegou no limite máximo de **15 cargos** configurados no sistema!`);
        
            message.reply(`<:emoji_2:835484262425165885> ${message.author}, o cargo foi **inserido** com sucesso!`);
        
            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $push: { 'antinvite.roles': role.id } }
            );
        }
      
        if (['canais', 'channels', 'canal', 'channel'].includes(args[0].toLowerCase())) {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        
            if (!channel)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você deve inserir o **ID** ou **MENCIONAR** o canal que deseja adicionar!`);
        
            if (anti.channels.some((x) => x === channel.id))
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o canal já estava configurado em minha lista, portanto eu removi!`).then(async () => {
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: message.guild.id },
                        { $pull: { 'antinvite.channels': channel.id } }
                    );
                });
        
            if (anti.channels.length >= 10)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você chegou no limite máximo de **10 canais** configurados no sistema!`);
        
            message.reply(`<:emoji_2:835484262425165885> ${message.author}, o canal foi **inserido** com sucesso!`);
        
            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $push: { 'antinvite.channels': channel.id } }
            );
        }
    }
};