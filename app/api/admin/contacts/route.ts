import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("am_admin_session");
  return session?.value === SESSION_TOKEN;
}

// GET - Listar todos los contactos
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Map to match Baserow field names used by the frontend
    const results = contacts.map((c) => ({
      id: c.id,
      Nombre: c.nombre,
      Email: c.email,
      Telefono: c.telefono,
      Empresa: c.empresa,
      Notas: c.notas,
      Activo: c.activo,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

// DELETE - Eliminar un contacto
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}

// PATCH - Actualizar un contacto
export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, ...fields } = await request.json();

    // Map frontend field names to database field names
    const updateData: Record<string, unknown> = {};
    if (fields.Nombre !== undefined) updateData.nombre = fields.Nombre;
    if (fields.Email !== undefined) updateData.email = fields.Email;
    if (fields.Telefono !== undefined) updateData.telefono = fields.Telefono;
    if (fields.Empresa !== undefined) updateData.empresa = fields.Empresa;
    if (fields.Notas !== undefined) updateData.notas = fields.Notas;
    if (fields.Activo !== undefined) updateData.activo = fields.Activo;

    const updated = await prisma.contact.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      Nombre: updated.nombre,
      Email: updated.email,
      Telefono: updated.telefono,
      Empresa: updated.empresa,
      Notas: updated.notas,
      Activo: updated.activo,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
