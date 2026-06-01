const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../../shared/authMiddleware');

router.post('/login',    ctrl.login);
router.post('/register', ctrl.register);
router.get('/usuarios',  authMiddleware, adminMiddleware, ctrl.listarUsuarios);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, ctrl.eliminarUsuario);

module.exports = router;
