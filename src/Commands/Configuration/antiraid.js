/* eslint-disable prefer-const */
const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
require('moment-duration-format');

module.exports = class AntiraidCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'antiraid';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Sistema de Anti Raid para seu servidor!';
        this.config = {
            registerSlash: true
        };
        this.aliases = ['atr'];
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message }) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, você não possui autoridade para utilizar esse comando!` });
        // Busca a Guild
        const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });
        const antiraid = doc.antiraid;

        const Embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setDescription(`> Seja bem vindo(a) ao meu sistema de Anti-Raid, o sistema tem o objetivo de proteger seu servidor de eventuais ataques que possam prejudicar o funcionamento.\n\n<a:setinha:1013543431085240371> O Status atual do sistema é ${antiraid.status ? '**Online**.' : '**Offline**.'}\n<a:setinha:1013543431085240371> O tempo configurado é **5 Minutos (Padrão)**\n\n<:kosame_exclamation:1254167710657413121> O sistema ainda continuará ativo para os demais funcionamentos.`)
            .setFooter({
                text: `Comando solicitado por ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
            })
            .setThumbnail('https://i.imgur.com/glqiE8i.png');

        const rowInicial = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Configure o Sistema Abaixo')
                    .addOptions([{
                        label: 'Ativar o Sistema',
                        emoji: '<:ksm_on:1114208742989377690>',
                        value: 'onSys'
                    },
                    {
                        label: 'Desativar o Sistema',
                        emoji: '<:ksm_off:1114208744704839791>',
                        value: 'offSys'
                    },
                    {
                        label: 'Resetar o Sistema',
                        emoji: '<:ksm_reset:1114208740225327205>',
                        value: 'resetSys'
                    }
                    ])
            );

        // Mensagem Principal 
        const msg = await message.reply({
            embeds: [Embed],
            components: [rowInicial],
            fetchReply: true
        });

        // Filto de Interação
        const filter = (i) => {
            return i.isStringSelectMenu() || i.isRoleSelectMenu() && i.message.id === msg.id;
        };
        
        // Definindo o collector
        const collector = msg.createMessageComponentCollector({ filter, time: 2 * 60 * 1000 });

        // Quando o timer encerrar
        collector.on('end', async () => {
            await msg.delete();
        });

        // Quando o collector for acionado
        collector.on('collect', async (i) => {
            let customId = i.values[0];

            // Verifica se o utilizador é o autor do comando
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: `Eiii ${i.user}, esse comando não pertence a você!. 👀`,
                    ephemeral: true
                });
            }

            // Coletando Interação
            if (customId === 'onSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    { $set: { 'antiraid.status': true } }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você ativou o sistema de **Anti-Raid**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (customId === 'offSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    { $set: { 'antiraid.status': false } }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você desativou o sistema de **Anti-Raid**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } else if (customId === 'resetSys') {
                await this.client.database.guilds.findOneAndUpdate(
                    { idS: i.guild.id },
                    { $set: { 
                        'antiraid.status': false
                    } }
                );

                return i.update({
                    content: `<:kosame_Correct:1010978511839842385> ${message.author} Você resetou o sistema de **Anti-Raid**.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            }
        });
    }
};