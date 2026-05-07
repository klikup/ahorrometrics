import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() {
  const c = await cookies();
  return c.get("am_admin_session")?.value === SESSION_TOKEN;
}

// POST - Save businesses from scraper results
export async function POST(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { businesses, localidad } = await request.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json({ error: "No hay empresas para guardar" }, { status: 400 });
    }

    let saved = 0;
    let skipped = 0;

    for (const b of businesses) {
      try {
        await prisma.scrapedBusiness.upsert({
          where: {
            osmId_localidad: { osmId: b.id, localidad: localidad || "" },
          },
          create: {
            osmId: b.id,
            nombre: b.nombre,
            tipo: b.tipo || "",
            direccion: b.direccion || "",
            telefono: b.telefono || "",
            email: b.email || "",
            web: b.web || "",
            lat: b.lat || 0,
            lon: b.lon || 0,
            localidad: localidad || "",
            estado: "nuevo",
          },
          update: {
            // Don't overwrite estado or notas if already saved
            nombre: b.nombre,
            tipo: b.tipo || "",
            direccion: b.direccion || "",
            telefono: b.telefono || "",
            email: b.email || "",
            web: b.web || "",
          },
        });
        saved++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ saved, skipped });
  } catch (error) {
    console.error("Error saving businesses:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

// GET - Get saved businesses with their status
export async function GET(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const localidad = request.nextUrl.searchParams.get("localidad") || "";

  try {
    const businesses = await prisma.scrapedBusiness.findMany({
      where: localidad ? { localidad } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      results: businesses.map((b) => ({
        id: b.id,
        osmId: b.osmId,
        nombre: b.nombre,
        tipo: b.tipo,
        direccion: b.direccion,
        telefono: b.telefono,
        email: b.email,
        web: b.web,
        lat: b.lat,
        lon: b.lon,
        localidad: b.localidad,
        estado: b.estado,
        emailEnviado: b.emailEnviado,
        fechaEmail: b.fechaEmail?.toISOString() || null,
        notas: b.notas,
      })),
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

// PATCH - Update business status
export async function PATCH(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, estado, notas } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (estado !== undefined) updateData.estado = estado;
    if (notas !== undefined) updateData.notas = notas;

    const updated = await prisma.scrapedBusiness.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, estado: updated.estado });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
