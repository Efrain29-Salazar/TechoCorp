const PDFDocument = require('pdfkit');
const prisma = require('../database/postgresql/prismaClient');
const Ticket = require('../database/mongodb/models/Ticket');
const { success, error } = require('../../shared/response');

async function generarPDF(req, res) {
  try {
    const [equipos, mantenimientos, totalTickets, ticketsPorEstado] = await Promise.all([
      prisma.equipo.findMany({ include: { mantenimientos: { take: 2, orderBy: { fecha: 'desc' } } } }),
      prisma.mantenimiento.count(),
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]),
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-techcorp.pdf"');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 120).fill('#1a237e');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(26)
       .text('TechCorp PRO', 50, 35, { align: 'center' });
    doc.fontSize(13).font('Helvetica')
       .text('Reporte de Gestión de Equipos y Soporte Técnico', 50, 68, { align: 'center' });
    doc.fontSize(10)
       .text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 92, { align: 'center' });

    doc.fillColor('#1a1a1a').moveDown(5);

    // Stats
    sectionTitle(doc, 'Resumen Ejecutivo');
    const rowY = doc.y + 8;
    statBox(doc, 50,  rowY, 115, 60, 'Total Equipos',       `${equipos.length}`,     '#e8eaf6', '#1a237e');
    statBox(doc, 175, rowY, 115, 60, 'Mantenimientos',      `${mantenimientos}`,      '#e8f5e9', '#1b5e20');
    statBox(doc, 300, rowY, 115, 60, 'Tickets Totales',     `${totalTickets}`,        '#fff3e0', '#e65100');
    statBox(doc, 425, rowY, 115, 60, 'Tickets Resueltos',   `${ticketsPorEstado.find(t => t._id === 'resuelto')?.total || 0}`, '#f3e5f5', '#4a148c');
    doc.moveDown(5.5);

    // Equipos table
    sectionTitle(doc, 'Inventario de Equipos');
    tableHeader(doc, doc.y + 6, ['Equipo', 'Tipo', 'Marca', 'Estado', 'Ubicacion']);
    equipos.forEach((e, i) => {
      tableRow(doc, doc.y + (i === 0 ? 28 : 22 * (i) + 28), [e.nombre, e.tipo, e.marca, e.estado, e.ubicacion || '-'], i % 2 === 0);
    });

    // Tickets
    if (doc.y > 620) doc.addPage();
    sectionTitle(doc, 'Resumen de Tickets por Estado');
    ticketsPorEstado.forEach((t, i) => {
      const r = doc.y + (i === 0 ? 6 : 4);
      tableRow(doc, r, [t._id || 'Sin estado', `${t.total} tickets`, '-', '-', '-'], i % 2 === 0);
    });

    // Footer
    for (let i = 0; i < doc.bufferedPageRange().count; i++) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill('#1a237e');
      doc.fillColor('#fff').fontSize(9).font('Helvetica')
         .text('TechCorp PRO — Sistema de Gestión de Equipos Tecnológicos', 50, doc.page.height - 22, { align: 'center', width: doc.page.width - 100 });
    }

    doc.end();
  } catch (e) {
    error(res, e.message, 500);
  }
}

function sectionTitle(doc, text) {
  const y = doc.y + 6;
  doc.rect(50, y, doc.page.width - 100, 22).fill('#1a237e');
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(11).text(text, 58, y + 5);
  doc.fillColor('#1a1a1a').moveDown(0.2);
}

function statBox(doc, x, y, w, h, label, value, bg, color) {
  doc.rect(x, y, w, h).fill(bg).stroke('#e0e0e0');
  doc.fillColor('#555').font('Helvetica').fontSize(8).text(label, x + 6, y + 8, { width: w - 12 });
  doc.fillColor(color).font('Helvetica-Bold').fontSize(20).text(value, x + 6, y + 22, { width: w - 12 });
}

function tableHeader(doc, y, cols) {
  const w = Math.floor(495 / cols.length);
  let x = 50;
  doc.rect(50, y, 495, 20).fill('#1a237e');
  cols.forEach(c => {
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(9).text(c, x + 4, y + 5, { width: w - 4 });
    x += w;
  });
}

function tableRow(doc, y, cols, shade) {
  const w = Math.floor(495 / cols.length);
  if (shade) doc.rect(50, y, 495, 20).fill('#f5f5f5');
  let x = 50;
  cols.forEach(c => {
    doc.fillColor('#333').font('Helvetica').fontSize(9).text(String(c), x + 4, y + 5, { width: w - 4 });
    x += w;
  });
}

module.exports = { generarPDF };
