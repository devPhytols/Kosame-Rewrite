const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class AutoroleCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'autorole';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Configure o sistema de dar cargos automaticamente.';
        this.aliases = ['ar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'add',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Define o cargo para o autorole.',
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
                name: 'remove',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Remove um cargo do autorole.',
                options: [
                    {
                        name: 'cargo',
                        description: 'Insira o cargo ou digite all.',
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            },
            {
                name: 'list',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Veja a lista de cargos configurados.'
            },
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Veja informações do sistema de autorole.'
            },
            {
                name: 'on',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Liga o sistema de autorole.'
            },
            {
                name: 'off',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Desliga o sistema de autorole.'
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
        const autorole = server.autorole;
        const role = message.guild.roles.cache.get(args[1]) || message.mentions?.roles?.first();

        if (!args[0]) {
            const HELP = new EmbedBuilder()
                .setAuthor({ name: `${message.guild.name} - Sistema de AutoRole`, iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
                .addFields(
                    {
                        name: 'Cargos setados atualmente',
                        value: !autorole.roles.length
                            ? 'Nenhum Cargo'
                            : `${autorole.roles.map((x) => `<@&${x}>`).join(', ')} - **[${autorole.roles.length
                            }]**`
                    },
                    {
                        name: 'Status do Sistema',
                        value: `No momento o sistema se encontra **${autorole.status ? 'Ativado' : 'Desativado'
                            }**`
                    },
                    {
                        name: 'Ajuda',
                        value: '> **`k!autorole add <cargo>`** - Adiciona um cargo;\n> **`k!autorole remove <cargo/all>`** - Remove um cargo\n> **`k!autorole list`** - Lista os cargos\n> **`k!autorole <on/off>`** - Ativa/Desativar o sistema'
                    });

            message.reply({ embeds: [HELP] });
            return;
        }

        if (['info', 'information'].includes(args[0].toLowerCase())) {
            const HELP2 = new EmbedBuilder()
                .setAuthor({ name: `${message.guild.name} - Sistema de AutoRole`, iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
                .addFields(
                    {
                        name: 'Cargos setados atualmente',
                        value: !autorole.roles.length
                            ? 'Nenhum Cargo'
                            : `${autorole.roles.map((x) => `<@&${x}>`).join(', ')} - **[${autorole.roles.length
                            }]**`
                    },
                    {
                        name: 'Status do Sistema',
                        value: `No momento o sistema se encontra **${autorole.status ? 'Ativado' : 'Desativado'
                            }**`
                    },
                    {
                        name: 'Ajuda',
                        value: '> **`k!autorole add <cargo>`** - Adiciona um cargo;\n> **`k!autorole remove <cargo/all>`** - Remove um cargo\n> **`k!autorole list`** - Lista os cargos\n> **`k!autorole <on/off>`** - Ativa/Desativar o sistema'
                    });

            message.reply({ embeds: [HELP2] });
            return;
        }

        if (!message.member.permissions.has('MANAGE_GUILD'))
            return message.reply(`${message.author}, você precisa da permissão **MANAGE_GUILD** para executar este comando.`);

        if (['add', 'adicionar'].includes(args[0].toLowerCase())) {
            if (!role) {
                return message.reply(`${message.author}, você não mencionou/inseriu o ID do cargo que deseja setar no AutoRole.`);
            } else if (autorole.roles.length > 5) {
                return message.reply(`${message.author}, o limite de cargos no AutoRole é **5** e você já alcançou ele, portanto não é possível adicionar mais cargos.`);
            } else if (autorole.roles.find((x) => x === role.id)) {
                return message.reply(`${message.author}, o cargo inserido já está adicionado no sistema.`);
            } else {
                message.reply(`${message.author}, o cargo foi adicionado no sistema de AutoRole com sucesso.`);

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $push: { 'autorole.roles': role.id } }
                );
            }
            return;
        }

        if (['remove', 'remover'].includes(args[0].toLowerCase())) {
            if (args[1] == 'all') {
                if (!autorole.roles.length) {
                    return message.reply(`${message.author}, não há nenhum cargo adicionado no sistema.`);
                } else {
                    message.reply(`${message.author}, todos os cargos foram removidos com sucesso.`);

                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: message.guild.id },
                        { $set: { 'autorole.roles': [], 'autorole.status': false } }
                    );
                }
                return;
            }
            if (!role) {
                return message.reply(`${message.author}, você não mencionou/inseriu o ID do cargo que deseja setar no AutoRole.`);
            } else if (!autorole.roles.length) {
                return message.reply(`${message.author}, não há nenhum cargo adicionado no sistema.`);
            } else if (!autorole.roles.find((x) => x === role.id)) {
                return message.reply(`${message.author}, o cargo inserido não está adicionado no sistema.`);
            } else {
                message.reply(`${message.author}, o cargo foi removido do sistema de AutoRole com sucesso.`);

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $pull: { 'autorole.roles': role.id } }
                );
            }

            return;
        }

        if (['list', 'lista'].includes(args[0].toLowerCase())) {
            if (!autorole.roles.length) {
                return message.reply(`${message.author}, não há nenhum cargo adicionado no sistema.`);
            } else {
                const LIST = new EmbedBuilder()
                    .setAuthor({ name: 'Lista dos cargos no sistema de AutoRole', iconURL: message.guild.iconURL(() => ({ dynamic: true })) })
                    .setDescription(autorole.roles.map((x) => `<@&${x}>`).join(', '));

                message.reply({ embeds: [LIST] });
            }
        }

        if (['on', 'ligar'].includes(args[0].toLowerCase())) {
            if (autorole.status) {
                return message.reply(`${message.author}, o sistema já se encontra ligado.`);
            } else if (!autorole.roles.length) {
                return message.reply(`${message.author}, não há nenhum cargo adicionado no sistema, portanto não é possível ligar ele.`);
            } else {
                message.reply(`${message.author}, sistema ligado com sucesso.`);

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'autorole.status': true } }
                );
            }
        }
        if (['off', 'desligar'].includes(args[0].toLowerCase())) {
            if (!autorole.status) {
                return message.reply(`${message.author}, o sistema já se encontra desligado.`);
            } else {
                message.reply(`${message.author}, sistema desligado com sucesso.`);

                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'autorole.status': false } }
                );
            }
        }
    }
};