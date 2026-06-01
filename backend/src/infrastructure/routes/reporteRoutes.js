const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reporteController');
const { authMiddleware } = require('../../shared/authMiddleware');

router.use(authMiddleware);
router.get('/pdf', ctrl.generarPDF);

module.exports = router;
