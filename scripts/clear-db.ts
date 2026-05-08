import fs from 'fs';
import path from 'path';

// Load variables from .env.local manually
try {
  const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  const dbUrlMatch = envLocal.match(/^DATABASE_URL="(.*)"/m) || envLocal.match(/^DATABASE_URL=(.*)/m);
  if (dbUrlMatch) {
    process.env.DATABASE_URL = dbUrlMatch[1].replace(/"/g, '');
  }
} catch (e) {
  // Ignore
}

async function clearDB() {
  const { prisma } = await import('../lib/prisma');
  
  console.log('Borrando Auditorias...');
  await prisma.auditoria.deleteMany();
  
  console.log('Borrando Contactos...');
  await prisma.contact.deleteMany();
  
  console.log('Borrando Empresas Scrapeadas (Leads)...');
  await prisma.scrapedBusiness.deleteMany();
  
  console.log('¡Base de datos limpiada con éxito!');
  await prisma.$disconnect();
}

clearDB().catch(e => {
  console.error('Error al limpiar la BD:', e);
  process.exit(1);
});
