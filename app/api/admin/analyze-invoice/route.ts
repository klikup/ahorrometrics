import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import path from "path";

const PROMPT = `Eres un experto analizador de facturas de electricidad y telecomunicaciones en España.
Analiza la factura proporcionada y extrae la siguiente información en formato JSON estricto.
Si un dato no está disponible o no puedes detectarlo, usa una cadena vacía "".

RESPONDE ÚNICAMENTE con el JSON, sin markdown, sin explicaciones, sin backticks.

El formato de respuesta debe ser EXACTAMENTE:
{
  "tipo": "electricidad" o "telecomunicaciones" o "otro",
  "proveedor_actual": "nombre de la compañía (ej: Iberdrola, Endesa, Naturgy, Movistar, Vodafone...)",
  "plan_actual": "nombre del plan o tarifa contratada",
  "coste_mensual": "importe total facturado en euros (solo número, ej: 185.40)",
  "consumo_kwh": "consumo en kWh del periodo (solo para electricidad, solo número)",
  "potencia_kw": "potencia contratada en kW (solo para electricidad, solo número ej: 5.75)",
  "num_lineas": "número de líneas móviles (solo para telecom, solo número)",
  "periodo_facturacion": "periodo de la factura (ej: 01/03/2026 - 31/03/2026)",
  "titular": "nombre del titular de la factura",
  "cups_o_referencia": "código CUPS (electricidad) o número de contrato",
  "notas": "otros detalles relevantes encontrados en la factura (descuentos, penalizaciones, permanencias, etc.)"
}`;

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: "No file URL provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    // Read the file from public directory
    const filePath = path.join(process.cwd(), "public", fileUrl);
    const fileBuffer = await readFile(filePath);
    const base64Data = fileBuffer.toString("base64");

    // Determine MIME type
    const ext = path.extname(fileUrl).toLowerCase();
    let mimeType = "application/pdf";
    if ([".png", ".PNG"].includes(ext)) mimeType = "image/png";
    else if ([".jpg", ".jpeg", ".JPG", ".JPEG"].includes(ext)) mimeType = "image/jpeg";
    else if ([".webp"].includes(ext)) mimeType = "image/webp";

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Send the file to Gemini for analysis
    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text().trim();
    
    // Parse the JSON response - handle potential markdown wrapping
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in the response
        const objectMatch = responseText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          parsed = JSON.parse(objectMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Invoice analysis error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error analyzing invoice" },
      { status: 500 }
    );
  }
}
