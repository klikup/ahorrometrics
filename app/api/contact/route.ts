import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/send-welcome-email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, empresa, mensaje } = body;

    if (!nombre || !email || !telefono) {
      return NextResponse.json(
        { error: "Los campos nombre, email y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido." },
        { status: 400 }
      );
    }

    // Store structured data in notas as JSON
    const notasData = JSON.stringify({
      estado: "nuevo",
      mensaje_original: mensaje || "",
      fecha_registro: new Date().toISOString().split("T")[0],
      fecha_contacto: "",
      electricidad: { notas: "", ahorro_estimado: "" },
      telecom: { notas: "", ahorro_estimado: "" },
      otros: { notas: "", ahorro_estimado: "" },
      importe_total_ahorro: "",
      observaciones: "",
    });

    // Save to PostgreSQL
    await prisma.contact.create({
      data: {
        nombre,
        email,
        telefono,
        empresa: empresa || "",
        notas: notasData,
        activo: true,
      },
    });

    // Send welcome email asynchronously (fire-and-forget)
    sendWelcomeEmail({ nombre, email, telefono, empresa, mensaje })
      .then(() => {
        console.log(`✅ Welcome email sent to ${email}`);
      })
      .catch((emailError) => {
        console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
