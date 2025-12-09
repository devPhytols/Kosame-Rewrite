/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, WebhookClient, User } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class StealCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'steal';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Comando para roubar a carteira de algum membro.';
        this.aliases = ['roubar', 'rob'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'Informe a pessoa que você deseja roubar.',
                required: true,
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {

        const USER = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();

        if (!USER)
            return message.reply({ content: 'Você deve mencionar quem deseja roubar primeiro.' });

        if (USER.id === message.author.id)
            return message.reply({ content: 'Você não pode roubar a si mesmo.' });
            //https://ptb.discord.com/api/webhooks/1267276849021714463/_76eWpH_uxzKvBuA3OO1gCA5RQvpjF_MLlTDBh-NkCFFdov-pNtxg-motZ8F2POs5_Tb
        const Webhook = new WebhookClient({ id: '1267276849021714463', token: '_76eWpH_uxzKvBuA3OO1gCA5RQvpjF_MLlTDBh-NkCFFdov-pNtxg-motZ8F2POs5_Tb' });

        const doc = await this.client.database.users.findOne({ idU: message.author.id });
        const cooldown = 3.6e6; //30 Minutos  1.8e6
        const user_cd = 1.8e6; //1 Hora  3.6e6
        const target = await this.client.database.users.findOne({ idU: USER.id });

        if (!target)
            return message.reply({ content: `${message.author}, este usuário não está registrado em minha database.` });

        if ((!doc.arsenal.hasPistola) && (!doc.arsenal.hasFuzil))
            return message.reply({ content: '<:kosame_wrong:1010978512825495613> Você deve possuir uma arma de fogo para roubar alguém!' });

        if (doc.blockpay)
            return message.reply({ content: 'Aguarde para utilizar este comando novamente...' });

        if (doc.blockbet)
            return message.reply({ content: 'Aguarde para utilizar este comando novamente...' });

        if (doc.Exp.level < 3)
            return message.reply({ content: 'Você ainda não pode utilizar esse tipo de comando, atinja o level 3 para que possa utiliza-lo.' });

        if (doc.crime.valorMultas >= 5000000)
            return message.reply({ content: '<:kosame_wrong:1010978512825495613> Você possui mais de 5 milhões em multas acumuladas, pague para conseguir utilizar esse comando!' });

        const coinsInicial = target.coins;
        const money = Math.ceil((50 / 100) * target.coins);

        if (cooldown - (Date.now() - doc.steal.time) > 0)
            return message.reply({ content: `<:warning:847276939281956895> Você deve aguardar **${moment.duration(cooldown - (Date.now() - doc.steal.time)).format('h [hora(s)] m [minutos] e s [segundo(s)]').replace('minsutos', 'minuto(s)')}** até poder roubar novamente.` });

        if (user_cd - (Date.now() - target.steal.protection) > 0)
            return message.reply({ content: `<:security:847276956034793482> O membro está em proteção por **${moment.duration(user_cd - (Date.now() - target.steal.protection)).format('d [dia(s)] h [hora(s)] m [minutos] e s [segundo(s)]').replace('minsutos', 'minuto(s)')}**.` });

        if (target.coins <= 500)
            return message.reply({ content: '<:warning:847276939281956895> Você não pode roubar alguém que tenha **500 Coins** ou menos na carteira.' });


        const embedConfirmar = new ClientEmbed()
            .setDescription(`Tem certeza que você deseja roubar a carteira de ${USER}?`);

        const row = new ActionRowBuilder();

        const retribuirButton = new ButtonBuilder()
            .setCustomId('confirmar')
            .setLabel('Confirmar')
            .setEmoji('<:steal:847275691833163787>')
            .setStyle('Success');

        row.addComponents([retribuirButton]);

        const msg = await message.reply({ embeds: [embedConfirmar], components: [row], fetchReply: true });

        let collect;

        const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id;
        };

        const collector = msg.createMessageComponentCollector({ filter: filter, time: 5000 });

        collector.on('collect', async (x) => {
            if (x.user.id != message.author.id)
                return x.reply({ content: 'Eiii, você não faz parte desse assalto!', ephemeral: true });

            collect = x;

            switch (x.customId) {
                case 'confirmar': {

                    const usermVerifica = await this.client.database.users.findOne({ idU: message.author.id });
                    const targetEnd = await this.client.database.users.findOne({ idU: USER.id });

                    const cooldown = 13000;
                    const paybet = usermVerifica.paydown2;
                    const time = cooldown - (Date.now() - paybet);

                    const cooldown2 = 13000;
                    const coinbet = usermVerifica.betdown2;
                    const time2 = cooldown - (Date.now() - coinbet);

                    const coinsFinal = targetEnd.coins;

                    if (paybet !== null && cooldown - (Date.now() - paybet) > 0)
                        return x.update({ content: '<:warning:847276939281956895> Você não conseguiu roubar o usuário!', embeds: [], components: [] });

                    if (coinbet !== null && cooldown2 - (Date.now() - coinbet) > 0)
                        return x.update({ content: '<:warning:847276939281956895> Você não conseguiu roubar o usuário!', embeds: [], components: [] });

                    if (coinsFinal !== coinsInicial)
                        return x.update({ content: '<:warning:847276939281956895> Você não conseguiu roubar o usuário!', embeds: [], components: [] });

                    const authorAntes = await this.client.database.users.findOne({ idU: message.author.id });
                    const targetAntes = await this.client.database.users.findOne({ idU: USER.id });

                    const coinsAntesAuthor = Util.toAbbrev(Math.floor(authorAntes.coins));
                    const coinsAntesRecebedor = Util.toAbbrev(Math.floor(targetAntes.coins));

                    x.update({ content: `<:steal:847275691833163787><:coins:842208238631125053> Você roubou **${money} coins** de ${USER}.`, embeds: [], components: [] });
                    await this.client.database.users.updateOne(
                        { idU: message.author.id },
                        {
                            $inc: { coins: money },
                            $set: { 'steal.time': Date.now() }
                        }
                    );

                    await this.client.database.users.updateOne(
                        { idU: USER.id },
                        {
                            $inc: { coins: -money },
                            $set: { 'steal.protection': Date.now() }
                        }
                    );


                    const targetVerifica = await this.client.database.users.findOne({ idU: USER.id });

                    const coinsFinalVerifica = targetVerifica.coins;
                    const verificaMoney = Math.ceil((50 / 100) * coinsInicial);

                    if (coinsFinalVerifica > verificaMoney) {
                        await this.client.database.users.updateOne(
                            { idU: message.author.id },
                            {
                                $set: { coins: 0 }
                            }
                        );
                    }

                    const authorDepois = await this.client.database.users.findOne({ idU: message.author.id });
                    const target2 = await this.client.database.users.findOne({ idU: USER.id });

                    const coinsDepoisAuthor = Util.toAbbrev(Math.floor(authorDepois.coins));
                    const coinsDepoisRecebedor = Util.toAbbrev(Math.floor(target2.coins));
                    const embedSteal = new ClientEmbed(this.client.user)
                        .setDescription(`${message.author.tag} \`(${message.author.id})\` roubou ${Math.floor(money)} de ${USER.tag} \`(${USER.id})\`\n\n*Valores na mão antes da transação:*\n\nCarteira de ${message.author.tag} \`(${message.author.id})\` - ${coinsAntesAuthor} Coins\nCarteira de ${USER.tag} \`(${USER.id})\` - ${coinsAntesRecebedor} Coins\n\n*Valores na mão depois da transação:*\n\nCarteira de ${message.author.tag} \`(${message.author.id})\` - ${coinsDepoisAuthor} Coins\nCarteira de ${USER.tag} \`(${USER.id})\` - ${coinsDepoisRecebedor} Coins\n\nServidor Utilizado: \`${message.guild.name}\` \`(${message.guild.id})\``)
                        .setTimestamp();

                    Webhook.send({embeds: [embedSteal]});
                    break;
                }
            }
        });

        collector.on('end', (x) => {
            if (collect) return;
            try {
                message.channel.messages.fetch(msg.id)
                    .then(message =>
                        msg.edit({
                            content: 'Acabou o tempo para confirmar o assalto!',
                            embeds: [],
                            components: []
                        })
                    );
            } catch (error) {
                collector.stop();
                return;
            }
        });
    }
};
