/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util.js');
const { createCanvas } = require('canvas');
const moment = require('moment');
require('moment-duration-format');

module.exports = class JogodavelhaCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'jogodavelha';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Desafie um usuário para uma partida de jogo da velha, apostando moedas.';
        this.cooldown = 40;
        this.aliases = ['jdv'];
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
        const GRID_SIZE = 3;
        const CELL_SIZE = 150;
        const PADDING = 20;
        const LINE_WIDTH = 8;

        // PALETA DE CORES
        const COLORS = {
            BACKGROUND: '#1a1a2e',
            GRID_LINES: '#a516d9',
            CELL: '#16213e',
            X: '#c96ef0',
            O: '#ffffff',
            TEXT: '#ffffff'
        };

        const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * PADDING;
        const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * PADDING;

        var board = [
            ['empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty']
        ];

        function drawGame() {
            const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');
        
            // Fundo
            ctx.fillStyle = COLORS.BACKGROUND;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
            // Desenhar grid
            ctx.strokeStyle = COLORS.GRID_LINES;
            ctx.lineWidth = LINE_WIDTH;

            // Linhas verticais
            for (let i = 1; i < GRID_SIZE; i++) {
                const x = PADDING + i * CELL_SIZE + (i - 1) * PADDING;
                ctx.beginPath();
                ctx.moveTo(x, PADDING);
                ctx.lineTo(x, CANVAS_HEIGHT - PADDING);
                ctx.stroke();
            }

            // Linhas horizontais
            for (let i = 1; i < GRID_SIZE; i++) {
                const y = PADDING + i * CELL_SIZE + (i - 1) * PADDING;
                ctx.beginPath();
                ctx.moveTo(PADDING, y);
                ctx.lineTo(CANVAS_WIDTH - PADDING, y);
                ctx.stroke();
            }
        
            // Desenhar as jogadas
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const cellX = PADDING + x * (CELL_SIZE + PADDING);
                    const cellY = PADDING + y * (CELL_SIZE + PADDING);

                    if (board[y][x] === 1) {
                        drawX(ctx, cellX, cellY, CELL_SIZE);
                    } else if (board[y][x] === 2) {
                        drawO(ctx, cellX, cellY, CELL_SIZE);
                    }
                }
            }
        
            const buffer = canvas.toBuffer('image/png');
            return buffer;
        }

        // Função para desenhar X estilizado
        function drawX(ctx, x, y, size) {
            ctx.strokeStyle = COLORS.X;
            ctx.lineWidth = LINE_WIDTH * 1.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(x + size * 0.2 - 10, y + size * 0.2);
            ctx.lineTo(x + size * 0.8 - 10, y + size * 0.8);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + size * 0.8 - 10, y + size * 0.2);
            ctx.lineTo(x + size * 0.2 - 10, y + size * 0.8);
            ctx.stroke();
        }

        // Função para desenhar O estilizado
        function drawO(ctx, x, y, size) {
            ctx.strokeStyle = COLORS.O;
            ctx.lineWidth = LINE_WIDTH * 1.5;

            ctx.beginPath();
            ctx.arc(
                x + size / 2 - 10,
                y + size / 2 - 10,
                size * 0.35,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        let user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        let betAmount = await Util.notAbbrev(args[1]);
        if(!user) return message.reply('Você deve mencionar alguém para jogar!');
        // VARIÁVEIS PARA BUSCA NO BD
        const uSrc = await this.client.database.users.findOne({ idU: message.author.id });
        const uBet = await this.client.database.users.findOne({ idU: user.id });
        // VERIFICAÇÕES TEMPO CONTA //
        const Apostador = await this.client.database.users.findOne({ idU: message.author.id });
        const accAge = Math.abs(Date.now() - message.author.createdAt);
        const accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));
        if (accDays <= 30) {
            return message.reply({ content: 'Eii, a sua conta é muito nova para transferir coins, aguarde alguns dias e junte suas economias!' });
        }
        if (Apostador.Exp.level < 6) {
            return message.reply('Você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.');
        }
        // FIM VERIFICAÇÃO DE TEMPO CONTA //
        // VERIFICAÇÃO DE TRANSAÇÃO //
        if (Apostador.blockpay) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }
        if (Apostador.blockbet) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }
        // FIM VERIFICAÇÃO DE TRANSAÇÃO //
        // ===> Taxas <=== //
        const taxa = calcularTaxa(betAmount);
        const valorFinal = betAmount - taxa;
        const valorFinalExibir = await uSrc.vip.hasVip && betAmount < 28999999 ? betAmount : betAmount - taxa;
        const calculaVIP = await uSrc.vip.hasVip && betAmount < 28999999 ? betAmount : valorFinal;
        // ===> Fim Taxas <=== //

        if(user.bot) return message.reply('Você não pode jogar com um bot!');
        if(user.id === message.author.id) return message.reply('Você não pode jogar com você mesmo!');
        if(!betAmount) return message.reply({ content: `${message.author}, você não forneceu a quantia da aposta!` });
        if(uSrc.bank < betAmount) return message.reply({ content: `${message.author}, você não possui coins suficientes para essa aposta!` });
        if(uBet.bank < betAmount) return message.reply({ content: `${user} não possui coins suficientes para essa aposta!` });
        if (String(betAmount) === 'NaN') return message.reply({ content: `${message.author}, o dinheiro é inválido.` });
        if (betAmount <= 0) return message.reply({ content: `${message.author}, dinheiro menor ou igual a 0` });
        if (uSrc.Exp.level < 6) return message.reply(`Você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.`);
        if (uBet.Exp.level < 6) return message.reply(`${user} você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.`);

        // TRAVA DE SEGURANÇA //
        await this.client.database.users.updateOne(
            { idU: message.author.id },
            {
                $set: { blockbet: true, blockpay: true, jogodavelha: true }
            }
        );

        await this.client.database.users.updateOne(
            { idU: user.id },
            {
                $set: { blockbet: true, blockpay: true, jogodavelha: true }
            }
        );
        // FIM TRAVA DE SEGURANÇA //

        const embed = new EmbedBuilder()
            .setTitle('Jogo da Velha')
            .setColor('#ffffff')
            .setDescription(`${message.author} Quer jogar jogo da velha com você!`);
        let gameBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel('Aceitar').setStyle('Success'),
                new ButtonBuilder().setCustomId('decline').setLabel('Recusar').setStyle('Danger'));
        let msg = await message.channel.send({embeds: [embed], components: [btn], content: `${user}` });
        const filter = (interaction) => interaction.user.id === user.id;
        const collector = msg.createMessageComponentCollector({filter, time: 45000});
        collector.on('collect', async (interaction) => {
            if(interaction.customId === 'accept') {
                await interaction.deferUpdate();
                collector.stop();
                TicTacToeGame(msg);
            }
            if(interaction.customId === 'decline') {
                // DESATIVA TRAVA DE SEGURANÇA //
                await this.client.database.users.updateOne(
                    { idU: message.author.id },
                    {
                        $set: { blockbet: false, blockpay: false, jogodavelha: false }
                    }
                );
                await this.client.database.users.updateOne(
                    { idU: user.id },
                    {
                        $set: { blockbet: false, blockpay: false, jogodavelha: false }
                    }
                );
                // DESATIVA FIM TRAVA DE SEGURANÇA //
                embed.setDescription(`${user} recusou o convite!`);
                collector.stop();
                await interaction.update({embeds: [embed], components: []});
            }
        });
        collector.on('end', async (collected) => {
            // DESATIVA TRAVA DE SEGURANÇA //
                await this.client.database.users.updateOne(
                    { idU: message.author.id },
                    {
                        $set: { blockbet: false, blockpay: false, jogodavelha: false }
                    }
                );
                await this.client.database.users.updateOne(
                    { idU: user.id },
                    {
                        $set: { blockbet: false, blockpay: false, jogodavelha: false }
                    }
                );
            // DESATIVA FIM TRAVA DE SEGURANÇA //
            if (collected.size < 1) {
                await msg.edit({ content: `Acabou o tempo para aceitar a aposta!`, embeds: [], components: [], files: [] });
            }
        });

        const client = this.client;
        async function TicTacToeGame(msg) {
            let playerTurn = message.author;
            const embed = new EmbedBuilder()
                .setTitle('Jogo da Velha')
                .setColor('#ffffff')
                .setDescription(`É a vez de ${playerTurn}\n\n<:porcentagem:1058512610791800952> ${uSrc.vip.hasVip && betAmount < 28999999 ? '<:vipinfo:1047247009796599830>' : ''} *Uma taxa de ${uSrc.vip.hasVip && betAmount < 28999999 ? ' 0' : Util.toAbbrev(taxa)} Coins* foi aplicada. ${user} receberá o valor de **${Util.toAbbrev(valorFinalExibir)}**!`)
                .setImage('attachment://jogodavelha.png');
            let file = drawGame();
            let attachment = new AttachmentBuilder(file, { name: 'jogodavelha.png' });
            await msg.edit({embeds: [embed], components: getComponents(), files: [attachment]});
            const filter = (i) => [message.author.id, user.id].includes(i.user.id);
            const collector = msg.createMessageComponentCollector({ idle: 40000, filter });

            collector.on('collect', async int => {
                
                if (int.user.id !== playerTurn.id) return await int.deferUpdate();

                gameBoard[int.customId.split('_')[1]] = playerTurn.id == message.author.id ? 1 : 2;
                board = [];
                for(let x = 0; x < 3; x++) {
                    board[x] = [];
                    for(let y = 0; y < 3; y++) {
                        board[x][y] = gameBoard[y * 3 + x];
                    }
                }
                if (checkWin(1) || checkWin(2) || !gameBoard.includes(0)) await int.deferUpdate();
                if (checkWin(1)) return collector.stop('authorWin');
                if (checkWin(2)) return collector.stop('userWin');
                if (!gameBoard.includes(0)) return collector.stop('tie');
                playerTurn = playerTurn.id == message.author.id ? user : message.author;
          
          
                const embed = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Jogo da Velha')
                    .setDescription(`É a vez de ${playerTurn}`)
                    .setImage('attachment://jogodavelha.png');
                let file = drawGame();
                let attachment = new AttachmentBuilder(file, { name: 'jogodavelha.png' });
                return await int.update({ embeds: [embed], components: getComponents(), files: [attachment] });
            });
        
        
            collector.on('end', async (_, reason) => {
                let file = drawGame();
                let attachment = new AttachmentBuilder(file, { name: 'jogodavelha.png' });
                embed.setImage('attachment://jogodavelha.png');
                if(reason == 'tie') {
                    // DESATIVA TRAVA DE SEGURANÇA //
                    await client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    await client.database.users.updateOne(
                        { idU: user.id },
                        {
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    // DESATIVA FIM TRAVA DE SEGURANÇA //
                    embed.setDescription('O jogo empatou!');
                }
                if (reason === 'authorWin') {
                    // Realiza o Pagamento
                    await client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $inc: { bank: calculaVIP },
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    await client.database.users.updateOne(
                        { idU: user.id },
                        {
                            $inc: { bank: -betAmount },
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    // Atualiza a Resposta
                    embed.setDescription(`${message.author} Ganhou!`);
                }
                if (reason === 'userWin') {
                    // Realiza o Pagamento
                    await client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $inc: { bank: -betAmount },
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    await client.database.users.updateOne(
                        { idU: user.id },
                        {
                            $inc: { bank: calculaVIP },
                            $set: { blockbet: false, blockpay: false, jogodavelha: false }
                        }
                    );
                    // Atualiza a Resposta
                    embed.setDescription(`${user} Ganhou!`);
                }
                await msg.edit({ embeds: [embed], components: getComponents(), files: [attachment] });
            });
        }
        function getComponents() {
            const components = [];

            for (let x = 0; x < 3; x++) {
                const row = new ActionRowBuilder();
                for (let y = 0; y < 3; y++) {
            
                    const button = gameBoard[y * 3 + x] === 1 ? '<:ksm_cell3:1371613248826118144>' : gameBoard[y * 3 + x] === 2 ? '<:ksm_cell4:1371614000135143435>' : '➖';
                    const btn = new ButtonBuilder().setEmoji(button).setStyle(button == '<:ksm_cell3:1371613248826118144>' ? 'Danger' : button == '<:ksm_cell4:1371614000135143435>' ? 'Primary' : 'Secondary').setCustomId('ttt_' + (y * 3 + x));
                    if (gameBoard[y * 3 + x] !== 0) btn.setDisabled(true);
                    row.addComponents(btn);
                }
                components.push(row);
            }
            return components;
        }
        function checkWin(player) {
            if (gameBoard[0] === gameBoard[4] && gameBoard[0] === gameBoard[8] && gameBoard[0] === player) {
                return true;
            } else if (gameBoard[6] === gameBoard[4] && gameBoard[6] === gameBoard[2] && gameBoard[6] === player) {
                return true;
            }
            for (let i = 0; i < 3; ++i) {
                if (gameBoard[i*3] === gameBoard[i*3+1] && gameBoard[i*3] === gameBoard[i*3+2] && gameBoard[i*3] === player) {
                    return true;
                }
                if (gameBoard[i] === gameBoard[i+3] && gameBoard[i] === gameBoard[i+6] && gameBoard[i] === player) {
                    return true;
                }
            }
            return false;
        }
        function calcularTaxa(valor) {
            let taxaPorcentagem;

            if (valor >= 2000000000) { // Acima de 2B 13% de taxa
                taxaPorcentagem = 12;
            } else if (valor >= 899999999) { // Acima de 900mM 10% de taxa
                taxaPorcentagem = 9;
            } else if (valor >= 699999999) { // Acima de 700M 8% de taxa
                taxaPorcentagem = 8;
            } else if (valor >= 400000000) { // Acima de 400M 6% de taxa
                taxaPorcentagem = 6;
            } else if (valor >= 50000000) { // Acima de 50M 5% de taxa
                taxaPorcentagem = 4;
            } else if (valor > 8999800) { // Acima de 9M 4% de taxa
                taxaPorcentagem = 3;
            } else if (valor <= 1000) {
                taxaPorcentagem = 0;
            } else {
                taxaPorcentagem = 3;
            }

            // Calculando a taxa pra rachadinha do governo
            const taxa = (valor * taxaPorcentagem) / 100;

            return taxa;
        }
    }
};