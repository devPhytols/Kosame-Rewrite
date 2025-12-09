const { EmbedBuilder, bold, inlineCode } = require('discord.js');
const { Event } = require('../Structures/Structures.js');

module.exports = class voiceStateUpdateEvent extends Event {
    constructor(client) {
        super(client);
        this.client = client;
        this.name = 'voiceStateUpdate';
    }
    async execute(oldState, newState) {
        const server = await this.client.database.guilds.findOne({ idS: newState.guild.id });
        if (oldState.channel == null) {
            if (server?.logs?.logsJoinCall?.status) {
                const msgEmbedLog = new EmbedBuilder()
                    .setAuthor({ name: 'Entrou no Canal', iconURL: newState.member.user.avatarURL({ size: 2048 }), url: null })
                    .setDescription(`<:link1:1118599477079572560><:g2:1118599475267649616> Nome do Usuario: ${bold(newState.member.user.tag)}\n<:link3:1118599470326743131><:g1:1118599469420785684> ID do Usuario: ${inlineCode(newState.member.user.id)}\n\n<:entrou:1118599476198773120> entrou no canal ${newState.channel}`)
                    .setColor(0x57F187)
                    .setFooter({ text: newState.guild.name, iconURL: null })
                    .setTimestamp();
                try {
                    await this.client.channels.cache.get(server.logs.logsJoinCall.channel).send({
                        embeds: [msgEmbedLog]
                    });
                } catch (error) {
                    if (error.code === 50013) {
                        return;
                    } else {
                        //this.client.logger.error(`${error}`, 'voiceStateUpdate');
                        return;
                    }
                }
            }
        } else if (newState.channel == null) {
            if (server?.logs?.logsLeaveCall?.status) {
                const msgEmbedLog = new EmbedBuilder()
                    .setAuthor({ name: 'Saiu do Canal', iconURL: oldState.member.user.avatarURL({ size: 2048 }), url: null })
                    .setDescription(`<:link1:1118599477079572560><:r3:1118599658097344522> Nome do Usuario: ${bold(oldState.member.user.tag)}\n<:link3:1118599470326743131><:r2:1118599661406662776> ID do Usuario: ${inlineCode(oldState.member.user.id)}\n\n<:saiu:1118599658860720138> saiu do canal ${oldState.channel}`)
                    .setColor(0xEF5351)
                    .setFooter({ text: oldState.guild.name, iconURL: null })
                    .setTimestamp();
                try {
                    await this.client.channels.cache.get(server.logs.logsLeaveCall.channel).send({
                        embeds: [msgEmbedLog]
                    });
                } catch (error) {
                    if (error.code === 50013) {
                        return;
                    } else {
                        //this.client.logger.error(`${error}`, 'voiceStateUpdate');
                        return;
                    }
                }
            }
        } else {
            if (server?.logs?.logsSwitchCall?.status) {
                const msgEmbedLog = new EmbedBuilder()
                    .setAuthor({ name: 'Mudou de Canal', iconURL: newState.member.user.avatarURL({ size: 2048 }), url: null })
                    .setDescription(`<:link1:1118599477079572560><:y2:1118599757082918985> Nome do Usuario: ${bold(newState.member.user.tag)}\n<:link3:1118599470326743131><:y3:1118599754130141274> ID do Usuario: ${inlineCode(newState.member.user.id)}\n\n<:mudou:1118599650690224168> saiu do canal ${oldState.channel} e entrou no ${newState.channel}`)
                    .setColor(0xFEDC00)
                    .setFooter({ text: newState.guild.name, iconURL: null })
                    .setTimestamp();
                try {
                    await this.client.channels.cache.get(server.logs.logsSwitchCall.channel).send({
                        embeds: [msgEmbedLog]
                    });
                } catch (error) {
                    if (error.code === 50013) {
                        return;
                    } else {
                        //this.client.logger.error(`${error}`, 'voiceStateUpdate');
                        return;
                    }
                }
            }
        }
    }
}