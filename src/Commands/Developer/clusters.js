const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class ClustersCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'clusters';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Habilitar/Desabilitar modo de manutenção global do bot.';
        this.aliases = ['clusterctl', 'maintenance', 'manutencao'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     */
    async commandExecute({ message }) {
        const ALLOWED_IDS = [
            '236651138747727872', // Fernando
            '848662735357083698', // Rik
            '202938550360997888', // Wayz
            '429679606946201600', // Thompson
            '885423103256195129' // Peeter
        ];

        if (!ALLOWED_IDS.includes(message.author.id)) return;

        const clientId = this.client.user.id;
        let clientDoc = await this.client.database.client.findOne({ _id: clientId });
        if (!clientDoc) {
            clientDoc = await this.client.database.client.create({ _id: clientId });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Clusters • Gerenciamento')
            .setThumbnail(this.client.user.displayAvatarURL({ size: 1024 }))
            .setDescription('# <:ksm_eita:1367974827868033106> Controle o gerenciamento do bot abaixo:\n-# <:ksm_set0:1367969325356683325> Adicione/Remova o sistema de manutenção de comandos e clusters.')
            .addFields(
                { name: '<:kosame_text:1089663498503602189> Status atual', value: clientDoc.manutenção ? '<:kosamecorret:1415382019793485994> Ativado' : '<:kosameerradopink:1415382586284572802> Desativado', inline: true },
                { name: '<:kosame_text:1089663498503602189> Motivo', value: clientDoc.reason ? `\`${clientDoc.reason}\`` : 'Nenhum', inline: false }
            );

        const select = new StringSelectMenuBuilder()
            .setCustomId('clusters_maintenance_select')
            .setPlaceholder('Selecione uma ação')
            .addOptions(
                { label: 'Ativar manutenção (Global)', emoji: '1415382019793485994', value: 'enable', description: 'Colocar o bot em modo de manutenção (global).' },
                { label: 'Desativar manutenção (Global)', emoji: '1415382586284572802', value: 'disable', description: 'Retirar o bot do modo de manutenção.' },
                { label: 'Ativar manutenção de um comando', emoji: '1415382019793485994', value: 'enable_cmd', description: 'Colocar um comando específico em manutenção.' },
                { label: 'Desativar manutenção de um comando', emoji: '1415382586284572802', value: 'disable_cmd', description: 'Retirar um comando específico da manutenção.' }
            );

        const row = new ActionRowBuilder().addComponents(select);

        const reply = await message.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = reply.createMessageComponentCollector({ time: 60_000 });
        collector.on('collect', async (i) => {
            if (i.customId !== 'clusters_maintenance_select') return;
            if (!ALLOWED_IDS.includes(i.user.id)) return i.reply({ content: 'Você não tem permissão para usar este seletor.', ephemeral: true });

            const choice = i.values[0];
            let updated;
            if (choice === 'enable') {
                const newReason = clientDoc.reason && clientDoc.reason.length > 0 ? clientDoc.reason : 'Manutenção em andamento. Voltaremos em breve!';
                updated = await this.client.database.client.findOneAndUpdate(
                    { _id: clientId },
                    { $set: { manutenção: true, reason: newReason } },
                    { new: true }
                );
            } else if (choice === 'disable') {
                updated = await this.client.database.client.findOneAndUpdate(
                    { _id: clientId },
                    { $set: { manutenção: false } },
                    { new: true }
                );
            } else if (choice === 'enable_cmd' || choice === 'disable_cmd') {
                // Ask for the command name
                await i.reply({ content: 'Envie o nome do comando que deseja alterar a manutenção (ex: `blackjack`). Você tem 30 segundos.', ephemeral: true });
                const msgFilter = m => m.author.id === i.user.id;
                const msgCollector = i.channel.createMessageCollector({ filter: msgFilter, max: 1, time: 30_000 });

                msgCollector.on('collect', async (m) => {
                    const cmdName = (m.content || '').trim();
                    if (!cmdName) {
                        return m.reply({ content: 'Nome de comando inválido.' });
                    }
                    try {
                        // Ensure command doc exists then toggle manutenção
                        const newState = choice === 'enable_cmd';
                        const cmdDoc = await this.client.database.command.findOneAndUpdate(
                            { _id: cmdName },
                            { $set: { manutenção: newState } },
                            { upsert: true, new: true }
                        );

                        // Optional: check if command exists in runtime map
                        const exists = this.client.commands?.get(cmdName) || [...(this.client.commands?.values() || [])].find(c => Array.isArray(c.aliases) && c.aliases.includes(cmdName));
                        const info = exists ? '' : ' (aviso: comando não localizado no cache em runtime)';

                        await m.reply({ content: `Manutenção do comando \`${cmdName}\`: ${newState ? 'Ativada' : 'Desativada'}${info}.` });
                    } catch (err) {
                        await m.reply({ content: 'Falha ao atualizar a manutenção do comando.' });
                    }
                });

                msgCollector.on('end', async (collected) => {
                    if (collected.size < 1) {
                        try { await i.followUp({ content: 'Tempo esgotado para informar o nome do comando.', ephemeral: true }); } catch {}
                    }
                });

                // Do not update the main embed when awaiting command name; return early
                return;
            }

            const newEmbed = EmbedBuilder.from(embed)
                .setFields(
                    { name: 'Status atual', value: updated.manutenção ? '<:kosamecorret:1415382019793485994> Ativado' : '<:kosameerradopink:1415382586284572802> Desativado', inline: true },
                    { name: 'Motivo', value: updated.reason ? `\`${updated.reason}\`` : 'Nenhum', inline: false }
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
