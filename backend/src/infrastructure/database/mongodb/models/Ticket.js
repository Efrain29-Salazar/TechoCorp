const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  titulo:      { type: String, required: true },
  descripcion: { type: String, required: true },
  prioridad:   { type: String, enum: ['baja', 'media', 'alta', 'critica'], default: 'media' },
  estado:      { type: String, enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'], default: 'abierto' },
  categoria:   { type: String, default: 'general' },
  equipoId:    { type: Number, default: null },
  asignadoA:   { type: String, default: null },
  reportadoPor:{ type: String, default: 'Sistema' },
  notas:       [{ texto: String, fecha: { type: Date, default: Date.now }, autor: String }],
  fecha:       { type: Date, default: Date.now },
  resueltoEn:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
