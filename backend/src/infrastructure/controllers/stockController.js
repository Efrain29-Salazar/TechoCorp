const path = require('path');
const fs   = require('fs');
const prisma = require('../database/postgresql/prismaClient');
const { success, error } = require('../../shared/response');

const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');

// Asegurar que el directorio de uploads exista
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/stock/upload — sube un PDF de catálogo
async function uploadCatalogo(req, res) {
  try {
    if (!req.file) return error(res, 'No se recibió ningún archivo PDF');

    const { nombre, descripcion } = req.body;
    if (!nombre) return error(res, 'El nombre del catálogo es requerido');

    const archivo = await prisma.stockArchivo.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        rutaArchivo: req.file.filename,
        subidoPor: req.usuario?.nombre || 'Admin',
      },
    });

    success(res, { mensaje: 'Catálogo subido exitosamente', archivo }, 201);
  } catch (e) {
    error(res, e.message, 500);
  }
}

// GET /api/stock/catalogos — lista todos los catálogos (admin)
async function listarCatalogos(req, res) {
  try {
    const catalogos = await prisma.stockArchivo.findMany({
      orderBy: { creadoEn: 'desc' },
    });
    success(res, catalogos);
  } catch (e) {
    error(res, e.message, 500);
  }
}

// GET /api/stock/catalogos/:id/download — descarga un PDF
async function descargarCatalogo(req, res) {
  try {
    const archivo = await prisma.stockArchivo.findUnique({ where: { id: Number(req.params.id) } });
    if (!archivo) return error(res, 'Catálogo no encontrado', 404);

    const filePath = path.join(UPLOADS_DIR, archivo.rutaArchivo);
    if (!fs.existsSync(filePath)) return error(res, 'Archivo no disponible', 404);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre}.pdf"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    error(res, e.message, 500);
  }
}

// DELETE /api/stock/catalogos/:id
async function eliminarCatalogo(req, res) {
  try {
    const archivo = await prisma.stockArchivo.findUnique({ where: { id: Number(req.params.id) } });
    if (!archivo) return error(res, 'No encontrado', 404);

    const filePath = path.join(UPLOADS_DIR, archivo.rutaArchivo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.stockArchivo.delete({ where: { id: Number(req.params.id) } });
    success(res, { mensaje: 'Catálogo eliminado' });
  } catch (e) {
    error(res, e.message, 500);
  }
}

// GET /api/stock/equipos — equipos en stock (admin)
async function listarEquiposStock(req, res) {
  try {
    const equipos = await prisma.equipo.findMany({
      where: { enStock: true },
      orderBy: { nombre: 'asc' },
    });
    success(res, equipos);
  } catch (e) {
    error(res, e.message, 500);
  }
}

// PATCH /api/stock/equipos/:id — marcar/desmarcar como stock
async function toggleStock(req, res) {
  try {
    const { enStock, precio, descripcionVenta } = req.body;
    const equipo = await prisma.equipo.update({
      where: { id: Number(req.params.id) },
      data: {
        enStock: enStock !== undefined ? enStock : undefined,
        precio: precio !== undefined ? parseFloat(precio) : undefined,
        descripcionVenta: descripcionVenta !== undefined ? descripcionVenta : undefined,
      },
    });
    success(res, equipo);
  } catch (e) {
    error(res, e.message, 500);
  }
}

module.exports = { uploadCatalogo, listarCatalogos, descargarCatalogo, eliminarCatalogo, listarEquiposStock, toggleStock };
