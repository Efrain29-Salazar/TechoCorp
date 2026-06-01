const EquipoUseCases = require('../../application/use-cases/equipos/EquipoUseCases');
const EquipoPrismaRepository = require('../database/postgresql/EquipoPrismaRepository');
const { success, error } = require('../../shared/response');

const repo = new EquipoPrismaRepository();
const uc   = new EquipoUseCases(repo);

async function listar(req, res) {
  try {
    const { estado } = req.query;
    const data = estado ? await uc.listarPorEstado(estado) : await uc.listarEquipos();
    success(res, data);
  } catch (e) { error(res, e.message, 500); }
}

async function obtener(req, res) {
  try {
    const e = await uc.obtenerEquipo(req.params.id);
    if (!e) return error(res, 'Equipo no encontrado', 404);
    success(res, e);
  } catch (e) { error(res, e.message, 500); }
}

async function crear(req, res) {
  try {
    const e = await uc.crearEquipo(req.body);
    success(res, e, 201);
  } catch (e) { error(res, e.message); }
}

async function actualizar(req, res) {
  try {
    const e = await uc.actualizarEquipo(req.params.id, req.body);
    success(res, e);
  } catch (e) { error(res, e.message); }
}

async function eliminar(req, res) {
  try {
    await uc.eliminarEquipo(req.params.id);
    success(res, { mensaje: 'Equipo eliminado' });
  } catch (e) { error(res, e.message, 500); }
}

async function agregarMantenimiento(req, res) {
  try {
    const m = await uc.agregarMantenimiento(req.params.id, req.body);
    success(res, m, 201);
  } catch (e) { error(res, e.message); }
}

async function obtenerMantenimientos(req, res) {
  try {
    const m = await uc.obtenerMantenimientos(req.params.id);
    success(res, m);
  } catch (e) { error(res, e.message, 500); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, agregarMantenimiento, obtenerMantenimientos };
