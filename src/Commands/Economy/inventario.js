const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class InventoryCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'inventario';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Veja todos os itens da sua mochila.';
        this.aliases = ['mochila', 'inventory'];
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
    async commandExecute({ message }) {

        const user = await this.client.database.users.findOne({ idU: message.author.id });

        const EMBED2 = new EmbedBuilder(message.author)
            .setColor('#FFFFFF')
            .setAuthor({ name: `Inventário de ${message.author.tag}`, iconURL: message.author.displayAvatarURL(() => ({ dynamic: true })) })
            .setDescription(`**Armas:**\n${user.arsenal.hasFaca ? '<:faca:1010973285493776456> *1x Faca*' : '<:faca:1010973285493776456> *0x Faca*'}\n${user.arsenal.hasPistola ? '<:pistola:1010973290128474112> *1x Pistola*' : '<:pistola:1010973290128474112> *0x Pistola*'}\n${user.arsenal.hasFuzil ? '<:fuzil:1010973288278806558> *1x Fuzil de Assalto*' : '<:fuzil:1010973288278806558> *0x Fuzil de Assalto*'}\n\n**Acessórios:**\n${user.arsenal.hasColete ? '<:coletek:1010977514304323605> *1x Colete a Prova de Balas*' : '<:coletek:1010977514304323605> *0x Colete a Prova de Balas*'}\n\n<:ak47:1012545445731520633> *${user.portearmas ? 'Você possui um Porte de Armas!' : 'Você ainda não possui o Porte de Armas, compre na Prefeitura!'}*`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1015096472599011418/1015097394259566622/inventario.png', { size: 1024 });

        message.reply({ embeds: [EMBED2] });
    }
};