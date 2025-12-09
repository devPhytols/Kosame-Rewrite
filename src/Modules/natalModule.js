/**
 * Módulo do Evento de Natal - Caça ao Papai Noel
 * O bot envia drops aleatórios em canais configurados
 * Usuários devem digitar a palavra correta para ganhar pontos e XP
 */

module.exports = class natalModule {
    constructor(client) {
        this.client = client;
        this.isActive = false;
        this.currentWord = null;
        this.currentChannel = null;

        // ===== CONFIGURAÇÕES DO EVENTO =====
        this.config = {
            // IDs dos canais onde o Papai Noel pode aparecer (adicione os IDs aqui)
            channelIds: [
                '1447744168263811133',
                '1447744198991417404'
            ],

            // Intervalo entre drops (em milissegundos) - 10 segundos para teste
            intervalMs: 130000,

            // Tempo para responder (em milissegundos) - 30 segundos
            timeoutMs: 30000,

            // Recompensas
            pointsReward: 10,  // Meias natalinas por acerto
            xpReward: 25,      // XP por acerto

            // Emoji do Papai Noel
            santaEmoji: '🎅'
        };

        // Palavras natalinas para o jogo
        this.palavras = [
            'panetone', 'peru', 'rabanada', 'tender', 'vinho',
            'bolo', 'pudim', 'presente', 'estrela', 'sino',
            'rena', 'papainoel', 'boneco', 'floco', 'guirlanda',
            'vela', 'laco', 'treno', 'duende', 'anjo',
            'neve', 'arvore', 'natal', 'meias', 'lareira'
        ];
    }

    execute() {
        try {
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
                await this.sendDrop();
            } catch (err) {
                this.client.logger?.warn?.(`Erro no drop de Natal: ${err.message}`, 'natalModule');
                this.isActive = false;
            }
        }, this.config.intervalMs);
    }

    async sendDrop() {
        // Seleciona um canal aleatório
        const randomChannelId = this.config.channelIds[Math.floor(Math.random() * this.config.channelIds.length)];

        const channel = await this.client.channels.fetch(randomChannelId).catch(() => null);
        if (!channel) {
            this.client.logger?.warn?.(`Canal ${randomChannelId} não encontrado`, 'natalModule');
            return;
        }

        // Seleciona uma palavra aleatória
        this.currentWord = this.palavras[Math.floor(Math.random() * this.palavras.length)];
        this.currentChannel = channel;
        this.isActive = true;

        // Envia a mensagem do Papai Noel
        const dropMessage = await channel.send({
            content: `${this.config.santaEmoji} **O Papai Noel apareceu!**\n\n🎄 Digite a palavra **\`${this.currentWord}\`** para ganhar **${this.config.pointsReward} Meias Natalinas** <:christmassock:1447757955415150743> e **${this.config.xpReward} XP**!\n\n-# ⏰ Você tem ${this.config.timeoutMs / 1000} segundos!`
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
                // Atualiza os pontos do usuário
                await this.client.database.users.findOneAndUpdate(
                    { idU: msg.author.id },
                    {
                        $inc: {
                            'evento.moeda1': this.config.pointsReward,
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
                        `✨ **+${this.config.xpReward} XP**`
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
                    content: `${this.config.santaEmoji} **O Papai Noel foi embora...**\n\n<:snowflakes:1447707292521726134> Ninguém digitou a palavra **\`${this.currentWord}\`** a tempo!\n-# Fique atento para o próximo drop!`
                }).catch(() => { });

                // Deleta após 5 segundos
                setTimeout(() => {
                    dropMessage.delete().catch(() => { });
                }, 5000);
            }
        });
    }
};
