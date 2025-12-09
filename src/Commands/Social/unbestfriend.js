const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class UnbestfriendCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'unbestfriend';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Coloque um fim em sua amizade com seu melhor amigo.';
        this.aliases = ['unbf'];
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
        const doc = await this.client.database.users.findOne({ idU: message.author.id });

        if (!doc.bestfriend.has)
            return message.reply({ content: `${message.author} você não possui um(a) melhor amigo(a)!` });

        const par = await this.client.users.fetch(doc.bestfriend.user);

        const confirmEmbed = new ClientEmbed()
            .setDescription(`${message.author}, você quer acabar sua linda amizade com **\`${par.tag}\`**?`)
            .setColor('#f8bc07');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_unbf')
                .setEmoji('1089754956321542234')
                .setLabel('Confirmar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_unbf')
                .setEmoji('1089754955256176701')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({ content: 'Confirme o pedido abaixo!', embeds: [confirmEmbed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === message.author.id,
            time: 10000
        });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.user.id !== message.author.id) {
                return message.reply({ content: `${interaction.user}, você não tem permissão para opinar nisso! 👀` })
            }

            if (interaction.customId === 'confirm_unbf') {
                const resultEmbed = new ClientEmbed()
                    .setAuthor({ name: `${par.tag}`, iconURL: par.displayAvatarURL(() => ({ dynamic: true })) })
                    .setDescription(`${message.author} não quer mais ser seu melhor amigo(a).`)
                    .setColor('#f8bc07');

                await msg.edit({ content: `${par}`, embeds: [resultEmbed], components: [] });

                await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                    $set: {
                        'bestfriend.user': 'null',
                        'bestfriend.has': false,
                        'bestfriend.time': 0
                    }
                });

                await this.client.database.users.findOneAndUpdate({ idU: doc.bestfriend.user }, {
                    $set: {
                        'bestfriend.user': 'null',
                        'bestfriend.has': false,
                        'bestfriend.time': 0
                    }
                });

            } else if (interaction.customId === 'cancel_unbf') {
                await msg.edit({ content: '**Pedido de remover melhor amigo(a) cancelado**', embeds: [], components: [] });
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                msg.edit({ content: '⏰ O tempo para confirmar acabou!', embeds: [], components: [] });
            }
        });
    }
};
