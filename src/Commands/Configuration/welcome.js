const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, ModalBuilder, TextInputStyle, TextInputBuilder, InteractionType, PermissionFlagsBits } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class WelcomeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'welcome';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Configure meu sistema de boas vindas em seu servidor.';
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
            return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);

        const gSrc = await this.client.database.guilds.findOne({ idS: message.guild.id });

        const Embed = new ClientEmbed()
            .setColor('#2E3035')
            .setTitle(`Sistema de Boas Vindas`)
            .setDescription(`Bem-Vindo(a) ao meu novo sistema de boas vindas, nesta versão optamos por facilitar a configuração para todos. Com novas ferramentas, vamos organizar o seu servidor!\n\n**Canal Configurado:** ${gSrc.welcome.channel == "null" ? "Nenhum Canal" : `<#${gSrc.welcome.channel}>`}\n\nAtualmente o sistema encontra-se **${gSrc.welcome.status ? "Online" : "Offline"}** neste servidor, para ativar utilize o menu de seleção abaixo e configure todos os requisitos necessários.\n`)
            .setThumbnail(this.client.user.displayAvatarURL({ extension: 'jpg', size: 2048 }));

        const channels = Array.from(await message.guild.channels.cache.filter(channel => channel.type === 0).values()).slice(0, 10);

        const canaisMenu = new ChannelSelectMenuBuilder()
            .setCustomId('canais-menu')
            .setPlaceholder('Selecione um canal de texto')
            .setChannelTypes(ChannelType.GuildText);

        const systemMenu = new StringSelectMenuBuilder()
            .setCustomId('system-menu')
            .setPlaceholder('Configurar O Sistema de Boas-Vindas')
            .addOptions([
                {
                    label: 'Ativar o Sistema',
                    emoji: '<:aficon:1058201359066865754>',
                    description: 'Ative o sistema de boas-vindas após configurado!',
                    value: 'configon'
                },
                {
                    label: 'Desativar o Sistema',
                    emoji: '<:aficon:1058201359066865754>',
                    description: 'Desative o sistema de boas-vindas após configurado!',
                    value: 'configoff'
                },
                {
                    label: 'Configurar o Canal',
                    emoji: '<:aficon:1058201359066865754>',
                    description: 'Escolha um dos canais da lista para dar boas-vindas!',
                    value: 'configch'
                },
                {
                    label: 'Configurar Mensagem',
                    emoji: '<:wmessage:1095716719248560139>',
                    description: 'Defina uma mensagem a ser exibida no sistema!',
                    value: 'configwmsg'
                },
                {
                    label: 'Cor dos Textos',
                    emoji: '<:palet:1095442951347384382>',
                    description: 'Escolha uma cor para os textos de boas-vindas!',
                    value: 'configcolors'
                }
            ]);

        const colorsMenu = new StringSelectMenuBuilder()
            .setCustomId('system-menu')
            .setPlaceholder('Configurar O Sistema de Boas-Vindas')
            .addOptions([
                {
                    label: 'Branco',
                    emoji: '<:wcwhite:1095444069146185840>',
                    description: 'Altere a cor dos textos para branco!',
                    value: 'colorwh'
                },
                {
                    label: 'Azul',
                    emoji: '<:wcblue:1095444071763427409>',
                    description: 'Altere a cor dos textos para azul!',
                    value: 'colorbl'
                },
                {
                    label: 'Vermelho',
                    emoji: '<:wcred:1095444073256599572>',
                    description: 'Altere a cor dos textos para vermelho!',
                    value: 'colord'
                },
                {
                    label: 'Preto',
                    emoji: '<:wcblack:1095444074854633592>',
                    description: 'Altere a cor dos textos para preta!',
                    value: 'colorbk'
                },
                {
                    label: 'Voltar',
                    value: 'configrtn'
                }
            ]);

        const modal = new ModalBuilder()
            .setCustomId('modalWelcome')
            .setTitle('Configuração do Welcome')
            .addComponents([
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('welcomeMsg')
                        .setLabel("Mensagem do Welcome")
                        .setMinLength(5)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('welcomeImg')
                        .setLabel("Imagem de Fundo [Forneça a URL]")
                        .setMinLength(10)
                        .setValue(gSrc.welcome.background)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
            ])


        const menuMessage = await message.reply({ embeds: [Embed], components: [new ActionRowBuilder().addComponents(systemMenu)] });

        // Filtro para coleta da interação
        const filter = (i) => {
            return (i.isStringSelectMenu() || i.isChannelSelectMenu()) && i.message.id === menuMessage.id;
        };

        // Definindo o filtro no coletor
        const collector = menuMessage.createMessageComponentCollector({ filter });

        // Iniciando o coletor
        collector.on('collect', async (i) => {
            // Verifica se a interação é feita pelo autor do comando
            if (i.user.id !== message.author.id) {
                return i.reply({ content: `Eiii ${i.user}, essa interação não é sua! 👀`, ephemeral: true });
            }
            // Verifica se os valores de 'canais-menu' estão incluídos
            const value = i.values[0];

            if (value === 'configch') {
                return await i.update({ embeds: [Embed], components: [new ActionRowBuilder().addComponents(canaisMenu)] });
            } else if (value === 'configon') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.status": true } }
                );
                return await i.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, sistema de welcome ativado com sucesso.`, embeds: [], components: [] });
            } else if (value === 'configoff') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.status": false } }
                );
                return await i.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, sistema de welcome desativado com sucesso.`, embeds: [], components: [] });
            } else if (value === 'configcolors') {
                return await i.update({ embeds: [Embed], components: [new ActionRowBuilder().addComponents(colorsMenu)] });
            } else if (value === 'configrtn') {
                return await i.update({ embeds: [Embed], components: [new ActionRowBuilder().addComponents(systemMenu)] })
            } else if (value === 'colorwh') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.colortext": '#FFFFFF' } }
                );
                return await i.update({ embeds: [], components: [], content: `<:kosame_Correct:1010978511839842385> A cor dos textos do sistema foi definida como branco!` })
            } else if (value === 'colorbl') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.colortext": '#227FFF' } }
                );
                return await i.update({ embeds: [], components: [], content: `<:kosame_Correct:1010978511839842385> A cor dos textos do sistema foi definida como azul!` })
            } else if (value === 'colord') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.colortext": '#FF0000' } }
                );
                return await i.update({ embeds: [], components: [], content: `<:kosame_Correct:1010978511839842385> A cor dos textos do sistema foi definida como vermelho!` })
            } else if (value === 'colorbk') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { "welcome.colortext": '#000000' } }
                );
                return await i.update({ embeds: [], components: [], content: `<:kosame_Correct:1010978511839842385> A cor dos textos do sistema foi definida como preto!` })
            } else if (value === 'configwmsg') {
                return i.showModal(modal);
            }

            // Pega o canal a partir do ID selecionado
            const canal = message.guild.channels.cache.get(value);
            // Envia uma mensagem de confirmação
            await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { "welcome.channel": canal.id } }
            );

            return await i.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, o canal ${canal} foi definido como o canal de boas-vindas.`, embeds: [], components: [] });
        });
    }
};