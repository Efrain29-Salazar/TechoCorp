const IClienteRepository = require('../../../domain/repositories/IClienteRepository');
const prisma = require('./prismaClient');

class ClientePrismaRepository extends IClienteRepository {
  async findByCorreo(correo) {
    return prisma.cliente.findUnique({ where: { correo } });
  }

  async findById(id) {
    return prisma.cliente.findUnique({ where: { id: Number(id) } });
  }

  async findAll() {
    return prisma.cliente.findMany({
      select: { id: true, nombre: true, correo: true, telefono: true, empresa: true, activo: true, creadoEn: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async create(data) {
    return prisma.cliente.create({ data });
  }

  async update(id, data) {
    return prisma.cliente.update({ where: { id: Number(id) }, data });
  }

  async delete(id) {
    return prisma.cliente.delete({ where: { id: Number(id) } });
  }
}

module.exports = ClientePrismaRepository;
