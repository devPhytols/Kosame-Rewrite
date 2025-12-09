const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class WarnsCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'warns';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Ative e Desative o sistema de reações de Level na Kosame.';
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Informações do sistema de avisos.'
            },
            {
                name: 'on',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Liga os avisos da Kosame no sevidor.'
            },
            {
                name: 'off',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Desliga os avisos da Kosame no sevidor.'
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        if (!message.member.permissions.has('ManageGuild'))
            return message.reply({ content: 'Você não tem permissão para executar este comando.' });

        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });

        const EMBED03 = new EmbedBuilder()
            .setColor(process.env.EMBED_COLOR)
            .setDescription(`Olá ${ message.author}, atualmente meu sistema de notificações se encontra **${server.levelwarn ? 'Ativado' : 'Desativado'}**\n\n<a:setinha:1013543500823920671> k!warns on **(para ativar)**\n<a:setinha:1013543500823920671> k!warns off **(para desativar)**`);

        if (!args[0])
            return message.reply({ embeds: [EMBED03] });
  
        if (args[0] == 'info') {
            return message.reply({ embeds: [EMBED03] });
        }
  
        if (args[0] == 'on') {
            if (server.levelwarn) {
                return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, o sistema já se encontra ativado.` });
            }
    
            message.reply({ content: `${config.emotes.success} ${message.author}, você ativou o sistema de avisos da Kosame!` });
            await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { levelwarn: true } }
            );
        }

        const EMBED01 = new EmbedBuilder()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, o sistema já se encontra desativado.`);

        const EMBED02 = new EmbedBuilder()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, você desativou o sistema de avisos da Kosame!`);

        if (args[0] == 'off') {
            if (!server.levelwarn) {
                return message.reply({ embeds: [EMBED01] });
            }
    
            message.reply({ embeds: [EMBED02] });
            await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { levelwarn: false } }
            );
        }
    }
};