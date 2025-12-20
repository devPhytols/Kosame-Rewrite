const { PermissionFlagsBits } = require('discord.js');

module.exports = class inviteModule {
    constructor(client) {
        this.client = client;
    }

    async execute(message, server) {
        try {
            // Verifica se o antinvite está ativado
            if (!server?.antinvite?.status) return;

            // Regex melhorada para detectar convites do Discord
            const regex = /(https?:\/\/)?(www\.|ptb\.|canary\.)?(discord\.(gg|io|me|li|link)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;

            if (!regex.test(message.content)) return;

            // Verifica se o canal está na whitelist
            const isWhitelistedChannel = server.antinvite.channels?.some((x) => x === message.channel.id);
            if (isWhitelistedChannel) return;

            // Verifica se o usuário tem um cargo na whitelist
            const hasWhitelistedRole = server.antinvite.roles?.some((x) => message.member?.roles?.cache?.has(x));
            if (hasWhitelistedRole) return;

            // Verifica se é administrador
            if (message.member?.permissions?.has(PermissionFlagsBits.Administrator)) return;

            // Monta a mensagem de aviso
            const warningMsg = server.antinvite.msg === 'null' || !server.antinvite.msg
                ? `<:ksm_errado:1089754955256176701> ${message.author}, você não pode divulgar outros servidores aqui!`
                : server.antinvite.msg
                    .replace(/{user}/g, message.author)
                    .replace(/{channel}/g, message.channel);

            // Deleta a mensagem e envia aviso
            await message.delete().catch(() => { });
            await message.channel.send(warningMsg).then((msg) => {
                setTimeout(() => msg.delete().catch(() => { }), 5000);
            }).catch(() => { });

        } catch (err) {
            this.client.logger.error(err.message, 'inviteModule');
        }
    }
};
