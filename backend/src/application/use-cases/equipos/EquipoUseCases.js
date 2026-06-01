class EquipoUseCases {
  constructor(equipoRepository) {
    this.repo = equipoRepository;
  }

  async listarEquipos()           { return this.repo.findAll(); }
  async obtenerEquipo(id)         { return this.repo.findById(id); }
  async crearEquipo(data)         { return this.repo.create(data); }
  async actualizarEquipo(id, d)   { return this.repo.update(id, d); }
  async eliminarEquipo(id)        { return this.repo.delete(id); }
  async listarPorEstado(estado)   { return this.repo.findByEstado(estado); }
  async estadisticasEstado()      { return this.repo.countByEstado(); }
  async agregarMantenimiento(id, d) { return this.repo.addMantenimiento(id, d); }
  async obtenerMantenimientos(id) { return this.repo.getMantenimientos(id); }
}

module.exports = EquipoUseCases;
