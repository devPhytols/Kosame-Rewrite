const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'help';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Encontre ajuda para utilizar meus comandos aqui.';
        this.aliases = ['ajuda'];
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
        const avatar = this.client.user.displayAvatarURL({ size: 2048 });

        const selectConfig = [
            { label: 'Social', emoji: '<:phone:1022541804794564678>', description: 'Veja todos os comandos Sociais!', value: 'social' },
            { label: 'Economia', emoji: '<:economia:1022541802928099450>', description: 'Veja todos os comandos de Economia!', value: 'segundo' },
            { label: 'Diversão', emoji: '<:diverso:1022541798972858449>', description: 'Veja todos os comandos de Diversão!', value: 'terceiro' },
            { label: 'Moderação', emoji: '<:moderacao:1022541796108144752>', description: 'Veja todos os comandos de Moderação!', value: 'moderacao' },
            { label: 'Configuração', emoji: '<:configuracao:1022541793075675157>', description: 'Veja todos os comandos de Configuração!', value: 'primeiro' },
            { label: 'Utilidades', emoji: '<:utilidades:1022541790370349056>', description: 'Veja todos os comandos de Utilidades!', value: 'quarto' }
        ];

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Selecione a Categoria')
                .addOptions(selectConfig.map(o => ({ label: o.label, emoji: o.emoji, description: o.description, value: o.value })))
        );

        const rowB = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Me Adicione')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=762320527637217312&permissions=8&scope=bot%20applications.commands')
                    .setStyle('Link'),

                new ButtonBuilder()
                    .setLabel('Suporte')
                    .setURL('https://discord.gg/THS6HBgPzr')
                    .setStyle('Link'),

                new ButtonBuilder()
                    .setLabel('Website')
                    .setURL('https://kosamebot.website')
                    .setStyle('Link')
            );

        const createEmbed = (title, description) => new EmbedBuilder()
            .setColor('#ffffff')
            .setAuthor({ name: title, iconURL: avatar })
            .setThumbnail(avatar)
            .setDescription(description);

        const embed = createEmbed(
            'Central de Ajuda',
            'Olá, eu sou a Kosame, um bot com múltiplas funções para o seu servidor. Eu possuo diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Social**\n<:arrowpk:1021588174620860518> **Economia**\n<:arrowpk:1021588174620860518> **Diversão**\n<:arrowpk:1021588174620860518> **Moderação**\n<:arrowpk:1021588174620860518> **Configuração**\n<:arrowpk:1021588174620860518> **Utilidades**\n\n<:information:1021614558995025930> Selecione as categorias abaixo!'
        );

        const embedsMap = {
            social: createEmbed('Comandos Sociais', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Geral**\n```k!profile\nk!profilebg\nk!vip info\nk!rank reps\nk!rep```\n<:arrowpk:1021588174620860518> **Casamento**\n```k!marry\nk!divorce\nk!status\nk!gf```\n<:arrowpk:1021588174620860518> **Melhor Amigo(a)**\n```k!bf\nk!unbf\nk!bfstatus\nk!fofocar```'),
            primeiro: createEmbed('Comandos de Configuração', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Geral**\n```k!prefix\nk!antinvite\nk!antifake\nk!logs```\n<:arrowpk:1021588174620860518> **Controle**\n```k!welcome\nk!byebye\nk!autorole\nk!banconfig\nk!cblock\nk!warns\nk!lang```\n'),
            segundo: createEmbed('Comandos de Economia', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Coletar Coins**\n```k!work\nk!daily\nk!semanal\nk!mensal\nk!vote\nk!gf\nk!fofocar\nk!recompensa```\n<:arrowpk:1021588174620860518> **Interação**\n```k!apostar\nk!roubar\nk!crime\nk!copo```\n<:arrowpk:1021588174620860518> **Serviços**\n```k!prefeitura\nk!ficha\nk!inventario\nk!shop\nk!rank coins\nk!rank crimes\nk!sacar\nk!depositar\nk!pay\nk!vip info```'),
            terceiro: createEmbed('Comandos de Diversão', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Geral**\n```k!8ball\nk!headpat\nk!hug\nk!kiss\nk!slap\nk!animeicon\nk!cat\nk!dog\nk!ship```'),
            moderacao: createEmbed('Comandos de Moderação', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Geral**\n```k!ban\nk!unban\nk!mute\nk!unmute\nk!kick\nk!lock\nk!unlock\nk!purge```'),
            quarto: createEmbed('Comandos de Utilidades', 'Kosame é um bot com múltiplas funções para o seu servidor. Ela possui diversas categorias de comandos para você ter a melhor experiência e com uma grande facilidade.\n\n<:arrowpk:1021588174620860518> **Geral**\n```k!avatar\nk!ping\nk!afk\nk!lembrete\nk!help\nk!addemoji\nk!emoji\nk!servericon\nk!serverbanner\nk!discrim\nk!randomcolor\nk!botinfo\nk!userinfo\nk!serverinfo\nk!anime```')
        };

        const sendmsg = await message.reply({ embeds: [embed], components: [row], fetchReply: true });
        const collector = sendmsg.createMessageComponentCollector({ time: 60000, filter: (i) => i.customId === 'select' });

        collector.on('collect', (collected) => {
            const value = Array.isArray(collected.values) ? collected.values[0] : undefined;
            if (!value) return;

            if (collected.user.id != message.author.id)
                return collected.reply({ content: 'Eiii, essa interação não é sua!', ephemeral: true });

            const target = embedsMap[value];
            if (target) return collected.update({ embeds: [target], components: [row] });
        });

        collector.on('end', () => {
            try {
                message.channel.messages.fetch(sendmsg.id)
                    .then(() =>
                        sendmsg.edit({
                            embeds: [embed],
                            components: [rowB]
                        })
                    );
            } catch (error) {
                collector.stop();
                return;
            }
        });
    }
};