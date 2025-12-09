const { PermissionFlagsBits } = require('discord.js');

module.exports = class inviteModule {
    constructor(client) {
        this.client = client;
    }

    execute(message, server) {
        try {
            if (server.antinvite.status) {
                const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g;

                if (regex.test(message.content)) {
                    const channels = server.antinvite.channels.some((x) => x === message.channel.id);
                    const roles = server.antinvite.roles.some((x) => message.member.roles.cache.has(x));

                    if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !channels && !roles)
                        return message.channel
                            .send(server.antinvite.msg === 'null' ? `${message.author}, você não pode divulgar servidores aqui!` : server.antinvite.msg.replace(/{user}/g, message.author).replace(/{channel}/g, message.channel))
                            .then(() => message.delete());
                }
            }
        } catch (err) {
            this.client.logger.error(err.message, inviteModule.name);
            return this.client.logger.warn(err.stack, inviteModule.name);
        }
    }
};