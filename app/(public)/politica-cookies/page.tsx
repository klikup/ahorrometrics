import Link from "next/link";

export default function PoliticaCookiesPage() {
  return (
    <main className="flex-1 pt-32 pb-20 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Política de Cookies</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. ¿Qué son las cookies?</h2>
            <p>
              Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. ¿Qué tipos de cookies utiliza esta página web?</h2>
            <ul className="list-disc pl-5 mt-4 space-y-4">
              <li>
                <strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.
              </li>
              <li>
                <strong>Cookies de análisis:</strong> Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Revocación y eliminación de cookies</h2>
            <p>
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador. En caso que no permitas la instalación de cookies en tu navegador es posible que no puedas acceder a alguna de las secciones de nuestra web.
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
