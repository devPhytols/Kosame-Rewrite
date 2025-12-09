const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const talkedRecently = new Set();

module.exports = class CopoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'copo';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '💸 Economia';
        this.description = 'Adivinhe em qual copo está a bolinha e receba coins.';
        this.config = {
            registerSlash: false
        };
        this.options = [
            {
                name: 'quantidade',
                description: 'Quantidade de moedas que deseja apostar no copo.',
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

        const User = await this.client.database.users.findOne({ idU: message.author.id });

        const money = await Util.notAbbrev(args[0]);
        const recompensa = money * 2;

        if (!args[0])
            return message.reply({ content: `${message.author}, você deve inserir uma quantia de 1k até 50k.` });

        if (String(money) === 'NaN')
            return message.reply({ content: `${message.author}, o dinheiro é inválido.` });

        if (money < 1000)
            return message.reply({ content: `${message.author}, dinheiro menor ou igual a 1000` });

        if (money > 50000)
            return message.reply({ content: `${message.author}, dinheiro não pode ser maior que 50k` });

        if (money > User.bank)
            return message.reply({ content: `${message.author}, você não possui essa quantia de coins!` });

        if (talkedRecently.has(message.author.id))
            return message.reply('Aguarde 10 segundos para usar o copo novamente!');

        if (User.blockpay)
            return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

        if (User.blockbet)
            return message.reply({ content: 'Você está com uma transação em andamento! Finalize...' });

        User.bank = User.bank - money;
        User.blockpay = true;
        User.blockbet = true;
        User.save();

        talkedRecently.add(message.author.id);

        setTimeout(() => {
            // Remove o usuario do cooldown após 15 segundos
            talkedRecently.delete(message.author.id);
        }, 10000);

        const embed1 = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription('Em qual copo a bolinha está?');

        const embedTimeout = new EmbedBuilder()
            .setColor('#f02626')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription('Acabou o tempo para confirmar!');

        const embed2 = new EmbedBuilder()
            .setColor('#f02626')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(`Você acertou o copo que tinha a bolinha\ne recebeu (**${Util.toAbbrev(Math.floor(recompensa))}**) coins!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015102860020695171/copobanner.png');

        const copo1Button = new ButtonBuilder()
            .setCustomId('opc1')
            .setLabel('1')
            .setStyle('Secondary')
            .setEmoji('<:copoks1:1012558791335739444>');

        const copo2Button = new ButtonBuilder()
            .setCustomId('opc2')
            .setLabel('2')
            .setStyle('Secondary')
            .setEmoji('<:copoks1:1012558791335739444>');

        const copo3Button = new ButtonBuilder()
            .setCustomId('opc3')
            .setLabel('3')
            .setStyle('Secondary')
            .setEmoji('<:copoks1:1012558791335739444>');

        const sorteiaNumero = Math.floor(Math.random() * 4) + 1;
        const resultado = sorteiaNumero;

        const buttonRow = new ActionRowBuilder().addComponents([copo1Button, copo2Button, copo3Button]);
        const msg = await message.reply({ embeds: [embed1], components: [buttonRow], fetchReply: true });
        const copoFilter = (i) => {
            return i.isButton() && i.message.id === msg.id;
        };
        const copoCollector = message.channel.createMessageComponentCollector({ filter: copoFilter, time: 15000, errors: ['time'], max: 1 });

        copoCollector.on('end', async (c) => {
            const components = [copo1Button, copo2Button, copo3Button];

            components.forEach((x) => x.setDisabled(true));
            msg.edit({ embeds: [embedTimeout], components: [buttonRow] });
            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                {
                    $set: {
                        blockpay: false,
                        blockbet: false
                    }
                });
        });

        copoCollector.on('collect', (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true });
            }

            if (i.customId === 'opc1') {
                msg.delete();
                const numero1 = 1;

                if (resultado == numero1) {
                    User.bank = User.bank + recompensa;
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author}`, embeds: [embed2] });
                } else {
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author} A bolinha não estava no copo 1!` });
                }
            }

            if (i.customId === 'opc2') {
                msg.delete();
                const numero2 = 2;

                if (resultado == numero2) {
                    User.bank = User.bank + recompensa;
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author}`, embeds: [embed2] });
                } else {
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author} A bolinha não estava no copo 2!` });
                }
            }

            if (i.customId === 'opc3') {
                msg.delete();
                const numero3 = 3;

                if (resultado == numero3) {
                    User.bank = User.bank + recompensa;
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author}`, embeds: [embed2] });
                } else {
                    User.blockpay = false;
                    User.blockbet = false;
                    User.save();
                    return i.reply({ content: `${message.author} A bolinha não estava no copo 3!` });
                }
            }
        });
    }
};