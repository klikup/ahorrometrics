import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Image src="/logo.png" alt="AhorroMetrics Logo" width={160} height={40} className="object-contain brightness-0 invert opacity-90" />
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Optimizamos tus gastos operativos con un modelo 100% a éxito. Si no ahorras, no cobramos.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-5">Navegación</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link></li>
              <li><Link href="/beneficios" className="hover:text-white transition-colors">Beneficios</Link></li>
              <li><Link href="/como-funciona" className="hover:text-white transition-colors">Cómo Funciona</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-5">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso Legal</Link></li>
              <li><Link href="/politica-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/politica-cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-5">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li>contacto@ahorrometrics.com</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} AhorroMetrics. Todos los derechos reservados.</span>
          <span>Hecho con dedicación en España 🇪🇸</span>
        </div>
      </div>
    </footer>
  );
}
