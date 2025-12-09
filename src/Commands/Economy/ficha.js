const { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType, WebhookClient } = require('discord.js');
const { Command } = require('../../Structures/Structures');
const { Util } = require('../../Utils/Util');
const { loadImage, registerFont, createCanvas } = require('canvas');
registerFont('src/Assets/fonts/Segoe Print.ttf', { family: 'Segoe Print' });
registerFont('src/Assets/fonts/Segoe UI.ttf', { family: 'Segoe UI' });
registerFont('src/Assets/fonts/Segoe UI Black.ttf', { family: 'Segoe UI Black' });

module.exports = class FichaCommand extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = 'ficha';
        this.type = ApplicationCommandType.ChatInput;
        this.description = 'Mostra a ficha criminal de um usuário.';
        this.cooldown = 30;
        this.config = {
            registerSlash: true
        };
        this.options = [
            {
                name: 'user',
                description: 'O usuário que você deseja ver a ficha.',
                type: ApplicationCommandOptionType.User
            }
        ];
    }

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {User[]} args
     */
    async commandExecute({ message, args }) {

        const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions?.users?.first() ||
      message.author;

        if(USER.bot)
            return;

        const user = await this.client.database.users.findOne({ idU: USER.id });
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        if (!user)
            return message.reply(
                `${message.author}, este usuário não está registrado em minha database.`
            );

        // PUXANDO INFOS DAS MULTAS
        const valorMulta = user.crime.valorMultas;
        let background = await loadImage('./src/Assets/img/jpeg/fichakosame.png');
        // DESENHANDO BACKGROUND
        if (USER.id === '236651138747727872') {
            background = await loadImage('https://i.imgur.com/AbKiDLR.png');
        }

        ctx.drawImage(background, 0, 0, 800, 400);

        // TEXTOS
        ctx.textAlign = 'center';
        ctx.font = '23px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#141414';
        ctx.fillText(`${USER.tag.toUpperCase()}`, 399, 363);

        // USER.id === '' ? user.profile.textcolor : '#2f2f2f'
        // CPF
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`${USER.id.toUpperCase()}`, 144, 366);

        // NIVEL CIDADANIA
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`${user.Exp.level > 5 ? 'Cidadão Kosame'.toUpperCase() : 'Imigrante'.toUpperCase()}`, 144, 304);

        // MULTAS PREFEITURA
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`Dívida: ${Util.toAbbrev(Math.floor(valorMulta))}`.toUpperCase(), 144, 242);

        // TOTAL MULTAS
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`Multas: ${Util.toAbbrev(Math.floor(user.multas))}`.toUpperCase(), 650, 242);

        // TOTAL PRISOES
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`Prisões: ${Util.toAbbrev(Math.floor(user.crime.prisoes))}`.toUpperCase(), 652, 304);

        // TOTAL CRIMES SUCESSOS
        ctx.textAlign = 'center';
        ctx.font = '18px "Segoe UI Black"';
        ctx.fillStyle = USER.id === '236651138747727872' ? user.profile.textcolor : '#2f2f2f';
        ctx.fillText(`Crimes: ${Util.toAbbrev(Math.floor(user.crime.sucessos))}`.toUpperCase(), 652, 365);


        // DESENHANDO O ARCO
        ctx.arc(400, 213, 106, 0, Math.PI * 2, true);
        ctx.lineWidth = 4;
        ctx.strokeStyle = USER.id === '236651138747727872' ? '#0b0b0b' : '#d0d0d0'; // 0b0b0b / d0d0d0
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        // DESENHANDO O AVATAR - POSIÇÃO
        const avatar = await loadImage(USER.displayAvatarURL({ extension: 'png', size: 1024 }));
        ctx.drawImage(avatar, 290, 100, 220, 220);

        const attach = new AttachmentBuilder(canvas.toBuffer('image/png', { quality: 1.0 }), { name: `KsFicha_${USER.tag}_.png` });

        message.reply({ files: [attach] });

    }
};
