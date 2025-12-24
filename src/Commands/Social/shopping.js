/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable require-await */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util.js');
const { store } = require('../../Utils/Shop/newShop.js');

module.exports = class ShoppingCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'background';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '💸 Economia';
        this.description = 'Loja de backgronds e personalização.';
        this.aliases = ['shop'];
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
    async commandExecute({ message, args }) {

        let category = '';
        let colorFilter = null; // Filtro de cor para backgrounds
        let page = 0;
        const itemsPerPage = 1;

        // Cores disponíveis para backgrounds
        const backgroundColors = [
            { label: 'Branco (White)', value: 'White' },
            { label: 'Preto (Black)', value: 'Black' },
            { label: 'Rosa (Rose)', value: 'Rose' },
            { label: 'Ciano (Cyan)', value: 'Cyan' },
            { label: 'Roxo (Purple)', value: 'Purple' },
            { label: 'Azul Rio (Blue River)', value: 'Blue River' },
            { label: 'Vermelho (Red)', value: 'Red' },
            { label: 'Amarelo (Yellow)', value: 'Yellow' },
            { label: 'Verde Pântano (Swamp Green)', value: 'Swamp Green' },
            { label: 'Rosa Choque (Pink)', value: 'Pink' },
            { label: 'Vermelho Escuro (Dark Red)', value: 'Dark Red' },
            { label: 'Verde Floresta (Forest Green)', value: 'Forest Green' },
            { label: 'Azul Oceano (Blue Ocean)', value: 'Blue Ocean' },
            { label: 'Cinza (Grey)', value: 'Grey' }
        ];

        const categoryRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('category_backgrounds').setLabel('Backgrounds').setEmoji('<:ksaddi:1270529616620159037>').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('category_molduras').setLabel('Molduras').setEmoji('<:ksaddi:1270529616620159037>').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('category_layouts').setLabel('Layouts').setEmoji('<:ksaddi:1270529616620159037>').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('category_help').setEmoji('<:ksduvida:1270530218016374816>').setStyle(ButtonStyle.Secondary)
            );

        const embedSelect = new ClientEmbed()
            .setColor('#FFFFFF')
            .setAuthor({ name: 'Customize Seu Perfil', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription('Olá, bem vindo(a) ao Shop da Kosame, aqui você poderá comprar itens exclusivos para personalizar seu perfil.\nAbaixo você poderá encontrar diversos tipos de banners, layouts e molduras disponíveis para compra.\n\n<:information:1021614558995025930> Seleciona as categorias abaixo!')
            .setThumbnail('https://i.imgur.com/rZyffGg.png', { size: 1024 })
            .setImage('https://i.imgur.com/4yG8gDi.png');

        const storeMessage = await message.reply({ embeds: [embedSelect], components: [categoryRow], fetchReply: true });

        const collector = storeMessage.createMessageComponentCollector({ time: 1000 * 60 * 10 });

        // Função para criar menu de seleção de cores
        const buildColorSelectMenu = () => {
            return new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('color_select')
                        .setPlaceholder('Selecione uma cor de background')
                        .addOptions(backgroundColors.slice(0, 25)) // Limite de 25 opções
                );
        };

        // Função para obter backgrounds filtrados por cor
        const getFilteredBackgrounds = (color) => {
            if (!color) return store.backgrounds;
            return store.backgrounds.filter(bg => bg.name.includes(`(${color})`));
        };

        collector.on('collect', async i => {

            if (i.user.id !== message.author.id) {
                return await i.reply({ content: '👀 Esta compra não pertence a você!', flags: MessageFlags.Ephemeral });
            }

            const userShop = await this.client.database.users.findOne({ idU: message.author.id });

            // Handler para seleção de categoria
            if (i.customId.startsWith('category_')) {
                category = i.customId.split('_')[1];
                page = 0;
                colorFilter = null;
                const cUser = await this.client.database.users.findOne({ idU: message.author.id });

                if (category === 'molduras' && cUser.vip.upgrade < 1) {
                    return await i.reply({ content: 'Você precisa ser VIP para utilizar molduras!', flags: MessageFlags.Ephemeral });
                }

                if (category === 'help') {
                    const helpEmbed = new ClientEmbed()
                        .setColor('#5865F2')
                        .setAuthor({ name: 'Ajuda do Shop', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(
                            '**Como funciona o Shop?**\n\n' +
                            '<:galeriadeimagens1:1373788908609077389> **Backgrounds** - Imagens de fundo para seu perfil. Selecione uma cor para ver os disponíveis.\n\n' +
                            '<:ksm_level:1426767032312922223> **Molduras** - Bordas decorativas para seu avatar. *Requer VIP.*\n\n' +
                            '<:kslgaleria:1200606939613245451> **Layouts** - Altere completamente o visual do seu perfil.\n\n' +
                            '**Dicas:**\n' +
                            '• Use `k!profile` para ver seu perfil atual\n' +
                            '• Itens comprados ficam salvos na sua conta para sempre!\n\n' +
                            '**Servidor de Suporte:** https://discord.gg/kosame'
                        )
                        .setThumbnail('https://i.imgur.com/rZyffGg.png');

                    return await i.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
                }

                // Se for backgrounds, mostrar menu de seleção de cores
                if (category === 'backgrounds') {
                    const colorEmbed = new ClientEmbed()
                        .setColor('#FFFFFF')
                        .setAuthor({ name: 'Selecione uma Cor', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription('Escolha uma cor para ver os backgrounds disponíveis.\n\n<:information:1021614558995025930> Use o menu abaixo para filtrar!')
                        .setThumbnail('https://i.imgur.com/rZyffGg.png')
                        .setImage('https://i.imgur.com/4yG8gDi.png');

                    const backButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_main').setLabel('Voltar').setEmoji('<:kosame_reply:1006724082429075576>').setStyle(ButtonStyle.Secondary)
                        );

                    return await i.update({ embeds: [colorEmbed], components: [buildColorSelectMenu(), backButton] });
                }

                await showPage(i, category, page, userShop, colorFilter);
            }

            // Handler para seleção de cor
            else if (i.customId === 'color_select') {
                colorFilter = i.values[0];
                page = 0;
                await showPage(i, 'backgrounds', page, userShop, colorFilter);
            }

            // Handler para voltar ao menu principal
            else if (i.customId === 'back_main') {
                colorFilter = null;
                category = '';
                await i.update({ embeds: [embedSelect], components: [categoryRow] });
            }

            // Handler para voltar à seleção de cores (backgrounds)
            else if (i.customId === 'back_colors') {
                colorFilter = null;
                page = 0;
                const colorEmbed = new ClientEmbed()
                    .setColor('#FFFFFF')
                    .setAuthor({ name: 'Selecione uma Cor', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setDescription('Escolha uma cor para ver os backgrounds disponíveis.\n\n<:information:1021614558995025930> Use o menu abaixo para filtrar!')
                    .setThumbnail('https://i.imgur.com/rZyffGg.png')
                    .setImage('https://i.imgur.com/4yG8gDi.png');

                const backButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('back_main').setLabel('Voltar').setEmoji('<:kosame_reply:1006724082429075576>').setStyle(ButtonStyle.Secondary)
                    );

                return await i.update({ embeds: [colorEmbed], components: [buildColorSelectMenu(), backButton] });
            }

            else if (i.customId === 'prev_page') {
                if (page > 0) page--;
                await showPage(i, category, page, userShop, colorFilter);
            } else if (i.customId === 'next_page') {
                const items = category === 'backgrounds' ? getFilteredBackgrounds(colorFilter) : store[category];
                if (page < Math.ceil(items.length / itemsPerPage) - 1) page++;
                await showPage(i, category, page, userShop, colorFilter);
            } else if (i.customId.startsWith('buy_')) {
                const itemIndex = parseInt(i.customId.split('_')[1]);
                const items = category === 'backgrounds' ? getFilteredBackgrounds(colorFilter) : store[category];
                const item = items[itemIndex];
                const user = await this.client.database.users.findOne({ idU: message.author.id });

                if (category === 'backgrounds' && user.backgrounds.includes(item.name)) {
                    return await i.reply({ content: `Você já possui o background ${item.name}.`, flags: MessageFlags.Ephemeral });
                }
                if (category === 'molduras' && user.molduras.includes(item.name)) {
                    return await i.reply({ content: `Você já possui a moldura ${item.name}.`, flags: MessageFlags.Ephemeral });
                }
                if (category === 'layouts' && user.haslayouts.includes(item.name)) {
                    return await i.reply({ content: `Você já possui o layout ${item.name}.`, flags: MessageFlags.Ephemeral });
                }

                if (user.bank >= item.price) {
                    user.bank -= item.price;
                    if (category === 'backgrounds') user.backgrounds.push(item.name);
                    if (category === 'molduras') user.molduras.push(item.name);
                    if (category === 'layouts') {
                        user.haslayouts.push(item.name);
                        // NÃO equipa automaticamente - apenas adiciona à lista de layouts
                        if (typeof user.layouts[item.cod] === 'object' && user.layouts[item.cod] !== null && 'has' in user.layouts[item.cod]) {
                            user.layouts[item.cod].has = true;
                        }
                    }
                    // NÃO equipa automaticamente backgrounds nem molduras
                    await user.save();
                    return await i.update({ content: `✅ Você comprou **${item.name}**!\n-# Use \`k!shop\` para equipar seu novo item.`, embeds: [], components: [], flags: MessageFlags.Ephemeral });
                } else {
                    return await i.reply({ content: 'Saldo insuficiente.', flags: MessageFlags.Ephemeral });
                }
            } else if (i.customId.startsWith('equip_')) {
                const itemIndex = parseInt(i.customId.split('_')[1]);
                const items = category === 'backgrounds' ? getFilteredBackgrounds(colorFilter) : store[category];
                const item = items[itemIndex];

                const user = await this.client.database.users.findOne({ idU: message.author.id });
                if (!user) return await i.update({ content: 'Usuário não encontrado.', flags: MessageFlags.Ephemeral });

                // Verificar se já está equipado
                const isAlreadyEquipped = (category === 'backgrounds' && user.profile.imagembg === item.raw) ||
                    (category === 'molduras' && user.profile.moldura === item.raw) ||
                    (category === 'layouts' && user.profile.layout === item.raw);

                if (isAlreadyEquipped) {
                    return await i.update({
                        content: `Você já está usando ${item.name}.`,
                        embeds: [],
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Atualizar valor
                if (category === 'layouts') {
                    user.profile.layout = item.raw;
                    user.profile.textcolor = item.textcolor;

                    for (const layout of Object.keys(user.layouts.toObject())) {
                        if (
                            typeof user.layouts[layout] === 'object' && user.layouts[layout] !== null && 'equipped' in user.layouts[layout]
                        ) {
                            user.layouts[layout].equipped = false;
                        }
                    }

                    if (
                        typeof user.layouts[item.cod] === 'object' && user.layouts[item.cod] !== null && 'equipped' in user.layouts[item.cod]
                    ) {
                        user.layouts[item.cod].has = true;
                        user.layouts[item.cod].equipped = true;
                    } else {
                        console.log('Erro ao equipar um layout!');
                    }
                }

                if (category === 'backgrounds') user.profile.imagembg = item.raw;
                if (category === 'molduras') user.profile.moldura = item.raw;

                await user.save();

                return await i.update({
                    content: `Você equipou ${item.name}!`,
                    embeds: [],
                    components: [],
                    flags: MessageFlags.Ephemeral
                });
            } else if (i.customId === 'cancel') {
                return await i.update({ content: 'Você cancelou a compra!', embeds: [], components: [], flags: MessageFlags.Ephemeral });
            }
        });

        // ============> Função do Paginator <=========== //
        async function showPage(interaction, cat, pg, userShop, colorFilter) {
            // Filtra itens exclusivos (exclusive: true não aparece na loja)
            const rawItems = cat === 'backgrounds' ? getFilteredBackgrounds(colorFilter) : store[cat];
            const items = rawItems.filter(item => !item.exclusive);
            const pageItems = items.slice(pg * itemsPerPage, (pg + 1) * itemsPerPage);

            if (pageItems.length === 0) {
                return await interaction.update({
                    content: 'Nenhum item encontrado nesta categoria.',
                    embeds: [],
                    components: [new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('back_colors').setLabel('Voltar').setEmoji('<:kosame_reply:1006724082429075576>').setStyle(ButtonStyle.Secondary)
                    )]
                });
            }

            const embed = new ClientEmbed()
                .setDescription(pageItems.map((item, index) => `# ${item.name}\n\n-# ${item.desc}\n-# <:arrowl:1373387965249753220> Valor: ${item.price} **(${Util.toAbbrev(item.price)})** Coins\n-# **${item.rarity}**`).join('\n'))
                .setImage(pageItems[0].image);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    ...pageItems.map((item, index) => {
                        const hasItem = cat === 'backgrounds' ? userShop.backgrounds.includes(item.name) : cat === 'molduras' ? userShop.molduras.includes(item.name) : cat === 'layouts' ? userShop.haslayouts.includes(item.name) : false;

                        return new ButtonBuilder()
                            .setCustomId(`${hasItem ? 'equip_' : 'buy_'}${pg * itemsPerPage + index}`)
                            .setLabel(hasItem ? 'Equipar' : 'Comprar')
                            .setEmoji(hasItem ? '1373755983196590240' : '1373756395303997471')
                            .setStyle(hasItem ? ButtonStyle.Secondary : ButtonStyle.Success);
                    }),
                    new ButtonBuilder().setCustomId('prev_page').setLabel('Anterior').setEmoji('1373756738221768725').setStyle(ButtonStyle.Secondary).setDisabled(pg === 0),
                    new ButtonBuilder().setCustomId('next_page').setLabel('Próxima').setEmoji('1373756737072533545').setStyle(ButtonStyle.Secondary).setDisabled(pg >= Math.ceil(items.length / itemsPerPage) - 1),
                    cat === 'backgrounds'
                        ? new ButtonBuilder().setCustomId('back_colors').setLabel('Cores').setEmoji('<:ksm_wait:1316584577384583258>').setStyle(ButtonStyle.Secondary)
                        : new ButtonBuilder().setCustomId('back_main').setLabel('Voltar').setEmoji('<:kosame_reply:1006724082429075576>').setStyle(ButtonStyle.Secondary)
                );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }
    }
};