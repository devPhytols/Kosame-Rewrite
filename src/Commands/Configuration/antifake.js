const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class AntifakeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'antifake';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Sistema de bloqueio de contas fakes no servidor.';
        this.aliases = ['af'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'canal',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Defina o canal para o sistema de logs.',
                options: [
                    {
                        name: 'channel',
                        description: 'Insira o canal aqui!',
                        type: ApplicationCommandOptionType.Channel,
                        required: true
                    }
                ]
            },
            {
                name: 'dias',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Defina a quantidade de dias que uma conta deve conter.',
                options: [
                    {
                        name: 'dias',
                        description: 'Insira a quantidade aqui!',
                        type: ApplicationCommandOptionType.Number,
                        required: true
                    }
                ]
            },
            {
                name: 'info',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Informações do sistema de Anti-Fake.'
            },
            {
                name: 'on',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Liga o sistema de Anti-Fake.'
            },
            {
                name: 'off',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Desliga o sistema de Anti-Fake.'
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {
        const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });

        if (!message.member.permissions.has('ManageGuild'))
            return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não tem **permissões** para utilizar esse comando!`);

        const anti = doc.antifake;

        const antiFake = new EmbedBuilder()
            .setDescription(`> Seja bem vindo(a) ao meu sistema de Anti-Fake, o sistema está em sua primeira versão e promete livrar o seu servidor de contas alternativas para evitar futuros problemas.\n\n<a:setinha:1013543500823920671> O Status atual do sistema é ${anti.status ? '**Online**.' : '**Offline**.'}\n<a:setinha:1013543500823920671> A Quantidade de dias configurada é de ${anti.dias === '30' ? '**30 dias**.' : `**${anti.dias} dias**.`}\n${anti.logsch === 'null' ? '<a:setinha:1013543500823920671> Nenhum canal de logs foi configurado até o momento.' : `<a:setinha:1013543500823920671> O Canal de logs está configurado em <#${anti.logsch}>.`}\n\n*<:kosame_exclamation:1020155210162774026> Defina um canal separado para receber os avisos!\n\n<a:setinha:1013543500823920671> Utilize \`k!af logs #Canal ou /antifake logs #Canal\`\n\n> O sistema de logs é opcional, caso deseje receber avisos quando uma conta for bloqueada do servidor!*`)
            .setFooter({ text: `Comando solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(this.client.user.displayAvatarURL({ extension: 'jpg', size: 2048 }));

        if (!args[0]) return message.reply({ embeds: [antiFake] });

        if (['info'].includes(args[0].toLowerCase())) {
            message.reply({ embeds: [antiFake] });
        }

        if (['dias', 'days', 'time'].includes(args[0].toLowerCase())) {
            const dias = args.slice(1).join(' ');

            if (!dias)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você não inseriu a quantidade de dias para o sistema!`);

            if (dias.length > 2)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, você deve inserir uma quantidade de dias! **Max: 99 dias**`);

            if (dias === anti.dias)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, a quantiade de dias que você inseriu é igual a quantidade atual!`);

            message.reply(`<:emoji_2:835484262425165885> ${message.author}, a quantidade de dias foi alterada!`);

            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antifake.dias': dias } }
            );
        }

        if (['canal', 'logs'].includes(args[0].toLowerCase())) {
            const canal = message.guild.channels.cache.get(args[1]) || message.mentions?.channels?.first();

            if (!canal) {
                return message.reply(
                    `${message.author}, você não inseriu o ID/não mencionou nenhum canal para as **logs**.`
                );
            } else if (canal.id === anti.logsch) {
                return message.reply(
                    `${message.author}, o canal inserido é o mesmo setado atualmente.`
                );
            } else {
                message.reply(
                    `${message.author}, o canal foi configurado com sucesso!`
                );
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: message.guild.id },
                    { $set: { 'antifake.logsch': canal.id } }
                );
            }
            return;
        }

        if (['on', 'ligar', 'ativar'].includes(args[0].toLowerCase())) {
            if (anti.status)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o sistema de **Anti-Fake** já se encontra ativado!`);

            message.reply(`<:emoji_2:835484262425165885> ${message.author}, sistema **ativado** com sucesso!`);

            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antifake.status': true } }
            );
        }

        if (['off', 'desligar', 'desativar'].includes(args[0].toLowerCase())) {
            if (!anti.status)
                return message.reply(`<:emoji_012:839153898774069268> ${message.author}, o sistema de **Anti-Fake** já se encontra desativado!`);

            message.reply(`<:emoji_2:835484262425165885> ${message.author}, sistema **desativado** com sucesso!`);

            return await this.client.database.guilds.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { 'antifake.status': false } }
            );
        }
    }
};
