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
    if (!Array.isArray(businesses) || businesses.length === 0)
      return NextResponse.json({ error: "No hay empresas" }, { status: 400 });

    let saved = 0, skipped = 0;
    const errors: string[] = [];

    for (const b of businesses) {
      try {
        await prisma.scrapedBusiness.upsert({
          where: { osmId_localidad: { osmId: Number(b.id), localidad: localidad || "" } },
          create: {
            osmId: Number(b.id), nombre: b.nombre || "", tipo: b.tipo || "",
            direccion: b.direccion || "", telefono: b.telefono || "",
            email: b.email || "", web: b.web || "",
            lat: b.lat || 0, lon: b.lon || 0, localidad: localidad || "",
          },
          update: {
            nombre: b.nombre || "", tipo: b.tipo || "",
            direccion: b.direccion || "", telefono: b.telefono || "",
            email: b.email || "", web: b.web || "",
          },
        });
        saved++;
      } catch (e) {
        skipped++;
        if (errors.length < 3) errors.push(`${b.nombre}: ${e instanceof Error ? e.message : "error"}`);
      }
    }

    console.log(`[Businesses] Saved: ${saved}, Skipped: ${skipped}`);
    if (errors.length > 0) console.error("[Businesses] Errors:", errors);

    return NextResponse.json({ saved, skipped, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error("Error saving businesses:", error);
    return NextResponse.json({ error: "Error al guardar: " + (error instanceof Error ? error.message : "") }, { status: 500 });
  }
}

// GET - Get saved businesses
export async function GET(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const localidad = request.nextUrl.searchParams.get("localidad") || "";

  try {
    const businesses = await prisma.scrapedBusiness.findMany({
      where: localidad ? { localidad } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ results: businesses.map(b => ({
      id: b.id, osmId: Number(b.osmId), nombre: b.nombre, tipo: b.tipo,
      direccion: b.direccion, telefono: b.telefono, email: b.email, web: b.web,
      lat: b.lat, lon: b.lon, localidad: b.localidad, estado: b.estado,
      emailEnviado: b.emailEnviado, fechaEmail: b.fechaEmail?.toISOString() || null,
    })) });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : "") }, { status: 500 });
  }
}

// PATCH - Update business status
export async function PATCH(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, estado, notas } = await request.json();
    const data: Record<string, unknown> = {};
    if (estado !== undefined) data.estado = estado;
    if (notas !== undefined) data.notas = notas;

    await prisma.scrapedBusiness.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
