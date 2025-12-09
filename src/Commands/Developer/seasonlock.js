const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class SeasonLockCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'seasonlock';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Bloquear/Desbloquear o comando de temporada (season).';
        this.aliases = ['seasonctl'];
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
        const OWNER_ID = '236651138747727872';
        if (message.author.id !== OWNER_ID) {
            return message.reply({ content: 'Apenas o proprietário pode usar este comando.' });
        }

        const clientId = this.client.user.id;
        let clientDoc = await this.client.database.client.findOne({ _id: clientId });
        if (!clientDoc) {
            clientDoc = await this.client.database.client.create({ _id: clientId });
        }

        const embed = new EmbedBuilder()
            .setTitle('Controle - Top Season')
            .addFields(
                { name: 'Status atual', value: clientDoc.seasonLock ? 'Bloqueado' : 'Desbloqueado', inline: true },
                { name: 'Mensagem (se bloqueado)', value: `\`${clientDoc.seasonLockMsg || 'O ranking de temporada está temporariamente indisponível.'}\``, inline: false }
            );

        const select = new StringSelectMenuBuilder()
            .setCustomId('season_lock_select')
            .setPlaceholder('Escolha uma ação')
            .addOptions(
                { label: 'Bloquear', value: 'block', description: 'Bloquear o comando de temporada.' },
                { label: 'Desbloquear', value: 'unblock', description: 'Desbloquear o comando de temporada.' }
            );

        const row = new ActionRowBuilder().addComponents(select);

        const reply = await message.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = reply.createMessageComponentCollector({ time: 60_000 });
        collector.on('collect', async (i) => {
            if (i.customId !== 'season_lock_select') return;
            if (i.user.id !== OWNER_ID) return i.reply({ content: 'Apenas o proprietário pode usar este seletor.', ephemeral: true });

            const choice = i.values[0];
            let updated;
            if (choice === 'block') {
                updated = await this.client.database.client.findOneAndUpdate(
                    { _id: clientId },
                    { $set: { seasonLock: true } },
                    { new: true }
                );
            } else if (choice === 'unblock') {
                updated = await this.client.database.client.findOneAndUpdate(
                    { _id: clientId },
                    { $set: { seasonLock: false } },
                    { new: true }
                );
            }

            const newEmbed = EmbedBuilder.from(embed)
                .setFields(
                    { name: 'Status atual', value: updated.seasonLock ? 'Bloqueado' : 'Desbloqueado', inline: true },
                    { name: 'Mensagem (se bloqueado)', value: `\`${updated.seasonLockMsg || 'O ranking de temporada está temporariamente indisponível.'}\``, inline: false }
                );

            await i.update({ embeds: [newEmbed] });
        });

        collector.on('end', async () => {
            try {
                await reply.edit({ components: [] });
            } catch (e) { /* ignore */ }
        });
    }
};
