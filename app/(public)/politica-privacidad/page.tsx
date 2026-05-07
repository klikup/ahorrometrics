import Link from "next/link";

export default function PoliticaPrivacidadPage() {
  return (
    <main className="flex-1 pt-32 pb-20 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Política de Privacidad</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Información al Usuario</h2>
            <p>
              AhorroMetrics, como Responsable del Tratamiento, le informa que, según lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril, (RGPD) y en la L.O. 3/2018, de 5 de diciembre, de protección de datos y garantía de los derechos digitales (LOPDGDD), trataremos sus datos tal y como reflejamos en la presente Política de Privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Finalidad del Tratamiento</h2>
            <p>
              Sus datos serán recabados para las siguientes finalidades:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Para mantener un contacto comercial y responder a las consultas enviadas a través de nuestro formulario de contacto.</li>
              <li>Para la prestación de los servicios de auditoría y optimización de costes contratados.</li>
              <li>Para el envío de comunicaciones comerciales relacionadas con nuestros servicios (siempre que nos haya dado su consentimiento explícito).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Conservación de los Datos</h2>
            <p>
              Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Derechos del Usuario</h2>
            <p>
              Cualquier persona tiene derecho a obtener confirmación sobre si en AhorroMetrics estamos tratando datos personales que les conciernan, o no. Las personas interesadas tienen derecho a:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Solicitar el acceso a los datos personales relativos al interesado.</li>
              <li>Solicitar su rectificación o supresión.</li>
              <li>Solicitar la limitación de su tratamiento.</li>
              <li>Oponerse al tratamiento.</li>
              <li>Solicitar la portabilidad de los datos.</li>
            </ul>
            <p className="mt-4">
              Podrá ejercer estos derechos dirigiéndose a nuestro correo electrónico: contacto@ahorrometrics.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link href="/" className="text-indigo-600 font-medium hover:underline">
            &larr; Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  );
}
