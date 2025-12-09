const { EmbedBuilder } = require('discord.js');

class ClientEmbed extends EmbedBuilder {
    constructor(data = {}) {
        super(data);
        this.setColor('#F1F1F1');
    }
}

module.exports = { ClientEmbed };