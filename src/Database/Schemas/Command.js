const { Schema, model } = require('mongoose');

const commandSchema = new Schema({
    _id: { type: String },
    usages: { type: Number, default: 0 },
    manutenção: { type: Boolean, default: false }
});

const commandModel = model('Commands', commandSchema);

module.exports = { commandModel };
