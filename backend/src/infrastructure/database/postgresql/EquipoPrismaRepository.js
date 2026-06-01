const IEquipoRepository = require('../../../domain/repositories/IEquipoRepository');
const prisma = require('./prismaClient');

class EquipoPrismaRepository extends IEquipoRepository {
  async findAll() {
    return prisma.equipo.findMany({
      include: { mantenimientos: { orderBy: { fecha: 'desc' }, take: 3 } },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findById(id) {
    return prisma.equipo.findUnique({
      where: { id: Number(id) },
      include: { mantenimientos: { orderBy: { fecha: 'desc' } } },
    });
  }

  // MODIFICADO: Extrae y descarta mantenimientos para que Prisma no se rompa al crear
  async create(data) {
    const { mantenimientos, id, ...dataLimpia } = data;
    return prisma.equipo.create({ data: dataLimpia });
  }

  // MODIFICADO: Limpia mantenimientos e id del objeto data antes de actualizar
  async update(id, data) {
    const { mantenimientos, id: _, ...dataLimpia } = data;
    return prisma.equipo.update({ 
      where: { id: Number(id) }, 
      data: dataLimpia 
    });
  }

  async delete(id) {
    return prisma.equipo.delete({ where: { id: Number(id) } });
  }

  async findByEstado(estado) {
    return prisma.equipo.findMany({ where: { estado }, include: { mantenimientos: true } });
  }

  async countByEstado() {
    return prisma.equipo.groupBy({ by: ['estado'], _count: { id: true } });
  }

  async addMantenimiento(equipoId, data) {
    return prisma.mantenimiento.create({ data: { ...data, equipoId: Number(equipoId) } });
  }

  async getMantenimientos(equipoId) {
    return prisma.mantenimiento.findMany({
      where: { equipoId: Number(equipoId) },
      orderBy: { fecha: 'desc' },
    });
  }
}

module.exports = EquipoPrismaRepository;