const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class PainelEventoCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'painelevento';
        this.type = ApplicationCommandType.ChatInput;
        this.description = '[DEV] Painel de controle do Evento de Natal';
        this.aliases = ['eventopainel', 'eventopanel'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    async commandExecute({ message }) {
        // Verifica se é desenvolvedor
        if (!this.client.developers.includes(message.author.id)) {
            return message.reply('❌ Apenas desenvolvedores podem usar este comando.');
        }

        // Busca o status atual do evento
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        const eventoPausado = clientData?.eventoPausado || false;

        const embed = new EmbedBuilder()
            .setColor(eventoPausado ? '#FF4444' : '#00FF00')
            .setTitle('<:arvore:1447705894870581328> Painel de Controle - Evento de Natal')
            .setDescription(
                `**Status atual:** ${eventoPausado ? '<:ponto_valorant:1089663579717902477> **PAUSADO**' : '<:iiponto_bet:1117202680067137637> **ATIVO**'}\n\n` +
                `Quando o evento está pausado:\n` +
                `> • Drops do Papai Noel desativados\n` +
                `> • Comando /lojinha desativado\n` +
                `> • Comando /meias desativado\n` +
                `> • Comando /arvore desativado\n` +
                `> • Ranking de meias desativado`
            )
            .setFooter({ text: 'Clique no botão abaixo para alterar o status' });

        const pauseBtn = new ButtonBuilder()
            .setCustomId('evento_pausar')
            .setLabel('Pausar')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('<:ponto_valorant:1089663579717902477>')
            .setDisabled(eventoPausado);

        const resumeBtn = new ButtonBuilder()
            .setCustomId('evento_resumir')
            .setLabel('Resumir')
            .setStyle(ButtonStyle.Success)
            .setEmoji('<:iiponto_bet:1117202680067137637>')
            .setDisabled(!eventoPausado);

        const resetBtn = new ButtonBuilder()
            .setCustomId('evento_reset_meias')
            .setLabel('Zerar Meias')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🗑️');

        const row = new ActionRowBuilder().addComponents(pauseBtn, resumeBtn, resetBtn);

        await message.reply({ embeds: [embed], components: [row] });
    }
};
