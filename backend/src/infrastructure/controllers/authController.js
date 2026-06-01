const LoginUseCase    = require('../../application/use-cases/auth/LoginUseCase');
const RegisterUseCase = require('../../application/use-cases/auth/RegisterUseCase');
const UsuarioPrismaRepository = require('../database/postgresql/UsuarioPrismaRepository');
const { success, error } = require('../../shared/response');

const repo = new UsuarioPrismaRepository();

async function login(req, res) {
  try {
    const result = await new LoginUseCase(repo).execute(req.body);
    success(res, result);
  } catch (e) {
    error(res, e.message, 401);
  }
}

async function register(req, res) {
  try {
    const result = await new RegisterUseCase(repo).execute(req.body);
    success(res, result, 201);
  } catch (e) {
    error(res, e.message);
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await repo.findAll();
    success(res, usuarios);
  } catch (e) {
    error(res, e.message, 500);
  }
}

async function eliminarUsuario(req, res) {
  try {
    await repo.delete(req.params.id);
    success(res, { mensaje: 'Usuario eliminado' });
  } catch (e) {
    error(res, e.message, 500);
  }
}

module.exports = { login, register, listarUsuarios, eliminarUsuario };
