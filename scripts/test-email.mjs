// Test script to send a promo email
import 'dotenv/config';
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const nombreEmpresa = "Empresa de Prueba S.L.";
const emailDestino = "angelmartinezrodriguez2019@gmail.com";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es";
const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:40px 40px 32px;text-align:center;">
          <h1 style="color:white;font-size:28px;margin:0 0 4px;font-weight:800;letter-spacing:-0.5px;">AhorroMetrics</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;letter-spacing:1px;">Auditoria de gastos para empresas</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:16px;color:#1e293b;margin:0 0 20px;line-height:1.7;">Estimado equipo de <strong>${nombreEmpresa}</strong>,</p>
          <p style="font-size:15px;color:#475569;margin:0 0 16px;line-height:1.7;">Nos ponemos en contacto con ustedes desde <strong>AhorroMetrics</strong>, empresa especializada en la <strong>auditoria y optimizacion de gastos</strong> en suministros de electricidad, gas y telecomunicaciones.</p>
          <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.7;">Ayudamos a empresas como la suya a <strong>reducir sus facturas mensuales</strong> sin cambiar de proveedor si no lo desean, simplemente optimizando las condiciones actuales de su contrato.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eef2ff,#e0e7ff);border-radius:12px;margin:0 0 24px;">
            <tr><td style="padding:28px;">
              <p style="font-size:18px;font-weight:bold;color:#3730a3;margin:0 0 16px;text-align:center;">Si usted no ahorra, nosotros no cobramos</p>
              <p style="font-size:14px;color:#4338ca;margin:0;text-align:center;line-height:1.6;">Nuestro modelo se basa en resultados. Realizamos la auditoria de forma <strong>totalmente gratuita</strong> y solo cobramos un porcentaje del ahorro real que consigamos en sus facturas. Sin ahorro, sin coste para usted.</p>
            </td></tr>
          </table>
          <p style="font-size:14px;font-weight:bold;color:#1e293b;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Que ofrecemos</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            ${[
              ["Auditoria gratuita", "de sus facturas actuales de luz, gas y telecomunicaciones"],
              ["Comparativa de mercado", "con las mejores ofertas disponibles para su perfil de consumo"],
              ["Negociacion directa", "con proveedores para conseguir las mejores condiciones"],
              ["Sin compromiso", "ni permanencia. Si no le convence, no tiene ninguna obligacion"],
            ].map(([t, d]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><table cellpadding="0" cellspacing="0"><tr><td style="width:32px;vertical-align:top;"><div style="width:24px;height:24px;background:#10b981;border-radius:50%;text-align:center;line-height:24px;color:white;font-size:13px;font-weight:bold;">&#10004;</div></td><td style="font-size:14px;color:#475569;line-height:1.5;"><strong>${t}</strong> ${d}</td></tr></table></td></tr>`).join("")}
          </table>
          <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.7;">Nos gustaria poder explicarle en detalle como funciona nuestro servicio en una <strong>breve llamada o reunion sin compromiso</strong>. Estamos convencidos de que podemos ayudarle a optimizar los gastos de su empresa.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 28px;">
            <a href="${baseUrl}/#contacto" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:bold;letter-spacing:0.5px;">Solicitar consulta gratuita</a>
          </td></tr></table>
          <p style="font-size:14px;color:#94a3b8;margin:0;line-height:1.6;text-align:center;">Tambien puede contactarnos en <a href="mailto:contacto@ahorrometrics.es" style="color:#4338ca;">contacto@ahorrometrics.es</a></p>
        </td></tr>
        <tr><td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;line-height:1.6;">AhorroMetrics - Auditoria de gastos para empresas<br><a href="${baseUrl}" style="color:#6366f1;">ahorrometrics.es</a></p>
          <p style="font-size:11px;color:#cbd5e1;margin:8px 0 0;text-align:center;">Si no desea recibir mas comunicaciones, responda indicandolo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

async function main() {
  console.log("Verificando conexion SMTP...");
  await transporter.verify();
  console.log("✅ SMTP OK. Enviando email a:", emailDestino);

  const info = await transporter.sendMail({
    from: `"AhorroMetrics" <${fromAddress}>`,
    to: emailDestino,
    subject: `${nombreEmpresa} - Podemos reducir sus gastos en suministros`,
    html,
    text: `Estimado equipo de ${nombreEmpresa}, desde AhorroMetrics le ofrecemos auditoria gratuita de gastos. Si no ahorra, no cobramos. Contactenos: contacto@ahorrometrics.es`,
  });

  console.log("✅ Email enviado! ID:", info.messageId);
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1); });
