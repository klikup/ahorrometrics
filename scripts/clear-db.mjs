import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDB() {
  console.log('Borrando Auditorias...');
  await prisma.auditoria.deleteMany();
  
  console.log('Borrando Contactos...');
  await prisma.contact.deleteMany();
  
  console.log('Borrando Empresas Scrapeadas (Leads)...');
  await prisma.scrapedBusiness.deleteMany();
  
  console.log('¡Base de datos limpiada con éxito!');
}

clearDB()
  .catch(e => {
    console.error('Error al limpiar la BD:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
