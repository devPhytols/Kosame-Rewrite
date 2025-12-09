const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');
const moment = require('moment');
require('moment-duration-format');

module.exports = class RepCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'rep';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Troque reputações com os seus amigos.';
        this.config = {
            registerSlash: true,
            giveXp: true
        };
        this.options = [
            {
                name: 'usuario',
                description: 'O usuário que você deseja dar a reputação.',
                required: true,
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {
        const contaData = Math.abs(Date.now() - message.author.createdAt);
        const contaDias = Math.ceil(contaData / (1000 * 60 * 60 * 24));
        const User = this.client.users.cache.get(args[0]) || message.mentions.users.first();
        const Autor = await this.client.database.users.findOne({ idU: message.author.id });
        const rep = Autor.reps;
        const cooldown = 3.6e6 - (Date.now() - rep.time);

        if (!User)
            return message.reply({ content: `${message.author}, você deve mencionar para quem deseja enviar uma reputação.` });

        // if (Autor.Exp.level < 3)
        //     return message.reply({ content: 'Você ainda não pode utilizar esse tipo de comando, atinja o level 3 para enviar reputações.' });

        if (contaDias <= 15)
            return message.reply({ content: 'Eii, a sua conta é muito nova para enviar reputações, me utilize por alguns dias!' });

        if (User == message.author.id)
            return message.reply({ content: `${message.author}, você não pode enviar reputação para você mesmo.` });

        const Alvo = await this.client.database.users.findOne({ idU: User.id });

        if (!Alvo)
            return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

        if (Alvo.reps.block === true)
            return message.reply(`${message.author}, esse usuário não deseja receber reputações!`);

        const embedCd = new ClientEmbed()
            .setColor('#edb021')
            .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription(
                `**Você já deu reputação hoje!**\n\nVolte em **${moment.
                    duration(cooldown).
                    format('h [Horas] m [Minutos] e s [Segundos]')}**
                `)
            .setThumbnail('https://images-ext-1.discordapp.net/external/D6U9B0q3i-pydbXDWPSFBiywzcxDAHWNuQE7QpLMQUI/https/media.discordapp.net/attachments/842037644712345633/859502306416394270/kosame_reputation.png', { size: 1024 });

        const embedSuccess = new ClientEmbed()
            .setColor('#edb021')
            .setAuthor({
                name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true }))
            })
            .setDescription(`<:kosame_reputation:846487970826944512> Você deu uma reputação para **${User.tag}**!\n\nUtilize: k!rankreps para ver o rank!`)
            .setThumbnail('https://images-ext-1.discordapp.net/external/D6U9B0q3i-pydbXDWPSFBiywzcxDAHWNuQE7QpLMQUI/https/media.discordapp.net/attachments/842037644712345633/859502306416394270/kosame_reputation.png', { size: 1024 });

        if (cooldown > 0)
            return message.reply({ embeds: [embedCd] });

        message.reply({ embeds: [embedSuccess] });

        await this.client.database.users.findOneAndUpdate({
            idU: message.author.id
        }, {
            $set: {
                'reps.time': Date.now()
            },
            $push: {
                'reps.history': {
                    $each: [
                        {
                            sender: message.author.id,
                            receiver: User.id,
                            date: new Date(),
                            action: 'send' // registrar que o autor enviou a rep
                        }
                    ],
                    $slice: -20 // mantém apenas os 20 mais recentes
                }
            }
        });

        await this.client.database.users.findOneAndUpdate(
            { idU: User.id },
            {
                $set: {
                    'reps.size': Alvo.reps.size + 1
                },
                $push: {
                    'reps.history': {
                        $each: [
                            {
                                sender: message.author.id,
                                receiver: User.id,
                                date: new Date(),
                                action: 'receive' // registrar que o alvo recebeu a rep
                            }
                        ],
                        $slice: -20 // mantém apenas os 20 mais recentes
                    }
                }
            }
        );
    }
};
