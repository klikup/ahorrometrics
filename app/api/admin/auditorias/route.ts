import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASEROW_TOKEN = "zqTOMqUCdocw6zF1K14KYGz4w1UPbEDS";
const AUDITORIAS_TABLE = "963329";
const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() { const c = await cookies(); return c.get("am_admin_session")?.value === SESSION_TOKEN; }

// GET - Get auditoria by ContactoID (query param)
export async function GET(request: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const contactoId = request.nextUrl.searchParams.get("contactoId");
  try {
    const url = contactoId
      ? `https://api.baserow.io/api/database/rows/table/${AUDITORIAS_TABLE}/?user_field_names=true&filter__ContactoID__equal=${contactoId}`
      : `https://api.baserow.io/api/database/rows/table/${AUDITORIAS_TABLE}/?user_field_names=true&size=200`;
    const res = await fetch(url, { headers: { Authorization: `Token ${BASEROW_TOKEN}` }, cache: "no-store" });
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

// POST - Create auditoria
export async function POST(request: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const res = await fetch(`https://api.baserow.io/api/database/rows/table/${AUDITORIAS_TABLE}/?user_field_names=true`, {
      method: "POST", headers: { Authorization: `Token ${BASEROW_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

// PATCH - Update auditoria
export async function PATCH(request: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id, ...fields } = await request.json();
    const res = await fetch(`https://api.baserow.io/api/database/rows/table/${AUDITORIAS_TABLE}/${id}/?user_field_names=true`, {
      method: "PATCH", headers: { Authorization: `Token ${BASEROW_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
