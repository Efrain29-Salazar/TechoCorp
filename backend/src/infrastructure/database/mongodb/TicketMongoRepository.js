const ITicketRepository = require('../../../domain/repositories/ITicketRepository');
const Ticket = require('./models/Ticket');

class TicketMongoRepository extends ITicketRepository {
  async findAll() {
    return Ticket.find().sort({ fecha: -1 });
  }

  async findById(id) {
    return Ticket.findById(id);
  }

  async create(data) {
    const t = new Ticket(data);
    return t.save();
  }

  async update(id, data) {
    return Ticket.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Ticket.findByIdAndDelete(id);
  }

  async findByEstado(estado) {
    return Ticket.find({ estado }).sort({ fecha: -1 });
  }

  async findByPrioridad(prioridad) {
    return Ticket.find({ prioridad }).sort({ fecha: -1 });
  }

  async countByEstado() {
    return Ticket.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]);
  }

  async countByPrioridad() {
    return Ticket.aggregate([{ $group: { _id: '$prioridad', total: { $sum: 1 } } }]);
  }

  async addNota(id, nota) {
    return Ticket.findByIdAndUpdate(id, { $push: { notas: nota } }, { new: true });
  }
}

module.exports = TicketMongoRepository;
