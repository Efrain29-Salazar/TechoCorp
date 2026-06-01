const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  rol:      { type: String, enum: ['usuario', 'asistente'], required: true },
  contenido:{ type: String, required: true },
  fecha:    { type: Date, default: Date.now },
});

const ChatAsitenteSchema = new mongoose.Schema({
  sesionId: { type: String, required: true, unique: true },
  usuario:  { type: String, default: 'anon' },
  mensajes: [MensajeSchema],
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatAsistente', ChatAsitenteSchema);
