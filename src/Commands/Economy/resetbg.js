const { ApplicationCommandType } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const ms = require('ms');
const moment = require('moment');
require('moment-duration-format');

module.exports = class ResetbgCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'resetbg';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Redefina o seu background de perfil.';
        this.aliases = ['buybg']
        this.config = {
            registerSlash: false
        };
        this.options = [];
    }

    /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
    async commandExecute({ message, args }) {

        if(message.author.bot) return;

        //=======
        const timeout = 600000;
        //=======
        const user = await this.client.database.users.findOne({ idU: message.author.id });
        //=======

        if (!args[0]) {
            return message.reply({ content: `Você deve comprar um background em k!shop!` });
        }

        if (args[0].toLowerCase() == 'reset') {
            const time = user.profile.time;

            if (time !== null && timeout - (Date.now() - time) > 0) {
                const times = ms(timeout - (Date.now() - time));
                message.reply(`${message.author}, você ainda não pode redefinir seu background novamente, tente em algumas horas!`);
            } else {
                await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                {
                    $set: {
                    'profile.imagembg': `./src/Assets/img/default/profiles/bgdefault.jpg`,
                    }
                }
                );
                await this.client.database.users.findOneAndUpdate(
                    { idU: message.author.id },
                    { $set: { 'profile.time': Date.now() } }
                );
                message.reply(`${message.author}, Desculpe pela incoveniência, eu redefini seu background para o padrão!`);
            }
            return null;
        }
    }
};
