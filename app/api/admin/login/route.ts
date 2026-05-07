import { NextRequest, NextResponse } from "next/server";

// ⚠️ Cambia esta contraseña por una segura
const ADMIN_PASSWORD = "AhorroMetrics2026!";
const SESSION_TOKEN = "am_session_valid_k8x2p9";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    
    response.cookies.set("am_admin_session", SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
