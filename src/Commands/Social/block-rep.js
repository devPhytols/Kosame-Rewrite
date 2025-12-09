const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');

module.exports = class BlockrepCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'blockrep';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Bloqueie o recebimento de reputações.';
        this.aliases = ['brep','blockrep'];
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
    async commandExecute({ message, args }) {

        const Autor = await this.client.database.users.findOne({ idU: message.author.id });

        if (Autor.reps.block) {
            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { 'reps.block': false } }
            );
    
            message.reply({ content: `${message.author}, agora você pode receber reputações.` });
        } else {
            await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { 'reps.block': true } }
            );
    
            message.reply({ content: `${message.author}, você não receberá mais reputações, utilize novamente para habilitar.` });
        }
    }
};