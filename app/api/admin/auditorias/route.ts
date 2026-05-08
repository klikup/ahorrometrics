import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() {
  const c = await cookies();
  return c.get("am_admin_session")?.value === SESSION_TOKEN;
}

// GET - Get auditoria by ContactoID (query param) or all
export async function GET(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const contactoId = request.nextUrl.searchParams.get("contactoId");

  try {
    if (contactoId) {
      const auditorias = await prisma.auditoria.findMany({
        where: { contactoId: parseInt(contactoId) },
      });

      const results = auditorias.map((a) => ({
        id: a.id,
        Nombre: a.nombre,
        ContactoID: a.contactoId,
        Estado: a.estado,
        FechaContacto: a.fechaContacto,
        Electricidad: a.electricidad,
        Telecom: a.telecom,
        OtrosGastos: a.otrosGastos,
        AhorroTotal: a.ahorroTotal,
        Notas: a.notas,
        facturaUrl: a.facturaUrl,
      }));

      return NextResponse.json({ results });
    } else {
      const auditorias = await prisma.auditoria.findMany({
        orderBy: { createdAt: "desc" },
      });

      const results = auditorias.map((a) => ({
        id: a.id,
        Nombre: a.nombre,
        ContactoID: a.contactoId,
        Estado: a.estado,
        FechaContacto: a.fechaContacto,
        Electricidad: a.electricidad,
        Telecom: a.telecom,
        OtrosGastos: a.otrosGastos,
        AhorroTotal: a.ahorroTotal,
        Notas: a.notas,
      }));

      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error("Error fetching auditorias:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST - Create auditoria
export async function POST(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    const created = await prisma.auditoria.create({
      data: {
        nombre: body.Nombre || "",
        contactoId: parseInt(body.ContactoID),
        estado: body.Estado || "nuevo",
        fechaContacto: body.FechaContacto || "",
        electricidad: body.Electricidad || "",
        telecom: body.Telecom || "",
        otrosGastos: body.OtrosGastos || "",
        ahorroTotal: body.AhorroTotal || "",
        notas: body.Notas || "",
        facturaUrl: body.facturaUrl || "",
      },
    });

    return NextResponse.json({
      id: created.id,
      Nombre: created.nombre,
      ContactoID: created.contactoId,
      Estado: created.estado,
      FechaContacto: created.fechaContacto,
      Electricidad: created.electricidad,
      Telecom: created.telecom,
      OtrosGastos: created.otrosGastos,
      AhorroTotal: created.ahorroTotal,
      Notas: created.notas,
      facturaUrl: created.facturaUrl,
    });
  } catch (error) {
    console.error("Error creating auditoria:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PATCH - Update auditoria
export async function PATCH(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, ...fields } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (fields.Nombre !== undefined) updateData.nombre = fields.Nombre;
    if (fields.ContactoID !== undefined) updateData.contactoId = parseInt(fields.ContactoID);
    if (fields.Estado !== undefined) updateData.estado = fields.Estado;
    if (fields.FechaContacto !== undefined) updateData.fechaContacto = fields.FechaContacto;
    if (fields.Electricidad !== undefined) updateData.electricidad = fields.Electricidad;
    if (fields.Telecom !== undefined) updateData.telecom = fields.Telecom;
    if (fields.OtrosGastos !== undefined) updateData.otrosGastos = fields.OtrosGastos;
    if (fields.AhorroTotal !== undefined) updateData.ahorroTotal = fields.AhorroTotal;
    if (fields.Notas !== undefined) updateData.notas = fields.Notas;
    if (fields.facturaUrl !== undefined) updateData.facturaUrl = fields.facturaUrl;

    const updated = await prisma.auditoria.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      Nombre: updated.nombre,
      ContactoID: updated.contactoId,
      Estado: updated.estado,
      FechaContacto: updated.fechaContacto,
      Electricidad: updated.electricidad,
      Telecom: updated.telecom,
      OtrosGastos: updated.otrosGastos,
      AhorroTotal: updated.ahorroTotal,
      Notas: updated.notas,
      facturaUrl: updated.facturaUrl,
    });
  } catch (error) {
    console.error("Error updating auditoria:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
