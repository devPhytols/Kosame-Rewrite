/* eslint-disable prefer-const */
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Command } = require('../../Structures/Structures.js');
const fetch = require('node-fetch');

module.exports = class privateCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'private';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Priva ou libera informações do userinfo.';
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    async commandExecute({ message, args }) {
        const userDb = await this.client.database.users.findOne({ idU: message.author.id });
        let perm = await fetch(`https://api.phytols.dev/api/v2/kosame/${message.author.id}`).then(res => res.json());
        
        // Verifica se o usuário é booster
        if (!perm[0].isBooster && !userDb.vip.hasVip) {
            return message.reply({
                content: '<:ksm_errado:1089754955256176701> Este comando só está disponível para usuários **VIP** e **Boosters**!\n-# Você pode se tornar um usuário VIP ou Booster visitando o meu servidor principal para sanar todas as suas dúvidas!\n-# Encontre o servidor de Suporte em https://kosame.site',
                ephemeral: true
            }).then(msg => setTimeout(() => msg.delete(), 1000 * 60));
        }

        if (!args[0]) {
            return message.reply({
                content: `<:zyexclaim:1006804908936269964> ${message.author}, Confirme para mim que vai privar! (**k!private all**)`,
                ephemeral: true
            }).then(msg => setTimeout(() => msg.delete(), 1000 * 20));
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_action')
                    .setEmoji('<:lockosame:1021582645555105852>')
                    .setLabel(userDb.userinfo.allPriv ? 'Sim, liberar' : 'Sim, privar')
                    .setStyle(userDb.userinfo.allPriv ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_action')
                    .setLabel('Não')
                    .setStyle(ButtonStyle.Secondary)
            );

        if (args[0] === 'all') {
            const confirmMsg = await message.reply({
                content: userDb.userinfo.allPriv ? 
                    'Você deseja LIBERAR todas as suas informações?' : 
                    'Você deseja PRIVAR todas as suas informações?',
                components: [row]
            });

            const filter = i => i.user.id === message.author.id;
            const collector = confirmMsg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'confirm_action') {
                    if (userDb.userinfo.allPriv) {
                        // Libera tudo
                        await userDb.set({
                            'userinfo.allPriv': false,
                            'userinfo.avatar': false,
                            'userinfo.nicknames': false
                        });
                        await userDb.save();
                        await interaction.update({
                            content: '<:ksunlock:1025473557758746746> Todas as informações foram liberadas com sucesso!',
                            components: []
                        }).then(msg => setTimeout(() => msg.delete(), 1000 * 20));
                    } else {
                        // Priva tudo
                        await userDb.set({
                            'userinfo.allPriv': true,
                            'userinfo.avatar': true,
                            'userinfo.nicknames': true
                        });
                        await userDb.save();
                        await interaction.update({
                            content: '<:ksunlock:1025473557758746746> Todas as informações foram privadas com sucesso!',
                            components: []
                        }).then(msg => setTimeout(() => msg.delete(), 1000 * 20));
                    }
                } else {
                    await interaction.update({
                        content: 'Entendi, a ação foi cancelada!',
                        components: []
                    });
                }
            });

            collector.on('end', collected => {
                if (!collected.size) {
                    confirmMsg.edit({
                        content: 'Hmmm... parece que você não respondeu a tempo, tente novamente!',
                        components: []
                    }).then(msg => setTimeout(() => msg.delete(), 1000 * 20));
                }
            });
        }
    }
};