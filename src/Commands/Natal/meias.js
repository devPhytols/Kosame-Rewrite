const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { TotalPecas } = require('../../Utils/Objects/ArvorePecas');
const fs = require('fs');
const path = require('path');

module.exports = class MeiasCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'meias';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja seu saldo de Meias Natalinas! 🎄';
        this.config = {
            registerSlash: true
        };
        this.options = [];

        // Webhook para resgates de insígnia
        this.webhookUrl = 'https://ptb.discord.com/api/webhooks/1450255146872471694/ZlIEwO2bcnPftpL-FDtgjP7_qFWjXbzhUf-W9b3BZoFXHvKNoWnk6uxFqSw9J7N95Nya';
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    async commandExecute({ message, args }) {
        // Verifica se o evento está pausado
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        if (clientData?.eventoPausado) {
            return message.reply('❄️ O Evento de Natal está pausado no momento. Aguarde!');
        }

        const user = message.author;
        const userData = await this.client.database.users.findOne({ idU: user.id });

        // Dados do evento
        const meiasAtuais = userData?.evento?.moeda1 || 0;
        const meiasTotais = userData?.evento?.moeda2 || 0;
        const pecasCompradas = userData?.evento?.actualLevel || 0;
        const metaMeias = 600;

        // Verifica se já resgatou no JSON
        const jsonPath = path.join(__dirname, '../../resgates_natal.json');
        let jaResgatou = false;
        try {
            if (fs.existsSync(jsonPath)) {
                const resgates = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                jaResgatou = resgates.some(r => r.odU === user.id);
            }
        } catch (err) {
            jaResgatou = false;
        }

        // Verifica se a árvore está completa (17 peças)
        const arvoreCompleta = pecasCompradas >= TotalPecas;

        // Verifica se atingiu a meta de meias
        const meiasCompletas = meiasTotais >= metaMeias;


        // Calcula progresso
        const progressoMeias = Math.min(100, Math.round((meiasTotais / metaMeias) * 100));
        const progressoArvore = Math.min(100, Math.round((pecasCompradas / TotalPecas) * 100));
        const progressoTotal = Math.round((progressoMeias + progressoArvore) / 2);

        // Emojis de status
        const checkEmoji = '<:ksm_certo:1089754956321542234> ';
        const crossEmoji = '<:ksm_errado:1089754955256176701>';

        // Constrói a descrição
        let description = `## <:arvore:1447705894870581328> Insígnia de Natal — Critérios\n\n`;
        description += `Requisitos para resgate da insígnia:\n`;
        description += `• Árvore de Natal totalmente montada\n`;
        description += `• ${metaMeias} meias coletadas até o final do evento\n\n`;

        description += `### Progresso da Insígnia de Natal\n`;
        description += `<:christmastree:1447757922875740291> Árvore de Natal: ${arvoreCompleta ? 'Montada ' + checkEmoji : 'Não montada ' + crossEmoji}\n`;
        description += `<:christmassock:1447757955415150743> Meias coletadas: ${meiasTotais} / ${metaMeias}\n\n`;

        // Se não completou
        if (!arvoreCompleta || !meiasCompletas) {
            description += `<:porcentagem:1058512610791800952> Sua progressão atual é de ${progressoTotal}%\n`;

            if (!arvoreCompleta) {
                const pecasFaltando = TotalPecas - pecasCompradas;
                description += `<:kosame_outage:1089663591050903612> Monte a árvore de Natal (faltam ${pecasFaltando} peças)`;
                if (!meiasCompletas) {
                    const meiasFaltando = metaMeias - meiasTotais;
                    description += ` e colete mais ${meiasFaltando} meias para liberar a insígnia.`;
                } else {
                    description += ` para liberar a insígnia.`;
                }
            } else if (!meiasCompletas) {
                const meiasFaltando = metaMeias - meiasTotais;
                description += `<:ksm_warn:1362577296246181901> Colete mais ${meiasFaltando} meias para liberar a insígnia.`;
            }
        } else {
            // Verifica se já resgatou
            const jaResgatou = userData?.evento?.insigniaResgatada || false;

            if (jaResgatou) {
                // Já resgatou a insígnia
                description += `### Árvore e meias completas\n`;
                description += `<:christmastree:1447757922875740291> Árvore de Natal: Montada ${checkEmoji}\n`;
                description += `<:christmassock:1447757955415150743> Meias coletadas: ${meiasTotais} / ${metaMeias} ${checkEmoji}\n\n`;
                description += `<:eventos:1089678294489780376> **Insígnia já resgatada!** Aguarde a equipe processar seu pedido.`;
            } else {
                // Pode resgatar
                description += `### Árvore e meias completas\n`;
                description += `<:christmastree:1447757922875740291> Árvore de Natal: Montada ${checkEmoji}\n`;
                description += `<:christmassock:1447757955415150743> Meias coletadas: ${meiasTotais} / ${metaMeias} ${checkEmoji}\n\n`;
                description += `<:eventos:1089678294489780376> Parabéns! Você cumpriu todos os requisitos e pode resgatar a insígnia de Natal. Clique no botão abaixo!`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(jaResgatou ? '#FFD700' : (arvoreCompleta && meiasCompletas ? '#57F187' : '#ffffff'))
            .setThumbnail(user.displayAvatarURL())
            .setDescription(description)
            .setFooter({ text: `Evento de Natal Kosame • Saldo atual: ${meiasAtuais} meias` });

        // Botão de resgate (só aparece se completou os requisitos E não resgatou ainda)
        const components = [];
        if (arvoreCompleta && meiasCompletas && !jaResgatou) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('resgatar_insignia_natal')
                        .setLabel('Resgatar Insígnia')
                        .setEmoji('<:arvore:1447705894870581328>')
                        .setStyle(ButtonStyle.Secondary)
                );
            components.push(row);
        }

        const reply = await message.reply({ embeds: [embed], components, fetchReply: true });

        // Collector para o botão
        if (arvoreCompleta && meiasCompletas && !(userData?.evento?.insigniaResgatada)) {
            const collector = reply.createMessageComponentCollector({
                filter: i => i.user.id === user.id && i.customId === 'resgatar_insignia_natal',
                time: 60000,
                max: 1
            });

            collector.on('collect', async (interaction) => {
                try {
                    // Marca como resgatada
                    await this.client.database.users.findOneAndUpdate(
                        { idU: user.id },
                        { $set: { 'evento.insigniaResgatada': true } }
                    );

                    // Salva no arquivo JSON
                    const jsonPath = path.join(__dirname, '../../resgates_natal.json');
                    let resgates = [];
                    try {
                        if (fs.existsSync(jsonPath)) {
                            resgates = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                        }
                    } catch (err) {
                        resgates = [];
                    }

                    resgates.push({
                        odU: user.id,
                        tag: user.tag,
                        username: user.username,
                        meiasTotais: meiasTotais,
                        pecasArvore: pecasCompradas,
                        dataResgate: new Date().toISOString()
                    });

                    fs.writeFileSync(jsonPath, JSON.stringify(resgates, null, 2));

                    // Envia webhook
                    const webhook = new WebhookClient({ url: this.webhookUrl });
                    await webhook.send({
                        content: `<:arvore:1447705894870581328> **Novo Resgate de Insígnia de Natal!**\n\n` +
                            `**Usuário:** ${user.tag} (${user.id})\n` +
                            `**Meias Totais:** ${meiasTotais}\n` +
                            `**Árvore:** ${pecasCompradas}/${TotalPecas} peças\n` +
                            `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    }).catch(err => console.error('Erro ao enviar webhook:', err));

                    // Atualiza o embed
                    const updatedEmbed = EmbedBuilder.from(embed)
                        .setColor('#FFD700')
                        .setDescription(description + `\n\n<:eventos:1089678294489780376> **Insígnia resgatada com sucesso!** Aguarde a equipe processar seu pedido.`);

                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('resgatar_insignia_natal')
                                .setLabel('Insígnia Resgatada!')
                                .setEmoji('<:eventos:1089678294489780376>')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );

                    await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
                } catch (error) {
                    console.error('Erro ao resgatar insígnia:', error);
                    await interaction.reply({ content: '❌ Ocorreu um erro ao processar seu resgate. Tente novamente!', ephemeral: true });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0 && components.length > 0) {
                    // Desabilita o botão após timeout
                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('resgatar_insignia_natal')
                                .setLabel('Resgatar Insígnia')
                                .setEmoji('<:arvore:1447705894870581328>')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                    await reply.edit({ components: [disabledRow] }).catch(() => { });
                }
            });
        }
    }
};
