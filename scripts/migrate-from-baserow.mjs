/**
 * Migration script: Baserow → PostgreSQL
 * 
 * This script fetches all data from Baserow tables and inserts it into the local PostgreSQL database.
 * Run with: node scripts/migrate-from-baserow.mjs
 * 
 * Make sure to:
 * 1. Have PostgreSQL running with DATABASE_URL set in .env
 * 2. Have run `npx prisma migrate dev` first to create the tables
 */

const BASEROW_TOKEN = "zqTOMqUCdocw6zF1K14KYGz4w1UPbEDS";
const CONTACTS_TABLE = "963283";
const AUDITORIAS_TABLE = "963329";

async function fetchAllFromBaserow(tableId) {
  const allResults = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true&size=200&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Token ${BASEROW_TOKEN}` },
    });

    if (!res.ok) {
      console.error(`Error fetching page ${page} from table ${tableId}:`, res.status);
      break;
    }

    const data = await res.json();
    allResults.push(...(data.results || []));
    hasMore = !!data.next;
    page++;
  }

  return allResults;
}

async function main() {
  console.log("🔄 Starting migration from Baserow to PostgreSQL...\n");

  // 1. Fetch all contacts from Baserow
  console.log("📥 Fetching contacts from Baserow...");
  const contacts = await fetchAllFromBaserow(CONTACTS_TABLE);
  console.log(`   Found ${contacts.length} contacts\n`);

  // 2. Fetch all auditorias from Baserow
  console.log("📥 Fetching auditorias from Baserow...");
  const auditorias = await fetchAllFromBaserow(AUDITORIAS_TABLE);
  console.log(`   Found ${auditorias.length} auditorias\n`);

  // 3. Import Prisma dynamically
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    // 4. Insert contacts
    console.log("📤 Inserting contacts into PostgreSQL...");
    const contactIdMap = new Map(); // Baserow ID -> PostgreSQL ID

    for (const c of contacts) {
      const created = await prisma.contact.create({
        data: {
          nombre: c.Nombre || "",
          email: c.Email || "",
          telefono: c.Telefono || "",
          empresa: c.Empresa || "",
          notas: c.Notas || "",
          activo: c.Activo !== undefined ? c.Activo : true,
        },
      });
      contactIdMap.set(c.id, created.id);
      console.log(`   ✅ Contact: ${created.nombre} (Baserow #${c.id} → PG #${created.id})`);
    }

    // 5. Insert auditorias
    console.log("\n📤 Inserting auditorias into PostgreSQL...");
    for (const a of auditorias) {
      const pgContactId = contactIdMap.get(Number(a.ContactoID));
      if (!pgContactId) {
        console.log(`   ⚠️  Skipping auditoria #${a.id}: ContactoID ${a.ContactoID} not found in contacts`);
        continue;
      }

      // Check if auditoria already exists for this contact
      const existing = await prisma.auditoria.findUnique({
        where: { contactoId: pgContactId },
      });

      if (existing) {
        console.log(`   ⏭️  Auditoria for contact #${pgContactId} already exists, skipping`);
        continue;
      }

      const created = await prisma.auditoria.create({
        data: {
          nombre: a.Nombre || "",
          contactoId: pgContactId,
          estado: a.Estado || "nuevo",
          fechaContacto: a.FechaContacto || "",
          electricidad: a.Electricidad || "",
          telecom: a.Telecom || "",
          otrosGastos: a.OtrosGastos || "",
          ahorroTotal: a.AhorroTotal || "",
          notas: a.Notas || "",
        },
      });
      console.log(`   ✅ Auditoria: ${created.nombre} (Contact PG #${pgContactId})`);
    }

    // 6. Summary
    const totalContacts = await prisma.contact.count();
    const totalAuditorias = await prisma.auditoria.count();
    console.log(`\n✅ Migration complete!`);
    console.log(`   📊 Contacts in PostgreSQL: ${totalContacts}`);
    console.log(`   📊 Auditorias in PostgreSQL: ${totalAuditorias}`);
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
