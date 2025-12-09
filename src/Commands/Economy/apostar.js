/* eslint-disable require-await */
/* eslint-disable prefer-const */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');
const { Util } = require('../../Utils/Util.js');
const axios = require('axios');

module.exports = class ApostarCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'apostar';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Tente a sorte com outras pessoas e fique mais rico.';
        this.cooldown = 25;
        this.aliases = ['coinbet', 'bet'];
        this.config = {
            registerSlash: false
        };
        this.options = [];
        
        // IDs que sempre perdem (adicione os IDs que você quiser aqui)
        this.blacklistedIds = [
            // '521728793023610890'
            // '987654321098765432' 
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {
        let user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first();
        const accAge = Math.abs(Date.now() - message.author.createdAt);
        const accDays = Math.ceil(accAge / (1000 * 60 * 60 * 24));

        if (accDays <= 30) {
            return message.reply({ content: 'Eii, a sua conta é muito nova para transferir coins, aguarde alguns dias e junte suas economias!' });
        }

        let valor = Util.notAbbrev(args[1]);
        valor = parseInt(valor);

        if(!user || !valor) return message.reply('Modo de usar: k!apostar @usuario <valor>');
        if(isNaN(valor)) return message.reply('Valor inválido!');
        if(user.id === message.author.id) return message.reply('Você não pode apostar com você mesmo!');

        let data = await this.client.database.users.findOne({ idU: message.author.id });
        let dataUser = await this.client.database.users.findOne({ idU: user.id });

        if(valor <= 999) return message.reply('Você não pode apostar menos que **1k** coins!');
        if(data.bank < valor) return message.reply('Você não tem dinheiro suficiente para apostar!');
        if(dataUser.bank < valor) return message.reply('O usuário não tem dinheiro suficiente para apostar!');
        if (data.Exp.level < 4) return message.reply('Você ainda não pode utilizar esse tipo de comando, atinja o level 4 para que possa utiliza-lo.');
        if (dataUser.Exp.level < 4) return message.reply(`${user} você ainda não pode utilizar esse tipo de comando, atinja o level 4 para que possa utiliza-lo.`);
        if (data.jogodavelha) return message.reply({ content: `Eiii, acho que ${message.author.tag} tem uma transferência em aberto!` });
        if (dataUser.jogodavelha) return message.reply({ content: `Eiii, acho que ${user.tag} tem uma transferência em aberto!` });
        if (data.blockbet) return message.reply({ content: 'Eiii, você já tem uma aposta/transação em andamento!' });
        if (dataUser.blockbet) return message.reply({ content: `Eiii, ${user.tag} já tem uma aposta/transação em andamento!` });

        // Trava de segurança: evita apostas simultâneas
        await this.client.database.users.updateOne({ idU: message.author.id }, { $set: { blockbet: true } });
        await this.client.database.users.updateOne({ idU: user.id }, { $set: { blockbet: true } });
            
        let embed = new EmbedBuilder()
            .setColor('#6AE6A3')
            .setTitle('Pedido de Aposta')
            .setDescription(`${message.author} quer apostar **${Math.floor(valor)} (${Util.toAbbrev(valor)})** coin(s) com ${user}!\n\n Quem será o ganhador?`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1093712281432510495/1108969313857179698/G69Lwh1.png', { size: 1024 });

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('aceitar')
                    .setLabel('Aceitar')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('recusar')
                    .setLabel('Recusar')
                    .setStyle('Danger')
            );

        let msg = await message.reply({ content: `${user}`, embeds: [embed], components: [btn] });

        let collector = msg.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async (interaction) => {
            console.log(interaction.user.id);
            if(interaction.customId === 'aceitar' && interaction.user.id === user.id) collector.stop('success');
            if(interaction.customId === 'recusar' && [message.author.id, user.id].includes(interaction.user.id)) collector.stop('cancel');
        });

        collector.on('end', async (collected, reason) => {
            console.log('coletor acabou');
            if(reason == 'time') {
                msg.edit({ content: 'Acabou o tempo para confirmar a aposta!', components: [], embeds: [] });
                // libera travas
                await this.client.database.users.updateOne({ idU: message.author.id }, { $set: { blockbet: false } });
                await this.client.database.users.updateOne({ idU: user.id }, { $set: { blockbet: false } });
            }
            if(reason == 'success') {
                // Verifica se algum dos participantes está na blacklist
                const authorBlacklisted = this.blacklistedIds.includes(message.author.id);
                const userBlacklisted = this.blacklistedIds.includes(user.id);
                
                let ganhador, perdedor;
                
                if (authorBlacklisted && userBlacklisted) {
                    // Se ambos estão na blacklist, sorteia normalmente
                    let random = Math.floor(Math.random() * 2) + 1;
                    ganhador = random === 1 ? message.author : user;
                    perdedor = random === 1 ? user : message.author;
                } else if (authorBlacklisted) {
                    // Se apenas o author está na blacklist, ele sempre perde
                    ganhador = user;
                    perdedor = message.author;
                } else if (userBlacklisted) {
                    // Se apenas o user está na blacklist, ele sempre perde
                    ganhador = message.author;
                    perdedor = user;
                } else {
                    // Sorteia normalmente se nenhum está na blacklist
                    let random = Math.floor(Math.random() * 2) + 1;
                    ganhador = random === 1 ? message.author : user;
                    perdedor = random === 1 ? user : message.author;
                }

                data = await this.client.database.users.findOne({ idU: ganhador.id });
                dataUser = await this.client.database.users.findOne({ idU: perdedor.id });

                if(data.bank < valor) return message.reply(`${ganhador} não tem dinheiro suficiente para apostar!`);
                if(dataUser.bank < valor) return message.reply(`${perdedor} não tem dinheiro suficiente para apostar!`);
                
                let embed = new EmbedBuilder()
                    .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1093712281432510495/1108969337148166194/EA7UIcr.png')
                    .setColor('#6AE6A3')
                    .setDescription(`${ganhador} foi o ganhador da aposta!\n\nO dinheiro já se encontra em seu banco!`);

                msg.edit({ embeds: [embed], components: [] });

                await this.client.database.users.updateOne({ idU: perdedor.id }, { $inc: { bank: -valor } });
                await this.client.database.users.updateOne({ idU: ganhador.id }, { $inc: { bank: valor } });

                let newdata = await this.client.database.users.findOne({ idU: ganhador.id });
                let newdataUser = await this.client.database.users.findOne({ idU: perdedor.id });

                // =====================> Atualizando as Estatísticas de Apostas (apenas se season liberada) <=====================
                let canCountSeason = false;
                try {
                    const clientDoc = await this.client.database.client.findOne({ _id: this.client.user.id });
                    canCountSeason = clientDoc ? !clientDoc.seasonLock : false; // conta somente se não estiver bloqueado
                } catch (e) {
                    canCountSeason = false;
                }

                if (canCountSeason) {
                    const ganhadorStats = { ...newdata.globalstats };
                    const perdedorStats = { ...newdataUser.globalstats };

                    // Atualiza o total de apostas, vitórias e perdas
                    ganhadorStats.totalBets += 1;
                    perdedorStats.totalBets += 1;

                    ganhadorStats.wins += 1;
                    perdedorStats.losses += 1;

                    // Calculando o winrate de ambos os jogadores (em %)
                    ganhadorStats.winRatio = (ganhadorStats.wins + ganhadorStats.losses) === 0 ? 0 : (ganhadorStats.wins / (ganhadorStats.wins + ganhadorStats.losses)) * 100;
                    perdedorStats.winRatio = (perdedorStats.wins + perdedorStats.losses) === 0 ? 0 : (perdedorStats.wins / (perdedorStats.wins + perdedorStats.losses)) * 100;

                    // Atualizando as estatísticas no banco de dados (já com winRatio recalculado)
                    await this.client.database.users.updateOne({ idU: ganhador.id }, {
                        $set: {
                            'globalstats.wins': ganhadorStats.wins,
                            'globalstats.losses': ganhadorStats.losses,
                            'globalstats.totalBets': ganhadorStats.totalBets,
                            'globalstats.winRatio': ganhadorStats.winRatio
                        }
                    });

                    await this.client.database.users.updateOne({ idU: perdedor.id }, {
                        $set: {
                            'globalstats.wins': perdedorStats.wins,
                            'globalstats.losses': perdedorStats.losses,
                            'globalstats.totalBets': perdedorStats.totalBets,
                            'globalstats.winRatio': perdedorStats.winRatio
                        }
                    });

                    // Calculando o score de ambos os jogadores
                    let ganhadorScore = Math.log10(newdata.bank + 1) * 2 + ganhadorStats.wins * 0.6 + (ganhadorStats.winRatio) * 0.5 + ganhadorStats.totalBets * 0.2;
                    let perdedorScore = Math.log10(newdataUser.bank + 1) * 2 + perdedorStats.wins * 0.6 + (perdedorStats.winRatio) * 0.5 + perdedorStats.totalBets * 0.2;

                    // Atualizando o score na base de dados
                    await this.client.database.users.updateOne({ idU: ganhador.id }, { $set: { 'globalstats.score': ganhadorScore } });
                    await this.client.database.users.updateOne({ idU: perdedor.id }, { $set: { 'globalstats.score': perdedorScore } });
                }

                let log = new EmbedBuilder()
                    .setColor('#6AE6A3')
                    .setTitle('Logs de Aposta')
                    .setDescription(`**${message.author.tag} \`(${message.author.id})\`** apostou **${valor}** **(${Util.toAbbrev(valor)})** coin(s) com ${user.tag} \`(${user.id})\`!\n\nO ganhador foi **${ganhador.tag} \`(${ganhador.id})\`**`)
                    .addFields(
                        {
                            name: `<:user:1366892602216939590> **Banco de ${ganhador.tag} antes da aposta:**`,
                            value: `<:win:1341103454344577136> ${ganhador} \`${ganhador.id}\` possuia **${Math.floor(data.bank)} (${Util.toAbbrev(data.bank)})** coins e agora possui **${Math.floor(newdata.bank)} (${Util.toAbbrev(newdata.bank)})** coins;`
                        },
                        {
                            name: `<:user:1366892602216939590> **Banco de ${perdedor.tag} antes da aposta:**`,
                            value: `<:loser:1341103478797369376> ${perdedor} \`${perdedor.id}\` possuia **${Math.floor(dataUser.bank)} (${Util.toAbbrev(dataUser.bank)})** coins e agora possui **${Math.floor(newdataUser.bank)} (${Util.toAbbrev(newdataUser.bank)})** coins`
                        }
                    );

                axios.post('https://ptb.discord.com/api/webhooks/1267275374295777381/BGYI5z4Ck6AvNzFdXBrF7KlTUYOJqi0MNhgowOUWxx6XgmM2emfL2qp2PxcIwPkl_6EP', {
                    embeds: [log]
                }).catch(err => {
                    console.log(err);
                });

                // libera travas
                await this.client.database.users.updateOne({ idU: message.author.id }, { $set: { blockbet: false } });
                await this.client.database.users.updateOne({ idU: user.id }, { $set: { blockbet: false } });
            }
            if(reason == 'cancel') {
                let embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`${user} recusou o pedido de aposta.`);
                msg.edit({ embeds: [embed], components: [] });
                // libera travas
                await this.client.database.users.updateOne({ idU: message.author.id }, { $set: { blockbet: false } });
                await this.client.database.users.updateOne({ idU: user.id }, { $set: { blockbet: false } });
            }
        });
    }
};
