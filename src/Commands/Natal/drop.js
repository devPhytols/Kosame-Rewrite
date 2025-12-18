const { ApplicationCommandType, AttachmentBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');
const { createCanvas } = require('canvas');

module.exports = class DropCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'drop';
        this.type = ApplicationCommandType.ChatInput;
        this.category = '🎄 Natal';
        this.description = 'Envia um drop do Papai Noel manualmente.';
        this.aliases = [];
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /**
     * Gera uma imagem com a palavra para evitar bots
     */
    generateWordImage(word) {
        const canvas = createCanvas(300, 80);
        const ctx = canvas.getContext('2d');

        // Fundo com gradiente natalino
        const gradient = ctx.createLinearGradient(0, 0, 300, 0);
        gradient.addColorStop(0, '#1a472a');
        gradient.addColorStop(0.5, '#2d5a3d');
        gradient.addColorStop(1, '#1a472a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 300, 80);

        // Borda decorativa
        ctx.strokeStyle = '#c41e3a';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 296, 76);

        // Texto da palavra
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Adiciona sombra
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(word.toUpperCase(), 150, 40);

        return canvas.toBuffer('image/png');
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message }) {
        // Verifica se é staff ou desenvolvedor
        if (!this.client.developers.includes(message.author.id) && !this.client.team.includes(message.author.id)) {
            return;
        }

        // Configurações do drop
        const channelIds = [
            '1447744168263811133',
            '1447744198991417404'
        ];

        const palavras = [
            'panetone', 'peru', 'rabanada', 'tender', 'vinho', 'bolo', 'pudim', 'presente', 'estrela', 'sino',
            'rena', 'papainoel', 'boneco', 'floco', 'vela', 'laco', 'treno', 'duende', 'anjo', 'neve',
            'arvore', 'natal', 'meias', 'lareira', 'manjedoura', 'cantata', 'coral', 'alegria', 'familia',
            'ceia', 'brinde', 'amigo', 'cartao', 'feliz', 'fogos',
            'luzes', 'enfeite', 'bola', 'pinheiro', 'azevinho', 'gengibre', 'canela',
            'chocolate', 'biscoito', 'decoracao', 'fita', 'embrulho', 'pacote', 'surpresa', 'desejo', 'paz',
            'amor', 'esperanca', 'gratidao', 'saude', 'harmonia', 'uniao'
        ];

        const pointsReward = 3;
        const xpReward = 25;
        const timeoutMs = 20000;

        // Verifica se o evento está pausado
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        if (clientData?.eventoPausado) {
            return message.reply('⏸️ O evento de Natal está pausado.');
        }

        // Seleciona canal e palavra aleatórios
        const randomChannelId = channelIds[Math.floor(Math.random() * channelIds.length)];
        const currentWord = palavras[Math.floor(Math.random() * palavras.length)];

        const channel = await this.client.channels.fetch(randomChannelId).catch(() => null);
        if (!channel) {
            return message.reply(`❌ Canal ${randomChannelId} não encontrado.`);
        }

        try {
            // Gera a imagem com a palavra
            const wordImageBuffer = this.generateWordImage(currentWord);
            const attachment = new AttachmentBuilder(wordImageBuffer, { name: 'palavra.png' });

            const dropMessage = await channel.send({
                content: `<:santaclaus2:1447757902201749615> **O Papai Noel apareceu!**\n\n<:christmastree:1447757922875740291> Digite a palavra da imagem para ganhar **${pointsReward} Meias Natalinas** <:christmassock:1447757955415150743> e **${xpReward} XP**!\n\n-# <:sandclock:1447764508235005994> Você tem ${timeoutMs / 1000} segundos!\n<@&1267294402158530703>`,
                files: [attachment]
            });

            // Confirma pro staff
            await message.reply({
                content: `✅ Drop enviado!\n\n> 📍 Canal: <#${channel.id}>\n> 🔤 Palavra: \`${currentWord}\``,
            });

            // Cria collector para respostas
            const filter = (msg) => msg.content.toLowerCase() === currentWord.toLowerCase();
            const collector = channel.createMessageCollector({ filter, max: 1, time: timeoutMs });

            collector.on('collect', async (msg) => {
                // Apaga a mensagem do usuário que acertou
                await msg.delete().catch(() => { });

                // Adiciona pontos e XP ao vencedor
                await this.client.database.users.findOneAndUpdate(
                    { idU: msg.author.id },
                    {
                        $inc: {
                            'evento.moeda1': pointsReward,
                            'evento.moeda2': pointsReward,
                            'Exp.xp': xpReward
                        }
                    },
                    { upsert: true }
                );

                const userData = await this.client.database.users.findOne({ idU: msg.author.id });
                const totalPontos = userData?.evento?.moeda1;
                await dropMessage.edit({
                    content: `<:present_nerd:1447714759863435354> **Parabéns ${msg.author}!** Você capturou o presente do Papai Noel!\n\n` +
                        `<:christmassock:1447757955415150743> **+${pointsReward} Meias Natalinas** (Total: **${totalPontos}**)\n` +
                        `<:jinglebell:1447706160978198660> **+${xpReward} XP**`,
                    files: [] // Remove a imagem
                });
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await dropMessage.edit({
                        content: `<:santaclaus2:1447757902201749615> **O Papai Noel foi embora...**\n\n<:snowflakes:1447707292521726134> Ninguém digitou a palavra a tempo!\n-# Fique atento para o próximo drop!`,
                        files: [] // Remove a imagem
                    }).catch(() => { });
                }
            });

        } catch (err) {
            this.client.logger?.error?.(err.message, 'drop');
            return message.reply('❌ Ocorreu um erro ao enviar o drop.');
        }
    }
};
