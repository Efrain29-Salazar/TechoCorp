const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const ctrl     = require('../controllers/stockController');
const { authMiddleware, adminMiddleware } = require('../../shared/authMiddleware');

const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
  },
});

// CLIENTES
router.get(
  '/catalogos',
  authMiddleware,
  ctrl.listarCatalogos
);

router.get(
  '/catalogos/:id/download',
  authMiddleware,
  ctrl.descargarCatalogo
);

router.get(
  '/equipos',
  authMiddleware,
  ctrl.listarEquiposStock
);

// ADMIN
router.post(
  '/upload',
  authMiddleware,
  adminMiddleware,
  upload.single('catalogo'),
  ctrl.uploadCatalogo
);

router.delete(
  '/catalogos/:id',
  authMiddleware,
  adminMiddleware,
  ctrl.eliminarCatalogo
);

router.patch(
  '/equipos/:id',
  authMiddleware,
  adminMiddleware,
  ctrl.toggleStock
);

module.exports = router;
