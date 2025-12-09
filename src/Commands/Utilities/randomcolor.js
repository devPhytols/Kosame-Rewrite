const { ApplicationCommandType } = require('discord.js');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Command } = require('../../Structures/Structures');

module.exports = class RandomcolorCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'randomcolor';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Gera uma cor aleatória em Hex e RGB.';
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    commandExecute({ message }) {

        const hex = ('00000' + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6);
        const int = parseInt(hex, 16);
        const rgb = [(int & 0xff0000) >> 16, (int & 0x00ff00) >> 8, int & 0x0000ff];

        const Embed = new ClientEmbed()
            .setColor(int)
            .setDescription(`**Color Hex:** \`\`\`#${hex}\`\`\`\n**Color RGB:** \`\`\`${rgb.join(',')}\`\`\``);

        return message.reply({ embeds: [Embed] });
    }
};