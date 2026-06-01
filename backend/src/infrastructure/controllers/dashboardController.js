const prisma = require('../database/postgresql/prismaClient');
const Ticket = require('../database/mongodb/models/Ticket');
const { success, error } = require('../../shared/response');

async function resumen(req, res) {
  try {
    const [totalEquipos, totalUsuarios, totalMantenimientos] = await Promise.all([
      prisma.equipo.count(),
      prisma.usuario.count(),
      prisma.mantenimiento.count(),
    ]);

    const equiposPorEstado = await prisma.equipo.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const [totalTickets, ticketsPorEstado, ticketsPorPrioridad] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$prioridad', total: { $sum: 1 } } }]),
    ]);

    const ultimosMantenimientos = await prisma.mantenimiento.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { equipo: { select: { nombre: true, tipo: true } } },
    });

    const ultimosTickets = await Ticket.find().sort({ fecha: -1 }).limit(5);

    success(res, {
      equipos: { total: totalEquipos, porEstado: equiposPorEstado },
      tickets: { total: totalTickets, porEstado: ticketsPorEstado, porPrioridad: ticketsPorPrioridad },
      usuarios: { total: totalUsuarios },
      mantenimientos: { total: totalMantenimientos, ultimos: ultimosMantenimientos },
      ultimosTickets,
    });
  } catch (e) {
    error(res, e.message, 500);
  }
}

module.exports = { resumen };
