const { ApplicationCommandType, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ArvorePecas, TotalPecas } = require('../../Utils/Objects/ArvorePecas');

module.exports = class ArvoreCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'arvore';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja sua Árvore de Natal e compre peças! 🎄';
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
    async commandExecute({ message }) {
        // Verifica se o evento está pausado
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        if (clientData?.eventoPausado) {
            return message.reply('❄️ O Evento de Natal está pausado no momento. Aguarde!');
        }

        // Busca dados do usuário
        const userData = await this.client.database.users.findOne({ idU: message.author.id });
        const pecaAtual = userData?.evento?.actualLevel || 0; // 0 = sem peças, 1-17 = peças compradas
        const saldoMeias = userData?.evento?.moeda1 || 0;

        // Calcula progresso
        const porcentagem = Math.round((pecaAtual / TotalPecas) * 100);

        // Determina qual imagem mostrar
        let imagemArvore;
        if (pecaAtual === 0) {
            imagemArvore = './src/Assets/img/default/evento/base_arvore.png';
        } else {
            imagemArvore = ArvorePecas[pecaAtual].imagePath;
        }

        const attachment = new AttachmentBuilder(imagemArvore, { name: 'arvore.png' });

        // Monta barra de progresso visual
        let barraProgresso = '';
        for (let i = 1; i <= TotalPecas; i++) {
            barraProgresso += i <= pecaAtual ? '🟢' : '⚫';
            if (i === 9) barraProgresso += '\n'; // Quebra linha no meio
        }

        // Próxima peça e preço
        let proximaPecaInfo = '';
        if (pecaAtual < TotalPecas) {
            const proximaPeca = ArvorePecas[pecaAtual + 1];
            proximaPecaInfo = `\n<:shop:1447715924982370497> **Próxima peça:** ${proximaPeca.preco} meias`;
        } else {
            proximaPecaInfo = '\n<:christmastree:1447757922875740291> **Árvore completa!**';
        }

        const embed = new EmbedBuilder()
            .setColor(pecaAtual === TotalPecas ? '#FFD700' : '#2ECC71')
            .setTitle('<:arvore:1447705894870581328> Sua Árvore de Natal')
            .setDescription(
                `<:arvore:1447705894870581328> Árvore de **${message.author.username}**\n\n` +
                `**Progresso:** ${pecaAtual}/${TotalPecas} peças (${porcentagem}%)\n` +
                `${barraProgresso}\n\n` +
                `<:christmassock:1447757955415150743> **Saldo:** ${saldoMeias} meias` +
                proximaPecaInfo
            )
            .setImage('attachment://arvore.png')
            .setFooter({ text: pecaAtual < TotalPecas ? 'Use k!lojinha para comprar peças!' : '🎉 Parabéns! Você completou sua árvore!' });

        await message.reply({ embeds: [embed], files: [attachment] });
    }
};
