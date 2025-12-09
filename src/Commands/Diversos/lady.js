const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class LadyCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'lady';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Gerencie as configurações de Primeira Dama.';
        this.config = {
            registerSlash: true
        };
    }

    async commandExecute({ message }) {
        if (message.author.id ==! '236651138747727872') return;

        const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });

        // Função para criar a embed com as configurações atuais
        const createConfigEmbed = () => {
            const ladyRole = doc.ladysys.ladyRole
                ? `<@&${doc.ladysys.ladyRole}>`
                : 'Nenhum cargo configurado';
            const allowedRoles = doc.ladysys.allowedRoles.length
                ? doc.ladysys.allowedRoles.map((roleId) => `<@&${roleId}>`).join(', ')
                : 'Nenhum cargo configurado';

            return new EmbedBuilder()
                .setColor('#ff69b4')
                .setTitle('Configurações de Primeira Dama')
                .setDescription('Gerencie as configurações do comando de Primeira Dama.')
                .addFields(
                    { name: 'Cargo de Primeira Dama', value: ladyRole, inline: false },
                    { name: 'Cargos com Permissão', value: allowedRoles, inline: false }
                )
                .setFooter({ text: 'Use o menu abaixo para alterar as configurações.' });
        };

        // Menu de seleção
        const menu = new StringSelectMenuBuilder()
            .setCustomId('lady-config-menu')
            .setPlaceholder('Selecione uma opção')
            .addOptions([
                {
                    label: 'Configurar Cargo de Primeira Dama',
                    description: 'Defina o cargo de Primeira Dama.',
                    value: 'set_lady_role'
                },
                {
                    label: 'Configurar Cargos com Permissão',
                    description: 'Defina os cargos com permissão.',
                    value: 'set_allowed_roles'
                },
                {
                    label: 'Configurações',
                    description: 'Acesse configurações avançadas.',
                    value: 'settings'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // Envia a mensagem inicial com o menu
        const reply = await message.reply({
            embeds: [createConfigEmbed()],
            components: [row]
        });

        // Coletor de interações para o menu
        const filter = (interaction) =>
            interaction.isStringSelectMenu() && interaction.customId === 'lady-config-menu';
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;

            const selected = interaction.values[0];

            if (selected === 'set_lady_role') {
                await interaction.reply({
                    content: 'Mencione ou envie o ID do cargo para configurar como Primeira Dama.',
                    ephemeral: true
                });

                const roleCollector = message.channel.createMessageCollector({
                    filter: (msg) => msg.author.id === interaction.user.id,
                    time: 30000,
                    max: 1
                });

                roleCollector.on('collect', async (msg) => {
                    const roleId = msg.mentions.roles.first()?.id || msg.content;

                    if (!message.guild.roles.cache.has(roleId)) {
                        return msg.reply('ID inválido ou cargo não encontrado.');
                    }

                    doc.ladysys.ladyRole = roleId;
                    await doc.save();

                    // Atualiza a mensagem original
                    reply.edit({
                        embeds: [createConfigEmbed()],
                        components: [row]
                    });

                    msg.reply(`Cargo de Primeira Dama configurado como <@&${roleId}>.`);
                });
            }

            if (selected === 'set_allowed_roles') {
                await interaction.reply({
                    content: 'Mencione ou envie os IDs dos cargos que terão permissão (separe por espaços).',
                    ephemeral: true
                });

                const rolesCollector = message.channel.createMessageCollector({
                    filter: (msg) => msg.author.id === interaction.user.id,
                    time: 30000,
                    max: 1
                });

                rolesCollector.on('collect', async (msg) => {
                    const roleIds = msg.mentions.roles.map((role) => role.id) || msg.content.split(' ');

                    const invalidRoles = roleIds.filter((id) => !message.guild.roles.cache.has(id));
                    if (invalidRoles.length > 0) {
                        return msg.reply(`Os seguintes IDs são inválidos: ${invalidRoles.join(', ')}`);
                    }

                    doc.ladysys.allowedRoles = roleIds;
                    await doc.save();

                    // Atualiza a mensagem original
                    reply.edit({
                        embeds: [createConfigEmbed()],
                        components: [row]
                    });

                    msg.reply(`Cargos com permissão configurados como: ${roleIds.map((id) => `<@&${id}>`).join(', ')}`);
                });
            }

            if (selected === 'settings') {
                const settingsMenu = new StringSelectMenuBuilder()
                    .setCustomId('lady-settings-menu')
                    .setPlaceholder('Escolha uma opção de configuração')
                    .addOptions([
                        {
                            label: 'Listar Membros com Primeira Dama',
                            description: 'Veja quem possui o cargo de Primeira Dama.',
                            value: 'list_members'
                        },
                        {
                            label: 'Remover Cargos com Permissão',
                            description: 'Escolha um cargo para remover.',
                            value: 'remove_roles'
                        },
                        {
                            label: 'Configurar Limite por Cargo',
                            description: 'Defina limites para cada cargo.',
                            value: 'set_limits'
                        }
                    ]);

                const settingsRow = new ActionRowBuilder().addComponents(settingsMenu);

                await interaction.reply({
                    content: 'Selecione uma configuração:',
                    components: [settingsRow],
                    ephemeral: true
                });

                const settingsCollector = message.channel.createMessageComponentCollector({
                    filter: (i) => i.isStringSelectMenu() && i.customId === 'lady-settings-menu',
                    time: 30000
                });

                settingsCollector.on('collect', async (settingsInteraction) => {
                    const settingSelected = settingsInteraction.values[0];

                    if (settingSelected === 'list_members') {
                        const membersWithRole = message.guild.members.cache.filter((member) =>
                            member.roles.cache.has(doc.ladysys.ladyRole)
                        );

                        const memberList = membersWithRole.size
                            ? membersWithRole.map((member) => member.user.tag).join('\n')
                            : 'Nenhum membro possui este cargo.';

                        await settingsInteraction.reply({
                            content: `**Membros com o cargo de Primeira Dama:**\n${memberList}`,
                            ephemeral: true
                        });
                    }

                    if (settingSelected === 'remove_roles') {
                        const roleOptions = doc.ladysys.allowedRoles.map((roleId) => ({
                            label: message.guild.roles.cache.get(roleId)?.name || 'Cargo desconhecido',
                            description: `ID: ${roleId}`,
                            value: roleId
                        }));

                        const rolesMenu = new StringSelectMenuBuilder()
                            .setCustomId('remove-role-menu')
                            .setPlaceholder('Selecione um cargo para remover')
                            .addOptions(roleOptions);

                        const rolesRow = new ActionRowBuilder().addComponents(rolesMenu);

                        await settingsInteraction.reply({
                            content: 'Selecione um cargo para remover da lista de permissões:',
                            components: [rolesRow],
                            ephemeral: true
                        });

                        const roleRemoveCollector = message.channel.createMessageComponentCollector({
                            filter: (i) => i.isStringSelectMenu() && i.customId === 'remove-role-menu',
                            time: 30000
                        });

                        roleRemoveCollector.on('collect', async (roleRemoveInteraction) => {
                            const roleId = roleRemoveInteraction.values[0];
                            doc.ladysys.allowedRoles = doc.ladysys.allowedRoles.filter((id) => id !== roleId);
                            await doc.save();

                            await roleRemoveInteraction.reply({
                                content: `Cargo removido: <@&${roleId}>`,
                                ephemeral: true
                            });

                            // Atualiza a embed original
                            reply.edit({
                                embeds: [createConfigEmbed()],
                                components: [row]
                            });
                        });
                    }

                    if (settingSelected === 'set_limits') {
                        if (!doc.ladysys.allowedRoles.length) {
                            return settingsInteraction.reply({
                                content: 'Não há cargos configurados para definir limites.',
                                ephemeral: true
                            });
                        }
                    
                        const roleMenu = new StringSelectMenuBuilder()
                            .setCustomId('select-role')
                            .setPlaceholder('Selecione um cargo para configurar o limite')
                            .addOptions(
                                doc.ladysys.allowedRoles.map((roleId) => ({
                                    label: message.guild.roles.cache.get(roleId)?.name || 'Cargo não encontrado',
                                    value: roleId
                                }))
                            );
                    
                        const roleRow = new ActionRowBuilder().addComponents(roleMenu);
                    
                        await settingsInteraction.reply({
                            content: 'Selecione um cargo para configurar o limite:',
                            components: [roleRow],
                            ephemeral: true
                        });
                    
                        const roleCollector = settingsInteraction.channel.createMessageComponentCollector({
                            filter: (i) => i.customId === 'select-role' && i.user.id === settingsInteraction.user.id,
                            time: 30000
                        });
                    
                        roleCollector.on('collect', async (roleInteraction) => {
                            const selectedRole = roleInteraction.values[0];
                    
                            const limitMenu = new StringSelectMenuBuilder()
                                .setCustomId('select-limit')
                                .setPlaceholder('Selecione o limite para este cargo')
                                .addOptions(
                                    Array.from({ length: 5 }, (_, i) => ({
                                        label: `${i + 1}`,
                                        value: `${i + 1}`
                                    }))
                                );
                    
                            const limitRow = new ActionRowBuilder().addComponents(limitMenu);
                    
                            await roleInteraction.reply({
                                content: `Selecione o limite para o cargo <@&${selectedRole}>:`,
                                components: [limitRow],
                                ephemeral: true
                            });
                    
                            const limitCollector = roleInteraction.channel.createMessageComponentCollector({
                                filter: (i) => i.customId === 'select-limit' && i.user.id === roleInteraction.user.id,
                                time: 30000
                            });
                    
                            limitCollector.on('collect', async (limitInteraction) => {
                                const selectedLimit = parseInt(limitInteraction.values[0], 10);
                    
                                // Inicializa a estrutura de limites caso não exista
                                doc.ladysys.limits = doc.ladysys.limits || {};
                                doc.ladysys.limits[selectedRole] = selectedLimit;
                    
                                await doc.save(); // Salva as alterações no banco
                    
                                await limitInteraction.reply({
                                    content: `Limite configurado para o cargo <@&${selectedRole}>: ${selectedLimit} Primeira(s) Dama(s).`,
                                    ephemeral: true
                                });
                    
                                limitCollector.stop();
                            });
                        });
                    }
                    
                });
            }
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            reply.edit({ components: [row] });
        });
    }
};