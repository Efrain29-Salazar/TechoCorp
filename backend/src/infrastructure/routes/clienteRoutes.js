const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clienteController');
const { clienteMiddleware } = require('../../shared/clienteMiddleware');
const { authMiddleware, adminMiddleware } = require('../../shared/authMiddleware');

// Rutas públicas (sin auth)
router.post('/register',  ctrl.register);
router.post('/login',     ctrl.login);

// Rutas para clientes autenticados
router.get('/perfil',     clienteMiddleware, ctrl.perfil);
router.get('/stock',      clienteMiddleware, ctrl.getStockPublico);
router.get('/catalogos',  clienteMiddleware, ctrl.getCatalogosPublicos);

// Rutas para admins (gestión de clientes)
router.get('/admin/lista',     authMiddleware, adminMiddleware, ctrl.listarClientes);
router.delete('/admin/:id',    authMiddleware, adminMiddleware, ctrl.eliminarCliente);

module.exports = router;
