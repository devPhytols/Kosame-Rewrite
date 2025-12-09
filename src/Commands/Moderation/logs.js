/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */

const { ApplicationCommandType, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChannelSelectMenuBuilder, PermissionFlagsBits, Colors } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class LogsCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'logs';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Função para logs de ações no servidor.';
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 */
    async commandExecute({ message }) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        const msgEmbed = new EmbedBuilder()
            .setAuthor({ name: `${message.guild.name} | Logs`, iconURL: message.guild.iconURL({ size: 2048 }), url: null })
            .setDescription('**Selecione abaixo o log que você deseja configurar:**')
            .setColor(0x2B2D31);
        const menu = new StringSelectMenuBuilder()
            .setCustomId('logs-menu')
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Escolha o log que deseja fazer alteração')
            .setOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-msgedit')
                    .setLabel('Mensagens Editadas')
                    .setDescription('Configurar Mensagens Editadas.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-msgdeleted')
                    .setLabel('Mensagens Deletadas')
                    .setDescription('Configurar Mensagens Deletadas.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-bans')
                    .setLabel('Banimentos Aplicados')
                    .setDescription('Configurar Banimentos Aplicados.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-unbans')
                    .setLabel('Bans Removidos')
                    .setDescription('Configurar Bans Removidos.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-kicks')
                    .setLabel('Expulsões Aplicadas')
                    .setDescription('Configurar Expulsões Aplicadas.')
                    .setEmoji('📝'),
                // new StringSelectMenuOptionBuilder()
                //     .setValue('logs-menu-mutes')
                //     .setLabel('Mutes Aplicados')
                //     .setDescription('Configurar Mutes Aplicados.')
                //     .setEmoji('📝'),
                // new StringSelectMenuOptionBuilder()
                //     .setValue('logs-menu-unmutes')
                //     .setLabel('Mutes Removidos')
                //     .setDescription('Configurar Mutes Removidos.')
                //     .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-joincalls')
                    .setLabel('Entradas em Calls')
                    .setDescription('Configurar Entrada em Calls.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-leavecalls')
                    .setLabel('Saidas de Calls')
                    .setDescription('Configurar Saida de Calls.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-switchcalls')
                    .setLabel('Mudanças de Calls')
                    .setDescription('Configurar Mudança de Calls.')
                    .setEmoji('📝'),
                new StringSelectMenuOptionBuilder()
                    .setValue('logs-menu-close')
                    .setLabel('Fechar Menu')
                    .setDescription('Fechar menu de configuração')
                    .setEmoji('❌')
            );
        const msg = await message.reply({ embeds: [msgEmbed], components: [new ActionRowBuilder().addComponents(menu)], fetchReply: true });
        const filter = (i) => {
            return i.isStringSelectMenu() || i.isButton() || i.isChannelSelectMenu() && i.message.id === msg.id;
        };

        const collector = msg.channel.createMessageComponentCollector({ filter: filter, time: 3 * 60 * 1000 });
        collector.on('end', () => {
        });

        collector.on('collect', async (collected) => {
            const value = collected.customId;
            if (collected.user.id != message.author.id)
                return collected.reply({ content: 'Eiii, essa interação não é sua!', ephemeral: true });

            const server = await this.client.database.guilds.findOne({ idS: message.guild.id });
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
            switch (value) {
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                CONFIGURAÇOES DE LOGS DE MENSAGENS EDITADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu':
                    if (collected.values[0] === 'logs-menu-msgedit') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgedit-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgedit-disable');
                        if (!server.logs.logsMsgEdit.status) {
                            msgEmbedChLogs.setDescription('**Mensagens Editadas** está desativada\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Mensagens Editadas** está ativada no canal: <#${server.logs.logsMsgEdit.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgedit-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE MENSAGENS DELETADAS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-msgdeleted') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgdeleted-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgdeleted-disable');
                        if (!server.logs.logsMsgDelete.status) {
                            msgEmbedChLogs.setDescription('**Mensagens Deletadas** está desativada\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Mensagens Deletadas** está ativada no canal: <#${server.logs.logsMsgDelete.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-msgdeleted-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE BANS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-bans') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-bans-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-bans-disable');
                        if (!server.logs.logsBan.status) {
                            msgEmbedChLogs.setDescription('**Banimentos Aplicados** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Banimentos Aplicados** está ativado no canal: <#${server.logs.logsBan.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-bans-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE BANS REMOVIDOS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-unbans') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unbans-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unbans-disable');
                        if (!server.logs.logsUnban.status) {
                            msgEmbedChLogs.setDescription('**Banimentos Removidos** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Banimentos Removidos** está ativado no canal: <#${server.logs.logsUnban.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unbans-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE EXPULSÕES APLICADAS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-kicks') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-kicks-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-kicks-disable');
                        if (!server.logs.logsKick.status) {
                            msgEmbedChLogs.setDescription('**Expulsões Aplicadas** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Expulsões Aplicadas** está ativado no canal: <#${server.logs.logsKick.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-kicks-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE MUTES APLICADOS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-mutes') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-mutes-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-mutes-disable');
                        if (!server.logs.logsMute.status) {
                            msgEmbedChLogs.setDescription('**Mutes Aplicados** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Mutes Aplicados** está ativado no canal: <#${server.logs.logsMute.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-mutes-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE MUTES REMOVIDOS
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-unmutes') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unmutes-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unmutes-disable');
                        if (!server.logs.logsUnmute.status) {
                            msgEmbedChLogs.setDescription('**Mutes Removidos** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Mutes Removidos** está ativado no canal: <#${server.logs.logsUnmute.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-unmutes-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE ENTRADAS EM CALL
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-joincalls') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-joincalls-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-joincalls-disable');
                        if (!server.logs.logsJoinCall.status) {
                            msgEmbedChLogs.setDescription('**Entradas em Calls** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Entradas em Calls** está ativado no canal: <#${server.logs.logsJoinCall.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-joincalls-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE SAIDAS DE CALL
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-leavecalls') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-leavecalls-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-leavecalls-disable');
                        if (!server.logs.logsLeaveCall.status) {
                            msgEmbedChLogs.setDescription('**Saidas de Calls** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Saidas de Calls** está ativado no canal: <#${server.logs.logsLeaveCall.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-leavecalls-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                        /*
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        CONFIGURAÇOES DE LOGS DE MUDANÇAS DE CALL
                        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                        */
                    } else if (collected.values[0] === 'logs-menu-switchcalls') {
                        const msgEmbedChLogs = new EmbedBuilder()
                            .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL({ size: 2048 }), url: null });
                        const buttonActivate = new ButtonBuilder()
                            .setCustomId('logs-menu-button-switchcalls-activate');
                        const buttonDisable = new ButtonBuilder()
                            .setCustomId('logs-menu-button-switchcalls-disable');
                        if (!server.logs.logsSwitchCall.status) {
                            msgEmbedChLogs.setDescription('**Mudanças de Calls** está desativado\nDeseja ativar?')
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Ativar')
                                .setStyle(ButtonStyle.Success);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);
                        } else {
                            msgEmbedChLogs.setDescription(`**Mudanças de Calls** está ativado no canal: <#${server.logs.logsSwitchCall.channel}>\nDeseja alterar?`)
                                .setColor(0x2B2D31);
                            buttonActivate.setLabel('Mudar Canal')
                                .setStyle(ButtonStyle.Primary);
                            buttonDisable.setLabel('Desativar')
                                .setStyle(ButtonStyle.Secondary);
                        }
                        const buttonClose = new ButtonBuilder()
                            .setCustomId('logs-menu-button-switchcalls-close')
                            .setLabel('Fechar')
                            .setStyle(ButtonStyle.Danger);
                        await collected.update({
                            embeds: [msgEmbedChLogs],
                            components: [new ActionRowBuilder().addComponents(buttonActivate, buttonDisable, buttonClose)]
                        });
                    }
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE MENSAGENS EDITADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgedit-activate':
                    const msgEmbedLogMsgEdit = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Mensagens Editadas**')
                        .setColor(0x2B2D31);
                    const selectMenuLogMsgEdit = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-msgedit-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogMsgEdit],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogMsgEdit)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE MENSAGENS EDITADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgedit-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsMsgEdit.channel': 'null',
                            'logs.logsMsgEdit.status': false
                        }
                    });
                    const ebSucessLogMsgEdit = new EmbedBuilder()
                        .setDescription('Logs de **Mensagem Editadas** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogMsgEdit],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE LOGS DE MENSAGENS EDITADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-msgedit-channels':
                    let channeldbLogMsgEdit = server.logs.logsMsgEdit.channel;
                    if (collected.values[0] != channeldbLogMsgEdit) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsMsgEdit.channel': collected.values[0],
                                'logs.logsMsgEdit.status': true
                            }
                        });
                        const ebSucessLogMsgEdit = new EmbedBuilder()
                            .setDescription(`Logs de **Mensagem Editadas** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogMsgEdit], components: [] });
                    } else {
                        const ebWarnLogMsgEdit = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Mensagem Editadas**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogMsgEdit], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE MENSAGENS EDITADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgedit-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE MENSAGENS DELETADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgdeleted-activate':
                    const msgEmbedLogMsgDeleted = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Mensagens Deletadas**')
                        .setColor(0x2B2D31);
                    const selectMenuLogMsgDeleted = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-msgdeleted-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogMsgDeleted],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogMsgDeleted)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE MENSAGENS DELETADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgdeleted-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsMsgDelete.channel': 'null',
                            'logs.logsMsgDelete.status': false
                        }
                    });
                    const ebSucessLogMsgDeleted = new EmbedBuilder()
                        .setDescription('Logs de **Mensagem Deletadas** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogMsgDeleted],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE LOGS DE MENSAGENS DELETADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-msgdeleted-channels':
                    let channeldbLogMsgDeleted = server.logs.logsMsgDelete.channel;
                    if (collected.values[0] != channeldbLogMsgDeleted) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsMsgDelete.channel': collected.values[0],
                                'logs.logsMsgDelete.status': true
                            }
                        });
                        const ebSucessLogMsgDeleted = new EmbedBuilder()
                            .setDescription(`Logs de **Mensagem Deletadas** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogMsgDeleted], components: [] });
                    } else {
                        const ebWarnLogMsgDeleted = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Mensagem Deletadas**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogMsgDeleted], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE MENSAGENS DELETADAS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-msgdeleted-close':
                    await collected.message.delete();
                    collector.stop();
                    break;

                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE BANS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-bans-activate':
                    const msgEmbedLogBan = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Banimentos Aplicados**')
                        .setColor(0x2B2D31);
                    const selectMenuLogBan = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-bans-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogBan],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogBan)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE BANS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-bans-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsBan.channel': 'null',
                            'logs.logsBan.status': false
                        }
                    });
                    const ebSucessLogBan = new EmbedBuilder()
                        .setDescription('Logs de **Banimentos Aplicados** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogBan],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE BANS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-bans-channels':
                    let channeldbLogBan = server.logs.logsBan.channel;
                    if (collected.values[0] != channeldbLogBan) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsBan.channel': collected.values[0],
                                'logs.logsBan.status': true
                            }
                        });
                        const ebSucessLogBan = new EmbedBuilder()
                            .setDescription(`Logs de **Banimentos Aplicados** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogBan], components: [] });
                    } else {
                        const ebWarnLogBan = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Banimentos Aplicados**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogBan], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE BANS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-bans-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE BANS REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unbans-activate':
                    const msgEmbedLogUnBan = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Bans Removidos**')
                        .setColor(0x2B2D31);
                    const selectMenuLogUnBan = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-unbans-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogUnBan],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogUnBan)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE BANS REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unbans-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsUnban.channel': 'null',
                            'logs.logsUnban.status': false
                        }
                    });
                    const ebSucessLogUnBan = new EmbedBuilder()
                        .setDescription('Logs de **Bans Removidos** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogUnBan],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE BANS REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-unbans-channels':
                    let channeldbLogUnBan = server.logs.logsUnban.channel;
                    if (collected.values[0] != channeldbLogUnBan) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsUnban.channel': collected.values[0],
                                'logs.logsUnban.status': true
                            }
                        });
                        const ebSucessLogUnBan = new EmbedBuilder()
                            .setDescription(`Logs de **Bans Removidos** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogUnBan], components: [] });
                    } else {
                        const ebWarnLogUnBan = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Bans Removidos**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogUnBan], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE BANS REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unbans-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE KICKS APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-kicks-activate':
                    const msgEmbedLogKick = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Expulsões Aplicadas**')
                        .setColor(0x2B2D31);

                    const selectMenuLogKick = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-kicks-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogKick],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogKick)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE KICKS APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-kicks-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsKick.channel': 'null',
                            'logs.logsKick.status': false
                        }
                    });
                    // eslint-disable-next-line no-case-declarations
                    const ebSucessLogKick = new EmbedBuilder()
                        .setDescription('Logs de **Expulsões Aplicadas** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogKick],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE KICKS APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-kicks-channels':
                    let channeldbLogKick = server.logs.logsKick.channel;
                    if (collected.values[0] != channeldbLogKick) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsKick.channel': collected.values[0],
                                'logs.logsKick.status': true
                            }
                        });
                        const ebSucessLogKick = new EmbedBuilder()
                            .setDescription(`Logs de **Expulsões Aplicadas** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogKick], components: [] });
                    } else {
                        const ebWarnLogKick = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Expulsões Aplicadas**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogKick], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE KICKS APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-kicks-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE MUTES APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-mutes-activate':
                    const msgEmbedLogMute = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Mutes Aplicados**')
                        .setColor(0x2B2D31);
                    const selectMenuLogMute = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-mutes-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogMute],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogMute)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE MUTES APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-mutes-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsMute.channel': 'null',
                            'logs.logsMute.status': false
                        }
                    });
                    const ebSucessLogMute = new EmbedBuilder()
                        .setDescription('Logs de **Mutes Aplicados** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogMute],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE MUTES APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-mutes-channels':
                    let channeldbLogMute = server.logs.logsMute.channel;
                    if (collected.values[0] != channeldbLogMute) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsMute.channel': collected.values[0],
                                'logs.logsMute.status': true
                            }
                        });
                        const ebSucessLogMute = new EmbedBuilder()
                            .setDescription(`Logs de **Mutes Aplicados** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogMute], components: [] });
                    } else {
                        const ebWarnLogMute = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Mutes Aplicados**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogMute], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE MUTES APLICADOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-mutes-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE MUTES REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unmutes-activate':
                    const msgEmbedLogUnMute = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Mutes Removidos**')
                        .setColor(0x2B2D31);
                    const selectMenuLogUnMute = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-unmutes-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogUnMute],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogUnMute)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE MUTES REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unmutes-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsUnmute.channel': 'null',
                            'logs.logsUnmute.status': false
                        }
                    });
                    const ebSucessLogUnMute = new EmbedBuilder()
                        .setDescription('Logs de **Mutes Removidos** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogUnMute],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE MUTES REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-unmutes-channels':
                    let channeldbLogUnMute = server.logs.logsUnmute.channel;
                    if (collected.values[0] != channeldbLogUnMute) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsUnmute.channel': collected.values[0],
                                'logs.logsUnmute.status': true
                            }
                        });
                        const ebSucessLogUnMute = new EmbedBuilder()
                            .setDescription(`Logs de **Mutes Removidos** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogUnMute], components: [] });
                    } else {
                        const ebWarnLogUnMute = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Mutes Removidos**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogUnMute], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE MUTES REMOVIDOS
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-unmutes-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE ENTRADAS EM CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-joincalls-activate':
                    const msgEmbedLogJoinCall = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Entrada em Calls**')
                        .setColor(0x2B2D31);
                    const selectMenuLogJoinCall = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-joincalls-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogJoinCall],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogJoinCall)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE ENTRADAS EM CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-joincalls-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsJoinCall.channel': 'null',
                            'logs.logsJoinCall.status': false
                        }
                    });
                    const ebSucessLogJoinCall = new EmbedBuilder()
                        .setDescription('Logs de **Entrada em Calls** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogJoinCall],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE ENTRADAS EM CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-joincalls-channels':
                    let channeldbLogJoinCall = server.logs.logsJoinCall.channel;
                    if (collected.values[0] != channeldbLogJoinCall) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsJoinCall.channel': collected.values[0],
                                'logs.logsJoinCall.status': true
                            }
                        });
                        const ebSucessLogJoinCall = new EmbedBuilder()
                            .setDescription(`Logs de **Entrada em Calls** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogJoinCall], components: [] });
                    } else {
                        const ebWarnLogJoinCall = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Entrada em Calls**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogJoinCall], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE ENTRADAS EM CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-joincalls-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE SAIDAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-leavecalls-activate':
                    const msgEmbedLogLeaveCall = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Saidas de Calls**')
                        .setColor(0x2B2D31);
                    const selectMenuLogLeaveCall = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-leavecalls-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogLeaveCall],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogLeaveCall)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE SAIDAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-leavecalls-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsLeaveCall.channel': 'null',
                            'logs.logsLeaveCall.status': false
                        }
                    });
                    const ebSucessLogLeaveCall = new EmbedBuilder()
                        .setDescription('Logs de **Saidas de Calls** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogLeaveCall],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE SAIDAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-leavecalls-channels':
                    let channeldbLogLeaveCall = server.logs.logsLeaveCall.channel;
                    if (collected.values[0] != channeldbLogLeaveCall) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsLeaveCall.channel': collected.values[0],
                                'logs.logsLeaveCall.status': true
                            }
                        });
                        const ebSucessLogLeaveCall = new EmbedBuilder()
                            .setDescription(`Logs de **Saidas de Calls** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogLeaveCall], components: [] });
                    } else {
                        const ebWarnLogLeaveCall = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Saidas de Calls**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogLeaveCall], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE SAIDAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-leavecalls-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-



                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE ATIVAR LOGS DE MUDANÇAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-switchcalls-activate':
                    const msgEmbedLogSwitchCall = new EmbedBuilder()
                        .setAuthor({ name: `${collected.guild.name} | Logs`, iconURL: collected.guild.iconURL(), url: null })
                        .setDescription('Escolha abaixo o canal desejado para **Mudanças de Calls**')
                        .setColor(0x2B2D31);
                    const selectMenuLogSwitchCall = new ChannelSelectMenuBuilder()
                        .setCustomId('logs-menu-switchcalls-channels')
                        .setPlaceholder('Escolha o canal desejado para os logs.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
                    await collected.update({
                        embeds: [msgEmbedLogSwitchCall],
                        components: [new ActionRowBuilder().addComponents(selectMenuLogSwitchCall)]
                    });
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE DESATIVAR LOGS DE MUDANÇAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-switchcalls-disable':
                    await this.client.database.guilds.findOneAndUpdate({
                        idS: collected.guild.id
                    }, {
                        $set: {
                            'logs.logsSwitchCall.channel': 'null',
                            'logs.logsSwitchCall.status': false
                        }
                    });
                    const ebSucessLogSwitchCall = new EmbedBuilder()
                        .setDescription('Logs de **Mudanças de Calls** foi desativado')
                        .setColor(Colors.Green);
                    await collected.update({
                        embeds: [ebSucessLogSwitchCall],
                        components: []
                    });
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                MENU DE SELECIONAR CANAL DE MUDANÇAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-switchcalls-channels':
                    let channeldbLogSwitchCall = server.logs.logsSwitchCall.channel;
                    if (collected.values[0] != channeldbLogSwitchCall) {
                        await this.client.database.guilds.findOneAndUpdate({
                            idS: collected.guild.id
                        }, {
                            $set: {
                                'logs.logsSwitchCall.channel': collected.values[0],
                                'logs.logsSwitchCall.status': true
                            }
                        });
                        const ebSucessLogSwitchCall = new EmbedBuilder()
                            .setDescription(`Logs de **Mudanças de Calls** definido no canal <#${collected.values[0]}>`)
                            .setColor(Colors.Green);
                        await collected.update({ embeds: [ebSucessLogSwitchCall], components: [] });
                    } else {
                        const ebWarnLogSwitchCall = new EmbedBuilder()
                            .setDescription('Este canal ja está configurado para as logs de **Mudanças de Calls**.')
                            .setColor(Colors.Orange);
                        await collected.update({ embeds: [ebWarnLogSwitchCall], components: [] });
                    }
                    collector.stop();
                    break;
                /*
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                BOTÃO DE FECHAR MENU DE LOGS DE MUDANÇAS DE CALL
                -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                */
                case 'logs-menu-button-switchcalls-close':
                    await collected.message.delete();
                    collector.stop();
                    break;
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
                default:
                    break;
            }
        });
    }
};