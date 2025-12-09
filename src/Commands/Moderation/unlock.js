const { ApplicationCommandType, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class UnlockCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'unlock';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para liberar o envio de mensagens em um canal.';
        this.aliases = ['destrancar'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
* @param {Client} client 
* @param {Message} message 
* @param {Channel[]} args 
*/
    async commandExecute({ message, args }) {

        if (!message.member.permissions.has('ManageGuild'))
            return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);
        
        const canal = message.guild.channels.cache.get(args[0]) || message.mentions?.channels?.first();

        const embedUnlockNotMention = new ClientEmbed()
            .setColor('#2E3035')
            .setDescription(`<:ksunlock:1025473557758746746> O Moderador **${message.author.tag}** desbloqueou o canal <#${message.channel.id}>.`);

        if (!args[0]) {
            return message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true }).then(() => { message.reply({ embeds: [embedUnlockNotMention] }); });
        } else if (!message.guild.members.me.permissions.has(PermissionsBitField.ManageChannels)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para desbloquear um canal!` });
        } else if (!message.member.permissions.has(PermissionsBitField.ManageChannels)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        } else {
            const embedBan = new ClientEmbed()
                .setColor('#2E3035')
                .setDescription(`<:ksunlock:1025473557758746746> O Moderador **${message.author.tag}** desbloqueou o canal ${canal}.`);

            const row = new ActionRowBuilder();

            const banirMembro = new ButtonBuilder()
                .setCustomId('bloquear')
                .setLabel('Desbloquear Canal')
                .setStyle('Success');

            const cancelarBan = new ButtonBuilder()
                .setCustomId('cancelar')
                .setLabel('Cancelar')
                .setStyle('Danger');

            row.addComponents([banirMembro, cancelarBan]);
            const filter = (interaction) => {
                return interaction.isButton() && interaction.message.id === msg.id;
            };
            const msg = await message.reply({ content: `Você tem certeza que deseja desbloquear o canal ${canal}?`, components: [row], fetchReply: true });
            const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', (x) => {
                if (x.user.id !== message.author.id) {
                    return x.reply({ content: `${x.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }

                switch (x.customId) {
                    case 'bloquear': {
                        message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { SEND_MESSAGES: true }).then(() => {
                            x.update({ content: `${message.author}`, embeds: [embedBan], components: [] });
                        });
                        break;
                    }

                    case 'cancelar': {
                        x.update({ content: `${message.author} Você desistiu de desbloquear o canal!`, components: [] });
                        break;
                    }
                }
            });
        }
    }
};