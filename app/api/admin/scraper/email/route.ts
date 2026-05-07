import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPromoEmail } from "@/lib/send-promo-email";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() {
  const c = await cookies();
  return c.get("am_admin_session")?.value === SESSION_TOKEN;
}

// POST - Send promo email to a business
export async function POST(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { businessId, emailOverride } = await request.json();

    // Get the business from DB
    const business = await prisma.scrapedBusiness.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const emailDestino = emailOverride || business.email;

    if (!emailDestino) {
      return NextResponse.json(
        { error: "Esta empresa no tiene email registrado" },
        { status: 400 }
      );
    }

    // Send the email
    await sendPromoEmail({
      nombreEmpresa: business.nombre,
      emailDestino,
    });

    // Update the business record
    await prisma.scrapedBusiness.update({
      where: { id: businessId },
      data: {
        emailEnviado: true,
        fechaEmail: new Date(),
        estado: "contactado",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email enviado a ${emailDestino}`,
    });
  } catch (error) {
    console.error("Error sending promo email:", error);
    return NextResponse.json(
      { error: `Error al enviar email: ${error instanceof Error ? error.message : "desconocido"}` },
      { status: 500 }
    );
  }
}
