const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');
const { authMiddleware } = require('../../shared/authMiddleware');

router.use(authMiddleware);
router.get('/resumen', ctrl.resumen);

module.exports = router;
