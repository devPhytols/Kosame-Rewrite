/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = class JokenpoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'jokenpo';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Desafie um usuário para uma partida de Pedra, Papel e Tesoura, apostando moedas.';
        this.aliases = ['ppt'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'oponente',
                description: 'Selecione o usuário que deseja desafiar.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'quantia',
                description: 'Quantas moedas você quer apostar?',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                minValue: 1
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {

        //https://ptb.discord.com/api/webhooks/1287578750740992110/dE0HsankelhpSFabFeUNLe6suCQ1YpFTmE_Pbho0nPlGX5ai6COqa1Jr-Dwb6cjntGb6
        const Webhook = new WebhookClient({ id: '1287578750740992110', token: 'dE0HsankelhpSFabFeUNLe6suCQ1YpFTmE_Pbho0nPlGX5ai6COqa1Jr-Dwb6cjntGb6' });

        const challenger = message.author;
        const opponent = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        const betAmount = await Util.notAbbrev(args[1]);

        if (!opponent) {
            return message.reply({ content: 'Você precisa desafiar alguém!', ephemeral: true });
        }

        if (challenger.id === opponent.id) {
            return message.reply({ content: 'Você não pode jogar com você mesmo!', ephemeral: true });
        }

        const challengerData = await this.client.database.users.findOne({ idU: challenger.id });
        const opponentData = await this.client.database.users.findOne({ idU: opponent.id });
        const oldBankOne = challengerData.bank;
        const oldBankTwo = opponentData.bank;
        const coinsAntesAuthor = Math.floor(challengerData.bank);
        const coinsAntesRecebedor = Math.floor(opponentData.bank);

        // ===> Taxas <=== //
        const taxa = calcularTaxa(betAmount);
        const valorFinal = betAmount - taxa;
        const valorFinalExibir = await challengerData.vip.hasVip && betAmount < 28999999 ? betAmount : betAmount - taxa;
        const calculaVIP = await challengerData.vip.hasVip && betAmount < 28999999 ? betAmount : valorFinal;
        // ===> Fim Taxas <=== //

        // Cooldown
        let cooldown = 45000;
        let pay = challengerData.jokenpo;
        let time = cooldown - (Date.now() - pay);

        const EMBED1 = new EmbedBuilder()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, Aguarde **${moment.duration(time).format('h [horas] m [minutos] e s [segundos]')}** para jogar novamente!`);

        if (pay !== null && time > 0) {
            return message.reply({ embeds: [EMBED1] });
        }

        // Verifica bloqueios de transações para ambos os jogadores
        if (challengerData.blockpay || challengerData.blockbet) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }

        if (opponentData.blockpay || opponentData.blockbet) {
            return message.reply('Seu oponente está com uma transação em andamento! Finalize...');
        }

        if (String(betAmount) === 'NaN') {
            return message.reply({ content: `${message.author}, o dinheiro é inválido.` });
        }

        if (betAmount <= 0) {
            return message.reply({ content: `${message.author}, dinheiro menor ou igual a 0` });
        }

        if (betAmount > 10000000000) {
            return message.reply({ content: `${message.author}, você não pode utilizar um valor maior que **10B**!` });
        }

        if (challengerData.bank < betAmount) {
            return message.reply({ content: 'Você não tem moedas suficientes para essa aposta.', ephemeral: true });
        }

        if (opponentData.bank < betAmount) {
            return message.reply({ content: `${opponent.username} não tem moedas suficientes para essa aposta.`, ephemeral: true });
        }

        // Bloqueia transações enquanto o jogo acontece
        await this.client.database.users.updateOne(
            { idU: challenger.id },
            {
                $set: {
                    blockpay: true,
                    blockbet: true
                }
            }
        );

        await this.client.database.users.updateOne(
            { idU: opponent.id },
            {
                $set: {
                    blockpay: true,
                    blockbet: true
                }
            }
        );

        // Criação dos botões para cada opção
        const buttonRock = new ButtonBuilder()
            .setCustomId('rps_pedra')
            .setEmoji('<:ks_pedra:1287522177121255477>')
            .setLabel('Pedra')
            .setStyle(ButtonStyle.Secondary);

        const buttonPaper = new ButtonBuilder()
            .setCustomId('rps_papel')
            .setEmoji('<:ks_papel:1287522174747410462>')
            .setLabel('Papel')
            .setStyle(ButtonStyle.Secondary);

        const buttonScissors = new ButtonBuilder()
            .setCustomId('rps_tesoura')
            .setEmoji('<:ks_tesoura:1287522178815754291>')
            .setLabel('Tesoura')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(buttonRock, buttonPaper, buttonScissors);

        const embed = new EmbedBuilder()
            .setTitle('Pedra, Papel e Tesoura')
            .setThumbnail('https://i.imgur.com/anJDJEZ.png')
            .setDescription(
                `**${challenger}** desafiou **${opponent}** para uma partida de **Pedra, Papel e Tesoura**!\n\n<:coins_k:846487970612903976> **O Valor da aposta é:** ${Util.toAbbrev(Math.floor(betAmount))} Coins\n<:ksppt1:1287520497223078038> Escolha sua jogada nos botões abaixo!\n\n<:porcentagem:1058512610791800952> ${challengerData.vip.hasVip && betAmount < 28999999 ? '<:vipinfo:1047247009796599830>' : ''} *Uma taxa de ${challengerData.vip.hasVip && betAmount < 28999999 ? ' 0' : Util.toAbbrev(taxa)} Coins* foi aplicada. ${opponent} receberá o valor de **${Util.toAbbrev(valorFinalExibir)}**!\n\n` +
                'O vencedor será revelado após ambos escolherem!'
            )
            .setColor('#c061ff');

        const msg = await message.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = (i) => {
            return [challenger.id, opponent.id].includes(i.user.id) && ['rps_pedra', 'rps_papel', 'rps_tesoura'].includes(i.customId);
        };

        const collector = message.channel.createMessageComponentCollector({ filter, time: 8000 });

        const choices = new Map();

        collector.on('collect', async (i) => {

            const { blocked, message: blockMessage } = await checkUserBlock(this.client, message.author.id, i.user.id);
            if (blocked) return i.reply({ content: blockMessage, ephemeral: true });

            if (![challenger.id, opponent.id].includes(i.user.id)) {
                return i.reply({ content: 'Você não está participando dessa partida!', ephemeral: true });
            }

            if (choices.has(i.user.id)) {
                return i.reply({ content: 'Você já fez sua escolha!', ephemeral: true });
            }

            choices.set(i.user.id, i.customId);

            await i.reply({ content: `Você escolheu **${i.customId.split('_')[1]}**. Aguarde a escolha do outro jogador.`, ephemeral: true });

            if (choices.size === 2) {
                collector.stop();
            }
        });

        collector.on('end', async (i) => {
            if (choices.size < 2) {
                await this.client.database.users.updateOne(
                    { idU: challenger.id },
                    {
                        $set: {
                            blockpay: false,
                            blockbet: false
                        }
                    }
                );

                await this.client.database.users.updateOne(
                    { idU: opponent.id },
                    {
                        $set: {
                            blockpay: false,
                            blockbet: false
                        }
                    }
                );

                return msg.edit({ content: 'Tempo esgotado! Um ou ambos os jogadores não fizeram suas escolhas a tempo.', components: [], embeds: [] });
            }

            const challengerChoice = choices.get(challenger.id).split('_')[1];
            const opponentChoice = choices.get(opponent.id).split('_')[1];

            let resultMessage;
            if (challengerChoice === opponentChoice) {
                resultMessage = `Empate! Ambos escolheram **${challengerChoice}**.`;
            } else if (
                (challengerChoice === 'pedra' && opponentChoice === 'tesoura') ||
                (challengerChoice === 'papel' && opponentChoice === 'pedra') ||
                (challengerChoice === 'tesoura' && opponentChoice === 'papel')
            ) {
                // ====> Salva os Coins do Vencedor <==== //
                await this.client.database.users.updateOne(
                    { idU: opponent.id },
                    {
                        $inc: { bank: -betAmount },
                        $set: { jokenpo: Date.now() }
                    }
                );

                await this.client.database.users.updateOne(
                    { idU: challenger.id },
                    {
                        $inc: { bank: calculaVIP },
                        $set: { jokenpo: Date.now() }
                    }
                );

                resultMessage = `${challenger.globalName ? challenger.globalName : challenger.username} ganhou com **${challengerChoice}** contra **${opponentChoice}** de ${opponent.globalName ? opponent.globalName : opponent.username}!`;
            } else {

                await this.client.database.users.updateOne(
                    { idU: opponent.id },
                    {
                        $inc: { bank: calculaVIP },
                        $set: { jokenpo: Date.now() }
                    }
                );

                await this.client.database.users.updateOne(
                    { idU: challenger.id },
                    {
                        $inc: { bank: -betAmount },
                        $set: { jokenpo: Date.now() }
                    }
                );

                resultMessage = `${opponent.globalName ? opponent.globalName : opponent.username} ganhou com **${opponentChoice}** contra **${challengerChoice}** de ${challenger.globalName ? challenger.globalName : challenger.username}!`;
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle('Resultado: Pedra, Papel e Tesoura')
                .setThumbnail('https://i.imgur.com/anJDJEZ.png')
                .setDescription(resultMessage)
                .setDescription(
                    `**${challenger.globalName ? challenger.globalName : challenger.username}** desafiou **${opponent.globalName ? opponent.globalName : opponent.username}** para uma partida de **Pedra, Papel e Tesoura**!\n\n<:coins_k:846487970612903976> **O Valor da aposta foi:** ${Util.toAbbrev(Math.floor(betAmount))} Coins\n<a:ks_doguinho:1037033014976319579> ${resultMessage}!\n\n${challenger} escolheu **${challengerChoice}** e ${opponent} escolheu **${opponentChoice}**`
                )
                .setColor('#c061ff');

            msg.edit({ embeds: [resultEmbed], components: [] });

            // Libera os bloqueios de transação após o jogo
            await this.client.database.users.updateOne(
                { idU: challenger.id },
                {
                    $set: {
                        blockpay: false,
                        blockbet: false
                    }
                }
            );

            await this.client.database.users.updateOne(
                { idU: opponent.id },
                {
                    $set: {
                        blockpay: false,
                        blockbet: false
                    }
                }
            );

            // ===========> Gambiarra Para Dup (Antiga) <=========== //
            const authorDepois = await this.client.database.users.findOne({ idU: challenger.id });
            const target2 = await this.client.database.users.findOne({ idU: opponent.id });
            const coinsDepoisAuthor = Math.floor(authorDepois.bank);
            const coinsDepoisRecebedor = Math.floor(target2.bank);

            const embedLogPay = new EmbedBuilder()
                .setDescription(`**${challenger.tag} \`(${challenger.id})\`** apostou no ppt \`${Util.toAbbrev(Math.floor(betAmount))}\` com **${opponent.tag} \`(${opponent.id})\`**!\n\n*Valores no banco antes da transação:*\n\nCoins de \`${opponent.tag}\` - **${coinsAntesRecebedor}**\nCoins de \`${challenger.tag}\` - **${coinsAntesAuthor}**\n\n*Valores no banco depois da transação:*\n\nCoins de \`${opponent.tag}\` - **${coinsDepoisRecebedor}**\nCoins de \`${challenger.tag}\` - **${coinsDepoisAuthor}**\n\nServidor Utilizado: \`${message.guild.name}\` \`(${message.guild.id})\``)
                .setTimestamp();

            Webhook.send({embeds: [embedLogPay]});
        });
    }
};

async function checkUserBlock(client, senderId, recipientId) {
    const [sender, recipient] = await Promise.all([
        client.database.users.findOne({ idU: senderId }),
        client.database.users.findOne({ idU: recipientId })
    ]);

    if (!sender || !recipient) {
        return { blocked: true, message: 'Erro ao localizar os usuários no banco de dados.' };
    }

    if (recipient.jogodavelha) {
        return { blocked: true, message: `Eiii, acho que ${recipientId.username} tem uma transferência em aberto!` };
    }

    return { blocked: false, message: null };
}

function calcularTaxa(valor) {
    let taxaPorcentagem;

    if (valor >= 2000000000) { // Acima de 2B 13% de taxa
        taxaPorcentagem = 18;
    } else if (valor >= 1000000000) { // Acima de 1B 12% de taxa
        taxaPorcentagem = 14;
    } else if (valor >= 899999999) { // Acima de 900mM 10% de taxa
        taxaPorcentagem = 11;
    } else if (valor >= 699999999) { // Acima de 700M 8% de taxa
        taxaPorcentagem = 9;
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