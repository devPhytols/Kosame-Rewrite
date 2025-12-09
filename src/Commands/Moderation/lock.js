const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class LockCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'lock';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para bloquear o envio de mensagens em um canal.';
        this.aliases = ['trancar'];
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

        const embedLockNotMention = new ClientEmbed()
            .setColor('#2E3035')
            .setDescription(`<:unknown10:1021579948932214794> O Moderador **${message.author.tag}** bloqueou o canal <#${message.channel.id}>.`);

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para bloquear um canal!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        } else if (!message.channel.permissionsFor(message.guild.roles.everyone).has(PermissionFlagsBits.SendMessages)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, esse canal já se encontra bloqueado!` });
        } else if (!args[0]) {
            return message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).then(() => message.reply({ embeds: [embedLockNotMention] }));
        } else {
            const embedLock = new ClientEmbed()
                .setColor('#2E3035')
                .setDescription(`<:unknown10:1021579948932214794> O Moderador **${message.author.tag}** bloqueou o canal ${canal}.`);

            const row = new ActionRowBuilder();

            const banirMembro = new ButtonBuilder()
                .setCustomId('bloquear')
                .setLabel('Bloquear Canal')
                .setStyle('Success');

            const cancelarBan = new ButtonBuilder()
                .setCustomId('cancelar')
                .setLabel('Cancelar')
                .setStyle('Danger');

            row.addComponents([banirMembro, cancelarBan]);

            const filter = (interaction) => {
                return interaction.isButton() && interaction.message.id === msg.id;
            };
            const msg = await message.reply({ content: `Você tem certeza que deseja bloquear o canal ${canal}?`, components: [row], fetchReply: true });
            const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', (x) => {
                if (x.user.id !== message.author.id) {
                    return x.reply({ content: `${x.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }
                
                switch (x.customId) {
                    case 'bloquear': {
                        message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { SEND_MESSAGES: false }).then(() => {
                            x.update({ content: `${message.author}`, embeds: [embedLock], components: [] });
                        });
                        break;
                    }

                    case 'cancelar': {
                        x.update({ content: `${message.author} Você desistiu de bloquear o canal!`, components: [] });
                        break;
                    }
                }
            });
        }
    }
};