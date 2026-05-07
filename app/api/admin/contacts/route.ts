import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASEROW_TOKEN = "zqTOMqUCdocw6zF1K14KYGz4w1UPbEDS";
const TABLE_ID = "963283";
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
    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true&size=200`,
      {
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
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
    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// PATCH - Actualizar un contacto (toggle Activo)
export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, ...fields } = await request.json();
    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}/?user_field_names=true`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
