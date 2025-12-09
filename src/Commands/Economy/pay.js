/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, WebhookClient, User, EmbedBuilder, ButtonStyle } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util.js');
const { checkAndCorrectBalance } = require('../../Modules/Extra/checkBalance');
const moment = require('moment');
require('moment-duration-format');

module.exports = class PayCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'pay';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Faça transações com outras pessoas.';
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {


        // ===========> Webhooks <=========== //
        //https://ptb.discord.com/api/webhooks/1267276388545597471/VdvlHKeKqpSl3ftA01dor8V8RKKRSlH_vbIMdSMvQ49aeX_7ALQc5pODvlvPZUJcQTbP
        const Webhook = new WebhookClient({ id: '1267276388545597471', token: 'VdvlHKeKqpSl3ftA01dor8V8RKKRSlH_vbIMdSMvQ49aeX_7ALQc5pODvlvPZUJcQTbP' });
        const WHKnew = new WebhookClient({ id: '1267275849858682963', token: '2OlO8UBOp1f6fY8lqpFZXhSmY8u8ddtIJPrLaQy-o58WdaQ7_nMeG3lTpBTS-HdBJFtR' }); // alerta dup
        // ===========> Fim Webhooks <=========== //
        const accAge = Math.abs(Date.now() - message.author.createdAt);
        const accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));
        const uSrc = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        const money = await Util.notAbbrev(args[1]);
        // ===========> Verificações & Condiçõesa <=========== //
        if (!uSrc || isNaN(String(money)) || money <= 1) {
            return message.reply('A forma de uso correta é: k!pay <@usuário> <@quantidade>');
        }

        if (uSrc.id === message.author.id) {
            return message.reply('Você não pode enviar dinheiro para si mesmo.');
        }

        if (uSrc.id === this.client.user.id) {
            return message.reply('Você não pode enviar dinheiro para mim, não aceito merrecas!');
        }

        if (accDays <= 30) {
            return message.reply({ content: 'Eii, a sua conta é muito nova para transferir coins, aguarde alguns dias e junte suas economias!' });
        }

        const sender = await this.client.database.users.findOne({ idU: message.author.id });
        const recipient = await this.client.database.users.findOne({ idU: uSrc.id });

        if (sender.Exp.level < 3) {
            return message.reply('Você ainda não pode utilizar esse tipo de comando, atinja o level 6 para que possa utiliza-lo.');
        }

        // ===========> Verificação Extra <=========== //
        if (sender.bank < money) {
            return message.reply('Você não tem dinheiro suficiente para essa transferência.');
        }

        if (!recipient) {
            return message.reply('O destinatário não está registrado no sistema.');
        }
        // ===========> Fim Verificação Extra <=========== //

        // ===========> Cooldown <=========== //
        let cooldown = 45000;
        let pay = sender.pay;
        let time = cooldown - (Date.now() - pay);

        const EMBED1 = new EmbedBuilder()
            .setColor('#BA2845')
            .setDescription(`<:emoji_012:839153898774069268> ${message.author}, Aguarde **${moment.duration(time).format('h [Horas] m [minuto] e s [segundo(s)]').replace('minsuto', 'minutos')}** para realizar outra transação!`);

        if (pay !== null && cooldown - (Date.now() - pay) > 0) {
            return message.reply({ embeds: [EMBED1] });
        }
        // ===========> Fim Verificações & Condiçõesa <=========== //

        // ===========> Verificação de Flood <=========== //
        if (sender.blockpay) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }

        if (recipient.blockpay) {
            return message.reply('Uma transação está acontecendo no momento! Aguarde...');
        }

        if (sender.blockbet) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }

        if (recipient.blockbet) {
            return message.reply('Uma transação está acontecendo no momento! Aguarde...');
        }

        if (sender.jogodavelha) {
            return message.reply('Você está com uma transação em andamento! Finalize...');
        }

        if (recipient.jogodavelha) {
            return message.reply('Uma transação está acontecendo no momento! Aguarde...');
        }

        // TRAVA DE SEGURANÇA //
        await this.client.database.users.updateOne(
            { idU: message.author.id },
            {
                $set: { blockbet: true, blockpay: true }
            }
        );

        await this.client.database.users.updateOne(
            { idU: uSrc.id },
            {
                $set: { blockpay: true }
            }
        );
        // FIM TRAVA DE SEGURANÇA //
        // ===========> Fim Verificação de Flood <=========== //

        // ===========> Calculos e Taxas <=========== //
        const oldBankOne = sender.bank;
        const oldBankTwo = recipient.bank;
        const coinsAntesAuthor = Math.floor(sender.bank);
        const coinsAntesRecebedor = Math.floor(recipient.bank);

        const taxa = calcularTaxa(money);
        const valorFinal = money - taxa;
        const valorFinalExibir = await sender.vip.hasVip && money < 28999999 ? money : money - taxa;
        const calculaVIP = await sender.vip.hasVip && money < 28999999 ? money : valorFinal;

        const calculaVIPTotalReceber = await sender.vip.hasVip && money < 28999999 ? money : valorFinal;
        const totalReceber = oldBankTwo + calculaVIPTotalReceber;
        const totalFicar = oldBankOne - money;
        const authorValorFinal = Math.floor(oldBankOne - money);
        // ===========> Fim Calculos e Taxas <=========== //

        const embed = new ClientEmbed()
            .setDescription(`<:coins_k:846487970612903976><:deposit:846485198669611089> ${message.author}, você está enviando **${Util.toAbbrev(money)} Coins** para ${uSrc.username}!\n <:porcentagem:1058512610791800952> ${sender.vip.hasVip && money < 28999999 ? '<:vipinfo:1047247009796599830>' : ''} *Uma taxa de ${sender.vip.hasVip && money < 28999999 ? ' 0' : Util.toAbbrev(taxa)} Coins* foi aplicada. ${uSrc} receberá o valor de **${Util.toAbbrev(valorFinalExibir)}**!`)
            .setColor(0x2E3035);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmSender')
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancelSender')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );

        const confirmationMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = confirmationMessage.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            if (i.user.id != message.author.id) {
                return i.reply({ content: `Eiii, apenas ${message.author.tag} pode aceitar isso, mete o pé!`, ephemeral: true });
            }

            if (i.customId === 'confirmSender') {

                // const { blocked, message: blockMessage } = await checkUserBlock(this.client, message.author.id, uSrc.id);
                // if (blocked) return i.reply({ content: blockMessage, ephemeral: true });

                const recipientEmbed = new ClientEmbed()
                    .setTitle('Confirmação de Transferência')
                    .setDescription(`<:coins_k:846487970612903976><:deposit:846485198669611089> ${message.author.username} deseja transferir **${Util.toAbbrev(money)}** para você. Deseja aceitar?\n <:porcentagem:1058512610791800952> ${sender.vip.hasVip && money < 28999999 ? '<:vipinfo:1047247009796599830>' : ''} *Uma taxa de ${sender.vip.hasVip && money < 28999999 ? ' 0' : Util.toAbbrev(taxa)} Coins* foi aplicada.`)
                    .setColor(0x2E3035);

                const recipientRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirmRecipient')
                            .setLabel('Confirmar')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancelRecipient')
                            .setLabel('Cancelar')
                            .setStyle(ButtonStyle.Danger)
                    );

                await i.update({ content: `Aguardando confirmação de ${uSrc.username}.`, embeds: [], components: [] });
                const recipientMessage = await message.channel.send({ content: `<@${uSrc.id}>`, embeds: [recipientEmbed], components: [recipientRow] });

                const recipientFilter = i => i.user.id === uSrc.id;
                const recipientCollector = recipientMessage.createMessageComponentCollector({ recipientFilter, time: 15000 });

                recipientCollector.on('collect', async i => {
                    if (i.user.id != uSrc.id) {
                        return i.reply({ content: `Eiii, apenas ${uSrc.username} pode aceitar isso, mete o pé!`, ephemeral: true });
                    }

                    if (i.customId === 'confirmRecipient') {
                        const newTransfer = {
                            sender: message.author.id,
                            receiver: uSrc.id,
                            amount: money
                        };

                        //const sender = await this.client.database.users.findOne({ idU: message.author.id });
                        //const recipient = await this.client.database.users.findOne({ idU: uSrc.id });

                        await this.client.database.users.updateOne(
                            { idU: message.author.id },
                            {
                                $inc: { bank: -money },
                                $set: {
                                    pay: Date.now(),
                                    blockpay: false,
                                    blockbet: false
                                }
                            }
                        );

                        await this.client.database.users.updateOne(
                            { idU: uSrc.id },
                            {
                                $inc: { bank: calculaVIP },
                                $set: {
                                    blockpay: false,
                                    blockbet: false
                                }
                            }
                        );

                        await i.update({ content: `<:coins_k:846487970612903976><:deposit:846485198669611089> ${uSrc.username} confirmou a transferência. **${Util.toAbbrev(valorFinalExibir)} Coins** foram transferidos para o banco de ${uSrc.username}!`, embeds: [], components: [] });
                        // ===========> Adiciona a Transação no Histórico <=========== //
                        await this.client.database.users.findOneAndUpdate({ idU: uSrc.id },
                            { $push: { transfers: { $each: [newTransfer], $position: 0, $slice: 20 } } });
                        await this.client.database.users.findOneAndUpdate({ idU: message.author.id },
                            { $push: { transfers: { $each: [newTransfer], $position: 0, $slice: 20 } } });
                        // ===========> Sistema AntiDup (CheckBank) <=========== //
                        //await checkAndCorrectBalance(this.client, message.author.id, oldBankOne - money );
                        //await checkAndCorrectBalance(this.client, uSrc.id, oldBankTwo + calculaVIP );

                        // ===========> Gambiarra Para Dup (Antiga) <=========== //
                        const authorDepois = await this.client.database.users.findOne({ idU: message.author.id });
                        const target2 = await this.client.database.users.findOne({ idU: uSrc.id });
                        const coinsDepoisAuthor = Math.floor(authorDepois.bank);
                        const coinsDepoisRecebedor = Math.floor(target2.bank);

                        const embedDDup = new EmbedBuilder()
                            .setAuthor({ name: 'Dup Encontrado!', iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
                            .setDescription(`**${message.author.tag} \`(${message.author.id})\`** enviou \`${Util.toAbbrev(Math.floor(valorFinalExibir))}\` para **${uSrc.tag} \`(${uSrc.id})\`**!\n\n*Verifique as logs do usuário em* <#1218679245396770837>`);

                        const embedLogPay = new EmbedBuilder()
                            .setDescription(`**${message.author.tag} \`(${message.author.id})\`** enviou \`${Util.toAbbrev(Math.floor(valorFinalExibir))}\` para **${uSrc.tag} \`(${uSrc.id})\`**!\n\n*Valores no banco antes da transação:*\n\nCoins de \`${uSrc.tag}\` - **${coinsAntesRecebedor}**\nCoins de \`${message.author.tag}\` - **${coinsAntesAuthor}**\n\n*Valores no banco depois da transação:*\n\nCoins de \`${uSrc.tag}\` - **${coinsDepoisRecebedor}**\nCoins de \`${message.author.tag}\` - **${coinsDepoisAuthor}**\n\nServidor Utilizado: \`${message.guild.name}\` \`(${message.guild.id})\``)
                            .setTimestamp();

                        Webhook.send({ embeds: [embedLogPay] });

                        if (coinsDepoisAuthor >= coinsAntesAuthor) {
                            WHKnew.send({ content: '<@&1089243477247791214>\nDupador Encontrado - Verifique Logs!', embeds: [embedDDup] });
                        }

                        if (coinsDepoisAuthor != authorValorFinal) {
                            WHKnew.send({ content: '<@&1089243477247791214>\nDup Nivel 3 Encontrado - Verifique Logs!', embeds: [embedDDup] });
                        }

                        if (coinsDepoisAuthor == coinsAntesAuthor) {
                            WHKnew.send({ content: '<@&1089243477247791214>\nPossível Dupador - Verifique Logs!', embeds: [embedDDup] });
                        }

                        if (coinsDepoisAuthor >= coinsAntesAuthor) {
                            WHKnew.send({ content: '<@&1089243477247791214>\nPossível Dupador - Verifique Logs!', embeds: [embedDDup] });
                        }

                        if (coinsDepoisRecebedor > totalReceber) {
                            WHKnew.send({ content: '<@&1089243477247791214>\nPossível Dupador - Verifique Logs!', embeds: [embedDDup] });
                        }
                    } else if (i.customId === 'cancelRecipient') {
                        await i.update({ content: `${uSrc.username} cancelou a transferência.`, embeds: [], components: [] });
                        // DESATIVA TRAVA DE SEGURANÇA //
                        await this.client.database.users.updateOne(
                            { idU: message.author.id },
                            {
                                $set: { blockbet: false, blockpay: false }
                            }
                        );
                        await this.client.database.users.updateOne(
                            { idU: uSrc.id },
                            {
                                $set: { blockbet: false, blockpay: false }
                            }
                        );
                        // DESATIVA FIM TRAVA DE SEGURANÇA //
                    }
                });

                recipientCollector.on('end', async (collected) => {
                    if (collected.size < 1) {
                        recipientMessage.edit({ content: 'Tempo esgotado. Transferência cancelada.', components: [], embeds: [] });
                    }
                    // DESATIVA TRAVA DE SEGURANÇA //
                    await this.client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $set: { blockbet: false, blockpay: false }
                        }
                    );
                    await this.client.database.users.updateOne(
                        { idU: uSrc.id },
                        {
                            $set: { blockbet: false, blockpay: false }
                        }
                    );
                    // DESATIVA FIM TRAVA DE SEGURANÇA //
                });
            } else if (i.customId === 'cancelSender') {
                await i.update({ content: 'Transferência cancelada pelo remetente.', embeds: [], components: [] });
                // DESATIVA TRAVA DE SEGURANÇA //
                await this.client.database.users.updateOne(
                    { idU: message.author.id },
                    {
                        $set: { blockbet: false, blockpay: false }
                    }
                );
                await this.client.database.users.updateOne(
                    { idU: uSrc.id },
                    {
                        $set: { blockbet: false, blockpay: false }
                    }
                );
                // DESATIVA FIM TRAVA DE SEGURANÇA //
            }
        });

        collector.on('end', async (collected) => {
            confirmationMessage.delete();
            // DESATIVA TRAVA DE SEGURANÇA //
            await this.client.database.users.updateOne(
                { idU: message.author.id },
                {
                    $set: { blockbet: false, blockpay: false }
                }
            );
            await this.client.database.users.updateOne(
                { idU: uSrc.id },
                {
                    $set: { blockbet: false, blockpay: false }
                }
            );
            // DESATIVA FIM TRAVA DE SEGURANÇA //
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

    if (sender.jogodavelha) {
        return { blocked: true, message: `Eiii, acho que ${senderId.username} tem uma transferência em aberto!` };
    }

    if (recipient.jogodavelha) {
        return { blocked: true, message: `Eiii, acho que ${recipientId.username} tem uma transferência em aberto!` };
    }

    return { blocked: false, message: null };
}

function calcularTaxa(valor) {
    let taxaPorcentagem;

    if (valor >= 4000000000) { // Acima de 4B 25% de taxa
        taxaPorcentagem = 25;
    } else if (valor >= 2000000000) { // Acima de 2B 19% de taxa
        taxaPorcentagem = 19;
    } else if (valor >= 1000000000) { // Acima de 1B 14% de taxa
        taxaPorcentagem = 14;
    } else if (valor >= 899999999) { // Acima de 900mM 11% de taxa
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