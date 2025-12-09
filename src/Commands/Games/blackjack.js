/* eslint-disable no-inner-declarations */
/* eslint-disable no-empty */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable require-await */
/* eslint-disable no-redeclare */
const { ApplicationCommandType, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const talkedRecently = new Set();

module.exports = class BlackjackCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'blackjack';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '💸 Economia';
        this.description = 'Aposte em uma partida de blackjack.';
        this.cooldown = 40;
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
        let valor = await Util.notAbbrev(args[0]);
        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        if (user) valor = await Util.notAbbrev(args[1]);
        if (!valor || isNaN(valor) || valor <= 0) return message.reply({ content: `${message.author}, o valor fornecido é inválido.` });
        if (valor < 10000) return message.reply('Você não pode apostar menos que **10K** coins!');
        if (valor > 500000000) return message.reply('Você não pode apostar mais que **500M** coins!');
        var color = '#ffffff';
        valor = parseInt(valor);
        var mensagem = await message.channel.send('Estou iniciando a partida...');
        var finished = false;
        let cannotDouble = false;
        let roundUser = message.author.id;

        const usersCol = this.client.database.users;
        const authorId = message.author.id;
        const opponentId = user ? user.id : null;

        async function getUserBalance(idU) {
            const doc = await usersCol.findOne({ idU: idU });
            return doc ? (doc.bank || 0) : 0;
        }
        async function incBalance(idU, amount) {
            await usersCol.updateOne({ idU: idU }, { $inc: { bank: amount } });
        }
        async function setBetFlags(idU, status) {
            await usersCol.updateOne({ idU }, { $set: { blockbet: status, blockpay: status } });
        }

        // Basic validations
        if (opponentId && opponentId === authorId)
            return message.reply('Você não pode apostar contra você mesmo.');
        if (user && user.bot)
            return message.reply('Você não pode desafiar um bot.');

        // Check ongoing transactions flags
        const authorDoc = await usersCol.findOne({ idU: authorId });
        if (authorDoc && (authorDoc.blockbet || authorDoc.blockpay)) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }
        let opponentDoc = null;
        if (opponentId) {
            opponentDoc = await usersCol.findOne({ idU: opponentId });
            if (opponentDoc && (opponentDoc.blockbet || opponentDoc.blockpay)) {
                return message.reply('Seu oponente está com uma transação em andamento! Finalize...');
            }
        }
        // Upfront bet checks and deductions
        const authorBal = await getUserBalance(authorId);
        if (authorBal < valor) {
            finished = true;
            return mensagem.edit({ content: `${message.author} Saldo insuficiente para apostar ${Util.toAbbrev(valor)}.`, embeds: [], components: [] });
        }
        if (opponentId) {
            const oppBal = await getUserBalance(opponentId);
            if (oppBal < valor) {
                finished = true;
                return mensagem.edit({ content: `${message.author} ${user} Saldo insuficiente do desafiado para apostar ${Util.toAbbrev(valor)}.`, embeds: [], components: [] });
            }
        }
        // Se o oponente aceitar, inicia o jogo
        if (opponentId) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel('Aceitar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('decline').setLabel('Recusar').setStyle(ButtonStyle.Danger)
            );
            await mensagem.edit({ content: `${message.author} ${user} deseja jogar Blackjack valendo ${Util.toAbbrev(valor)}.`, components: [row], embeds: [] }).catch(() => {});
            const consent = await new Promise((resolve) => {
                const collector = mensagem.createMessageComponentCollector({ idle: 30000 });
                collector.on('collect', async (i) => {
                    if (i.user.id !== opponentId) {
                        return i.reply({ content: 'Aguardando resposta do desafiado.', ephemeral: true });
                    }
                    await i.deferUpdate().catch(() => {});
                    collector.stop('answered');
                    resolve(i.customId === 'accept');
                });
                collector.on('end', (c, reason) => {
                    if (reason !== 'answered') resolve(false);
                });
            });
            if (!consent) {
                finished = true;
                await mensagem.edit({ content: `Olá ${message.author}, ${user} recusou ou não respondeu o seu pedido.\n-# O jogo foi cancelado, tente novamente.`, components: [], embeds: [] }).catch(() => {});
                return;
            }
            await mensagem.edit({ content: `Olá ${message.author}, ${user} aceitou o seu pedido de Blackjack valendo ${Util.toAbbrev(valor)}.\n-# Estou iniciando a partida...`, components: [], embeds: [] }).catch(() => {});
        }
        // Deduzir as apostas
        await incBalance(authorId, -valor);
        if (opponentId) await incBalance(opponentId, -valor);
        // Trava de transação para ambos os jogadores
        await setBetFlags(authorId, true);
        if (opponentId) await setBetFlags(opponentId, true);

        var botoes = (status, double) => new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel('Comprar')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('hit')
            .setEmoji('🔁')
            .setDisabled(status),
        new ButtonBuilder()
            .setLabel('Passar')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('stand')
            .setEmoji('↪️')
            .setDisabled(status),
        new ButtonBuilder()
            .setLabel('Dobrar')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('dobrar')
            .setEmoji('2️⃣')
            .setDisabled(true));
            // .setDisabled(double || !!user))

        let numCardsPulled = 0;
        var gameOver = false;

        var player = {
            id: authorId,
            tag: message.author,
            cards: [],
            score: 0,
            stood: false,
            bust: false
        };
        var player2 = user ? {
            id: opponentId,
            tag: user,
            cards: [],
            score: 0,
            stood: false,
            bust: false
        } : null;
        var dealer = {
            cards: [],
            score: 0,
            stood: false,
            bust: false
        };

        function getCardsValue(a) {
            var cardArray = [],
                sum = 0,
                i = 0,
                dk = 10.5,
                doubleking = 'QQ',
                aceCount = 0,
                cardArray = a,
                soft = false;
            for (i; i < cardArray.length; i += 1) {
                if (cardArray[i].rank === 'J' || cardArray[i].rank === 'Q' || cardArray[i].rank === 'K') {
                    sum += 10;
                } else if (cardArray[i].rank === 'A') {
                    sum += 11;
                    aceCount += 1;
                    soft = true;
                } else if (cardArray[i].rank === doubleking) {
                    sum += dk;
                } else {
                    sum += cardArray[i].rank;
                }
            }
            while (aceCount > 0 && sum > 21) {
                sum -= 10;
                aceCount -= 1;
                soft = false;
            }
            return {
                sum: sum,
                soft: soft
            };
        }

        var deck = {
            deckArray: [],
            initialize: function() {
                var suitArray, rankArray, s, r, n;
                suitArray = ['paus', 'ouros', 'copas', 'espadas'];
                rankArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
                n = 13;
                for (s = 0; s < suitArray.length; s += 1) {
                    for (r = 0; r < rankArray.length; r += 1) {
                        this.deckArray[s * n + r] = {
                            rank: rankArray[r],
                            suit: suitArray[s]
                        };
                    }
                }
            },
            shuffle: function() {
                var temp, i, rnd;
                for (i = 0; i < this.deckArray.length; i += 1) {
                    rnd = Math.floor(Math.random() * this.deckArray.length);
                    temp = this.deckArray[i];
                    this.deckArray[i] = this.deckArray[rnd];
                    this.deckArray[rnd] = temp;
                }
            }
        };

        deck.initialize();
        deck.shuffle();

        async function settleSolo(outcome, stake) {
            finished = true;
            cannotDouble = true;
            if (outcome === 'win') {
                await incBalance(authorId, stake * 2);
            } else if (outcome === 'blackjack') {
                await incBalance(authorId, stake * 2); // pagamento simples
            } else if (outcome === 'empate') {
                await incBalance(authorId, stake);
            } else if (outcome === 'lose') {
            }
            await setBetFlags(authorId, false);
        }
        async function settleMulti(results) {
            finished = true;
            cannotDouble = true;
            for (const r of results) {
                if (!r) continue;
                if (r.outcome === 'win' || r.outcome === 'blackjack') {
                    await incBalance(r.id, valor * 2);
                } else if (r.outcome === 'empate') {
                    await incBalance(r.id, valor);
                }
                await setBetFlags(r.id, false);
            }
        }

        function resetGame() {
            numCardsPulled = 0;
            player.cards = [];
            dealer.cards = [];
            player.score = 0;
            dealer.score = 0;
            deck.initialize();
        }

        async function endMsg(title, msg) {
            function handToString(cards, score) {
                let s = '';
                for (const card of cards) {
                    s += card.rank.toString();
                    if (card.suit == 'copas') s += '♥';
                    if (card.suit == 'ouros') s += '♦';
                    if (card.suit == 'espadas') s += '♠';
                    if (card.suit == 'paus') s += '♣';
                    s += ' ';
                }
                const soft = getCardsValue(cards).soft ? 'Soft ' : '';
                s += ' = ' + '**' + soft + score.toString() + '**';
                return s;
            }
            const gambleEmbed = new EmbedBuilder()
                .setColor(color)
                .setAuthor({
                    name: 'Kosame - BlackJack',
                    iconURL: message.author.displayAvatarURL()
                })
                .addFields([{ name: `<:usercards:1430330588891447416> Cartas de ${message.author.globalName ? message.author.globalName : message.author.username}` , value: handToString(player.cards, player.score) }])
                .setTimestamp();
            if (player2) {
                gambleEmbed.addFields([{ name: `<:usercards:1430330588891447416> Cartas de ${user.globalName ? user.globalName : user.username}`, value: handToString(player2.cards, player2.score) }]);
            }
            gambleEmbed.addFields([{ name: '<:botcards:1430330759511543919> Cartas da Kosame', value: handToString(dealer.cards, dealer.score) }]);
            if (title && msg) gambleEmbed.addFields([{ name: title, value: msg }]);
            await mensagem.edit({
                content: `${message.author} ${user ? user : ''}`,
                embeds: [gambleEmbed],
                components: [botoes(finished, cannotDouble)]
            }).catch(e => console.log(e));
        }

        async function endGame2(action) {
            if (gameOver || finished) return;

            if (player2) {
                const bothDone = (player.stood || player.bust) && (player2.stood || player2.bust);
                if (bothDone) {
                    // Dealer compra até 17
                    while (dealer.score < 17) dealerDraw();
                    dealer.bust = dealer.score > 21;
                    dealer.stood = true;

                    // Verificações diretas do dealer (Kosame)
                    if (dealer.score === 21) {
                        const res = [
                            { id: player.id, outcome: 'lose' },
                            { id: player2.id, outcome: 'lose' }
                        ];
                        await settleMulti(res);
                        gameOver = true;
                        await endMsg('<:results:1430330745305694310> Resultado:', `Kosame conseguiu **21**. Ambos os jogadores perderam ${Util.toAbbrev(valor)}.`);
                        return;
                    }

                    if (dealer.bust) {
                        const res = [
                            { id: player.id, outcome: player.bust ? 'lose' : 'win' },
                            { id: player2.id, outcome: player2.bust ? 'lose' : 'win' }
                        ];
                        await settleMulti(res);
                        gameOver = true;
                        const msg = [
                            `Kosame passou de **21**.`,
                            `${message.author} ${res[0].outcome === 'win' ? `venceu e ganhou ${Util.toAbbrev(valor)}` : `perdeu e perdeu ${Util.toAbbrev(valor)}`}.`,
                            `${user} ${res[1].outcome === 'win' ? `venceu e ganhou ${Util.toAbbrev(valor)}` : `perdeu e perdeu ${Util.toAbbrev(valor)}`}.`
                        ].join('\n');
                        await endMsg('<:results:1430330745305694310> Resultado:', msg);
                        return;
                    }

                    // Pontuações válidas (sem bust)
                    const p1 = player.bust ? -1 : player.score;
                    const p2 = player2.bust ? -1 : player2.score;
                    let res = [];

                    // Kosame vence se tiver pontuação >= a de qualquer jogador
                    const dealerBeatsP1 = dealer.score >= p1 && p1 !== -1;
                    const dealerBeatsP2 = dealer.score >= p2 && p2 !== -1;

                    // Regras finais
                    if (p1 === -1 && p2 === -1) {
                        // Ambos estouraram
                        res = [
                            { id: player.id, outcome: 'lose' },
                            { id: player2.id, outcome: 'lose' }
                        ];
                    } else if (!player.bust && dealerBeatsP1 && dealerBeatsP2) {
                        // Kosame vence de ambos
                        res = [
                            { id: player.id, outcome: 'lose' },
                            { id: player2.id, outcome: 'lose' }
                        ];
                    } else {
                        // Comparar entre jogadores se kosame não superou todos
                        if (p1 > p2) {
                            res = [
                                { id: player.id, outcome: 'win' },
                                { id: player2.id, outcome: 'lose' }
                            ];
                        } else if (p2 > p1) {
                            res = [
                                { id: player.id, outcome: 'lose' },
                                { id: player2.id, outcome: 'win' }
                            ];
                        } else {
                            res = [
                                { id: player.id, outcome: 'empate' },
                                { id: player2.id, outcome: 'empate' }
                            ];
                        }
                    }

                    await settleMulti(res);
                    gameOver = true;

                    const msg = [
                        `${message.author} ${res[0].outcome === 'win' ? `venceu e ganhou ${Util.toAbbrev(valor)}` : res[0].outcome === 'empate' ? `empatou e recebeu ${Util.toAbbrev(valor)}` : `perdeu e perdeu ${Util.toAbbrev(valor)}`}.`,
                        `${user} ${res[1].outcome === 'win' ? `venceu e ganhou ${Util.toAbbrev(valor)}` : res[1].outcome === 'empate' ? `empatou e recebeu ${Util.toAbbrev(valor)}` : `perdeu e perdeu ${Util.toAbbrev(valor)}`}.`,
                        `Kosame: ${dealer.score}`
                    ].join('\n');

                    await endMsg('<:results:1430330745305694310> Resultado:', msg);
                    return;
                }
            }

            if (!gameOver) loop();
        }


        async function endGame(action) {
            if (player.score === 21 && (!getCardsValue(player.cards).soft || action == 'stand')) {
                gameOver = true;
                await settleSolo('win', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `${message.author} conseguiu **21** e ganhou ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (player.score > 21) {
                gameOver = true;
                await settleSolo('lose', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `${message.author} passou de **21** e perdeu ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (dealer.score === 21) {
                gameOver = true;
                await settleSolo('lose', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `Kosame conseguiu **21**. ${message.author} perdeu ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (dealer.score > 21) {
                gameOver = true;
                await settleSolo('win', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `Kosame passou de **21**. ${message.author} ganhou ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (dealer.score >= 17 && player.score > dealer.score && player.score < 21) {
                gameOver = true;
                await settleSolo('win', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `${message.author} venceu e ganhou ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (dealer.score >= 17 && player.score < dealer.score && dealer.score < 21) {
                gameOver = true;
                await settleSolo('lose', valor);
                await endMsg('<:results:1430330745305694310> Resultado:', `${message.author} perdeu ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (player.score === dealer.score && action == 'stand') {
                gameOver = true;
                await settleSolo('empate', valor);
                await endMsg('<:results:1430330745305694310> Resultado: ', `Empate. ${message.author} recebeu ${Util.toAbbrev(valor)}.`);
                return;
            }
            if (action != 'dobrar') loop();
        }

        function dealerDraw() {
            dealer.cards.push(deck.deckArray[numCardsPulled]);
            dealer.score = getCardsValue(dealer.cards).sum;
            numCardsPulled += 1;
        }

        function newGame() {
            hit(false, player.id);
            hit(false, player.id);
            if (player2) {
                hit(false, player2.id);
                hit(false, player2.id);
            }
            dealerDraw();
            loop();
        }

        function hit(dobro, hitter) {
            if (hitter == player.id) {
                player.cards.push(deck.deckArray[numCardsPulled]);
                player.score = getCardsValue(player.cards).sum;
                player.bust = player.score > 21;
                if (!player2 && player.bust) {
                    endGame('hit');
                    return;
                }
                if (player2 && player.bust) {
                    player.stood = true;
                    roundUser = player2.id;
                    endGame2('stand');
                    return;
                }
            } else if (player2 && hitter == player2.id) {
                player2.cards.push(deck.deckArray[numCardsPulled]);
                player2.score = getCardsValue(player2.cards).sum;
                player2.bust = player2.score > 21;
                if (player2 && player2.bust) {
                    player2.stood = true;
                    roundUser = player.id;
                    endGame2('stand');
                    return;
                }
            } else {
                dealer.cards.push(deck.deckArray[numCardsPulled]);
                dealer.score = getCardsValue(dealer.cards).sum;
                dealer.bust = dealer.score > 21;
            }
            numCardsPulled += 1;
            if (numCardsPulled > (player2 ? 5 : 3) && !dobro) {
                if (player2) endGame2();
                else endGame();
            }
        }

        function stand() {
            if (player2) {
                if (roundUser == player.id) {
                    player.stood = true;
                    roundUser = player2.id;
                    endGame2('stand');
                } else if (roundUser == player2.id) {
                    player2.stood = true;
                    endGame2('stand');
                }
            } else {
                while (dealer.score < 17) {
                    dealerDraw();
                }
                endGame('stand');
            }
        }

        newGame();
        async function loop() {
            if (gameOver) return;
            if (player2) {
                const current = roundUser == player.id ? player.tag.username : user.username;
                await endMsg(`Vez de ${current}`, 'Pressione **Comprar** para comprar uma carta, **Passar** para passar a vez ou **Dobrar** para dobrar a aposta (desativado em modo 2 jogadores).');
            } else {
                await endMsg(`Vez do ${roundUser == player.id ? message.author.username : 'Kosame'}`, 'Pressione **Comprar** para comprar uma carta, **Passar** para passar a vez ou **Dobrar** para dobrar o valor da aposta e comprar uma última carta!');
            }
            const coletor = mensagem.createMessageComponentCollector({
                idle: 60000
            });
            coletor.on('collect', async (i) => {
                if (roundUser != i.user.id) {
                    i.reply({ content: 'Essa não é sua vez!', ephemeral: true });
                    return;
                }
                await i.deferUpdate().catch(e => {});
                coletor.stop('sucess');
                if (gameOver) return;
                if (i.customId == 'hit') {
                    hit(false, i.user.id);
                    return;
                } else if (i.customId === 'stand') {
                    stand();
                    return;
                } else if (i.customId == 'dobrar') {
                    if (player2) return; // desabilita no modo 2 jogadores
                    // Verifica se o autor pode dobrar (precisa pagar o valor adicional)
                    const currentBalance = await getUserBalance(authorId);
                    if (currentBalance < valor) {
                        return await i.reply({ content: `${message.author} Você não possui saldo suficiente para dobrar a aposta.`, ephemeral: true, allowedMentions: { repliedUser: false } }).catch(() => {});
                    }
                    // Deduzir a aposta adicional e prosseguir
                    await incBalance(authorId, -valor);
                    valor *= 2;
                    cannotDouble = true;
                    await endMsg(`Vez do ${message.author.username}`, 'Aposta dobrada. Você comprará apenas mais uma carta e então finalizará.');
                    hit(true, i.user.id);
                    await endGame('dobrar');
                    if (!gameOver) stand();
                }
            });
            coletor.on('end', async (collected, motivo) => {
                if (gameOver) return;
                if (motivo == 'messageDelete') {
                    gameOver = true;
                    // Trava de segurança: libera travas
                    await setBetFlags(authorId, false);
                    if (opponentId) await setBetFlags(opponentId, false);
                } else if (motivo != 'sucess') {
                    stand();
                }
            });
        }

    // await loop()
    }
};