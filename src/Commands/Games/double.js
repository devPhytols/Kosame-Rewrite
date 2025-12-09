/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class DoubleCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'double';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '💸 Economia';
        this.description = 'Multiplicador para enriquecer na Kosame.';
        this.config = {
            registerSlash: false
        };
        this.options = [
            {
                name: 'quantidade',
                description: 'Quantidade de moedas que deseja multiplicar.',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 */
    async commandExecute({ message, args }) {
        const USER = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        const uSrc = await this.client.database.users.findOne({ idU: message.author.id });

        // Cooldown
        let cooldown = 45000;
        let pay = uSrc.double;
        let time = cooldown - (Date.now() - pay);

        const EMBED1 = new ClientEmbed()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, Aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace("minsuto", "minutos")}** para utilizar o multiplicador novamente!`);

        if (pay !== null && cooldown - (Date.now() - pay) > 0) {
            return message.reply({ embeds: [EMBED1] })
        }

        const money = await Util.notAbbrev(args[0]);
        const money2 = await Util.notAbbrev(args[1]);
        const oldBank = uSrc.bank;

        // Multiplicador
        const roxo = money * 2;
        const preto = money * 2;
        const branco = money * 4;

        // function sortearCores() {
        //     const cores = ['Roxo', 'Roxo', 'Branco', 'Roxo', 'Preto', 'Branco', 'Roxo', 'Branco'];
        //     const corSorteada = Math.floor(Math.random() * cores.length);
        //     return cores[corSorteada];
        // }
        function sortearCores() {
            const cores = [
                'Roxo', 'Roxo', 'Preto', 'Roxo','Preto','Roxo','Preto','Roxo','Roxo', // 4 chances de 'Roxo'
                'Preto', 'Preto', 'Roxo', 'Roxo','Preto','Preto',      // 3 chances de 'Preto'
                'Branco'                        // 1 chance de 'Branco'
            ];
            let coresRecentes = [];
        
            return function() {
                let corSorteada;
                do {
                    corSorteada = cores[Math.floor(Math.random() * cores.length)];
                } while (coresRecentes.includes(corSorteada) && coresRecentes.length < cores.length);
        
                coresRecentes.push(corSorteada);
                if (coresRecentes.length > 2) {
                    coresRecentes.shift();
                }
        
                return corSorteada;
            };
        }

        const sortear = sortearCores();

        if (!USER) {

            if (String(money) === 'NaN'){
                return message.reply({ content: `${message.author}, o valor fornecido é inválido.` });
            } else if (money < 1000) {
                return message.reply({ content: `${message.author}, você não pode multiplicar menos que 1000 Coins.` });
            } else if (money > 2000000) {
                return message.reply({ content: `${message.author}, o dinheiro não pode ser maior que 2M Coins.` });
            } else if (money > uSrc.bank) {
                return message.reply({ content: `${message.author}, você não possui essa quantia de coins!` });
            } else if (uSrc.blockpay) {
                return message.reply(`Você está com uma transação em andamento! Finalize...`)
            } else if (uSrc.blockbet) {
                return message.reply(`Você está com uma transação em andamento! Finalize...`)
            }

            uSrc.set({
                blockpay: true,
                blockbet: true
            });
            uSrc.save();

            const corFinal = sortear();  
            //console.log(corFinal);
            const Embed = new ClientEmbed()
                .setColor('#edb021')
                .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`Valor Apostado: **${money} Coins (${Util.toAbbrev(Math.floor(money))})**.\n\nLucros:\n<:purplep:1151287162088734770> Roxo 2x **(${Util.toAbbrev(Math.floor(roxo))})**\n<:blackp:1151287583549161572> Preto 2x **(${Util.toAbbrev(Math.floor(preto))})**\n<:whitep:1151287580797706261> Branco 4x **(${Util.toAbbrev(Math.floor(branco))})**\n\n<:kosame_exclamation:1089663586831450153> Caso perca, você perderá o dobro do valor que lançou!`)
                .setImage('https://i.imgur.com/WPjJOMh.png');
    
            let imgLoserGif;
            let imgLoser;
            let Embed2 = new ClientEmbed()
                .setColor('#edb021')
                .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() });
                //.setThumbnail('https://cdn.discordapp.com/attachments/1051624179608338442/1095038934750343350/1040260.png');
    
            const roxoButton = new ButtonBuilder()
                .setCustomId('Roxo')
                .setLabel('Roxo')
                .setEmoji('<:purplep:1151287162088734770>')
                .setStyle(ButtonStyle.Secondary);
            const pretoButton = new ButtonBuilder()
                .setCustomId('Preto')
                .setLabel('Preto')
                .setEmoji('<:blackp:1151287583549161572>')
                .setStyle(ButtonStyle.Secondary);
            const brancoButton = new ButtonBuilder()
                .setCustomId('Branco')
                .setLabel('Branco')
                .setEmoji('<:whitep:1151287580797706261>')
                .setStyle(ButtonStyle.Secondary);
    
            const buttonRow = new ActionRowBuilder().addComponents([roxoButton, pretoButton, brancoButton]);
    
            const msg = await message.reply({ 
                content: `${message.author}, escolha uma cor.`,
                embeds: [Embed], 
                components: [buttonRow] 
            });
    
            const filter = (i) => {
                return i.isButton() && i.message.id === msg.id;
            };
            const doubleCollector = msg.createMessageComponentCollector({ filter, time: 30000 });

            doubleCollector.on('end', async (c, r) => {
                    uSrc.set({
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();
            });
    
            doubleCollector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
                }
    
                if (i.customId == 'Roxo' && corFinal === 'Roxo') {
                    Embed2.setDescription(`${message.author} Estou roletando a aposta...\nCoins Apostados: **${money} (${Util.toAbbrev(Math.floor(money))})**`);
                    Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297964314505226/GIF_EVENTO_ROLETA2_KOSAME.gif');
                    await i.message.edit({ 
                        embeds: [Embed2],
                        components: [] 
                    });
                    setTimeout(() => {
                        Embed2.setDescription(`${corFinal}\n${message.author} Meus parabéns! Você escolheu a cor Roxo e acertou!\nSeu banco: **${Math.floor(oldBank + roxo)} (${Util.toAbbrev(Math.floor(oldBank + roxo))})**`);
                        Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297964725534730/IMG_GIF_EVENTO_ROLETA2_KOSAME.png');
                        return i.message.edit({ 
                            embeds: [Embed2],
                            components: [] 
                        });
                    }, 7000);
                    uSrc.set({
                        bank: uSrc.bank + roxo,
                        double: Date.now(),
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();
                    await checkAndCorrectBalance(this.client, message.author.id, oldBank + roxo );
                } else if (i.customId == 'Preto' && corFinal === 'Preto') {
                    Embed2.setDescription(`${message.author} Estou roletando a aposta...\nCoins Apostados: **${money} (${Util.toAbbrev(Math.floor(money))})**`);
                    Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297962095706173/GIF_EVENTO_ROLETA_KOSAME.gif');
                    await i.message.edit({ 
                        embeds: [Embed2],
                        components: [] 
                    });
                    setTimeout(() => {
                        Embed2.setDescription(`${corFinal}\n${message.author} Meus parabéns! Você escolheu a cor Preto e acertou!\nSeu banco: **${Math.floor(oldBank + preto)} (${Util.toAbbrev(Math.floor(oldBank + preto))})**`);
                        Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297963517587506/IMG_GIF_EVENTO_ROLETA_KOSAME.png');
                        return i.message.edit({ 
                            embeds: [Embed2],
                            components: [] 
                        });
                    }, 7000);
                    uSrc.set({
                        bank: uSrc.bank + preto,
                        double: Date.now(),
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();
                    await checkAndCorrectBalance(this.client, message.author.id, oldBank + preto );
                } else if (i.customId == 'Branco' && corFinal === 'Branco') {
                    Embed2.setDescription(`${message.author} Estou roletando a aposta...\nCoins Apostados: **${money} (${Util.toAbbrev(Math.floor(money))})**`);
                    Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297962947158047/GIF_EVENTO_ROLETA3_KOSAME.gif');
                    await i.message.edit({ 
                        embeds: [Embed2],
                        components: [] 
                    });
                    setTimeout(() => {
                        Embed2.setDescription(`${corFinal}\n${message.author} Meus parabéns! Você escolheu a cor Branco e acertou!\nSeu banco: **${Math.floor(oldBank + branco)} (${Util.toAbbrev(Math.floor(oldBank + branco))})**`);
                        Embed2.setImage('https://cdn.discordapp.com/attachments/1138297565079670904/1138297963823759451/IMG_GIF_EVENTO_ROLETA3_KOSAME.png');
                        return i.message.edit({ 
                            embeds: [Embed2],
                            components: [] 
                        });
                    }, 7000);
                    uSrc.set({
                        bank: uSrc.bank + branco,
                        double: Date.now(),
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();
                    await checkAndCorrectBalance(this.client, message.author.id, oldBank + branco );
                } else {
                    // Imagens em GIF
                    if (corFinal === 'Branco') imgLoserGif = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297962947158047/GIF_EVENTO_ROLETA3_KOSAME.gif';
                    if (corFinal === 'Preto') imgLoserGif = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297962095706173/GIF_EVENTO_ROLETA_KOSAME.gif';
                    if (corFinal === 'Roxo') imgLoserGif = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297964314505226/GIF_EVENTO_ROLETA2_KOSAME.gif';
                    // Imagens Estáticas
                    if (corFinal === 'Branco') imgLoser = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297963823759451/IMG_GIF_EVENTO_ROLETA3_KOSAME.png';
                    if (corFinal === 'Preto') imgLoser = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297963517587506/IMG_GIF_EVENTO_ROLETA_KOSAME.png';
                    if (corFinal === 'Roxo') imgLoser = 'https://cdn.discordapp.com/attachments/1138297565079670904/1138297964725534730/IMG_GIF_EVENTO_ROLETA2_KOSAME.png';
    
                    Embed2.setDescription(`${message.author} Estou roletando a aposta...\nCoins Apostados: **${money} (${Util.toAbbrev(Math.floor(money))})**`);
                    Embed2.setImage(`${imgLoserGif}`);
                    await i.message.edit({ 
                        embeds: [Embed2],
                        components: [] 
                    });
                    setTimeout(() => {
                        Embed2.setDescription(`\n${message.author} Você perdeu! Você escolheu a cor ${i.customId} e caiu ${corFinal}!\nCoins Perdidos: **${money} (${Util.toAbbrev(Math.floor(money))})**`);
                        Embed2.setImage(`${imgLoser}`);
                        return i.message.edit({ 
                            embeds: [Embed2],
                            components: [] 
                        });
                    }, 7000);
                    uSrc.set({
                        bank: uSrc.bank - money * 2,
                        double: Date.now(),
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();
                    await checkAndCorrectBalance(this.client, message.author.id, oldBank - money * 2 );

                    const correctionNegative = await this.client.database.users.findOne({ idU: message.author.id });
                    const fixBank = correctionNegative.bank;

                    if (fixBank < 0) {
                        uSrc.set({
                            bank: 0,
                            blockpay: false,
                            blockbet: false
                        });
                        await uSrc.save();
                    }
                }
            });
    
        } 
        // {
        //     const corFinal = sortearCores();  
        //     console.log(corFinal);
        //     const Embed = new ClientEmbed()
        //         .setColor('#edb021')
        //         .setAuthor({ name: `${message.author.username} VS ${USER.username}`, iconURL: message.author.displayAvatarURL() })
        //         .setDescription(`Valor Apostado: **${money2} Coins (${Util.toAbbrev(Math.floor(money2))})**.\n\nCores:\n<:purplep:1151287162088734770> Roxo\n<:blackp:1151287583549161572> Preto\n<:whitep:1151287580797706261> Branco`)
        //         .setImage('https://i.imgur.com/WPjJOMh.png');
    
        //     let imgLoserGif;
        //     let imgLoser;
        //     let Embed2 = new ClientEmbed()
        //         .setColor('#edb021')
        //         .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    
        //     const roxoButton = new ButtonBuilder()
        //         .setCustomId('Roxo')
        //         .setLabel('Roxo')
        //         .setEmoji('<:purplep:1151287162088734770>')
        //         .setStyle(ButtonStyle.Secondary);
        //     const pretoButton = new ButtonBuilder()
        //         .setCustomId('Preto')
        //         .setLabel('Preto')
        //         .setEmoji('<:blackp:1151287583549161572>')
        //         .setStyle(ButtonStyle.Secondary);
        //     const brancoButton = new ButtonBuilder()
        //         .setCustomId('Branco')
        //         .setLabel('Branco')
        //         .setEmoji('<:whitep:1151287580797706261>')
        //         .setStyle(ButtonStyle.Secondary);
    
        //     const buttonRow = new ActionRowBuilder().addComponents([roxoButton, pretoButton, brancoButton]);
    
        //     const msg = await message.reply({ 
        //         content: ` ${message.author} é a sua vez! Escolha uma cor.`,
        //         embeds: [Embed], 
        //         components: [buttonRow] 
        //     });

        //     const filter = (i) => {
        //         return i.isButton() && i.message.id === msg.id;
        //     };
        //     const doubleUser1 = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });
        //     const doubleUser2 = msg.createMessageComponentCollector({ filter, time: 120000, max: 1 });
    
        //     doubleUser1.on('collect', async (i) => {
        //         if (i.user.id !== message.author.id) {
        //             return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
        //         }

        //         await i.message.edit({

        //         });

        //     });

        //     doubleUser2.on('collect', async (i) => {
        //         if (i.user.id !== USER.id) {
        //             return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
        //         }

        //     });
        // }
    }
};