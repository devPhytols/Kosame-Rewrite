const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');

module.exports = class BestfriendCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'bestfriend';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Torne-se melhor amigo(a) de alguém na Kosame.';
        this.aliases = ['bf'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'A pessoa que será seu melhor amigo(a).',
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

        const user = this.client.users.cache.get(args[0]) || message.mentions?.users?.first() || message.author;
        const doc = await this.client.database.users.findOne({ idU: message.author.id });

        if (doc.bestfriend.has)
            return message.reply({ content: `${message.author}, você já possui um melhor amigo.` });

        if (!user)
            return message.reply({ content: `${message.author}, você deve mencionar com quem deseja casar.` });

        if (user.id === message.author.id)
            return message.reply({ content: `${message.author}, você não pode ser seu melhor amigo.` });

        const target = await this.client.database.users.findOne({ idU: user.id });

        if (!target)
            return message.reply({ content: `${message.author}, este usuário não está registrado em minha database.` });

        if (target.bestfriend.has)
            return message.reply({ content: `${message.author}, o usuário já é melhor amigo de **\`${await this.client.users.fetch(target.bestfriend.user).then((x) => x.tag)}\`**.` });

        const embedaceito = new ClientEmbed()
            .setColor('#f8bc07')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(`${user} aceitou seu pedido!\n\n**Agora vocês são melhores amigos.** `)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015101071154233344/1015101127148187668/bf1.png', { size: 1024 });

        const embedpedido = new ClientEmbed()
            .setColor('#f8bc07')
            .setTitle('**Pedido de Melhor Amigo**')
            .setDescription(`${message.author} pediu para ser melhor amigo(a) de ${user}!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015101071154233344/1015101127148187668/bf1.png', { size: 1024 });

        const filter = (reaction, member) => {
            return (member.id === user.id && ['✅', '❌'].includes(reaction.emoji.name));
        };

        message.reply('Pedido enviado!').then(
            message.channel.send({
                embeds: [embedpedido]
            }).then(async (msg) => {
                for (const emoji of ['✅', '❌']) await msg.react(emoji);

                msg
                    .awaitReactions({
                        filter: filter,
                        max: 1,
                        time: 10000,
                        errors: ['time']
                    })
                    .then(async (collected) => {
                        if (collected.first().emoji.name === '✅') {
                            msg.delete();

                            message.channel.send({
                                embeds: [embedaceito]
                            });

                            await this.client.database.users.findOneAndUpdate({
                                idU: message.author.id
                            }, {
                                $set: {
                                    'bestfriend.user': user.id,
                                    'bestfriend.has': true,
                                    'bestfriend.time': Date.now()
                                }
                            });
                            await this.client.database.users.findOneAndUpdate({
                                idU: user.id
                            }, {
                                $set: {
                                    'bestfriend.user': message.author.id,
                                    'bestfriend.has': true,
                                    'bestfriend.time': Date.now()
                                }
                            });

                            return;
                        }

                        if (collected.first().emoji.name === '❌') {
                            msg.delete();

                            return message.channel.send(
                                `<:sadface:842078049951809557><:bbrokenheart:842154049850834974> ${user} recusou seu pedido de melhor amigo(a).`
                            );
                        }
                    }).catch(() => {
                        msg.delete();
                        message.reply({ content: 'O tempo para aceitar o pedido acabou!' });
                    });
            })).catch(() => { });
    }
};