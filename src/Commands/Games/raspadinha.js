/* eslint-disable prefer-const */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');

module.exports = class RaspadinhaCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'raspadinha';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Compre uma raspadinha e tente a sorte.';
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

        const uSrc = await this.client.database.users.findOne({ idU: message.author.id });
        const money = await Util.notAbbrev(args[0]);

        if (!args[0]) {
            return message.reply({ content: `${message.author}, você pode comprar raspadinhas de 500 até 500k Coins. *k!raspadinha 100k*` });
        } else if (String(money) === 'NaN'){
            return message.reply({ content: `${message.author}, o valor fornecido é inválido.` });
        } else if (money < 500) {
            return message.reply({ content: `${message.author}, não existe raspadinhas por menos que 500 Coins.` });
        } else if (money > 500000) {
            return message.reply({ content: `${message.author}, o dinheiro não pode ser maior que 500k Coins.` });
        } else if (money > uSrc.bank) {
            return message.reply({ content: `${message.author}, você não possui essa quantia de coins!` });
        } else if (uSrc.blockpay) {
            return message.reply({ content: `${message.author}, você está com uma transação em andamento! Finalize...` });
        } else if (uSrc.blockbet) {
            return message.reply({ content: `${message.author}, você está com uma transação em andamento! Finalize...` });
        }

        uSrc.set({
            blockpay: true,
            blockbet: true
        });
        uSrc.save();

        const Embed = new EmbedBuilder()
            .setColor('#FF83A9')
            .setDescription(`Você deseja comprar uma raspadinha? será descontado **${Util.toAbbrev(Math.floor(money))} Coins** por cada raspadinha que você adquirir, lembrando que você pode ganhar ou perder, caso vença, será depositado o dobro do valor em seu banco, caso perca, será debitado o valor que comprou em raspadinhas.\n\nAperte no botão abaixo para concluir a compra de sua raspadinha!\n\n<:rabisco:1073396868303814757>  **Objetivo:** *Obter Três <:maca:1073383723388637265>*`)
            .setImage('https://cdn.discordapp.com/attachments/1109147495377944637/1109147506601889852/O0jPItN.png', { size: 1024 })
            .setThumbnail('https://cdn.discordapp.com/attachments/1109147495377944637/1109147553548738630/FFjeMHA.png', { size: 1024 });

        const confirmarButton = new ButtonBuilder()
            .setCustomId('confirmar')
            .setLabel('Comprar e Raspar')
            .setStyle('Secondary');

        const cancelarButton = new ButtonBuilder()
            .setCustomId('cancelar')
            .setLabel('Cancelar Compra')
            .setStyle('Danger');

        const buttonRow = new ActionRowBuilder().addComponents([confirmarButton, cancelarButton]);
        const msg = await message.reply({ embeds: [Embed], components: [buttonRow], fetchReply: true });
        const buttonFilter = (i) => {
            return i.isButton() && i.message.id === msg.id;
        };

        const buttonCollector = msg.createMessageComponentCollector({ buttonFilter, errors: ['time'], time: 20000 });
        let frutas = ['🍎', '🍊', '🍇', '🍓', '🍏'];

        let raspadinha = [];
        for (let i = 0; i < 9; i++) {
            raspadinha.push(frutas[Math.floor(Math.random() * frutas.length)]);
        }

        let resultado = raspadinha.filter(x => x === '🍎').length;

        buttonCollector.on('end', async (c, r) => {
            if (c.size === 0 && r === 'time') {
                uSrc.set({
                    blockpay: false,
                    blockbet: false
                });
                await uSrc.save();

                msg.edit({ content: `${message.author}, acabou o tempo para confirmar a compra da raspadinha!`, embeds: [], components: [], fetchReply: true });
            }
        });

        buttonCollector.on('collect', async (i) => {
            if (i.user.id == message.author.id) {
                if (i.customId === 'confirmar') {
                    if (resultado >= 3) {
                        uSrc.set({
                            bank: uSrc.bank + money,
                            blockpay: false,
                            blockbet: false
                        });
                        await uSrc.save();

                        return i.update({ content: `Parabéns! Você venceu! Aqui está a sua raspadinha: ${raspadinha.join(', ')}`, embeds: [], components: [], fetchReply: true });
                    } else {
                        uSrc.set({
                            bank: uSrc.bank - money,
                            blockpay: false,
                            blockbet: false
                        });
                        await uSrc.save();

                        return i.update({ content: `Você perdeu! Aqui está a sua raspadinha: ${raspadinha.join(', ')}`, embeds: [], components: [], fetchReply: true });
                    }
                } else if (i.customId === 'cancelar') {
                    uSrc.set({
                        blockpay: false,
                        blockbet: false
                    });
                    await uSrc.save();

                    return i.update({ content: `${message.author}, você cancelou a compra da raspadinha!`, embeds: [], components: [], fetchReply: true })
                }
            } else {
                return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }
        });
    }
};
