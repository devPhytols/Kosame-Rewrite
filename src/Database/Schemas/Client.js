const { Schema, model } = require('mongoose');

const clientSchema = new Schema({
    _id: { type: String },
    manutenção: { type: Boolean, default: false },
    reason: { type: String },
    lastElite: { type: Number },
    blacklist: { type: Array, default: [] },
    Sban: { type: Array, default: [] },
    seasonLock: { type: Boolean, default: false },
    seasonLockMsg: { type: String, default: 'O ranking de temporada está temporariamente indisponível.' },
    eventoPausado: { type: Boolean, default: false } // Pausa o evento de Natal
});

const clientModel = model('Client', clientSchema);

module.exports = { clientModel };
