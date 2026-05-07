import nodemailer from "nodemailer";

interface ContactData {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  mensaje?: string;
}

/**
 * Creates a reusable SMTP transporter using environment variables.
 * Validates that credentials are properly configured before attempting to send.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Log configuration (without exposing the full password)
  console.log(`📧 SMTP Config: host=${host}, port=${port}, user=${user || "NOT SET"}, pass=${pass ? "****" + pass.slice(-4) : "NOT SET"}`);

  if (!user || !pass) {
    throw new Error(
      "SMTP credentials not configured. Set SMTP_USER and SMTP_PASS in .env.local"
    );
  }

  if (pass === "tu_contraseña_de_aplicacion_aqui") {
    throw new Error(
      "SMTP_PASS still has the placeholder value. Update it with your real SMTP password in .env.local"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    // Timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Generates the professional HTML email template for welcome/confirmation emails.
 */
function generateWelcomeEmailHTML(data: ContactData): string {
  const currentYear = new Date().getFullYear();
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bienvenido a AhorroMetrics</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    
    /* Typography */
    body, td, p, a, li, blockquote {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, Helvetica, sans-serif;
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; width: 100%;">

  <!-- Preheader (hidden text shown in email previews) -->
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Hemos recibido tu solicitud correctamente. Un experto de AhorroMetrics se pondrá en contacto contigo en breve.
  </div>

  <!-- Wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">

          <!-- ═══════════════ HEADER WITH GRADIENT ═══════════════ -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%); padding: 40px 48px 32px; text-align: center;" class="mobile-padding">
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <img src="${logoUrl}" alt="AhorroMetrics" width="180" style="width: 180px; max-width: 180px; height: auto; display: block; border-radius: 8px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 16px;">
                          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">Confirmación de Registro</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
          <tr>
            <td style="padding: 48px 48px 16px;" class="mobile-padding">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 700; color: #1e293b; line-height: 1.3;">
                ¡Hola, ${data.nombre}! 👋
              </h1>
              <p style="margin: 0 0 28px; font-size: 16px; color: #64748b; line-height: 1.6;">
                Gracias por confiar en <strong style="color: #4f46e5;">AhorroMetrics</strong>. Hemos recibido tu solicitud correctamente.
              </p>

              <!-- Success Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="48" valign="top" style="padding-right: 16px;">
                          <div style="width: 44px; height: 44px; background-color: #dcfce7; border-radius: 50%; text-align: center; line-height: 44px; font-size: 22px;">
                            ✅
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #166534;">Solicitud registrada con éxito</p>
                          <p style="margin: 0; font-size: 14px; color: #15803d; line-height: 1.5;">
                            Tu consulta ha quedado registrada en nuestro sistema. Un experto en optimización de gastos revisará tu caso y se pondrá en contacto contigo <strong>en las próximas 24-48 horas</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Data Summary -->
              <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
                Datos de tu solicitud
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Nombre</td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500;">${data.nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #64748b;">Email</td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #64748b;">Teléfono</td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${data.telefono}</td>
                </tr>
                ${data.empresa ? `
                <tr>
                  <td style="padding: 14px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #64748b;">Empresa</td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${data.empresa}</td>
                </tr>
                ` : ""}
                ${data.mensaje ? `
                <tr>
                  <td style="padding: 14px 20px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top;">Mensaje</td>
                  <td style="padding: 14px 20px; font-size: 14px; color: #1e293b; line-height: 1.5;">${data.mensaje}</td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>

          <!-- ═══════════════ WHAT'S NEXT SECTION ═══════════════ -->
          <tr>
            <td style="padding: 0 48px 40px;" class="mobile-padding">
              <p style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
                ¿Qué sucederá a continuación?
              </p>

              <!-- Step 1 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td width="44" valign="top" style="padding-right: 14px;">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 50%; text-align: center; line-height: 36px; color: #ffffff; font-size: 14px; font-weight: 700;">1</div>
                  </td>
                  <td valign="top" style="padding-top: 6px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1e293b;">Análisis preliminar</p>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Revisaremos los datos que nos has proporcionado para preparar una evaluación inicial.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td width="44" valign="top" style="padding-right: 14px;">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 50%; text-align: center; line-height: 36px; color: #ffffff; font-size: 14px; font-weight: 700;">2</div>
                  </td>
                  <td valign="top" style="padding-top: 6px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1e293b;">Contacto personalizado</p>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Un experto se pondrá en contacto contigo para conocer tus necesidades específicas.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td width="44" valign="top" style="padding-right: 14px;">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 50%; text-align: center; line-height: 36px; color: #ffffff; font-size: 14px; font-weight: 700;">3</div>
                  </td>
                  <td valign="top" style="padding-top: 6px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1e293b;">Propuesta de ahorro</p>
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Te presentaremos un informe detallado con el ahorro estimado para tu empresa.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ CTA BUTTON ═══════════════ -->
          <tr>
            <td style="padding: 0 48px 40px;" class="mobile-padding">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 28px; text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 15px; color: #475569; line-height: 1.5;">
                      ¿Quieres conocer más sobre cómo reducimos los gastos de tu empresa?
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 50px; padding: 14px 36px;">
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}/como-funciona" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block;">
                            Descubre Cómo Funciona →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ DIVIDER ═══════════════ -->
          <tr>
            <td style="padding: 0 48px;" class="mobile-padding">
              <div style="border-top: 1px solid #e2e8f0;"></div>
            </td>
          </tr>

          <!-- ═══════════════ FOOTER ═══════════════ -->
          <tr>
            <td style="padding: 32px 48px 40px; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e293b;">AhorroMetrics</p>
              <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8;">Decisiones Inteligentes, Resultados Medibles</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #94a3b8;">Si no ahorras, no cobramos.</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}" style="font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 500;">Sitio web</a>
                  </td>
                  <td style="color: #cbd5e1; font-size: 12px;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}/servicios" style="font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 500;">Servicios</a>
                  </td>
                  <td style="color: #cbd5e1; font-size: 12px;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}/politica-privacidad" style="font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 500;">Privacidad</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 4px; font-size: 11px; color: #cbd5e1;">
                contacto@ahorrometrics.es
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                © ${currentYear} AhorroMetrics. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email Container -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/**
 * Sends a professional welcome/confirmation email to a new contact.
 * This is called automatically when a new contact form is submitted.
 */
export async function sendWelcomeEmail(data: ContactData): Promise<void> {
  console.log(`📧 Preparing welcome email for: ${data.email}`);
  
  const transporter = createTransporter();

  // Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log("📧 SMTP connection verified successfully");
  } catch (verifyError) {
    console.error("❌ SMTP connection verification failed:", verifyError);
    throw verifyError;
  }

  const mailOptions = {
    from: {
      name: "AhorroMetrics",
      address: process.env.SMTP_USER || "contacto@ahorrometrics.es",
    },
    to: data.email,
    subject: `${data.nombre}, hemos recibido tu solicitud — AhorroMetrics`,
    html: generateWelcomeEmailHTML(data),
    // Plain text fallback for email clients that don't support HTML
    text: `
¡Hola, ${data.nombre}!

Gracias por confiar en AhorroMetrics. Hemos recibido tu solicitud correctamente.

Tu consulta ha quedado registrada en nuestro sistema. Un experto en optimización de gastos revisará tu caso y se pondrá en contacto contigo en las próximas 24-48 horas.

DATOS DE TU SOLICITUD:
- Nombre: ${data.nombre}
- Email: ${data.email}
- Teléfono: ${data.telefono}
${data.empresa ? `- Empresa: ${data.empresa}` : ""}
${data.mensaje ? `- Mensaje: ${data.mensaje}` : ""}

¿QUÉ SUCEDERÁ A CONTINUACIÓN?
1. Análisis preliminar — Revisaremos los datos que nos has proporcionado.
2. Contacto personalizado — Un experto se pondrá en contacto contigo.
3. Propuesta de ahorro — Te presentaremos un informe detallado.

Visita nuestro sitio: ${process.env.NEXT_PUBLIC_BASE_URL || "https://ahorrometrics.es"}

---
AhorroMetrics — Decisiones Inteligentes, Resultados Medibles
Si no ahorras, no cobramos.
contacto@ahorrometrics.es
© ${new Date().getFullYear()} AhorroMetrics. Todos los derechos reservados.
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent successfully! Message ID: ${info.messageId}`);
}

