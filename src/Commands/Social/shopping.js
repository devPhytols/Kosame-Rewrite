/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable require-await */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        let page = 0;
        const itemsPerPage = 1;

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

        collector.on('collect', async i => {

            if (i.user.id !== message.author.id) {
                return await i.reply({ content: '👀 Esta compra não pertence a você!', ephemeral: true });
            }

            const userShop = await this.client.database.users.findOne({ idU: message.author.id });
            if (i.customId.startsWith('category_')) {
                category = i.customId.split('_')[1];
                page = 0;
                const cUser = await this.client.database.users.findOne({ idU: message.author.id });

                if (category === 'molduras' && cUser.vip.upgrade < 1) {
                    return await i.reply({ content: 'Você precisa ser VIP para utilizar molduras!', ephemeral: true });
                }
                if (category === 'help') {
                    return await i.reply({ content: 'Se você tem alguma dúvida sobre o meu Shopping, você pode acessar meu Servidor Oficial! https://discord.gg/kosame', ephemeral: true });
                }
                await showPage(i, category, page, userShop);
            } else if (i.customId === 'prev_page') {
                if (page > 0) page--;
                await showPage(i, category, page, userShop);
            } else if (i.customId === 'next_page') {
                if (page < Math.ceil(store[category].length / itemsPerPage) - 1) page++;
                await showPage(i, category, page, userShop);
            } else if (i.customId.startsWith('buy_')) {
                const itemIndex = i.customId.split('_')[1];
                const item = store[category][itemIndex];
                const user = await this.client.database.users.findOne({ idU: message.author.id });
                
                if (category === 'backgrounds' && user.backgrounds.includes(item.name)) {
                    return await i.reply({ content: `Você já possui o background ${item.name}.`, ephemeral: true });
                }
                if (category === 'molduras' && user.molduras.includes(item.name)) {
                    return await i.reply({ content: `Você já possui a moldura ${item.name}.`, ephemeral: true });
                }
                if (category === 'layouts' && user.haslayouts.includes(item.name)) {
                    return await i.reply({ content: `Você já possui o layout ${item.name}.`, ephemeral: true });
                }
                
                if (user.bank >= item.price) {
                    user.bank -= item.price;
                    if (category === 'backgrounds') user.backgrounds.push(item.name);
                    if (category === 'molduras') user.molduras.push(item.name);
                    if (category === 'layouts') user.haslayouts.push(item.name);
                    if (category === 'backgrounds') user.profile.imagembg = item.raw;
                    if (category === 'molduras') user.profile.moldura = item.raw;
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
                            typeof user.layouts[item.cod] === 'object' &&user.layouts[item.cod] !== null &&'equipped' in user.layouts[item.cod]
                        ) {
                            user.layouts[item.cod].has = true;
                            user.layouts[item.cod].equipped = true;
                        } else {
                            console.log('Erro ao comprar um layout!')
                            //console.error(`Código do layout inválido ou corrompido: ${item.cod}`, user.layouts[item.cod]);
                        }
                    }
                    await user.save();
                    return await i.update({ content: `Você comprou ${item.name}!`, embeds: [], components: [], ephemeral: true });
                } else {
                    return await i.reply({ content: 'Saldo insuficiente.', ephemeral: true });
                }
            }  else if (i.customId.startsWith('equip_')) {
                const itemIndex = i.customId.split('_')[1];
                const item = store[category][itemIndex];
    
                const user = await this.client.database.users.findOne({ idU: message.author.id });
                if (!user) return await i.update({ content: 'Usuário não encontrado.', ephemeral: true });

                // Verificar se já está equipado
                const isAlreadyEquipped = (category === 'backgrounds' && user.profile.imagembg === item.raw) || (category === 'molduras' && user.profile.moldura === item.raw);

                if (isAlreadyEquipped) {
                    return await i.update({
                        content: `Você já está usando ${item.name}.`,
                        embeds: [],
                        components: [],
                        ephemeral: true
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
                        typeof user.layouts[item.cod] === 'object' && user.layouts[item.cod] !== null &&'equipped' in user.layouts[item.cod]
                    ) {
                        user.layouts[item.cod].has = true;
                        user.layouts[item.cod].equipped = true;
                    } else {
                        console.log('Erro ao equipar um layout!');
                        //console.error(`Código do layout inválido ou corrompido: ${item.cod}`, user.layouts[item.cod]);
                    }
                }

                if (category === 'backgrounds') user.profile.imagembg = item.raw;
                if (category === 'molduras') user.profile.moldura = item.raw;

                await user.save();

                return await i.update({
                    content: `Você equipou ${item.name}!`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (i.customId === 'cancel') {
                return await i.update({ content: 'Você cancelou a compra!', embeds: [], components: [], ephemeral: true });
            }
        });

        // ===========> Função do Paginator <=========== //
        async function showPage(interaction, category, page, userShop) {
            const items = store[category].slice(page * itemsPerPage, (page + 1) * itemsPerPage);
            const embed = new ClientEmbed()
                //.setColor(`${items.map((item, index) => `${item.embedcolor}`)}`)
                .setDescription(items.map((item, index) => `# ${item.name}\n\n-# ${item.desc}\n-# <:arrowl:1373387965249753220> Valor: ${item.price} **(${Util.toAbbrev(item.price)})** Coins\n-# **${item.rarity}**`).join('\n'))
                .setImage(items[0].image);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    ...items.map((item, index) => {
                        //const hasItem = category === 'backgrounds' ? userShop.backgrounds.includes(item.name) : userShop.molduras.includes(item.name);
                        const hasItem = category === 'backgrounds' ? userShop.backgrounds.includes(item.name) : category === 'molduras' ? userShop.molduras.includes(item.name) : category === 'layouts' ? userShop.haslayouts.includes(item.name) : false;

                        return new ButtonBuilder()
                            .setCustomId(`${hasItem ? 'equip_' : 'buy_'}${page * itemsPerPage + index}`)
                            .setLabel(hasItem ? 'Equipar' : 'Comprar')
                            .setEmoji(hasItem ? '1373755983196590240' : '1373756395303997471')
                            .setStyle(hasItem ? ButtonStyle.Secondary : ButtonStyle.Success);
                    }),
                    new ButtonBuilder().setCustomId('prev_page').setLabel('Anterior').setEmoji('1373756738221768725').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
                    new ButtonBuilder().setCustomId('next_page').setLabel('Próxima').setEmoji('1373756737072533545').setStyle(ButtonStyle.Secondary).setDisabled(page >= Math.ceil(store[category].length / itemsPerPage) - 1),
                    new ButtonBuilder().setCustomId('cancel').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }
    }
};