const {
    ApplicationCommandType,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ThumbnailBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class ContainerCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'natal';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Painel do Evento de Natal da Kosame! 🎄';
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
        // Container principal com cor de acento vermelho natalino
        const container = new ContainerBuilder()
            .setAccentColor(0xffffff);

        // Media Gallery com imagem de header do evento
        const mediaGallery = new MediaGalleryBuilder()
            .addItems(
                new MediaGalleryItemBuilder()
                    .setURL('https://i.imgur.com/xY3HCbT.png')
                    .setDescription('Evento de Natal Kosame 2025')
            );

        // Texto de boas-vindas do evento
        const welcomeText = new TextDisplayBuilder()
            .setContent('## <:snowflakes:1447707292521726134> Evento de Natal Kosame 2025!\n\nBem-vindo(a) ao nosso evento especial de Natal! Colete **Meias Natalinas** <:christmassock:1447757955415150743> em drops aleatórios pelos canais, monte sua própria **Árvore de Natal** e troque suas meias por itens exclusivos na nossa **Lojinha de Natal**!');

        // Separador
        const separator = new SeparatorBuilder()
            .setSpacing(1)
            .setDivider(true);

        // Texto de como funciona
        const howItWorksText = new TextDisplayBuilder()
            .setContent('### <:present_nerd:1447714759863435354> Como funciona o evento:');

        // Seção 1: Regras do evento
        const section1 = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('<:kosame_text:1089663498503602189> **Leia as regras do evento. <:rules:1447757878441021533>**\n-# ➜ Entenda como participar e ganhar!')
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('Explicação do Evento')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ptb.discord.com/channels/1447705346586968186/1447705347744727163')
            );

        // Seção 2: Drops de pontos
        const section2 = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('<:kosame_text:1089663498503602189> **Colete Meias Natalinas!** <:christmassock:1447757955415150743>\n-# ➜ Fique atento aos drops em canais aleatórios.')
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('Veja minhas meias')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ptb.discord.com/channels/1447705346586968186/1447705347744727163')
            );

        // Separador 2
        const separator2 = new SeparatorBuilder()
            .setSpacing(1)
            .setDivider(true);

        // Texto de funcionalidades do evento
        const featuresText = new TextDisplayBuilder()
            .setContent('### <:happy:1447707613222535210> Aproveite as funcionalidades do evento:');

        // Seção 3: Árvore de Natal
        const section3 = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('<:kosame_text:1089663498503602189> **Monte sua Árvore de Natal! <:arvore:1447705894870581328>**\n-# ➜ Personalize e decore sua própria árvore.')
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('Montar minha árvore')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ptb.discord.com/channels/1447705346586968186/1447705347744727163')
            );

        // Seção 4: Lojinha de Natal
        const section4 = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('<:kosame_text:1089663498503602189> **Lojinha de Natal! <:shop:1447715924982370497>**\n-# ➜ Troque seus pontos por itens exclusivos!')
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('Abrir lojinha de Natal')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ptb.discord.com/channels/1447705346586968186/1447705347744727163')
            );

        // Seção 5: Ranking
        const section5 = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('<:kosame_text:1089663498503602189> **Ranking de Natal! <:ranking:1447716700081356830>**\n-# ➜ Veja quem está no topo do evento!')
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('Ver ranking do evento')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ptb.discord.com/channels/1447705346586968186/1447705347744727163')
            );

        // Adiciona todos os componentes ao container
        container
            .addMediaGalleryComponents(mediaGallery)
            .addTextDisplayComponents(welcomeText)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(howItWorksText)
            .addSectionComponents(section1)
            .addSectionComponents(section2)
            .addSeparatorComponents(separator2)
            .addTextDisplayComponents(featuresText)
            .addSectionComponents(section3)
            .addSectionComponents(section4)
            .addSectionComponents(section5);

        // Envia a mensagem com o flag IS_COMPONENTS_V2
        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
