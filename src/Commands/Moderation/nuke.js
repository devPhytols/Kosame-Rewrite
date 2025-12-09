const { ApplicationCommandType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');

module.exports = class NukeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'nuke';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Apaga e recria o canal atual mantendo as permissões e posição.';
        this.config = { registerSlash: true };
        this.options = [];
    }

    async commandExecute({ message }) {
        const channel = message.channel;

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: 'Você precisa da permissão `Administrador` para usar este comando.' });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setEmoji('<:ksm_certo:1089754956321542234>') 
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setEmoji('<:ksm_errado:1089754955256176701>')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );

        const reply = await message.reply({ content: `<:kosame_outage:1089663591050903612> Você realmente deseja **recriar** o canal \`${channel.name}\`?\n-# ㅤ<:ksm_set0:1367969325356683325> Todo o conteúdo que existia nesse canal será permanentemente apagado!`, components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'cancel') {
                await interaction.update({ content: '<:ksm_errado:1089754955256176701> Nuke cancelado.', embeds: [], components: [] });
                collector.stop();
            } else if (interaction.customId === 'confirm') {
                await interaction.update({ content: '<a:timeg:1371599117872005187> Canal sendo recriado...', embeds: [], components: [] });

                try {
                    // Salvar todas as configurações do canal antes de deletar
                    const snapshot = {
                        name: channel.name,
                        type: channel.type,
                        topic: channel.topic,
                        nsfw: channel.nsfw,
                        rateLimitPerUser: channel.rateLimitPerUser,
                        parent: channel.parent,
                        position: channel.position,
                        permissionOverwrites: channel.permissionOverwrites.cache,
                        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration
                    };

                    // Deletar canal original
                    await channel.delete(`Canal nuked por ${message.author.tag}`);

                    // Criar novo canal com todas as configurações
                    const clone = await message.guild.channels.create({
                        name: snapshot.name,
                        type: snapshot.type,
                        topic: snapshot.topic,
                        nsfw: snapshot.nsfw,
                        rateLimitPerUser: snapshot.rateLimitPerUser,
                        parent: snapshot.parent,
                        position: snapshot.position,
                        permissionOverwrites: snapshot.permissionOverwrites,
                        defaultAutoArchiveDuration: snapshot.defaultAutoArchiveDuration,
                        reason: `Canal nuked por ${message.author.tag}`
                    });

                    // Mensagem no novo canal
                    await clone.send({ content: `-# <:kosame_outage:1089663591050903612> Canal recriado com sucesso por ${message.author}!` }).catch(() => {});
                } catch (e) {
                    await message.channel.send({ content: 'Falha ao recriar o canal.' }).catch(() => {});
                } finally {
                    collector.stop();
                }
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                reply.edit({ content: '<a:timeg:1371599117872005187> Tempo expirou. Nuke cancelado.', embeds: [], components: [] });
            }
        });
    }
};