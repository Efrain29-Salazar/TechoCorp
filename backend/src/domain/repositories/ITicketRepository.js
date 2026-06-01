class ITicketRepository {
  async findAll()           { throw new Error('Not implemented'); }
  async findById(id)        { throw new Error('Not implemented'); }
  async create(data)        { throw new Error('Not implemented'); }
  async update(id, data)    { throw new Error('Not implemented'); }
  async delete(id)          { throw new Error('Not implemented'); }
  async findByEstado(e)     { throw new Error('Not implemented'); }
  async findByPrioridad(p)  { throw new Error('Not implemented'); }
}

module.exports = ITicketRepository;
