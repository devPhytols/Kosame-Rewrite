/**
 * Módulo do Evento de Natal - Caça ao Papai Noel
 * O bot envia drops aleatórios em canais configurados
 * Usuários devem digitar a palavra correta para ganhar pontos e XP
 */

const { createCanvas } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = class natalModule {
    constructor(client) {
        this.client = client;
        this.isActive = false;
        this.currentWord = null;
        this.currentChannel = null;
        this.lastChannelId = null; // Para variar os canais

        // ===== CONFIGURAÇÕES DO EVENTO =====
        this.config = {
            // IDs dos canais onde o Papai Noel pode aparecer (adicione os IDs aqui)
            channelIds: [
                '1447744168263811133',
                '1447744198991417404'
            ],

            // Intervalo entre drops (em milissegundos) - 20 minutos para teste
            intervalMs: 600000,

            // Tempo para responder (em milissegundos) - 30 segundos
            timeoutMs: 20000,

            // Recompensas
            pointsReward: 5,  // Meias natalinas por acerto
            xpReward: 25,      // XP por acerto

            // Emoji do Papai Noel
            santaEmoji: '<:santaclaus2:1447757902201749615>'
        };

        // Palavras natalinas para o jogo
        this.palavras = [
            'panetone', 'peru', 'rabanada', 'tender', 'vinho', 'bolo', 'pudim', 'presente', 'estrela', 'sino', 'rena', 'papainoel', 'boneco', 'floco', 'vela', 'laco', 'treno', 'duende', 'anjo', 'neve', 'arvore', 'natal', 'meias', 'lareira', 'manjedoura', 'cantata', 'coral', 'alegria', 'familia', 'ceia', 'brinde', 'amigo', 'cartao', 'feliz', 'fogos', 'luzes', 'enfeite', 'bola', 'pinheiro', 'azevinho', 'gengibre', 'canela', 'chocolate', 'biscoito', 'decoracao', 'fita', 'embrulho', 'pacote', 'surpresa', 'desejo', 'paz', 'amor', 'esperanca', 'gratidao', 'saude', 'harmonia', 'uniao'
        ];
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

    // Função para calcular shard ID (mesma do giveawayModule)
    getShardId(snowflake, totalShards) {
        return Number((BigInt(snowflake) >> 22n) % BigInt(totalShards));
    }

    execute() {
        try {
            // ID do servidor do evento
            const eventGuildId = '1447705346586968186';
            const totalShards = 4; // Número manual de shards
            const currentShardId = this.client.shard?.ids?.[0] ?? 0;

            // Calcula a shard correta para o servidor do evento
            const targetShardId = this.getShardId(eventGuildId, totalShards);

            if (currentShardId !== targetShardId) {
                this.client.logger.info(`Módulo de Natal ignorado na shard ${currentShardId} (servidor está na shard ${targetShardId})`, 'natalModule');
                return;
            }

            this.client.logger.info('Módulo de Natal iniciado!', 'natalModule');
            this.startLoop();
        } catch (err) {
            this.client.logger?.error?.(err.message, 'natalModule');
            this.client.logger?.warn?.(err.stack, 'natalModule');
        }
    }

    startLoop() {
        setInterval(async () => {
            if (this.isActive) return; // Não iniciar novo drop se já houver um ativo

            try {
                // Verifica se o evento está pausado
                const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
                if (clientData?.eventoPausado) return; // Evento pausado, não enviar drop

                await this.sendDrop();
            } catch (err) {
                this.client.logger?.warn?.(`Erro no drop de Natal: ${err.message}`, 'natalModule');
                this.isActive = false;
            }
        }, this.config.intervalMs);
    }

    async sendDrop() {
        // Seleciona um canal aleatório diferente do último usado
        let availableChannels = this.config.channelIds.filter(id => id !== this.lastChannelId);
        if (availableChannels.length === 0) availableChannels = this.config.channelIds;

        const randomChannelId = availableChannels[Math.floor(Math.random() * availableChannels.length)];
        this.lastChannelId = randomChannelId; // Salva para evitar repetição

        const channel = await this.client.channels.fetch(randomChannelId).catch(() => null);
        if (!channel) {
            this.client.logger?.warn?.(`Canal ${randomChannelId} não encontrado`, 'natalModule');
            return;
        }

        // Seleciona uma palavra aleatória
        this.currentWord = this.palavras[Math.floor(Math.random() * this.palavras.length)];
        this.currentChannel = channel;
        this.isActive = true;

        // Gera a imagem com a palavra
        const wordImageBuffer = this.generateWordImage(this.currentWord);
        const attachment = new AttachmentBuilder(wordImageBuffer, { name: 'palavra.png' });

        // Envia a mensagem do Papai Noel
        const dropMessage = await channel.send({
            content: `${this.config.santaEmoji} **O Papai Noel apareceu!**\n\n<:christmastree:1447757922875740291> Digite a palavra da imagem para ganhar **${this.config.pointsReward} Meias Natalinas** <:christmassock:1447757955415150743> e **${this.config.xpReward} XP**!\n\n-# <:sandclock:1447764508235005994> Você tem ${this.config.timeoutMs / 1000} segundos!\n<@&1267294402158530703>`,
            files: [attachment]
        });

        // Cria um collector para aguardar respostas
        const filter = (msg) => {
            return msg.content.toLowerCase() === this.currentWord.toLowerCase() && !msg.author.bot;
        };

        const collector = channel.createMessageCollector({
            filter,
            time: this.config.timeoutMs,
            max: 1
        });

        collector.on('collect', async (msg) => {
            try {
                // Atualiza os pontos do usuário (moeda1 = saldo atual, moeda2 = total histórico)
                await this.client.database.users.findOneAndUpdate(
                    { idU: msg.author.id },
                    {
                        $inc: {
                            'evento.moeda1': this.config.pointsReward,
                            'evento.moeda2': this.config.pointsReward, // Total histórico
                            'Exp.xp': this.config.xpReward
                        }
                    },
                    { upsert: true }
                );

                // Busca o saldo atualizado
                const userData = await this.client.database.users.findOne({ idU: msg.author.id });
                const totalPontos = userData?.evento?.moeda1 || this.config.pointsReward;

                // Envia mensagem de sucesso
                await channel.send({
                    content: `<:present_nerd:1447714759863435354> **Parabéns ${msg.author}!** Você capturou o presente do Papai Noel!\n\n` +
                        `<:christmassock:1447757955415150743> **+${this.config.pointsReward} Meias Natalinas** (Total: **${totalPontos}**)\n` +
                        `<:jinglebell:1447706160978198660> **+${this.config.xpReward} XP**`
                });

                // Deleta a mensagem original do drop
                await dropMessage.delete().catch(() => { });

            } catch (err) {
                this.client.logger?.error?.(`Erro ao processar captura: ${err.message}`, 'natalModule');
            }
        });

        collector.on('end', async (collected) => {
            this.isActive = false;
            this.currentWord = null;
            this.currentChannel = null;

            // Se ninguém acertou
            if (collected.size === 0) {
                await dropMessage.edit({
                    content: `${this.config.santaEmoji} **O Papai Noel foi embora...**\n\n<:snowflakes:1447707292521726134> Ninguém digitou a palavra a tempo!\n-# Fique atento para o próximo drop!`,
                    files: [] // Remove a imagem
                }).catch(() => { });

                // Deleta após 5 segundos
                setTimeout(() => {
                    dropMessage.delete().catch(() => { });
                }, 5000);
            }
        });
    }
};
