const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ticketController');
const { authMiddleware } = require('../../shared/authMiddleware');

router.use(authMiddleware);

router.get('/',                ctrl.listar);
router.get('/:id',             ctrl.obtener);
router.post('/',               ctrl.crear);
router.put('/:id',             ctrl.actualizar);
router.delete('/:id',          ctrl.eliminar);
router.post('/:id/notas',      ctrl.agregarNota);
router.patch('/:id/resolver',  ctrl.resolver);

module.exports = router;
