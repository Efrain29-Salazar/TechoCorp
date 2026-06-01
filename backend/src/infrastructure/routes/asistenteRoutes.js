const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/asistenteController');

router.post('/mensaje',              ctrl.enviarMensaje);
router.get('/historial/:sesionId',   ctrl.obtenerHistorial);

module.exports = router;
