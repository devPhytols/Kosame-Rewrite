const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    idS: { type: String },
    prefix: { type: String, default: 'k!' },
    levelwarn: { type: Boolean, default: true },
    premium: {
        hasPremium: { type: Boolean, default: false },
        date: { type: Number, default: 0 }
    },
    welcome: {
        status: { type: Boolean, default: false },
        background: { type: String, default: 'https://wallpapercave.com/wp/wp7986080.jpg' },
        colortext: { type: String, default: '#FFFFFF' },
        channel: { type: String, default: 'null' },
        msg: { type: String, default: 'null' }
    },
    byebye: {
        status: { type: Boolean, default: false },
        channel: { type: String, default: 'null' },
        msg: { type: String, default: 'null' }
    },
    ladysys: {
        ladyRole: { type: String, default: null }, // ID do cargo de Primeira Dama
        allowedRoles: { type: [String], default: [] }, // IDs dos cargos permitidos
        limits: { type: Map, of: Number, default: {} } // Limites de Primeiras Damas por cargo
    },
    logs: {
        logsMsgEdit: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsMsgDelete: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsBan: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsUnban: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsKick: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsMute: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsUnmute: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsJoinCall: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsLeaveCall: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        },
        logsSwitchCall: {
            channel: { type: String, default: 'null' },
            status: { type: Boolean, default: false }
        }
    },
    antifake: {
        dias: { type: Number, default: 30 },
        logsch: { type: String, default: 'null' },
        status: { type: Boolean, default: false }
    },
    autorole: {
        status: { type: Boolean, default: false },
        roles: { type: Array, default: [] }
    },
    cmdblock: {
        status: { type: Boolean, default: false },
        channels: { type: Array, default: [] },
        cmds: { type: Array, default: [] },
        msg: { type: String, default: 'Comandos bloqueados nesse canal!' }
    },
    antinvite: {
        msg: { type: String, default: 'null' },
        status: { type: Boolean, default: false },
        channels: { type: Array, default: [] },
        roles: { type: Array, default: [] }
    },
    autobadge: {
        status: { type: Boolean, default: false },
        earlySupporter: { 
            role: { type: String, default: 'null' }
        },
        verifiedDeveloper: { 
            role: { type: String, default: 'null' }
        },
        hypeSquad: { 
            role: { type: String, default: 'null' }
        },
        certifiedModerator: {
            role: { type: String, default: 'null' }
        },
        partner: {
            role: { type: String, default: 'null' }
        }
    },
    antiraid: {
        status: { type: Boolean, default: false }
    }
});

const guildModel = model('Guilds', guildSchema);

module.exports = { guildModel };
