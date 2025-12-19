const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const moment = require('moment');
require('moment-duration-format');

module.exports = class StatusCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'status';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja o status do seu relacionamento e amizade.';
        this.aliases = ['casal', 'bfstatus'];
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
    async commandExecute({ message, args }) {
        moment.locale('pt-BR');

        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        const doc = await this.client.database.users.findOne({ idU: user.id });

        if (!doc)
            return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

        const hasMarriage = doc.marry?.has;
        const hasBestfriend = doc.bestfriend?.has;

        if (!hasMarriage && !hasBestfriend)
            return message.reply({ content: `${user} não está casado(a) e não possui melhor amigo(a)!` });

        // Determina qual view mostrar primeiro
        let currentView = hasMarriage ? 'marry' : 'bestfriend';

        const buildSelectMenu = (currentView) => {
            const options = [];

            options.push({
                label: 'Casamento',
                description: hasMarriage ? 'Ver status do casamento' : 'Não está casado(a)',
                value: 'marry',
                emoji: '<:ksmmarry:1451361735398133853>',
                default: currentView === 'marry'
            });

            options.push({
                label: 'Melhor Amigo',
                description: hasBestfriend ? 'Ver status da amizade' : 'Não possui melhor amigo(a)',
                value: 'bestfriend',
                emoji: '<:ksm_soquinho:1451365035468263640>',
                default: currentView === 'bestfriend'
            });

            return new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`status_select_${message.author.id}`)
                    .setPlaceholder('Selecione o que deseja ver')
                    .addOptions(options)
            );
        };

        const buildContainer = async (view, includeMenu = true) => {
            const container = new ContainerBuilder().setAccentColor(view === 'marry' ? 0xFF4B4E : 0xf8bc07);

            if (view === 'marry' && hasMarriage) {
                const par = await this.client.users.fetch(doc.marry.user);
                const duration = moment.duration(Date.now() - doc.marry.time).format('Y [ano] M [meses] d [dias] h [horas] m [min]');
                const date = moment(doc.marry.time).format('DD/MM/YYYY [às] HH:mm');

                container
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# <:ksmmarry:1451361735398133853> Status de Casamento`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `<:ID:842414207257149442> **Informações de:** ${user.tag}\n\n` +
                            `<:weddingstats:842093765127831572> **Parceiro(a):**\n` +
                            `> **${par.tag}**\n> \`${par.id}\`\n\n` +
                            `<:marriage:842095491486842942> **Casados há:**\n` +
                            `> **${duration}**\n> -# Desde ${date}`
                        )
                    );
            } else if (view === 'bestfriend' && hasBestfriend) {
                const par = await this.client.users.fetch(doc.bestfriend.user);
                const duration = moment.duration(Date.now() - doc.bestfriend.time).format('Y [ano] M [meses] d [dias] h [horas] m [min]');
                const date = moment(doc.bestfriend.time).format('DD/MM/YYYY [às] HH:mm');

                container
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# <:ksm_soquinho:1451365035468263640> Status de Amizade`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `<:ID:842414207257149442> **Informações de:** ${user.tag}\n\n` +
                            `<:bfriends:842146949288296478> **Melhor Amigo(a):**\n` +
                            `> **${par.tag}**\n> \`${par.id}\`\n\n` +
                            `<:bfstats:850721969741234187> **Amigos há:**\n` +
                            `> **${duration}**\n> -# Desde ${date}`
                        )
                    );
            } else {
                container
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ❌ Não disponível`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            view === 'marry'
                                ? `${user.tag} não está casado(a) no momento.`
                                : `${user.tag} não possui melhor amigo(a) no momento.`
                        )
                    );
            }

            // Adiciona o select menu dentro do container se necessário
            if (includeMenu) {
                container.addActionRowComponents(buildSelectMenu(view));
            }

            return container;
        };

        const container = await buildContainer(currentView, true);

        const msg = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === message.author.id && i.customId === `status_select_${message.author.id}`,
            time: 120000
        });

        collector.on('collect', async (interaction) => {
            try {
                currentView = interaction.values[0];
                const newContainer = await buildContainer(currentView, true);

                await interaction.update({
                    components: [newContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch {
                // Ignora erros
            }
        });

        collector.on('end', async () => {
            try {
                const finalContainer = await buildContainer(currentView, false);
                await msg.edit({
                    components: [finalContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch { }
        });
    }
};