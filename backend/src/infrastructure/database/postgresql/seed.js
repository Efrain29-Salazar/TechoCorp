const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL...');

  // ── Usuarios admin ────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const tecPass   = await bcrypt.hash('tecnico123', 10);

  await prisma.usuario.upsert({
    where: { correo: 'admin@techcorp.com' },
    update: {},
    create: { nombre: 'Administrador', correo: 'admin@techcorp.com', password: adminPass, rol: 'admin' },
  });
  await prisma.usuario.upsert({
    where: { correo: 'tecnico@techcorp.com' },
    update: {},
    create: { nombre: 'Carlos Técnico', correo: 'tecnico@techcorp.com', password: tecPass, rol: 'tecnico' },
  });

  // ── Clientes de ejemplo ───────────────────────────────────────────
  const cliPass = await bcrypt.hash('cliente123', 10);
  await prisma.cliente.upsert({
    where: { correo: 'cliente@empresa.com' },
    update: {},
    create: { nombre: 'María González', correo: 'cliente@empresa.com', password: cliPass, telefono: '+57 300 123 4567', empresa: 'Empresa ABC S.A.S' },
  });

  // ── Equipos ───────────────────────────────────────────────────────
  const equipos = [
    { nombre: 'Laptop Dell XPS 15', tipo: 'Laptop', marca: 'Dell', modelo: 'XPS 15 9520', serial: 'DELL-XPS-001', estado: 'operativo', ubicacion: 'Oficina A', enStock: true, precio: 4500000, descripcionVenta: 'Laptop de alto rendimiento, Intel Core i7, 16GB RAM, SSD 512GB. Garantía de 1 año.' },
    { nombre: 'Servidor HP ProLiant', tipo: 'Servidor', marca: 'HP', modelo: 'ProLiant DL380', serial: 'HP-SRV-001', estado: 'operativo', ubicacion: 'Data Center', enStock: false },
    { nombre: 'Impresora Canon G3160', tipo: 'Impresora', marca: 'Canon', modelo: 'G3160', serial: 'CAN-PRT-001', estado: 'revision', ubicacion: 'Recepción', enStock: false },
    { nombre: 'Switch Cisco SG350', tipo: 'Red', marca: 'Cisco', modelo: 'SG350-28', serial: 'CSC-NET-001', estado: 'operativo', ubicacion: 'Data Center', enStock: true, precio: 1200000, descripcionVenta: 'Switch gestionable 28 puertos GbE, ideal para redes empresariales.' },
    { nombre: 'PC HP EliteDesk 800', tipo: 'Desktop', marca: 'HP', modelo: 'EliteDesk 800 G6', serial: 'HP-DSK-001', estado: 'inactivo', ubicacion: 'Bodega', enStock: true, precio: 1800000, descripcionVenta: 'PC empresarial, Intel Core i5, 8GB RAM, SSD 256GB, Windows 11 Pro.' },
    { nombre: 'Monitor LG 27"', tipo: 'Monitor', marca: 'LG', modelo: '27UK850', serial: 'LG-MON-001', estado: 'operativo', ubicacion: 'Oficina B', enStock: true, precio: 850000, descripcionVenta: 'Monitor 4K UHD 27", panel IPS, HDR400, compatible USB-C.' },
    { nombre: 'Laptop Lenovo ThinkPad', tipo: 'Laptop', marca: 'Lenovo', modelo: 'ThinkPad X1 Carbon', serial: 'LEN-LAP-001', estado: 'operativo', ubicacion: 'Bodega', enStock: true, precio: 5200000, descripcionVenta: 'Ultrabook empresarial, Core i7 12va gen, 16GB RAM, SSD 1TB, pantalla 14" OLED.' },
  ];

  for (const e of equipos) {
    const equipo = await prisma.equipo.upsert({
      where: { serial: e.serial },
      update: {},
      create: e,
    });
    await prisma.mantenimiento.create({
      data: { equipoId: equipo.id, descripcion: 'Mantenimiento preventivo inicial — limpieza y revisión general', tipo: 'preventivo', tecnico: 'Carlos Técnico', costo: 50.0 },
    });
  }

  console.log('✓ Seed completado correctamente.');
  console.log('');
  console.log('Credenciales:');
  console.log('  Admin:    admin@techcorp.com     / admin123');
  console.log('  Técnico:  tecnico@techcorp.com   / tecnico123');
  console.log('  Cliente:  cliente@empresa.com    / cliente123');
  console.log('');
  console.log('Portales:');
  console.log('  Admin:    http://localhost:5173/login');
  console.log('  Cliente:  http://localhost:5173/portal');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
