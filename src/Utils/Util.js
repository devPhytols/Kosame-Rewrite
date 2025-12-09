const convertMoney = require('./plugins/convertMoney.js');
const renderEmoji = require('./plugins/renderEmoji.js');
const moneyAbbrev = require('./plugins/moneyAbbrev');

class Util {
    static toAbbrev(num) {
        return convertMoney(num);
    }

    static renderEmoji(ctx, msg, x, y) {
        return renderEmoji(ctx, msg, x, y);
    }

    static notAbbrev(num) {
        return moneyAbbrev(num);
    }

    counter(num = Number) {
        num = num.toString();

        let texto = '';
        const numbers = {
            0: '0️⃣',
            1: '1️⃣',
            2: '2️⃣',
            3: '3️⃣',
            4: '4️⃣',
            5: '5️⃣',
            6: '6️⃣',
            7: '7️⃣',
            8: '8️⃣',
            9: '9️⃣'
        };
        for (let i = 0; i < num.length; i++)
            texto += '' + numbers[parseInt(num[i])] + '';
        return texto;
    }
}

class Logger {
    static Colors = {
        RESET: '\x1b[0m',
        RED: '\x1b[31m',
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        BLUE: '\u001b[34m'
    };

    static get currentTime() {
        return `${Logger.Colors.BLUE}[${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}]${Logger.Colors.RESET}`;
    }

    error(content = String, path = String) {
        return console.error(`${Logger.currentTime} - ${Logger.Colors.RED}[${path ?? 'ERROR'}]${Logger.Colors.RESET} ${content}`);
    }

    info(content = String, path = String) {
        return console.log(`${Logger.currentTime} - ${Logger.Colors.GREEN}[${path ?? 'INFO'}]${Logger.Colors.RESET} ${content}`);
    }

    success(content = String, path = String) {
        return console.log(`${Logger.currentTime} - ${Logger.Colors.GREEN}[${path ?? 'SUCCESS'}]${Logger.Colors.RESET} ${content}`);
    }

    warn(content = String, path = String) {
        return console.warn(`${Logger.currentTime} - ${Logger.Colors.YELLOW}[${path ?? 'WARN'}]${Logger.Colors.RESET} ${content}`);
    }
}

module.exports = { Util, Logger };
