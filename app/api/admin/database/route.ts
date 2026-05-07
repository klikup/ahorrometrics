import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() {
  const c = await cookies();
  return c.get("am_admin_session")?.value === SESSION_TOKEN;
}

// GET - Obtener datos de las tablas de la base de datos
export async function GET() {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const [contacts, auditorias] = await Promise.all([
      prisma.contact.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.auditoria.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const contactCount = contacts.length;
    const auditoriaCount = auditorias.length;

    // Stats
    const estadoCount: Record<string, number> = {};
    auditorias.forEach((a) => {
      estadoCount[a.estado] = (estadoCount[a.estado] || 0) + 1;
    });

    const activosCount = contacts.filter((c) => c.activo).length;
    const inactivosCount = contacts.filter((c) => !c.activo).length;

    return NextResponse.json({
      stats: {
        contacts: contactCount,
        auditorias: auditoriaCount,
        activos: activosCount,
        inactivos: inactivosCount,
        porEstado: estadoCount,
      },
      tables: {
        contacts: contacts.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          email: c.email,
          telefono: c.telefono,
          empresa: c.empresa,
          activo: c.activo,
          notas: c.notas.length > 100 ? c.notas.substring(0, 100) + "..." : c.notas,
          created_at: c.createdAt.toISOString(),
          updated_at: c.updatedAt.toISOString(),
        })),
        auditorias: auditorias.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          contacto_id: a.contactoId,
          estado: a.estado,
          fecha_contacto: a.fechaContacto,
          ahorro_total: a.ahorroTotal,
          electricidad: a.electricidad.length > 80 ? a.electricidad.substring(0, 80) + "..." : a.electricidad,
          telecom: a.telecom.length > 80 ? a.telecom.substring(0, 80) + "..." : a.telecom,
          otros_gastos: a.otrosGastos.length > 80 ? a.otrosGastos.substring(0, 80) + "..." : a.otrosGastos,
          notas: a.notas.length > 80 ? a.notas.substring(0, 80) + "..." : a.notas,
          created_at: a.createdAt.toISOString(),
          updated_at: a.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Database view error:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de la base de datos" },
      { status: 500 }
    );
  }
}
