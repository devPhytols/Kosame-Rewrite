const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class CblockCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'cblock';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Permita comandos apenas em alguns canais.';
        this.aliases = ['cmdblock', 'cb'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'addcanal',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Define o canal permitido para usar comandos.',
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
                name: 'msg',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Define a mensagem do sistema de bloqueio.',
                options: [
                    {
                        name: 'message',
                        description: 'Insira a mensagem que deseja.',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: 'on',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Liga o sistema de bloqueio.'
            },
            {
                name: 'off',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Desliga o sistema de bloqueio.'
            },
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Veja a sua configuração do sistema.'
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        if (!message.member.permissions.has('ManageChannels'))
            return message.reply({ content: 'Você não tem permissão para executar este comando.' });

        const server = await this.client.database.guilds.findOne({ idS: message.guild.id });
        const cb = server.cmdblock;

        if (!args[0]) {
            const HELP = new EmbedBuilder()
                .setAuthor({ name: `${message.guild.name} - Bloqueio de Comandos`, iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
                .addFields(
                    {
                        name: 'Canais Permitidos',
                        value:
                            cb.channels.length == 0
                                ? 'Nenhum canal configurado'
                                : cb.channels.map((x) => `<#${x}>`).join(', ')
                    },
                    {
                        name: 'Mensagem',
                        value: `\`${cb.msg}\``
                    },
                    {
                        name: 'Status da Configuração',
                        value: `O sistema está **${!cb.status ? 'OFFLINE' : 'ONLINE'
                            }** no momento.`
                    })
                .setThumbnail(message.guild.iconURL({ extension: 'jpg', size: 2048 }));

            message.reply({ embeds: [HELP] });
            return;
        }

        if (['info', 'information'].includes(args[0].toLowerCase())) {
            const HELP1 = new EmbedBuilder()
                .setAuthor({ name: `${message.guild.name} - Bloqueio de Comandos`, iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
                .addFields(
                    {
                        name: 'Canais Permitidos',
                        value:
                            cb.channels.length == 0
                                ? 'Nenhum canal configurado'
                                : cb.channels.map((x) => `<#${x}>`).join(', ')
                    },
                    {
                        name: 'Mensagem',
                        value: `\`${cb.msg}\``
                    },
                    {
                        name: 'Status da Configuração',
                        value: `O sistema está **${!cb.status ? 'OFFLINE' : 'ONLINE'
                            }** no momento.`
                    })
                .setThumbnail(message.guild.iconURL({ extension: 'jpg', size: 2048 }));

            message.reply({ embeds: [HELP1] });
            return;
        }

        if (['addcanal', 'canal', 'adicionar', 'channel'].includes(args[0].toLowerCase())) {
            const channel =
                message.guild.channels.cache.get(args[1]) ||
                message.mentions?.channels?.first();

            if (!channel) {
                return message.reply({ content: `${message.author}, por favor, mencione ou insira o ID do canal para permitir comandos!` });
            } else {
                if (cb.channels.some((x) => x === channel.id)) {
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: message.guild.id },
                        { $pull: { 'cmdblock.channels': channel.id } }
                    );

                    return message.reply({ content: 'Esse canal já se encontra na minha lista de permissão, então o removi!' });
                } else {
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: message.guild.id },
                        { $push: { 'cmdblock.channels': channel.id } }
                    );

                    message.reply({ content: `O canal ${channel} foi adicionado à lista de canais permitidos!` });
                }
            }
        }

        if (['msg', 'mensagem', 'message'].includes(args[0].toLowerCase())) {
            const msg = args.slice(1).join(' ');

            if (!msg) {
                return message.reply({ content: 'Por favor, insira a mensagem!' });
            } else if (msg == cb.msg) {
                return message.reply({ content: 'A mensagem é a mesma que já está configurada, tente com algo diferente' });
            } else {
                message.reply({ content: `${message.author}, você alterou a mensagem de bloqueio com sucesso!.` });

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'cmdblock.msg': msg } }
                );
            }
        }

        if (['on', 'ativar', 'ligar'].includes(args[0].toLowerCase())) {
            if (cb.status) {
                return message.reply({ content: 'O sistema já se encontra em funcionamento.' });
            } else {
                message.reply({ content: 'O sistema foi iniciado!' });

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'cmdblock.status': true } }
                );
            }
        }

        if (['off', 'desativar', 'desligar'].includes(args[0].toLowerCase())) {
            if (!cb.status) {
                return message.reply({ content: 'O sistema já se encontra desligado.' });
            } else {
                message.reply({ content: 'O sistema foi desligado!' });

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'cmdblock.status': false } }
                );
            }
        }
    }
};