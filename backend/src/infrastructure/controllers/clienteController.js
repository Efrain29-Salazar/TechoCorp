const { ClienteRegisterUseCase, ClienteLoginUseCase } = require('../../application/use-cases/clientes/ClienteAuthUseCase');
const ClientePrismaRepository = require('../database/postgresql/ClientePrismaRepository');
const prisma = require('../database/postgresql/prismaClient');
const { success, error } = require('../../shared/response');

const repo = new ClientePrismaRepository();

async function register(req, res) {
  try {
    const cliente = await new ClienteRegisterUseCase(repo).execute(req.body);
    success(res, { mensaje: 'Cuenta creada exitosamente', cliente }, 201);
  } catch (e) {
    error(res, e.message);
  }
}

async function login(req, res) {
  try {
    const result = await new ClienteLoginUseCase(repo).execute(req.body);
    success(res, result);
  } catch (e) {
    error(res, e.message, 401);
  }
}

async function perfil(req, res) {
  try {
    const cliente = await repo.findById(req.cliente.id);
    if (!cliente) return error(res, 'Cliente no encontrado', 404);
    const { password, ...pub } = cliente;
    success(res, pub);
  } catch (e) {
    error(res, e.message, 500);
  }
}

async function listarClientes(req, res) {
  try {
    const clientes = await repo.findAll();
    success(res, clientes);
  } catch (e) {
    error(res, e.message, 500);
  }
}

async function eliminarCliente(req, res) {
  try {
    await repo.delete(req.params.id);
    success(res, { mensaje: 'Cliente eliminado' });
  } catch (e) {
    error(res, e.message, 500);
  }
}

// Equipos en stock visibles para clientes
async function getStockPublico(req, res) {
  try {
    const equipos = await prisma.equipo.findMany({
      where: { enStock: true, estado: 'operativo' },
      select: {
        id: true, nombre: true, tipo: true, marca: true, modelo: true,
        precio: true, descripcionVenta: true, estado: true,
      },
      orderBy: { nombre: 'asc' },
    });
    success(res, equipos);
  } catch (e) {
    error(res, e.message, 500);
  }
}

// Catálogos PDF disponibles para clientes
async function getCatalogosPublicos(req, res) {
  try {
    const archivos = await prisma.stockArchivo.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, descripcion: true, creadoEn: true },
      orderBy: { creadoEn: 'desc' },
    });
    success(res, archivos);
  } catch (e) {
    error(res, e.message, 500);
  }
}

module.exports = { register, login, perfil, listarClientes, eliminarCliente, getStockPublico, getCatalogosPublicos };
