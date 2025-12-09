const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { layouts } = require('../../Utils/Shop/layouts.js');
const path = require('path');
const mime = require('mime-types');
const axios = require('axios');
const FormData = require('form-data');

module.exports = class ProfilebgCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'profilebg';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Configurar o estilo do perfil.';
        this.aliases = ['profilecf', 'perfilcf','pcf', 'custom'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'img',
                type: ApplicationCommandOptionType.Subcommand,
                description: '[VIP] Define o seu background de perfil.',
                options: [
                    {
                        name: 'img',
                        description: 'Insira a URL da imagem!',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            }
        ];
    }

    /**
 * @param {Client} client
 * @param {Message} message
 * @param {String[]} args
 */
    async commandExecute({ message, args }) {

        const user = await this.client.database.users.findOne({ idU: message.author.id });
        const regex = /^(http(s)?:\/\/|www\.).*(\.jpg|\.png)/g;
        const vip = user.vip;
        const uLayout = user.layouts;
        const arrayLayout = layouts;

        if (user.blockpay)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        if (user.blockbet)
            return message.reply('Você está com uma transação em andamento! Finalize...');

        const embed = new ClientEmbed()
            .setAuthor({ name: 'Edição de Perfil', iconURL: this.client.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription('Olá, bem vindo(a) ao Editor de Perfil, aqui você poderá personalizar seu perfil com tudo que tenha direito.\nAbaixo você poderá encontrar todos os seus layouts disponíveis para uso, além disso, para usuários vip, poderão também editar algumas informações do perfil.\n\n<:information:1021614558995025930> *Confira abaixo algumas inforamações do seu perfil*\n')
            .addFields(
                {
                    name: '**Background do Perfil**',
                    value:
                user.profile.imagembg == 'https://i.pinimg.com/originals/81/d3/6f/81d36fb05994148a3e3305d6331892a8.jpg'
                    ? '\`\`\`Background Padrão\`\`\`'
                    : '```Background Personalizado```'
                })
            .setThumbnail('https://i.imgur.com/uQyjk4Q.png', { size: 1024 });

        if (!args[0]) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Selecione uma Opção')
                        .addOptions([
                            {
                                label: '[VIP] Alterar Configurações',
                                emoji: '1373788914673909771',
                                description: 'Altere o estilo do seu perfil. (Biografia/Banner)',
                                value: 'opc1'
                            },
                            {
                                label: '[VIP] Alterar Fundo do Banco',
                                emoji: '1373788912853717165',
                                description: 'Altere o estilo do seu banco. (Banner)',
                                value: 'opc4'
                            },
                            {
                                label: '[VIP] Alterar Cor dos Textos',
                                emoji: '1373788910777274389',
                                description: '[VIP 3.0] - Altere a cor dos textos no perfil.',
                                value: 'opc3'
                            },
                            {
                                label: '[VIP] Alterar Insignia VIP',
                                emoji: '1175128221411455109',
                                description: '[VIP 5.0] - Altere a insignia do seu Perfil.',
                                value: 'opc5'
                            },
                            {
                                label: '[VIP] Meus Gifs',
                                emoji: '1425245772764676167',
                                description: '[VIP Onyx] - Veja a lista de banners de banco animados.',
                                value: 'opc6'
                            },
                            {
                                label: 'Meus Layouts',
                                emoji: '1373788908609077389',
                                description: 'Veja a lista de todos os seus layouts comprados.',
                                value: 'opc2'
                            }
                        ])
                );

            const rowColors = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Seleciona Uma Cor')
                        .addOptions([
                            {   label: '[VIP 3.0] Azul/Blue',
                                emoji: '<:ksm_lblue:1116150189070241884>',
                                description: 'Será definida a cor azul representada no icone.',
                                value: 'cor1'
                            },
                            {
                                label: '[VIP 3.0] Vermelho/Red',
                                emoji: '<:ksm_lred:1116150185781907467>',
                                description: 'Será definida a cor vermelha representada no icone.',
                                value: 'cor2'
                            },
                            {
                                label: '[VIP 3.0] Roxo/Purple',
                                emoji: '<:ksm_lpurple:1116150184108367943>',
                                description: 'Será definida a cor roxa representada no icone.',
                                value: 'cor3'
                            },
                            {
                                label: '[VIP 3.0] Rosa/Rose',
                                emoji: '<:ksm_lrose:1116151248538841188>',
                                description: 'Será definida a cor rosa representada no icone.',
                                value: 'cor4'
                            },
                            {
                                label: '[VIP 3.0] Laranja/Orange',
                                emoji: '<:ksm_lorange:1116151245590233238>',
                                description: 'Será definida a cor laranja representada no icone.',
                                value: 'cor5'
                            },
                            {
                                label: '[VIP 3.0] Branco/White',
                                emoji: '<:ksm_lwhite:1116368082697453578>',
                                description: 'Será definida a cor branca representada no icone.',
                                value: 'cor6'
                            },
                            {
                                label: '[VIP 3.0] Amarelo',
                                emoji: '<:kslamarelo:1191400844726382632>',
                                description: 'Será definida a cor amarelo representada no icone.',
                                value: 'cor7'
                            },
                            {
                                label: '[VIP 3.0] Preto',
                                emoji: '<:kslpreto:1191400841731657818>',
                                description: 'Será definida a cor preta representada no icone.',
                                value: 'cor8'
                            },
                            {
                                label: '[VIP 3.0] Verde',
                                emoji: '<:kslverde:1191400840267837590>',
                                description: 'Será definida a cor verde representada no icone.',
                                value: 'cor9'
                            },
                            {
                                label: '[VIP 3.0] Ciano',
                                emoji: '<:kslcyan:1237131713071808582> ',
                                description: 'Será definida a cor ciano representada no icone.',
                                value: 'cor10'
                            },
                            {
                                label: '[VIP 3.0] Azul Escuro',
                                emoji: '<:kslazul2:1191400836224528434>',
                                description: 'Será definida a cor azul escuro representada no icone.',
                                value: 'cor11'
                            },
                            {
                                label: '[VIP 3.0] Verde Água',
                                emoji: '<:kslverde2:1191400833477267576>',
                                description: 'Será definida a cor verde água representada no icone.',
                                value: 'cor12'
                            },
                            {
                                label: '[VIP 5.0] Rosa/Pink',
                                emoji: '<:kslrosa2:1237131716867395615>',
                                description: 'Será definida a cor rosa pink representada no icone.',
                                value: 'cor13'
                            },
                            {
                                label: '[VIP 5.0] Verde Esmeralda',
                                emoji: '<:kslverde1:1237132020392394772>',
                                description: 'Será definida a cor verde esmeralda representada no icone.',
                                value: 'cor14'
                            },
                            {
                                label: '[VIP 5.0] Dourado Pérola',
                                emoji: '<:kslvipyellow:1237131714736820356>',
                                description: 'Será definida a cor dourado pérola representada no icone.',
                                value: 'cor15'
                            },
                            {
                                label: '[VIP Ruby] Cinza/Gray',
                                emoji: '1373725072887648357',
                                description: 'Será definida a cor cinza/gray representada no icone.',
                                value: 'cor16'
                            },
                            {
                                label: '[VIP Ruby] Azul Aurora/Aurora Blue',
                                emoji: '1373817279107567677',
                                description: 'Será definida a cor azul aurora/aurora blue pérola representada no icone.',
                                value: 'cor17'
                            },
                            {
                                label: '[VIP Ruby] Vermelho Escuro/Dark Red',
                                emoji: '1373726921380204614',
                                description: 'Será definida a cor vermelho escuro/dark red representada no icone.',
                                value: 'cor18'
                            },
                            {
                                label: '[VIP Ruby] Branco Neve/Snow White',
                                emoji: '1373741564664221716',
                                description: 'Será definida a cor branco neve/snow white representada no icone.',
                                value: 'cor19'
                            },
                            {
                                label: '[VIP Ruby] Roxo Escuro/Dark Purple',
                                emoji: '1373744634269794354',
                                description: 'Será definida a cor roxo escuro/dark purple representada no icone.',
                                value: 'cor20'
                            },
                            { label: 'Voltar', value: 'voltarmenu' }
                        ])
                );

            const rowInsigniaVIP = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Seleciona Uma Insignia')
                        .addOptions([ 
                            { label: 'VIP 1.0', emoji: '<:vip1:1175119303222239323>', description: 'Será definida a Insignia do VIP 1.0', value: 'bvip1' }, 
                            { label: 'VIP 2.0', emoji: '<:vip2:1175119308997791744>', description: 'Será definida a Insignia do VIP 2.0', value: 'bvip2' }, 
                            { label: 'VIP 3.0', emoji: '<:vip3:1175119305780760587> ', description: 'Será definida a Insignia do VIP 3.0', value: 'bvip3' }, 
                            { label: 'VIP 4.0', emoji: '<:vip4:1152446097021743115>', description: 'Será definida a Insignia do VIP 4.0', value: 'bvip4' }, 
                            { label: 'VIP 5.0', emoji: '<:vip5:1175128221411455109>', description: 'Será definida a Insignia do VIP 5.0', value: 'bvip5' }, 
                            { label: 'VIP Ruby Prestige', emoji: '<:vip6:1274703071393349817>', description: 'Será definida a Insignia do VIP Ruby Prestige', value: 'bvip6' }, 
                            { label: 'Vip Ruby Vanguard', emoji: '<:vip7:1274703111469924473>', description: 'Será definida a Insignia do VIP Ruby Vanguard', value: 'bvip7' }, 
                            { label: 'Early VIP (Apenas Early)', emoji: '<:vipearly:1191389866479583334>', description: 'Será definida a Insignia do Early VIP 2021', value: 'bvip100' }, 
                            { label: 'Resetar', description: 'Volte a sua Insignia Original!', value: 'bvipreset' },
                            { label: 'Voltar', value: 'voltarmenu' }
                        ]));

            const rowBannerGifs = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Escolha um Gif')
                        .addOptions([
                            { label: 'Blue Galaxy', emoji: '<:coinsgif:1425245772764676167>', description: 'Brilhe como as estrelas!', value: 'bgif1' },
                            { label: 'Fall', emoji: '<:coinsgif:1425245772764676167>', description: 'Folhas caindo suavemente.', value: 'bgif2' },
                            { label: 'Sakura River', emoji: '<:coinsgif:1425245772764676167>', description: 'Chuva de Sakuras! 🌸', value: 'bgif3' },
                            { label: 'Pink Lake', emoji: '<:coinsgif:1425245772764676167>', description: 'Lago rosa mágico!', value: 'bgif4' },
                            { label: 'Asian Life', emoji: '<:coinsgif:1425245772764676167>', description: 'Beleza serena asiática.', value: 'bgif5' },
                            { label: 'Desativar Gif', description: 'Desative o gif de fundo.', value: 'disablegif' },
                            { label: 'Voltar', value: 'voltarmenu' }
                        ])
                );

            const layoutOptions = {
                white: { label: 'White Style', description: 'Layout Clássico da Kosame.', emoji: '1373496156881031208' },
                rose: { label: 'Rose Style', description: 'O Perfeito Layout Rose.', emoji: '1373492068533538876' },
                purple: { label: 'Purple Style', description: 'O Lindo Layout Purple.', emoji: '1373492464488546335' },
                cyan: { label: 'Cyan Style', description: 'O Diferenciado Layout Cyan.', emoji: '1373492320296632513' },
                red: { label: 'Red Style', description: 'Um visual mais vibrante e intenso.', emoji: '1373492649688043601' },
                swampgreen: { label: 'Swamp Green', description: 'Tons naturais e misteriosos.', emoji: '1373492923634683904' },
                yellow: { label: 'Yellow Style', description: 'Layout alegre e iluminado.', emoji: '1373492664892264522' },
                blueriver: { label: 'Blue River', description: 'Um layout tranquilo como um rio.', emoji: '1373492526266449920' },
                pink: { label: 'Pink Style', description: 'Visual fofo e acolhedor.', emoji: '1373492947760185414' },
                darkred: { label: 'Dark Red', description: 'Para quem gosta de um tom mais fechado.', emoji: '1373496601502421083' },
                forestgreen: { label: 'Forest Green', description: 'Verde profundo e elegante.', emoji: '1373493014252753036' },
                blueocean: { label: 'Blue Ocean', description: 'Como o mar aberto.', emoji: '1373494792134066256' },
                black: { label: 'Black Style', description: 'O Famoso Layout Black.', emoji: '1373495092085526568' },
                gray: { label: 'Gray Style', description: 'Neutro e sofisticado.', emoji: '1373495744081952880' },
                wamoled: { label: 'White Amoled', description: 'Um design ainda mais claro.', emoji: '1373495788109566073' },
                amoled: { label: 'Black Amoled', description: 'Um design bem mais escuro.', emoji: '1373495775816056994' },
                gamoled: { label: 'Gray Amoled Style', description: 'Estilo amoled para gamers.', emoji: '1373495802999078952' }
            };

            const row2 = new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Veja Sua Lista de Layouts');

            for (const [key, data] of Object.entries(layoutOptions)) {
                if (uLayout[key]?.has) {
                    row2.addOptions({
                        label: data.label,
                        emoji: data.emoji,
                        description: data.description,
                        value: `${key}style`
                    });
                }
            }

            row2.addOptions({ label: 'Voltar', value: 'voltarmenu' });

            const rowBg = new ActionRowBuilder().addComponents(row2);
            const modal = new ModalBuilder()
                .setCustomId('modalPcf')
                .setTitle('Configuração de Perfil')
                .addComponents([
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('profilebanner')
                            .setLabel('Banner do Perfil [Forneça a URL]')
                            .setMinLength(1)
                            .setValue(user.profile.imagembg = user.profile.imagembg.replace('104.237.11.161','api.phytols.dev'))
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                ]);

            const modalCoins = new ModalBuilder()
                .setCustomId('modalCoins')
                .setTitle('Configuração do Banco')
                .addComponents([
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('coinsbanner')
                            .setLabel('Banner do Coins [Forneça a URL]')
                            .setMinLength(1)
                            .setValue(user.profile.coinsbg.replace('104.237.11.161','api.phytols.dev'))
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                ]);

            const filter = (i) => {
                return i.isStringSelectMenu() && i.message.id === msg.id;
            };
            const msg = await message.reply({ content: `${message.author}`, embeds: [embed], components: [row], fetchReply: true });
            const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

            collector.on('end', () => {
                msg.delete();
            });

            // eslint-disable-next-line require-await
            collector.on('collect', async (collected) => {
                if (collected.user.id !== message.author.id) {
                    return collected.reply({ content: `Eiii ${collected.user}, esse perfil pertence a você!. 👀`, ephemeral: true });
                }

                const value = collected.values[0];
                const layoutKey = value.replace('style', '');
                const selectedLayout = arrayLayout.find(layout => layout.value === value);

                // console.log("Layout Key:", layoutKey);
                // console.log("Selected Layout:", selectedLayout);
                // console.log("User Layout Exists:", user.layouts[layoutKey]);

                if (value === 'opc1') {
                    if (!user.vip.hasVip) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    return collected.showModal(modal);
                } else if (value === 'opc2') {
                    return collected.update({ components: [rowBg], fetchReply: true });
                } else if (value === 'opc3') {
                    if (vip.upgrade < 3) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP 3.0** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    return collected.update({ components: [rowColors], fetchReply: true });
                } else if (value === 'opc5') {
                    if (vip.upgrade < 5) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP 5.0** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    return collected.update({ components: [rowInsigniaVIP], fetchReply: true });
                } else if (value === 'opc6') {
                    if (vip.upgrade < 10) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Onyx** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    return collected.update({ components: [rowBannerGifs], fetchReply: true });
                } else if (value === 'opc4') {
                    if (!user.vip.hasVip) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    return collected.showModal(modalCoins);
                } else if (value === 'bvip1') {
                    user.vip.bLevel = 1;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip1:1175119303222239323> **VIP 1.0**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip2') {
                    user.vip.bLevel = 2;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip2:1175119308997791744> **VIP 2.0**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip3') {
                    user.vip.bLevel = 3;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip3:1175119305780760587> **VIP 3.0**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip4') {
                    user.vip.bLevel = 4;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip4:1152446097021743115> **VIP 4.0**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip5') {
                    user.vip.bLevel = 5;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip5:1175128221411455109> **VIP 5.0**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip6') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **Vip Ruby Prestige+** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    user.vip.bLevel = 6;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip6:1274703071393349817> **VIP Ruby Prestige**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip7') {
                    if (vip.upgrade < 7) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **Vip Ruby Vanguard+** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }
                    user.vip.bLevel = 7;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vip7:1274703111469924473> **Vip Ruby Vanguard**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvip100') {
                    if (!vip.early) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **Early VIP** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
                    }

                    user.vip.bLevel = 100;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a insignia do seu vip como <:vipearly:1191389866479583334> **Early VIP**.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bvipreset') {
                    user.vip.bLevel = 0;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você resetou sua insignia ao Vip Original.`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor1') {
                    user.profile.textcolor = '#2980BA';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Azul/Blue e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor2') {
                    user.profile.textcolor = '#DF2121';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Vermelho/Red e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor3') {
                    if (user.layouts.purple.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout roxo, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#9D21DF';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Roxo/Purple e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor4') {
                    user.profile.textcolor = '#FFB9F0';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Rosa/Rose e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor5') {
                    user.profile.textcolor = '#FF9A3D';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Laranja/Orange e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor6') {
                    if (user.layouts.white.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout branco, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    if (user.layouts.wamoled.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout White Amoled, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#FFFFFF';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Branco/White e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor7') {
                    user.profile.textcolor = '#ffec00';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Amarelo e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor8') {
                    if (user.layouts.black.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout preto, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    if (user.layouts.amoled.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout Amoled, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#000001';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Preta e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor9') {
                    user.profile.textcolor = '#12ff00';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Verde e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor10') {
                    if (user.layouts.cyan.equipped) {
                        return collected.update({ content: `❌ ${message.author}, você está utilizando o layout ciano, portanto não pode equipar esta cor!`, embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#5FF1F0';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Ciano e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor11') {
                    user.profile.textcolor = '#00008B';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Azul Escuro e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor12') {
                    user.profile.textcolor = '#7FFFD4';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Verde Água e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor13') {
                    if (vip.upgrade < 5) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP 5.0** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#ff56e1';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Rosa/Pink e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor14') {
                    if (vip.upgrade < 5) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP 5.0** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#7de94a';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Verde Esmeralda e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor15') {
                    if (vip.upgrade < 5) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP 5.0** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#d9a31f';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Dourado Pérola e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor16') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#323540';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Cinza/Gray e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor17') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#768fe3';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Azul Aurora/Aurora Blue e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor18') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#8B0000';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Vermelho Escuro/Dark Red e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor19') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#c7cffc';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Branco Neve/Snow White e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'cor20') {
                    if (vip.upgrade < 6) {
                        return collected.update({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa cor!', embeds: [], components: [], fetchReply: true });
                    }
                    user.profile.textcolor = '#571553';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você definiu a cor Roxo Escuro/Dark Purple e ela já foi definida em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bgif1') {
                    user.profile.coinsgif = 'https://i.imgur.com/ftpfJFO.gif';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você escolheu o gif *Blue Galaxy* e ele já foi definido em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bgif2') {
                    user.profile.coinsgif = 'https://i.imgur.com/EJE6gR8.gif';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você escolheu o gif *Fall* e ele já foi definido em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bgif3') {
                    user.profile.coinsgif = 'https://i.imgur.com/nfZHtC1.gif';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você escolheu o gif *Sakura River* e ele já foi definido em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bgif4') {
                    user.profile.coinsgif = 'https://i.imgur.com/ImahGQD.gif';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você escolheu o gif *Pink Lake* e ele já foi definido em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'bgif5') {
                    user.profile.coinsgif = 'https://i.imgur.com/ubX0EKC.gif';
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você escolheu o gif *Asian Life* e ele já foi definido em seu perfil!`, embeds: [], components: [], fetchReply: true });
                } else if (value === 'disablegif') {
                    user.profile.coinsgif = null;
                    user.save();
                    return collected.update({ content: `<:kosame_Correct:1010978511839842385> ${message.author}, você desativou o gif de fundo e ele foi removido de seu banco!`, embeds: [], components: [], fetchReply: true });
                } else if (selectedLayout && user.layouts[layoutKey]) {
                    user.profile.layout = selectedLayout.layout;
                    user.profile.textcolor = selectedLayout.textcolor;

                    for (const key of Object.keys(user.layouts)) {
                        user.layouts[key].equipped = false;
                    }
                    user.layouts[layoutKey].equipped = true;
                    await user.save();

                    await collected.update({
                        content: `<:kosame_Correct:1010978511839842385> ${collected.user}, você equipou o layout **${selectedLayout.label}**, ele já foi definido em seu perfil!`,
                        embeds: [],
                        components: [],
                        fetchReply: true
                    });
                } else if (value === 'voltarmenu') {
                    return collected.update({ content: `${message.author}`, embeds: [embed], components: [row], fetchReply: true });
                }
            });
        }

        if (args[0] == 'img') {
            if (!user.vip.hasVip) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
            }

            const bgi = args.slice(1).join(' ');

            if (!bgi) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você não inseriu nenhuma imagem!' });
            } else if (bgi.length > 300) {
                return message.reply({ content: '<:emoji_012:839153898774069268> O url inserido é muito grande, tente com um url menor!' });
            } else if (bgi.length < 2) {
                return message.reply({ content: '<:emoji_012:839153898774069268> O url inserido não é válido!' });
            } else if (!regex.test(bgi)) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você não forneceu uma URL válida para o banner!' });
            } else if (bgi == user.profile.imagembg) {
                return message.reply({ content: '<:emoji_012:839153898774069268> A imagem inserida é a mesma setada atualmente!' });
            } else {
                const bgFormatted = convertWebpToPng(bgi);
                let newImageUrl;
                if (bgFormatted.includes('imgur.com')) {
                    newImageUrl = bgFormatted;
                } else {
                    console.log('Link não é do Imgur, realizando upload.');
                    newImageUrl = await uploadImageFromUrl(bgFormatted); // Usa a função de upload
                }
                message.reply({ content: '<:kosame_Correct:1010978511839842385> O seu background de perfil foi alterado com sucesso!' });
                await this.client.database.users.findOneAndUpdate(
                    { idU: message.author.id },
                    { $set: { 'profile.imagembg': newImageUrl } }
                );
            }

            return;
        }

        if (args[0] == 'avatar') {
            if (user.vip.upgrade < 6) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
            }

            const bg = args.slice(1).join(' ');

            if (!bg) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você não inseriu nenhuma imagem!' });
            } else if (bg.length > 300) {
                return message.reply({ content: '<:emoji_012:839153898774069268> O url inserido é muito grande, tente com um url menor!' });
            } else if (bg.length < 2) {
                return message.reply({ content: '<:emoji_012:839153898774069268> O url inserido não é válido!' });
            } else if (!regex.test(bg)) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você não forneceu uma URL válida para o banner!' });
            } else if (bg == user.profile.customAv) {
                return message.reply({ content: '<:emoji_012:839153898774069268> A imagem inserida é a mesma setada atualmente!' });
            } else {

                const bgFormatted = convertWebpToPng(bg);
                let newImageUrl;
                if (bgFormatted.includes('imgur.com')) {
                    newImageUrl = bgFormatted;
                } else {
                    console.log('Link não é do Imgur, realizando upload.');
                    newImageUrl = await uploadImageFromUrl(bgFormatted); // Usa a função de upload
                }

                message.reply({ content: '<:kosame_Correct:1010978511839842385> O seu avatar de perfil foi alterado com sucesso!' });
                await this.client.database.users.findOneAndUpdate(
                    { idU: message.author.id },
                    { $set: { 'profile.customAv': newImageUrl } }
                );
            }

            return;
        }

        if (args[0] == 'reset') {
            if (user.vip.upgrade < 6) {
                return message.reply({ content: '<:emoji_012:839153898774069268> Você precisar ser **VIP Ruby** para utilizar essa opção!', embeds: [], components: [], fetchReply: true });
            }

            message.reply({ content: '<:kosame_Correct:1010978511839842385> O seu avatar de perfil foi resetado com sucesso!' });
            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { 'profile.customAv': 'null' } }
            );

            return;
        }
    }
};


function convertWebpToPng(url) {
    return url.replace(/(?<=\bformat=)webp\b/, 'png');
}

async function uploadImageFromUrl(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const formData = new FormData();
        formData.append('image', Buffer.from(response.data), 'image.png');
        const uploadResponse = await axios.post('http://104.237.11.161/cdn/upload', formData, { headers: formData.getHeaders() });
        return uploadResponse.data;
    } catch (error) {
        throw error;
    }
}
