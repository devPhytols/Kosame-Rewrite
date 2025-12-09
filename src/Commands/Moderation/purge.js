/* eslint-disable prefer-const */
const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { Command } = require('../../Structures/Structures.js');

module.exports = class PurgeCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'purge';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Limpe uma quantidade de mensagens de um usuário.';
        this.aliases = ['cl'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'usuario',
                description: 'Informe o usuário que deseja limpar.',
                required: true,
                type: ApplicationCommandOptionType.User
            },
            {
                name: 'quantidade',
                description: 'Informe a quantidade que deseja limpar.',
                required: false,
                type: ApplicationCommandOptionType.String
            }
        ];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async commandExecute({ message, args }) {
        // Args: <userMentionOrId> [quantidade|all]
        let user = null;
        
        // Tentar pegar menção primeiro
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } 
        // Se não houver menção, tentar buscar por ID
        else if (args[0]) {
            const userId = args[0].replace(/[<@!>]/g, ''); // Remove caracteres de menção se houver
            user = await this.client.users.fetch(userId).catch(() => null);
        }
        
        const qtyArg = args[1];
        const limit = qtyArg && !isNaN(parseInt(qtyArg)) ? parseInt(qtyArg) : null; // null => all

        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply({ content: `${message.author}, você não possui permissões suficientes no servidor para apagar mensagens!` });
        } else if (!user) {
            return message.reply({ content: `${message.author}, você não mencionou um usuário válido ou forneceu um ID válido.` });
        } else if (limit !== null && limit < 1) {
            return message.reply({ content: `${message.author}, você precisa fornecer uma quantia maior que 1.` });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm').setLabel('Confirmar').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );
        const prompt = await message.reply({ content: `Você confirma apagar ${limit ? `${limit} mensagens` : 'todas as mensagens disponíveis'} de ${user.tag} neste canal?`, components: [row] });
        const collected = await prompt.awaitMessageComponent({ time: 30000 }).catch(() => null);
        if (!collected || collected.customId !== 'confirm' || collected.user.id !== message.author.id) {
            await prompt.edit({ content: 'Operação cancelada.', components: [] }).catch(() => {});
            return;
        }
        await collected.update({ content: 'Iniciando limpeza...', components: [] }).catch(() => {});

        try {
            let deletedMessages = 0;
            let lastId = undefined;
            let remaining = limit ?? Infinity;
            const twoWeeks = 14 * 24 * 60 * 60 * 1000;
            let consecutiveEmptyBatches = 0;

            while (remaining > 0) {
                const fetched = await message.channel.messages.fetch({ limit: 100, before: lastId }).catch(() => null);
                if (!fetched || fetched.size === 0) break;

                const userMessages = fetched.filter(m => m.author.id === user.id);
                if (userMessages.size === 0) {
                    lastId = fetched.last()?.id;
                    consecutiveEmptyBatches++;
                    // Se encontrou 5 lotes consecutivos sem mensagens do usuário, parar
                    if (consecutiveEmptyBatches >= 5) break;
                    continue;
                }
                
                consecutiveEmptyBatches = 0; // Reset o contador quando encontrar mensagens

                // Respect limit if provided
                const sliceCount = Math.min(userMessages.size, remaining);
                const targets = new Map([...userMessages.entries()].slice(0, sliceCount));

                const now = Date.now();
                const recent = new Map();
                const old = [];
                for (const [id, msg] of targets) {
                    if (now - msg.createdTimestamp < twoWeeks) recent.set(id, msg);
                    else old.push(msg);
                }

                // Bulk delete for recent ones (supports Collection)
                if (recent.size > 0) {
                    await message.channel.bulkDelete(recent, true).catch(() => {});
                    deletedMessages += recent.size;
                    remaining -= recent.size;
                }
                // Individually delete old ones
                for (const msg of old) {
                    if (remaining <= 0) break;
                    await msg.delete().catch(() => {});
                    deletedMessages += 1;
                    remaining -= 1;
                    await new Promise(r => setTimeout(r, 200));
                }

                lastId = fetched.last()?.id;
                if (fetched.size < 100) break; // reached top
                
                // Pequena pausa entre lotes para evitar rate limit
                await new Promise(r => setTimeout(r, 500));
            }

            const reply = await message.channel.send({ content: `**${deletedMessages} mensagens de ${user.tag} foram limpas nesse chat!**` });
            
            // Deleta a resposta após 15 segundos
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 15000);
        } catch (err) {
            console.error(err);
            return message.reply({ content: 'Ocorreu um erro ao tentar limpar as mensagens.' });
        }
    }
};