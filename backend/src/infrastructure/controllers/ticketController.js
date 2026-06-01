const TicketUseCases = require('../../application/use-cases/tickets/TicketUseCases');
const TicketMongoRepository = require('../database/mongodb/TicketMongoRepository');
const { success, error } = require('../../shared/response');

const repo = new TicketMongoRepository();
const uc   = new TicketUseCases(repo);

async function listar(req, res) {
  try {
    const { estado, prioridad } = req.query;
    let data;
    if (estado)    data = await uc.ticketsPorEstado(estado);
    else if (prioridad) data = await uc.ticketsPorPrioridad(prioridad);
    else           data = await uc.listarTickets();
    success(res, data);
  } catch (e) { error(res, e.message, 500); }
}

async function obtener(req, res) {
  try {
    const t = await uc.obtenerTicket(req.params.id);
    if (!t) return error(res, 'Ticket no encontrado', 404);
    success(res, t);
  } catch (e) { error(res, e.message, 500); }
}

async function crear(req, res) {
  try {
    const t = await uc.crearTicket(req.body);
    success(res, t, 201);
  } catch (e) { error(res, e.message); }
}

async function actualizar(req, res) {
  try {
    const t = await uc.actualizarTicket(req.params.id, req.body);
    if (!t) return error(res, 'Ticket no encontrado', 404);
    success(res, t);
  } catch (e) { error(res, e.message); }
}

async function eliminar(req, res) {
  try {
    await uc.eliminarTicket(req.params.id);
    success(res, { mensaje: 'Ticket eliminado' });
  } catch (e) { error(res, e.message, 500); }
}

async function agregarNota(req, res) {
  try {
    const t = await uc.agregarNota(req.params.id, { ...req.body, autor: req.usuario?.nombre || 'Sistema' });
    success(res, t);
  } catch (e) { error(res, e.message); }
}

async function resolver(req, res) {
  try {
    const t = await uc.resolverTicket(req.params.id);
    success(res, t);
  } catch (e) { error(res, e.message); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, agregarNota, resolver };
