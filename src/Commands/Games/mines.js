/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { createCanvas, loadImage } = require('canvas');
const { Util } = require('../../Utils/Util');

module.exports = class MinesCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'mines';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Tente a sorte multiplicando seus ganhos.';
        this.cooldown = 60;
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
        // VERIFICAÇÕES TEMPO CONTA + ADICIONAIS //
        const accAge = Math.abs(Date.now() - message.author.createdAt);
        const accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));
        if (accDays <= 30) {
            return message.reply({ content: 'Eii, a sua conta é muito nova para transferir coins, aguarde alguns dias e junte suas economias!' });
        }
        // CONFIGURAÇÕES PERSONALIZÁVEIS
        const Apostador = await this.client.database.users.findOne({ idU: message.author.id });
        const GRID_SIZE = 4;
        const CELL_SIZE = 100;
        const PADDING = 20;
        const CORNER_RADIUS = 15;
        var SHOW_HIDDEN = false; // Ative para mostrar células não reveladas com opacidade
        const HIDDEN_OPACITY = 0.3; // Opacidade das células não reveladas (0 a 1)
        // VERIFICAÇÃO DE TRANSAÇÃO
        if (Apostador.Exp.level < 6) {
            return message.reply('Você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.');
        }
        if (Apostador.blockpay) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }
        if (Apostador.blockbet) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }
        // Cores personalizáveis (código HEX)
        const COLORS = {
            BACKGROUND: '#1a1a2e',
            CELL_HIDDEN: '#0f3460',
            CELL_EMPTY: '#1a1a2e',
            CELL_DIAMOND: '#00ff9d',
            CELL_BOMB: '#ff2e63'
        };

        const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * PADDING;
        const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * PADDING;

        async function drawGame(revealedCells, cellContent) {
            const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');
        
            // Carregar imagens
            let diamondImg, bombImg;
            try {
                diamondImg = await loadImage('https://cdn.discordapp.com/emojis/1368600947974213733.png');
                bombImg = await loadImage('https://cdn.discordapp.com/emojis/1368604975097315418.png');
            } catch (error) {
                console.error('Erro ao carregar imagens:', error);
                return;
            }
        
            // Fundo
            ctx.fillStyle = COLORS.BACKGROUND;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
            // Função para desenhar célula com opacidade
            function drawCell(x, y, color, opacity = 1.0) {
                ctx.save();
                ctx.globalAlpha = opacity;

                ctx.beginPath();
                ctx.moveTo(x + CORNER_RADIUS, y);
                ctx.lineTo(x + CELL_SIZE - CORNER_RADIUS, y);
                ctx.quadraticCurveTo(x + CELL_SIZE, y, x + CELL_SIZE, y + CORNER_RADIUS);
                ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - CORNER_RADIUS);
                ctx.quadraticCurveTo(x + CELL_SIZE, y + CELL_SIZE, x + CELL_SIZE - CORNER_RADIUS, y + CELL_SIZE);
                ctx.lineTo(x + CORNER_RADIUS, y + CELL_SIZE);
                ctx.quadraticCurveTo(x, y + CELL_SIZE, x, y + CELL_SIZE - CORNER_RADIUS);
                ctx.lineTo(x, y + CORNER_RADIUS);
                ctx.quadraticCurveTo(x, y, x + CORNER_RADIUS, y);
                ctx.closePath();

                ctx.fillStyle = color;
                ctx.fill();
                ctx.restore();
            }
        
            // Desenhar todas as células primeiro (para camada de fundo)
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const cellX = PADDING + x * (CELL_SIZE + PADDING);
                    const cellY = PADDING + y * (CELL_SIZE + PADDING);

                    if (SHOW_HIDDEN) {
                        // Desenhar todas as células com opacidade reduzida
                        let color;
                        switch(cellContent[y][x]) {
                            case 'diamond': color = COLORS.CELL_DIAMOND; break;
                            case 'bomb': color = COLORS.CELL_BOMB; break;
                            default: color = COLORS.CELL_EMPTY;
                        }
                        drawCell(cellX, cellY, color, HIDDEN_OPACITY);
                    }

                    // Desenhar célula não revelada por cima (se não estiver revelada)
                    if (!revealedCells[y][x]) {
                        drawCell(cellX, cellY, COLORS.CELL_HIDDEN);
                    }
                }
            }
        
            // Desenhar conteúdo das células reveladas (em cima)
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (revealedCells[y][x]) {
                        const cellX = PADDING + x * (CELL_SIZE + PADDING);
                        const cellY = PADDING + y * (CELL_SIZE + PADDING);

                        // Cor da célula revelada
                        let color;
                        switch(cellContent[y][x]) {
                            case 'diamond': color = COLORS.CELL_DIAMOND; break;
                            case 'bomb': color = COLORS.CELL_BOMB; break;
                            default: color = COLORS.CELL_EMPTY;
                        }
                        drawCell(cellX, cellY, color);

                        // Ícones
                        if (cellContent[y][x] === 'diamond') {
                            const imgSize = CELL_SIZE * 0.6;
                            ctx.drawImage(
                                diamondImg, 
                                cellX + (CELL_SIZE - imgSize)/2, 
                                cellY + (CELL_SIZE - imgSize)/2, 
                                imgSize, 
                                imgSize
                            );
                        } else if (cellContent[y][x] === 'bomb') {
                            const imgSize = CELL_SIZE * 0.5;
                            ctx.drawImage(
                                bombImg, 
                                cellX + (CELL_SIZE - imgSize)/2, 
                                cellY + (CELL_SIZE - imgSize)/2, 
                                imgSize, 
                                imgSize
                            );
                        }
                    } else if(SHOW_HIDDEN) {
                        // Desenhar todas as Celtulas com opacidade reduzida
                        let color;
                        const cellX = PADDING + x * (CELL_SIZE + PADDING);
                        const cellY = PADDING + y * (CELL_SIZE + PADDING);
                        switch(cellContent[y][x]) {
                            case 'diamond': color = COLORS.CELL_DIAMOND; break;
                            case 'bomb': color = COLORS.CELL_BOMB; break;
                            default: color = COLORS.CELL_EMPTY;
                        }
                        const imgSize = CELL_SIZE * 0.5;
                        ctx.save();
                        ctx.globalAlpha = HIDDEN_OPACITY;
                        ctx.drawImage(
                            cellContent[y][x] === 'bomb' ? bombImg : diamondImg, 
                            cellX + (CELL_SIZE - imgSize)/2, 
                            cellY + (CELL_SIZE - imgSize)/2, 
                            imgSize, 
                            imgSize
                        );
                        ctx.restore();
                    }
                }
            }
        
            // Salvar imagem
            const buffer = canvas.toBuffer('image/png');
            return buffer;
        }

        var calMult = (bombs, selecoes) => {
            var totalCasas = 16;
            let multiplicador = 1;
            
            for (let i = 0; i < selecoes; i++) {
                var casasRestantes = totalCasas - i;
                var bombasRestantes = bombs;
                
                var chanceSegura = (casasRestantes - bombasRestantes) / casasRestantes;
                multiplicador *= (1 / chanceSegura) * 0.85;
            }
            
            return multiplicador.toFixed(2);
        };
        if (!args[0] || isNaN(!args[0])) return message.reply({ embeds: [new EmbedBuilder().setColor('#ffffff').setTitle('Mines').setDescription('Modo de usar: `!mines <valor> (bombas)`')] });
        var valor = Util.notAbbrev(args[0]);
        if (Apostador.Exp.level < 6) return message.reply({ content: `Você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.` });
        if (Apostador.bank < valor) return message.reply({ content: `${message.author}, você não possui coins suficientes para realizar essa aposta!` });
        if (Apostador.jogodavelha) return message.reply({ content: `Eiii, acho que ${message.author.tag} tem uma transferência em aberto!` });
        if (String(valor) === 'NaN') return message.reply({ content: `${message.author}, o dinheiro é inválido.` });
        if (valor > 1000000000) return message.reply({ content: `${message.author}, O valor máximo para essa aposta é de **1B** Coins.` });
        if (valor <= 0) return message.reply({ content: `${message.author}, dinheiro menor ou igual a 0` });
        var countBombs = parseInt(args[1]) || 4;
        if (countBombs > 14) return message.reply({ content: `${message.author}, a quantia máxima é de **14** bombas!` });
        if (countBombs < 4) return message.reply({ content: `${message.author}, a quantia minima é de **4** bombas!` });
        var totalDiamonds = 16 - countBombs;
        var bombs = [];
        for (let i = 0; i < countBombs; i++) {
            let ind = parseInt(Math.random() * 16);
            while (bombs.includes(ind)) ind = parseInt(Math.random() * 16);
            bombs.push(ind);
        }
        
        var row = [];
        for (let i = 0; i < 16; i += 4) {
            row.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn${i}`).setEmoji('1338631561930608671').setStyle('Secondary'),
                new ButtonBuilder().setCustomId(`btn${i + 1}`).setEmoji('1338631561930608671').setStyle('Secondary'),
                new ButtonBuilder().setCustomId(`btn${i + 2}`).setEmoji('1338631561930608671').setStyle('Secondary'),
                new ButtonBuilder().setCustomId(`btn${i + 3}`).setEmoji('1338631561930608671').setStyle('Secondary')
            ));
        }
        var buttons = [];
        row.forEach(r => buttons.push(...r.components));
        
        let ind = 0;
        var abbrev = (num, precision = 2) => {
            const suffsFromZeros = {
                0: '',
                3: 'K',
                6: 'M',
                9: 'B',
                12: 'T'
            };
            let number = parseInt(num);
            const {
                length
            } = number.toString();
            const lengthThird = length % 3;
            const divDigits = length - (lengthThird || lengthThird + 3);
            const calc = '' + (number / (10 ** divDigits)).toFixed(precision);
  
            return number < 1000 ? '' + number : (calc.indexOf('.') === calc.length - 3 ? calc.replace(/.00/, '') : calc) + suffsFromZeros[divDigits];
        };
        var newButton = (s) => new ButtonBuilder()
            .setLabel(' ')
            .setEmoji(s ? '1368604975097315418' : '1368600947974213733')
            .setCustomId(`nada${ind}`)
            .setStyle(s ? 'Danger' : 'Success')
            .setDisabled(true);
        var newButton2 = (s) => new ButtonBuilder()
            .setLabel(' ')
            .setEmoji(s ? '1368604975097315418' : '1368600947974213733')
            .setCustomId(`nada${ind}`)
            .setStyle('Secondary')
            .setDisabled(true);
        
        var emb = new EmbedBuilder()
            .setColor('#ffffff')
            .setAuthor({
                name: `Mines | ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`**Aposta**: ${valor.toLocaleString('pt')} **(${Util.toAbbrev(valor)})**\n**Minas**: ${countBombs}`);
        
        var revealButtons = () => {
            for (let o = 0; o < 16; o++) {
                ind++;
                if (bombs.includes(o)) cellContent[parseInt(o / 4)][parseInt(o % 4)] = 'bomb';
                if (!buttons[o].data.custom_id.includes('nada')) buttons[o] = newButton2(bombs.includes(parseInt(buttons[o].data.custom_id.slice(3))) ? true : false);
            }
        };
        
        var sacbtn = (v, type) => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('sacar').setLabel(`${type == 'lose' ? 'Perdeu' : type == 'win' ? 'Ganhou' : 'Sacar'} (${abbrev(type == 'lose' ? valor : v, 1)})`).setStyle(type == 'lose' ? 'Danger' : 'Success').setDisabled(v == 0 || type == 'lose' || type == 'win' ? true : false).setEmoji(type == 'lose' ? '💥' : type == 'win' ? '1089754956321542234' : '842202378761666561'),
            new ButtonBuilder().setLabel('Regras').setEmoji('1006724085549650000').setCustomId('minestherules').setStyle('Secondary')
        );
        var multiplicador;
        let cellContent = [['empty', 'empty', 'empty', 'empty'], ['empty', 'empty', 'empty', 'empty'], ['empty', 'empty', 'empty', 'empty'], ['empty', 'empty', 'empty', 'empty']];
        let revealedCells = [[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]];
        let img = await drawGame(revealedCells, cellContent);
        let attachment = new AttachmentBuilder(img, { name: 'mines.png' });
        emb.setImage('attachment://mines.png');
        message.channel.send({ embeds:[emb], components: [...row, sacbtn(0)], files: [attachment] }).then(msg => {
            var filter = (i) => i.user.id == message.author.id;
            var collector = msg.createMessageComponentCollector({ filter, idle: 180000 });
            collector.on('collect', async (i) => {
                // if (i.customId == 'sacar') {
                //     return;
                // }
                if (i.customId == 'sacar') {
                    await i.deferUpdate().catch(e => {});

                    // Mensagens principais ao sacar
                    const mensagensSaque = [
                        'Você decidiu parar. Sabedoria ou medo? <a:trevo:1368014150089052160>',
                        'Saque feito! Que tal tentar novamente mais tarde?',
                        'Parada estratégica! 🧠 Às vezes parar é vencer.',
                        'Você se retirou com estilo! 💼 Lucro garantido.'
                    ];
                    // Ajusta o Pagamento
                    const lucro = Math.floor(valor * multiplicador) - valor;
                    // Realiza o Pagamento
                    await this.client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $inc: { bank: lucro }
                        }
                    );
                    // Escolher aleatoriamente uma mensagem principal
                    const msgPrincipal = mensagensSaque[Math.floor(Math.random() * mensagensSaque.length)];

                    // Mensagem adicional com os valores
                    const msgAdicional = `<:coins_:1368607294476259489> Você retirou ${(valor * multiplicador).toLocaleString('pt')} **(${Util.toAbbrev((valor * multiplicador))})**. A sorte esteve do seu lado!`;

                    emb.setColor('Green')
                        .setDescription(`${msgPrincipal}\n\n-# ${msgAdicional}`);

                    collector.stop('win');
                    return;
                }
                if (bombs.includes(parseInt(i.customId.slice(3)))) {
                    let b = buttons.findIndex(x => x.data.custom_id == i.customId);
                    buttons[b] = newButton(true);
                    revealButtons();
                    SHOW_HIDDEN = true;
                    COLORS.BACKGROUND = '#9c3636';
                    COLORS.CELL_HIDDEN = '#7a2a2a';
                    revealedCells[parseInt(i.customId.slice(3) / 4)][parseInt(i.customId.slice(3)) % 4] = true;

                    // Mensagens de derrota
                    const mensagensDerrota = [
                        'Explosão! 💥 Seu trevo não deu sorte dessa vez.',
                        '<:ksm_bombt:1368604975097315418> Puff! A sorte acabou por aqui. Tente novamente!',
                        'Kaboom! <:ksm_bombt:1368604975097315418> Você pisou onde não devia.',
                        'Você foi pelos ares! 😬 Que azar.'
                    ];

                    // Realiza o Pagamento
                    await this.client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $inc: { bank: -valor }
                        }
                    );

                    // Seleciona uma mensagem aleatória
                    const msgDerrota = mensagensDerrota[Math.floor(Math.random() * mensagensDerrota.length)];

                    // Mensagem adicional
                    const msgAdicional = `Você apostou ${valor.toLocaleString('pt')} **(${Util.toAbbrev(valor)})** e infelizmente perdeu. Confira o mapa para ver onde estavam as minas.`;

                    emb.setColor('#ff0000')
                        .setDescription(`${msgDerrota}\n\n-# ${msgAdicional}`);

                    await i.deferUpdate().catch(e => {});
                    collector.stop('lose');
                    return;
                } else {
                    let b = buttons.findIndex(x => x.data.custom_id == i.customId);
                    buttons[b] = newButton(false);
                    let dimas = buttons.filter(a => a.data.style == 3).length;
                    let diamantes = 16 - dimas - countBombs;
                    ind++;
                    multiplicador = calMult(countBombs, dimas);
                    cellContent[parseInt(i.customId.slice(3) / 4)][parseInt(i.customId.slice(3)) % 4] = 'diamond';
                    revealedCells[parseInt(i.customId.slice(3) / 4)][parseInt(i.customId.slice(3)) % 4] = true;
                    if(totalDiamonds == dimas) {
                        await i.deferUpdate().catch(e => {});
                        emb.setColor('Green').setDescription(`## Fim de jogo!\n**Aposta**: ${valor.toLocaleString('pt')}\n**Lucros**: ${((valor * multiplicador) - valor).toLocaleString('pt')}`);
                        collector.stop('win');
                        return;
                    }
                    emb.setDescription(`**Aposta**: ${valor.toLocaleString('pt')} **(${Util.toAbbrev(valor)})**\n**Minas**: ${countBombs}\n**Possível ganho**: ${(valor * multiplicador).toLocaleString('pt')} **(${Util.toAbbrev((valor * multiplicador))})**\n**Multiplicador atual**: ${multiplicador}x\n**Trevos encontrados**: ${dimas}`);
                }
                row = [];
                for (let p = 0; p < 16; p += 4) {
                    row.push(new ActionRowBuilder().addComponents(buttons[p], buttons[p + 1], buttons[p + 2], buttons[p + 3]));
                }
                let img = await drawGame(revealedCells, cellContent);
                let attachment = new AttachmentBuilder(img, { name: 'mines.png' });
                emb.setImage('attachment://mines.png');
                await i.update({ embeds:[emb], components: [...row, sacbtn(valor * multiplicador)], files: [attachment] }).catch(e => {});
            });
            collector.on('end', async (collected, reason) => {
                if (reason == 'lose') {
                    row = [];
                    for (let p = 0; p < 16; p += 4) {
                        row.push(new ActionRowBuilder().addComponents(buttons[p], buttons[p + 1], buttons[p + 2], buttons[p + 3]));
                    }
                    let img = await drawGame(revealedCells, cellContent);
                    let attachment = new AttachmentBuilder(img, { name: 'mines.png' });
                    emb.setImage('attachment://mines.png');
                    return msg.edit({ embeds: [emb], components: [...row, sacbtn(valor * multiplicador, 'lose')], files: [attachment] });
                }
                if (reason == 'win') {
                    row = [];
                    for (let p = 0; p < 16; p += 4) {
                        row.push(new ActionRowBuilder().addComponents(buttons[p], buttons[p + 1], buttons[p + 2], buttons[p + 3]));
                    }
                    for(let a = 0; a < 16; a++) {
                        if(bombs.includes(a)) cellContent[parseInt(a / 4)][parseInt(a % 4)] = 'bomb';
                    }
                    COLORS.BACKGROUND = '#29b37e';
                    COLORS.CELL_HIDDEN = '#239167';
                    SHOW_HIDDEN = true;
                    let img = await drawGame(revealedCells, cellContent);
                    let attachment = new AttachmentBuilder(img, { name: 'mines.png' });
                    emb.setImage('attachment://mines.png');
                    return msg.edit({ embeds: [emb], components: [...row, sacbtn(valor * multiplicador, 'win')], files: [attachment] });
                }
            });
        });
    }
};
