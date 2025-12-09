const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const moment = require('moment');
require('moment-duration-format');

module.exports = class CrimeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'crime';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Tente cometer um ato ilegal para obter coins.';
        this.config = {
            registerSlash: true,
            giveXp: false
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message }) {

        const user = await this.client.database.users.findOne({ idU: message.author.id });
        const arsenal = user.arsenal;

        const cooldown = 600000;
        const crimeD = user.crime.time;
        const time = cooldown - (Date.now() - crimeD);
        const sorteiaMulta = Math.floor(Math.random() * (100000 - 1000000)) + 1000000; //100000
        const sorteiaRecompensa = Math.floor(Math.random() * (500000 - 5000000)) + 5000000;

        const cooldownEMBED = new EmbedBuilder()
            .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription(`**Você cometeu um crime recentemente!**\n\nTente novamente em **${moment.duration(time).format('h [Horas] m [Minutos] e s [Segundos]')}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015103194256384111/cooldowncrime.png', { size: 1024 });

        if (crimeD !== null && cooldown - (Date.now() - crimeD) > 0)
            return message.reply({ embeds: [cooldownEMBED] });

        if (user.crime.valorMultas >= 10000000)
            return message.reply({ content: '<:kosame_wrong:1010978512825495613> Você possui mais de 10 milhões em multas acumuladas, pague para conseguir utilizar esse comando!' });

        if (user.blockpay)
            return message.reply(`Você está com uma transação em andamento! Finalize...`)

        if (user.blockbet)
            return message.reply(`Você está com uma transação em andamento! Finalize...`)

        const sucesso1 = new EmbedBuilder()
            .setDescription(`Você ficou 2 meses planejando um roubo à banco, foram com máscaras e roupas iguais para que dificultasse para os seguranças e policias do banco. O plano foi feito executado com maestria e você conseguiu roubar (**${Util.toAbbrev(sorteiaRecompensa)}**).\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015103302867886141/sucesso1.png');

        const sucesso2 = new EmbedBuilder()
            .setDescription(`Seu patrão o chamou para se infiltrar em um leilão de jóias com 5 comparsas, ao se infiltrar no local, você e seus comparsas concluíram o plano de roubar os produtos que seriam leiloados e você foi recompensando com uma maleta de dinheiro no valor de (**${Util.toAbbrev(sorteiaRecompensa)}**).\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015103456140349440/sucesso2.png');

        const sucesso3 = new EmbedBuilder()
            .setDescription(`Você está andando pelo bairro e um vendedor de drogas pede pra você fazer uma entrega como teste, você pega sua bicicleta e vai até o destino, mesmo que a polícia não te pare, você fica na adrenalina e um medo constante. Tudo dá certo e o vendedor te pagou (**${Util.toAbbrev(sorteiaRecompensa)}**) pela entrega das drogas.\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015103729101451374/sucesso3.png');

        const sucesso4 = new EmbedBuilder()
            .setDescription(`Ao acessar o Telegram, você entrou em grupos aleatórios de cartões clonados, com isso fez amizades com os clonadores de cartões e aprendeu os metódos necessários para fazer dinheiro. Na sua primeira venda de cartões clonados, você ganhou (**${Util.toAbbrev(sorteiaRecompensa)}**).\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015103744209322055/sucesso4.png');

        const sucesso5 = new EmbedBuilder()
            .setDescription(`Um novo morador de seu bairro te perguntou se você roubaria a casa de uma pessoa que o devia, você além de aceitar a oferta, concluiu corretamente e recebeu (**${Util.toAbbrev(sorteiaRecompensa)}**) pelo seu crime.\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015104007380938793/sucesso5.png');

        const sucesso6 = new EmbedBuilder()
            .setDescription(`Você criou um perfil no OnlyFans com fotos obstruídas do Google, o perfil virou um sucesso e ganhou vários seguidores. O OnlyFans te pagou (**${Util.toAbbrev(sorteiaRecompensa)}**) pelas vendas de fotos +18.\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015104099961819146/sucesso6.png');

        const sucesso7 = new EmbedBuilder()
            .setDescription(`Você é um hacker anônimo, porém famoso. Outra pessoa anônima te contrata para derrubar um site do governo, com suas habilidades, você consegue derrubar o site do governo e o contratante te paga (**${Util.toAbbrev(sorteiaRecompensa)}**) pelo bom trabalho.\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015104167053905990/sucesso7.png');

        const sucesso8 = new EmbedBuilder()
            .setDescription(`Você é acionado para um projeto de crime cibernéticos e fica responsável pelo roubo de dados financeiros ou credenciais bancárias de terceiros, você inclui uma programação criada em uma loja online de eletrônicos e recolhe diversos dados financeiros para a equipe. O dono do projeto te paga (**${Util.toAbbrev(sorteiaRecompensa)}**) pela contribuição.\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015104367361269810/sucesso8.png');

        const sucesso9 = new EmbedBuilder()
            .setDescription(`Em navegação pela OLX, você aplica diversos golpes anunciando diversos itens para a venda, porém, não cumpre com a entrega, recolhe apenas o valor depositado por quem deseja comprar. Na semana, você fez (**${Util.toAbbrev(sorteiaRecompensa)}**).\n\n<:win:1012117489968234596> **${Util.toAbbrev(sorteiaRecompensa)}**`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015104379910619197/sucesso9.png');

        const preso1 = new EmbedBuilder()
            .setDescription(`Você tentou assaltar uma loja, mantendo os trabalhadores de refém. Um dos reféns se arriscou, causando um tumulto após revidar e conseguir jogar a arma de um dos assaltantes no chão, após o caos criado, o segurança conseguiu uma brecha e contatou a polícia, você foi preso(a) e terá que pagar (**${Util.toAbbrev(sorteiaMulta)}**) de multa.\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105010016731136/preso1.png');

        const preso2 = new EmbedBuilder()
            .setDescription(`Você tentou roubar um banco só que as pessoas que trabalhavam na recepção eram treinadas e estavam armadas, você falhou mas matou 2 reféns. Os seguranças do banco contataram a polícia, você foi levado preso(a) e recebeu uma multa de (**${Util.toAbbrev(sorteiaMulta)}**).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105065398325289/preso2.png');

        const preso3 = new EmbedBuilder()
            .setDescription(`Você tentou roubar uma moto, mas era de um policial e ele levou você preso(a), além disso, terá que pagar uma multa no valor de (**${Util.toAbbrev(sorteiaMulta)}**).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105117575454770/preso3.png');

        const preso4 = new EmbedBuilder()
            .setDescription('Você se juntou com seus amigos do bairro e tentou revender gramas de maconha, porém, caiu numa falsa compra da polícia e foi preso(a).')
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105388787552326/preso4.png');

        const preso5 = new EmbedBuilder()
            .setDescription(`Você estava transportando uma maleta cheia de dinheiro em um avião roubado, no entanto, você foi descoberto pelo radar da aeronáutica e foi levado preso(a).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105452503220254/preso5.png');

        const preso6 = new EmbedBuilder()
            .setDescription(`Você viu seus amigos conseguindo aparelhos caros com frequência e achou estranha a situação, perguntou para eles descobrindo que usam cartões clonados para efetuar a compra do que deseja. Você se interessou e comprou um celular com cartão clonado mas foi descoberto e preso(a) pela polícia federal, além de pagar uma multa de (**${Util.toAbbrev(sorteiaMulta)}**).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105727779586048/preso6.png');

        const multa2 = new EmbedBuilder()
            .setDescription(`Você estava com pressa para chegar em casa e estava acima de 100km/h e mexendo no celular, porém não esperava que o sinal tinha radar e recebeu uma multa de (**${Util.toAbbrev(sorteiaMulta)}**).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015105935913529394/multa1.png');

        const multa3 = new EmbedBuilder()
            .setDescription(`Você foi visto pela polícia bêbado mijando na rua após sair de uma boate, você e o policial ficaram debatendo por um longo tempo, ao decorrer do tempo, você se estressou e xingou o policial, automaticamente o policial o levou para delegacia por desacato e você terá que pagar uma multa no valor de (**${Util.toAbbrev(sorteiaMulta)}**).\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015106005350240338/multa2.png');

        const multa4 = new EmbedBuilder()
            .setDescription(`Você estacionou sem querer numa vaga de deficiente e os guardas de trânsitos te aplicaram uma multa enquanto você fazia compras no supermercado. Portanto, pagará o valor de (**${Util.toAbbrev(sorteiaMulta)}**) em uma multa.\n\n<:lose:1012117476328357988> **${Util.toAbbrev(sorteiaMulta)}**`)
            .setFooter({ text: 'Utilize k!ficha ou /ficha para ver seu perfil no governo!' })
            .setThumbnail('https://cdn.discordapp.com/attachments/1015103158843871252/1015106063198077058/multa3.png');

        var arraySucesso = [sucesso1, sucesso2, sucesso3, sucesso4, sucesso5, sucesso6, sucesso7, sucesso8, sucesso9];
        var arrayPreso = [preso1, preso2, preso3, preso4, preso5, preso6];
        var arrayMulta = [multa2, multa3, multa4];

        let sorteiaResultado;
        let exibeResultado;
        const embedSucesso = arraySucesso[Math.floor(Math.random() * arraySucesso.length)];
        const embedMulta = arrayMulta[Math.floor(Math.random() * arrayMulta.length)];
        const embedPreso = arrayPreso[Math.floor(Math.random() * arrayPreso.length)];

        const deuCerto = 'deuCerto';
        const deuMulta = 'deuMulta';
        const foiPreso = 'foiPreso';

        if (arsenal.hasFaca) {
            sorteiaResultado = [deuCerto, deuCerto, deuCerto, deuMulta, foiPreso, deuCerto][Math.floor(Math.random() * 6)];
        } else if (arsenal.hasPistola) {
            sorteiaResultado = [deuCerto, deuCerto, deuCerto, deuCerto, deuMulta, foiPreso][Math.floor(Math.random() * 6)];
        } else if (arsenal.hasFuzil) {
            sorteiaResultado = [deuCerto, deuCerto, deuCerto, deuCerto, deuCerto, deuCerto, deuMulta, deuCerto, foiPreso][Math.floor(Math.random() * 9)];
        } else {
            sorteiaResultado = [deuCerto, deuCerto, deuCerto, foiPreso, deuCerto, deuMulta][Math.floor(Math.random() * 6)];
        }

        if (sorteiaResultado == deuCerto) {
            exibeResultado = embedSucesso;
            user.crime.sucessos = user.crime.sucessos + 1;
            user.crime.id = message.author.id;
            user.crime.user = message.author.tag;
            user.crime.time = Date.now();
            user.bank = user.bank + sorteiaRecompensa;
            user.save();
        } else if (sorteiaResultado == deuMulta) {
            exibeResultado = embedMulta;

            if (user.crime.valorMultas >= 1000000) {
                user.crime.valorMultas = user.crime.valorMultas + sorteiaMulta;
                user.multas = user.multas + 1;
                user.portearmas = false;
                user.crime.id = message.author.id;
                user.crime.user = message.author.tag;
                user.crime.time = Date.now();
                user.save();
            } else {
                user.crime.valorMultas = user.crime.valorMultas + sorteiaMulta;
                user.multas = user.multas + 1;
                user.crime.id = message.author.id;
                user.crime.user = message.author.tag;
                user.crime.time = Date.now();
                user.save();
            }

        } else if (sorteiaResultado == foiPreso) {
            exibeResultado = embedPreso;

            if (user.crime.valorMultas >= 1000000) {
                user.crime.valorMultas = user.crime.valorMultas + sorteiaMulta;
                user.crime.prisoes = user.crime.prisoes + 1;
                user.multas = user.multas + 2;
                user.crime.id = message.author.id;
                user.portearmas = false;
                user.crime.user = message.author.tag;
                user.crime.time = Date.now();
                user.arsenal.hasColete = false;
                user.arsenal.hasFaca = false;
                user.arsenal.hasPistola = false;
                user.arsenal.hasFuzil = false;
                user.save();
            } else {
                user.crime.valorMultas = user.crime.valorMultas + sorteiaMulta;
                user.crime.prisoes = user.crime.prisoes + 1;
                user.multas = user.multas + 2;
                user.crime.id = message.author.id;
                user.crime.user = message.author.tag;
                user.crime.time = Date.now();
                user.arsenal.hasColete = false;
                user.arsenal.hasFaca = false;
                user.arsenal.hasPistola = false;
                user.arsenal.hasFuzil = false;
                user.save();
            }
        }

        message.reply({ embeds: [exibeResultado] });
    }
};
