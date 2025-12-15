const {
    ApplicationCommandType,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class LojinhaCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'lojinha';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Lojinha de Natal - Troque seus pontos por itens exclusivos! 🎁';
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
        // Verifica se o evento está pausado
        const clientData = await this.client.database.client.findOne({ _id: this.client.user.id });
        if (clientData?.eventoPausado) {
            return message.reply('❄️ O Evento de Natal está pausado no momento. Aguarde!');
        }

        // Container principal
        const container = new ContainerBuilder()
            .setAccentColor(0xffffff);

        // Media Gallery com imagem da lojinha
        const mediaGallery = new MediaGalleryBuilder()
            .addItems(
                new MediaGalleryItemBuilder()
                    .setURL('https://i.imgur.com/bF0KNMO.png')
                    .setDescription('Lojinha de Natal')
            );

        // Texto de título da lojinha
        const titleText = new TextDisplayBuilder()
            .setContent('## <:arvore:1447705894870581328> A Lojinha de Natal está aberta!\n\nConfira os itens disponíveis para serem trocados por pontos e escolha seu presente especial.\nDê uma olhada na listinha abaixo e aproveite a magia do natalina<:snowflakes:1447707292521726134>');

        // Separador
        const separator = new SeparatorBuilder()
            .setSpacing(1)
            .setDivider(true);

        // Lista de itens disponíveis
        const itensText = new TextDisplayBuilder()
            .setContent('<:itens:1447724488882913390> **Layout Natalino por 30 dias.**\n<:itens:1447724488882913390> **1B de Coins.**\n<:itens:1447724488882913390> **XP duplo por 30 dias.**\n<:itens:1447724488882913390> **VIP de 15 dias.**\n<:itens:1447724488882913390> **Slot personalizado.**\n<:itens:1447724488882913390> **Moldura.**');

        // Separador 2
        const separator2 = new SeparatorBuilder()
            .setSpacing(1)
            .setDivider(true);

        // Texto de seleção
        const selectText = new TextDisplayBuilder()
            .setContent('### <:shop:1447715924982370497> Selecione uma categoria:');

        // Select Menu dentro do container
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`lojinha_categoria_${message.author.id}`)
            .setPlaceholder('🎄 Selecione uma opção')
            .addOptions([
                {
                    label: 'Itens & Recompensas',
                    description: 'Layout Natalino, VIP, Coins e mais!',
                    value: 'itens',
                    emoji: '1447724488882913390'
                },
                {
                    label: 'Decorações de Árvore',
                    description: 'Enfeites para decorar sua árvore de Natal',
                    value: 'arvore',
                    emoji: '1447705894870581328'
                }
            ]);

        const selectRow = new ActionRowBuilder().addComponents(selectMenu);

        // Adiciona todos os componentes ao container
        container
            .addMediaGalleryComponents(mediaGallery)
            .addTextDisplayComponents(titleText)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(itensText)
            .addSeparatorComponents(separator2)
            .addTextDisplayComponents(selectText)
            .addActionRowComponents(selectRow);

        // Envia a mensagem com o flag IS_COMPONENTS_V2
        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
