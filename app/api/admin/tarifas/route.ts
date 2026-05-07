import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SESSION_TOKEN = "am_session_valid_k8x2p9";
const FILE = join(process.cwd(), "data", "tarifas.json");

async function isAuth() { const c = await cookies(); return c.get("am_admin_session")?.value === SESSION_TOKEN; }

export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try { return NextResponse.json(JSON.parse(readFileSync(FILE, "utf-8"))); } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    body.ultima_actualizacion = new Date().toISOString().split("T")[0];
    writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
