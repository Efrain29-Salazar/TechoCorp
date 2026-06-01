class TicketUseCases {
  constructor(ticketRepository) {
    this.repo = ticketRepository;
  }

  async listarTickets()             { return this.repo.findAll(); }
  async obtenerTicket(id)           { return this.repo.findById(id); }
  async crearTicket(data)           { return this.repo.create(data); }
  async actualizarTicket(id, data)  { return this.repo.update(id, data); }
  async eliminarTicket(id)          { return this.repo.delete(id); }
  async ticketsPorEstado(estado)    { return this.repo.findByEstado(estado); }
  async ticketsPorPrioridad(p)      { return this.repo.findByPrioridad(p); }
  async estadisticasEstado()        { return this.repo.countByEstado(); }
  async estadisticasPrioridad()     { return this.repo.countByPrioridad(); }
  async agregarNota(id, nota)       { return this.repo.addNota(id, nota); }

  async resolverTicket(id) {
    return this.repo.update(id, { estado: 'resuelto', resueltoEn: new Date() });
  }
}

module.exports = TicketUseCases;
