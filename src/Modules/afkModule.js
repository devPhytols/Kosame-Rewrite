module.exports = class afkModule {
    constructor(client) {
        this.client = client;
    }

    async execute(message, user) {
        try {
            let doc = await this.client.database.users.findOne({ idU: message.author.id });
            if (!doc) doc = await new this.client.database.users({ idU: message.author.id }).save();
            // Se o usuário mencionado estiver AFK:
            if (message.mentions.users.first()) {
                let doc = await this.client.database.users.findOne({ idU: message.mentions.users.first().id });
                if (!doc) doc = await new this.client.database.users({ idU: message.mentions.users.first().id }).save();

                if (doc.AFK.away) {
                    if (doc.AFK.servers.some((x) => x == message.guild.id)) {
                        return message.reply({ content: `<:userafk:1042183419825770496> ${message.author}, o usuário \`${message.mentions.users.first().tag}\` está **AFK**. \n<:reason:1042181908529958952> **Motivo**: \`${doc.AFK.reason || 'nenhum'}\`` })
                        .then((message) => setTimeout(() => message.delete(), 1000 * 20));
                    }
                }
            }

            // Se o autor da mensagem estiver AFK:
            if (user && user.AFK.away) {
                let doc = await this.client.database.users.findOne({ idU: message.author.id });
                if (!doc) doc = await new this.client.database.users({ idU: message.author.id }).save();

                if (doc.AFK.servers.some((x) => x == message.guild.id) || doc.AFK.servers.length === 0) {
                    user.set({
                        'AFK.away': false,
                        'AFK.reason': null
                    });
                    user.save();
                    await this.client.database.users.findOneAndUpdate(
                        { idU: message.author.id },
                        { $pull: { 'AFK.servers': message.guild.id } }
                    );
    
                    return message.reply({ content: '<:awake:1042184014934573076> Você não está mais **AFK**!' })
                        .then((message) => setTimeout(() => message.delete(), 1000 * 20));
                }
            }
        } catch (err) {
            this.client.logger.error(err.message, afkModule.name);
            return this.client.logger.warn(err.stack, afkModule.name);
        }
    }
};