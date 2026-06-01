const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el sembrado de usuarios...');

  // 1. Crear Administrador
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@techcorp.com' },
    update: {},
    create: {
      nombre: 'Administrador TechCorp',
      correo: 'admin@techcorp.com',
      password: 'admin123', // El backend se encargará de validar o encriptar según su lógica
      rol: 'admin',
      activo: true
    },
  });
  console.log('Usuario Admin creado o verificado:', admin.correo);

  // 2. Crear Técnico
  const tecnico = await prisma.usuario.upsert({
    where: { correo: 'tecnico@techcorp.com' },
    update: {},
    create: {
      nombre: 'Técnico de Soporte',
      correo: 'tecnico@techcorp.com',
      password: 'tecnico123',
      rol: 'tecnico',
      activo: true
    },
  });
  console.log('Usuario Técnico creado o verificado:', tecnico.correo);
}

main()
  .catch((e) => {
    console.error('Error al insertar usuarios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });