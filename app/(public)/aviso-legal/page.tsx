import Link from "next/link";

export default function AvisoLegalPage() {
  return (
    <main className="flex-1 pt-32 pb-20 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Aviso Legal</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Datos Identificativos</h2>
            <p>
              En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), se informa que el titular del presente sitio web es AhorroMetrics (en adelante, "la Empresa"), con domicilio a estos efectos en Paseo de la Castellana, Madrid, España.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Uso del Portal</h2>
            <p>
              El acceso y/o uso de este portal atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Propiedad Intelectual e Industrial</h2>
            <p>
              La Empresa por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, etc.). Todos los derechos reservados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Exclusión de Garantías y Responsabilidad</h2>
            <p>
              La Empresa no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
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
