const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class ServerlistCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'serverlist';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Mostra a lista com todos os servidores da Kosame.';
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */

    // eslint-disable-next-line no-unused-vars
    async commandExecute({ message, args, prefix, author }) {
        if (!['236651138747727872'].includes(message.author.id)) return;

        let current = 0;
        const pages = [];
        const guilds = (await this.client.shard?.broadcastEval((client) => client.guilds.cache))?.map((g) => g)[0];
        const guildsMap = guilds?.sort((A, B) => B.memberCount - A.memberCount).map((g) => g);

        for (let i = 0; i < guildsMap.length; i++) {
            if (i % 10 === 0) {
                let embed = new EmbedBuilder()
                    .setColor('#2E3035')
                    .setTitle(`<:kscrown:1191384507123765328> ${this.client.user.username} - Lista de Servidores`)
                    .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }))
                    .setDescription(guildsMap.map((G, I) => `**${I + 1}** - ${G.name} *(**${G.memberCount}** Membros)*`).slice(i, i + 10).join('\n'));

                pages.push(embed);
            }
        }

        const msg = await message.reply({ embeds: [pages[current]], components: [this.button(1, current <= 0 ? true : false, pages.length <= 1 ? true : false)] });
        const filter = (i) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: `${i.user}, esta interação não é para você.`, ephemeral: true }), false);
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

        collector.on('end', () => {
            msg.edit({ components: [this.button(current + 1, true, true)] });
        });

        collector.on('collect', (i) => {
            if (i.customId === '-') current -= 1;
            if (i.customId === '+') current += 1;

            pages[current].setFooter({ text: `Você está na página: ${current + 1}/${pages.length}`, iconURL: this.client.user.displayAvatarURL({ size: 2048 }) });
            return void msg.edit({ embeds: [pages[current]], components: [this.button(current + 1, current <= 0 ? true : false, current === pages.length - 1 ? true : false)] });
        });
    }

    button(num = 1, first = false, second = false) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('-')
                    .setEmoji('<:kslanterior:1194481419028799599>')
                    .setDisabled(first)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`${num}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('+')
                    .setEmoji('<:kslproximo:1194481422287786057> ')
                    .setDisabled(second)
                    .setStyle(ButtonStyle.Secondary)
            );
    }
};
