const IUsuarioRepository = require('../../../domain/repositories/IUsuarioRepository');
const prisma = require('./prismaClient');

class UsuarioPrismaRepository extends IUsuarioRepository {
  async findByCorreo(correo) {
    return prisma.usuario.findUnique({ where: { correo } });
  }

  async findById(id) {
    return prisma.usuario.findUnique({ where: { id: Number(id) } });
  }

  async findAll() {
    return prisma.usuario.findMany({
      select: { id: true, nombre: true, correo: true, rol: true, activo: true, creadoEn: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async create(data) {
    return prisma.usuario.create({ data });
  }

  async update(id, data) {
    return prisma.usuario.update({ where: { id: Number(id) }, data });
  }

  async delete(id) {
    return prisma.usuario.delete({ where: { id: Number(id) } });
  }
}

module.exports = UsuarioPrismaRepository;
