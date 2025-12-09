const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class MarryCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'marry';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Inicie um matrimônio com outra pessoa na Kosame.';
        this.aliases = ['casar', 'casamento'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'pessoa',
                description: 'A pessoa que será seu companheiro.',
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

        if (doc.marry.has)
            return message.reply({ content: `${message.author}, você já está casado.` });

        if (!user)
            return message.reply({ content: `${message.author}, você deve mencionar com quem deseja casar.` });

        if (user.id === message.author.id)
            return message.reply({ content: `${message.author}, você não pode casar com você mesmo.` });

        const target = await this.client.database.users.findOne({ idU: user.id });

        if (!target)
            return message.reply({ content: `${message.author}, não encontrei este usuário em minha database.` });

        if (target.marry.has)
            return message.reply({ content: `${message.author}, o(a) membro(a) já está casado com o(a) **\`${await this.client.users.fetch(target.marry.user).then((x) => x.tag)}\`**.` });

        const embedaceito = new ClientEmbed()
            .setColor('#F55978')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(`${user} aceitou seu pedido!\n\n**Agora vocês estão casados.** `)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015101071154233344/1015101392752484433/marry1.png', { size: 1024 });

        const embedpedido = new ClientEmbed()
            .setColor('#FF4B4E')
            .setTitle('**Pedido de Casamento**')
            .setDescription(`Você convidou ${user} para um jantar romântico\ne o(a) pediu em casamento!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015101071154233344/1015101392563736677/marry2.png');

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
                                    'marry.user': user.id,
                                    'marry.has': true,
                                    'marry.time': Date.now()
                                }
                            });
                            await this.client.database.users.findOneAndUpdate({
                                idU: user.id
                            }, {
                                $set: {
                                    'marry.user': message.author.id,
                                    'marry.has': true,
                                    'marry.time': Date.now()
                                }
                            });

                            return;
                        }

                        if (collected.first().emoji.name === '❌') {
                            msg.delete();

                            return message.channel.send({ content: `<:sadface:842078049951809557><:brokenheart:842091496143978537> ${user} recusou seu pedido de casamento.` });
                        }
                    }).catch(() => {
                        msg.delete();
                        message.reply({ content: 'O tempo para aceitar o pedido acabou!' });
                    });
            })).catch(() => { });
    }
};