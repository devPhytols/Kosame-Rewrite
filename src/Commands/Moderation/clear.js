const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');

module.exports = class ClearCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'clear';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Limpe uma quantidade específica de mensagens.';
        this.aliases = ['limpar'];
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'quantidade',
                description: 'Informe a quantidade que deseja limpar.',
                required: true,
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
        const quantidade = parseInt(args[0]);

        // Verificando permissões do bot e do usuário
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply({ content: `<:emoji_012:839153898774069268> ${message.author}, eu não tenho permissões suficientes no servidor para apagar mensagens!` });
        } else if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply({ content: 'Você não possui permissão para utilizar este comando!' });
        } else if (isNaN(quantidade)) {
            return message.reply({ content: '**Por favor, informe uma quantidade válida de mensagens!**' });
        } else if (quantidade < 1) {
            return message.reply({ content: '**Por favor, forneça um número maior que 0!**' });
        }

        try {
            let remaining = quantidade;
            let deletedMessages = 0;

            // Vamos apagar em blocos de 100 mensagens até que a quantidade total seja alcançada
            while (remaining > 0) {
                const toDelete = Math.min(remaining, 100); // Apaga no máximo 100 mensagens por vez
                const messagesToDelete = await message.channel.messages.fetch({ limit: toDelete });

                if (messagesToDelete.size === 0) break; // Para se não houver mais mensagens para deletar

                // Apaga as mensagens
                const deleted = await message.channel.bulkDelete(messagesToDelete, true); // "true" permite excluir mensagens com mais de 14 dias
                deletedMessages += deleted.size;
                remaining -= deleted.size; // Subtrai o número de mensagens REALMENTE deletadas

                // Para se já deletamos o suficiente ou não há mais mensagens
                if (deleted.size === 0 || remaining <= 0) break;

                // Atraso para não sobrecarregar o Discord (sem limites de taxa)
                await new Promise(resolve => setTimeout(resolve, 1000)); // Atraso de 1000ms entre os blocos de exclusão
            }

            const reply = await message.channel.send({ content: `**${deletedMessages} mensagens foram limpas nesse chat!**` });
            
            // Deleta a resposta após 5 segundos
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);
        } catch (err) {
            console.error(err);
            return message.channel.send({ content: 'Ocorreu um erro ao tentar limpar as mensagens.' }).catch(() => {});
        }
    }
};