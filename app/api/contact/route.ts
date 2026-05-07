import { NextRequest, NextResponse } from "next/server";

const BASEROW_TOKEN = "zqTOMqUCdocw6zF1K14KYGz4w1UPbEDS";
const TABLE_ID = "963283";
const BASEROW_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`;

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

    // Store structured data in Notas as JSON
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

    const baserowResponse = await fetch(BASEROW_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Nombre: nombre,
        Email: email,
        Telefono: telefono,
        Empresa: empresa || "",
        Notas: notasData,
        Activo: true,
      }),
    });

    if (!baserowResponse.ok) {
      const errorData = await baserowResponse.text();
      console.error("Baserow error:", errorData);
      return NextResponse.json(
        { error: "Error al guardar los datos. Inténtalo de nuevo más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
