const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  nivel:    { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  accion:   { type: String, required: true },
  detalle:  { type: String },
  usuario:  { type: String },
  ip:       { type: String },
  fecha:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', LogSchema);
