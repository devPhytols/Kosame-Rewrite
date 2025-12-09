const { ApplicationCommandType, ApplicationCommandOptionType, User } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { ClientEmbed } = require('../../Structures/ClientEmbed');
const { Util } = require('../../Utils/Util');

module.exports = class RankrepsCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'rankreps';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Obtenha informações do Leaderboard de Reputações.';
        this.aliases = ['topreps', 'reps'];
        this.config = {
            registerSlash: true
        };
        this.options = [];
    }

    /** 
 * @param {Client} client 
 * @param {Message} message 
 * @param {User[]} args 
 */
    async commandExecute({ message, args }) {

        const REPS = await require("mongoose").connection.collection("users").find({ "reps.size": { $gt: 2000 } }).toArray();
        const reps = Object.entries(REPS).map(([, x]) => x.idU).sort((x, f) => x.size - f.size)
        const members = [];

        await this.PUSH(reps, members);

        const repsMap = members.map((x) => x).sort((x, f) => f.reps - x.reps).slice(0, 10);

        const TOP = new ClientEmbed()
            .setTitle(`${this.client.user.username} — Ranking Global de Reps`)
            .setDescription(repsMap.map((x, f) =>`\`${f + 1}º\` **${x.user.tag}** - ( ${Util.toAbbrev(x.reps)} Reps )\n\`ID:\` \`${x.user.id}\``).join("\n\n"))
            .setThumbnail('https://cdn.discordapp.com/attachments/1015095138684522636/1015096060936474655/reps.png')
            .setFooter({ text: `Não está no rank? Continue coletando reputações!`, iconURL: message.author.displayAvatarURL({ size: 2048 })});
        message.reply({embeds: [TOP]});
    }

    async PUSH(reps, members) {
        for (const member of reps) {
            const doc = await this.client.database.users.findOne({ idU: member });
    
            members.push({
                user: await this.client.users.fetch(member).then((user) => {
                return user;
                }),
                reps: doc.reps.size,
            });
        }
    }
};