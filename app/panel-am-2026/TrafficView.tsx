import { ExternalLink, Radar } from "lucide-react";

export default function TrafficView() {
  return (
    <div className="w-full h-full flex flex-col space-y-4 min-h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radar className="w-5 h-5 text-indigo-400" />
            Analíticas en Tiempo Real
          </h2>
          <p className="text-xs text-slate-500 mt-1">Conectado directamente con Google Analytics 4</p>
        </div>
        <a 
          href="https://datastudio.google.com/reporting/13020b5b-7fff-4c0f-8656-2fef5765cd31/page/kIV1C" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver en pantalla completa
        </a>
      </div>
      
      <div className="flex-1 w-full bg-[#f8f9fa] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl min-h-[1200px] relative">
        <iframe 
          className="absolute inset-0 w-full h-full"
          src="https://datastudio.google.com/embed/reporting/13020b5b-7fff-4c0f-8656-2fef5765cd31/page/kIV1C" 
          frameBorder="0" 
          style={{ border: 0 }} 
          allowFullScreen 
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
