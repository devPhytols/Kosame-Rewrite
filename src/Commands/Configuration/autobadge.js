/* eslint-disable prefer-const */
const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
require('moment-duration-format');

module.exports = class AutobadgeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'autobadge';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Sistema de entrega de cargos de acordo com seus emblemas!';
        this.config = {
            registerSlash: true
        };
        this.aliases = ['bdg'];
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message }) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        // Busca a Guild
        const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });
        const autobadge = doc.autobadge;

        const Embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setDescription(`> Seja bem vindo(a) ao meu sistema de auto-badges, o sistema tem o objetivo de entregar cargos específicos de acordo com as badges que os usuários possuem.\n\n<a:setinha:1013543431085240371> O Status atual do sistema é ${autobadge.status ? '**Online**.' : '**Offline**.'}\n\n<:kosame_exclamation:1254167710657413121> Caso o cargo definido seja excluído, o sistema ainda continuará ativo para os demais cargos configurados.`)
            .setFooter({
                text: `Comando solicitado por ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
            })
            .setThumbnail('https://i.imgur.com/glqiE8i.png');

        const rowInicial = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Configure o Sistema Abaixo')
                    .addOptions([{
                        label: 'Selecionar Cargos',
                        emoji: '<:ksm_select:1114018961739223152>',
                        description: 'Configure os cargos que serão adicionados.',
                        value: 'rolesConfig'
                    },
                    {
                        label: 'Configurações',
                        emoji: '<:ksm_eng1:1114019318766784512>',
                        description: 'Configure o sistema completamente nesta opção.',
                        value: 'generalConfig'
                    }
                    ])
            );

        const rowRoles = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Selecione a Badge Desejada')
                    .addOptions([{
                        label: 'Verified Bot Developer',
                        emoji: '<:Bot_Developer:942750521456984144>',
                        description: 'Configure o emblema de Desenvolvedor Verificado.',
                        value: 'earlyDev'
                    },
                    {
                        label: 'Early Supporter',
                        emoji: '<:Early_Supporter:993671403339522048>',
                        description: 'Configure o emblema de Apoiador Inicial.',
                        value: 'earlySupp'
                    },
                    {
                        label: 'HypeSquad Events',
                        emoji: '<:Hypesquad_Events:949813177871376425>',
                        description: 'Configure o emblema de HypeSquad Events.',
                        value: 'hypeEvents'
                    },
                    {
                        label: 'Certified Moderator',
                        emoji: '<:Certified_Moderator:942750518680371271>',
                        description: 'Configure o emblema de Certified Moderator.',
                        value: 'certifiedModerator'
                    },
                    {
                        label: 'Partner',
                        emoji: '<:Discord_Partner:942750522794991677>',
                        description: 'Configure o emblema de Server Partner.',
                        value: 'serverPartner'
                    },
                    {
                        label: 'Voltar',
                        value: 'voltar'
                    }
                    ])
            );

        const rowSystem = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Selecione Uma Opção Abaixo')
                    .addOptions([{
                        label: 'Ativar o Sistema',
                        emoji: '<:ksm_on:1114208742989377690>',
                        value: 'onSys'
                    },
                    {
                        label: 'Desativar o Sistema',
                        emoji: '<:ksm_off:1114208744704839791>',
                        value: 'offSys'
                    },
                    {
                        label: 'Resetar o Sistema',
                        emoji: '<:ksm_reset:1114208740225327205>',
                        value: 'resetSys'
                    },
                    {
                        label: 'Voltar',
                        value: 'voltar'
                    }
                    ])
            );

        const rowSelectRoles = new ActionRowBuilder()
            .addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId('roles')
                    .setPlaceholder('Selecione o Cargo Desejado.')
                    .setMinValues(1)
                    .setMaxValues(1)
            );

        // Mensagem Principal 
        const msg = await message.reply({
            embeds: [Embed],
            components: [rowInicial],
            fetchReply: true
        });

        // Filto de Interação
        const filter = (i) => {
            return i.isStringSelectMenu() || i.isRoleSelectMenu() && i.message.id === msg.id;
        };

        // Definindo o collector
        const collector = msg.createMessageComponentCollector({ filter, time: 2 * 60 * 1000 });

        // Quando o timer encerrar
        collector.on('end', async () => {
            await msg.delete();
        });

        // Armazenando o valor da interação
        let previousValue;

        // Quando o collector for acionado
        collector.on('collect', async (i) => {
            let customId = i.values[0];

            // Verifica se o utilizador é o autor do comando
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: `Eiii ${i.user}, esse comando não pertence a você!. 👀`,
                    ephemeral: true
                });
            }

            // Coletando Interação
            if (customId === 'earlyDev' || customId === 'earlySupp' || customId === 'hypeEvents') {
                previousValue = customId;
                return i.update({
                    embeds: [Embed],
                    components: [rowSelectRoles]
                });
            } else if (customId === 'rolesConfig') {
                return i.update({
                    embeds: [Embed],
                    components: [rowRoles]
                });
            } else if (customId === 'generalConfig') {
                return i.update({
                    embeds: [Embed],
                    components: [rowSystem]
                });
            } else if (customId === 'onSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    { $set: { 'autobadge.status': true } }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você ativou o sistema de **Auto-Badges**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (customId === 'offSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    { $set: { 'autobadge.status': false } }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você desativou o sistema de **Auto-Badges**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (customId === 'resetSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    {
                        $set: {
                            'autobadge.status': false,
                            'autobadge.verifiedDeveloper.role': 'null',
                            'autobadge.earlySupporter.role': 'null',
                            'autobadge.hypeSquad.role': 'null'
                        }
                    }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você resetou o sistema de **Auto-Badges**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (customId === 'voltar') {
                return i.update({
                    embeds: [Embed],
                    components: [rowInicial],
                    fetchReply: true
                });
            }

            // Se a Interação for no RoleSelect
            if (i.customId == 'roles') {
                // Obtendo o cargo na guild
                const getRole = i.guild.roles.cache.get(customId);
                const eRoles = new EmbedBuilder()
                    .setColor('#41ab3c')
                    .setDescription(`<:kosame_Correct:1010978511839842385> ${message.author} você configurou o cargo ${getRole}.`);

                // Responde a Interação
                if (previousValue === 'earlyDev') {
                    // Atualiza 'earlyDev' no banco de dados
                    console.log('earlyDev');
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: i.guild.id },
                        { $set: { 'autobadge.verifiedDeveloper.role': customId } }
                    );
                    // Atualiza a mensagem
                    return i.update({
                        embeds: [eRoles],
                        components: []
                    });
                } else if (previousValue === 'earlySupp') {
                    // Atualiza 'earlySupp' no banco de dados
                    console.log('earlySupp');
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: i.guild.id },
                        { $set: { 'autobadge.earlySupporter.role': customId } }
                    );
                    // Atualiza a mensagem
                    return i.update({
                        embeds: [eRoles],
                        components: []
                    });
                } else if (previousValue === 'hypeEvents') {
                    // Atualiza 'hypeEvents' no banco de dados
                    console.log('hypeEvents');
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: i.guild.id },
                        { $set: { 'autobadge.hypeSquad.role': customId } }
                    );
                    // Atualiza a mensagem
                    return i.update({
                        embeds: [eRoles],
                        components: []
                    });
                } else if (previousValue === 'certifiedModerator') {
                    // Atualiza 'certifiedModerator' no banco de dados
                    console.log('certifiedModerator');
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: i.guild.id },
                        { $set: { 'autobadge.certifiedModerator.role': customId } }
                    );
                    // Atualiza a mensagem
                    return i.update({
                        embeds: [eRoles],
                        components: []
                    });
                } else if (previousValue === 'serverPartner') {
                    // Atualiza 'serverPartner' no banco de dados
                    console.log('serverPartner');
                    await this.client.database.guilds.findOneAndUpdate(
                        { idS: i.guild.id },
                        { $set: { 'autobadge.partner.role': customId } }
                    );
                    // Atualiza a mensagem
                    return i.update({
                        embeds: [eRoles],
                        components: []
                    });
                }

                // Limpa o previousValue
                previousValue = undefined;
            }
        });
    }
};