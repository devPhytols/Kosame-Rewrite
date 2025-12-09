const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class DivorceCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'divorce';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Se divorcie do seu companheiro na Kosame.';
        this.aliases = ['divorcio', 'divorciar'];
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

        if (!doc.marry.has)
            return message.reply({ content: `${message.author}, você não está casado.` });

        const par = await this.client.users.fetch(doc.marry.user);

        const EMBED1 = new ClientEmbed()
            .setAuthor({ name: `${par.tag}`, iconURL: par.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription(`<:brokenheart:842091496143978537><:sadface:842078049951809557> ${message.author} se divorciou de você.`)
            .setColor('#FF4B4E');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_divorce')
                .setLabel('Confirmar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_divorce')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

        const prompt = await message.reply({
            content: `${message.author}, você quer se divorciar de **\`${par.tag}\`**?`,
            components: [row],
            fetchReply: true
        });

        const collector = prompt.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 10000,
            filter: (interaction) => interaction.user.id === message.author.id
        });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.user.id !== message.author.id) {
                return message.reply({ content: `${interaction.user}, você não tem permissão para opinar nisso! 👀` })
            }

            if (interaction.customId === 'confirm_divorce') {
                collector.stop();
                await prompt.delete();

                await message.channel.send({ content: `${message.author.id}`, embeds: [EMBED1] });

                await this.client.database.users.findOneAndUpdate({ idU: message.author.id }, {
                    $set: {
                        'marry.user': 'null',
                        'marry.has': false,
                        'marry.time': 0
                    }
                });
                await this.client.database.users.findOneAndUpdate({ idU: doc.marry.user }, {
                    $set: {
                        'marry.user': 'null',
                        'marry.has': false,
                        'marry.time': 0
                    }
                });
            } else if (interaction.customId === 'cancel_divorce') {
                collector.stop();
                await prompt.delete();
                await message.channel.send('**Pedido de divórcio cancelado**');
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await prompt.delete().catch(() => { });
                await message.channel.send('O tempo para confirmar acabou!');
            }
        });
    }
};
