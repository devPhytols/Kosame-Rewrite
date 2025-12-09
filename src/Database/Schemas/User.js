const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    idU: { type: String },
    idS: { type: String },
    coins: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    lastBet: { type: Number, default: 0 },
    semanal: { type: Number, default: 0 },
    mensal: { type: Number, default: 0 },
    recompensa: { type: Number, default: 0 },
    vote: { type: Number, default: 0 },
    pay: { type: Number, default: 0 },
    double: { type: Number, default: 0 },
    forca: { type: Number, default: 0 },
    rinha: { type: Number, default: 0 },
    jokenpo: { type: Number, default: 0 },
    multas: { type: Number, default: 0 },
    portearmas: { type: Boolean, default: false },
    coinbet: { type: Number, default: 0 },
    blockpay: { type: Boolean, default: false },
    blockbet: { type: Boolean, default: false },
    jogodavelha: { type: Boolean, default: false },
    gfcooldown: { type: Number, default: 0 },
    bfcooldown: { type: Number, default: 0 },
    kisscoldown: { type: Number, default: 0 },
    hugcoldown: { type: Number, default: 0 },
    slapcoldown: { type: Number, default: 0 },
    betdown: { type: Number, default: 0 },
    betdown2: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    globalstats: {
        totalBets: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        winRatio: { type: Number, default: 0 },
        score: { type: Number, default: 0 }
    },
    userinfo: {
        nicknames: { type: Boolean, default: false },
        avatar: { type: Boolean, default: false },
        allPriv: { type: Boolean, default: false }
    },
    evento: {
        actualCartela: {
            type: Number,
            default: 0
        },
        actualLevel: {
            type: Number,
            default: 0
        },
        moeda1: {
            type: Number,
            default: 0
        },
        moeda2: {
            type: Number,
            default: 0
        },
        moeda3: {
            type: Number,
            default: 0
        },
        trocas: {
            type: Number,
            default: 0
        },
        cooldown: {
            type: Number,
            default: 0
        }
    },
    eventoext: {
        cartela1: {
            has: { type: Boolean, default: false },
            hasFull: { type: Boolean, default: false },
            counter: { type: Number, default: 0 }
        },
        cartela2: {
            has: { type: Boolean, default: false },
            hasFull: { type: Boolean, default: false },
            counter: { type: Number, default: 0 }
        },
        cartela3: {
            has: { type: Boolean, default: false },
            hasFull: { type: Boolean, default: false },
            counter: { type: Number, default: 0 }
        }
    },
    arsenal: {
        hasColete: { type: Boolean, default: false },
        hasFaca: { type: Boolean, default: false },
        hasFuzil: { type: Boolean, default: false },
        hasPistola: { type: Boolean, default: false }
    },
    Exp: {
        xp: { type: Number, default: 1 },
        level: { type: Number, default: 1 },
        nextLevel: { type: Number, default: 100 },
        id: { type: String, default: 'null' },
        user: { type: String, default: 'null' },
        lastXpTimestamp: { type: Number, default: 0 }
    },
    cooldowns: {
        lastXpTimestamp: { type: Number, default: 0 }
    },
    work: {
        exp: { type: Number, default: 1 },
        level: { type: Number, default: 1 },
        nextLevel: { type: Number, default: 250 },
        cooldown: { type: Number, default: 0 },
        coins: { type: Number, default: 200 },
        name: { type: String, default: 'null' }
    },
    vip: {
        hasVip: { type: Boolean, default: false },
        date: { type: Number, default: 0 },
        bLevel: { type: Number, default: 0 },
        early: { type: Boolean, default: false },
        nextupgrade: { type: Boolean, default: true },
        upgrade: {
            type: Schema.Types.Number,
            default: 1
        },
        cooldown: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    about: { type: String, default: 'null' },
    reps: {
        size: { type: Number, default: 0 },
        history: [
            {
                sender: { type: String, required: true },
                receiver: { type: String, required: true },
                date: { type: Date, default: Date.now }
            }
        ],
        time: { type: Number, default: 0 },
        block: { type: Boolean, default: false }
    },
    backgrounds: { type: [String], default: [] },
    molduras: { type: [String], default: [] },
    haslayouts: { type: [String], default: [] },
    marry: {
        time: { type: Number, default: 0 },
        user: { type: String, default: 'null' },
        has: { type: Boolean, default: false }
    },
    bestfriend: {
        time: { type: Number, default: 0 },
        user: { type: String, default: 'null' },
        has: { type: Boolean, default: false }
    },
    steal: {
        time: { type: Number, default: 0 },
        protection: { type: Number, default: 0 }
    },
    crime: {
        id: { type: String, default: 'null' },
        user: { type: String, default: 'null' },
        time: { type: Number, default: 0 },
        valorMultas: { type: Number, default: 0 },
        sucessos: { type: Number, default: 0 },
        prisoes: { type: Number, default: 0 }
    },
    staff: {
        status: { type: Boolean, default: false },
        dev: { type: Boolean, default: false },
        mod: { type: Boolean, default: false },
        owner: { type: Boolean, default: false }
    },
    bans: {
        imagembg: { type: String, default: '' },
        imgkick: { type: String, default: '' },
        banneds: { type: Number, default: 0 }
    },
    profile: {
        coinsbg: { type: String, default: './src/Assets/img/default/general/coinsdefault.png' },
        coinsgif: { type: String, default: 'null' },
        imagembg: { type: String, default: './src/Assets/img/default/profiles/bgdefault.jpg' },
        layout: { type: String, default: './src/Assets/img/default/profiles/jTD2ju8.png' },
        moldura: { type: String, default: 'null' },
        customAv: { type: String, default: 'null' },
        textcolor: { type: String, default: '#000000' },
        slot1: { type: String, default: 'null' },
        slot2: { type: String, default: 'null' },
        slot3: { type: String, default: 'null' },
        time: { type: Number, default: 0 },
        cooldown: { type: Number, default: 0 }
    },
    insignias: {
        type: [String], // Armazena os caminhos das imagens das insígnias equipadas
        default: [] // Inicializa vazio
    },    
    equippedInsignias: { type: [String], default: [] }, // Códigos das insígnias equipadas
    layouts: {
        white: {
            equipped: { type: Boolean, default: true },
            has: { type: Boolean, default: true }
        },
        black: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        amoled: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        wamoled: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        purple: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        cyan: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        rose: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        blueriver: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        red: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        yellow: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        swampgreen: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        pink: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        darkred: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        forestgreen: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        blueocean: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        gray: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        },
        gamoled: {
            equipped: { type: Boolean, default: false },
            has: { type: Boolean, default: false }
        }
    },
    AFK: {
        away: {
            type: Schema.Types.Boolean,
            default: false
        },
        lastNickname: {
            type: Schema.Types.String,
            default: null
        },
        reason: {
            type: Schema.Types.String,
            default: null
        },
        servers: {
            type: Schema.Types.Array,
            default: []
        }
    },
    reminder: {
        myReminders: {
            type: Schema.Types.Array,
            default: []
        },
        isDm: {
            type: Schema.Types.Boolean,
            default: false
        }
    },
    transfers: [
        {
            sender: { type: String, required: true },
            receiver: { type: String, required: true },
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
});

const userModel = model('Users', userSchema);

module.exports = { userModel };
