import { BarChart3, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";

export default function TrafficView() {
  const stats = [
    { label: "Visitas Totales", value: "12,450", change: "+14.5%", up: true, icon: Users },
    { label: "Usuarios Únicos", value: "8,210", change: "+5.2%", up: true, icon: Globe },
    { label: "Tasa de Rebote", value: "42.3%", change: "-2.1%", up: false, icon: ArrowDownRight },
    { label: "Tiempo Medio", value: "2m 45s", change: "+12.4%", up: true, icon: Clock },
  ];

  const sources = [
    { name: "Orgánico (Google)", value: 45, color: "bg-indigo-500" },
    { name: "Directo", value: 25, color: "bg-emerald-500" },
    { name: "Redes Sociales", value: 20, color: "bg-amber-500" },
    { name: "Referidos", value: 10, color: "bg-pink-500" },
  ];

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const visits = [450, 520, 480, 610, 590, 310, 290];
  const maxVisits = Math.max(...visits);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.label}</p>
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold tracking-tight text-white">{s.value}</p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {s.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Tráfico Semanal
              </h2>
              <p className="text-xs text-slate-500 mt-1">Visitas en los últimos 7 días</p>
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 mt-4 relative">
            <div className="absolute top-0 left-0 w-full border-b border-slate-800/50 border-dashed" />
            <div className="absolute top-1/2 left-0 w-full border-b border-slate-800/50 border-dashed" />
            
            {visits.map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 z-10 group">
                <div className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 rounded-t-lg transition-all relative flex items-end justify-center" style={{ height: `${(v / maxVisits) * 100}%` }}>
                  <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all opacity-80 group-hover:opacity-100" />
                  <span className="absolute -top-7 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded shadow-lg">{v}</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Fuentes de Tráfico
          </h2>
          <div className="space-y-5">
            {sources.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">{s.name}</span>
                  <span className="text-slate-500">{s.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-400 mb-1">Integración de Analíticas</h3>
          <p className="text-xs text-slate-400">Estos datos son una simulación. Para obtener datos reales, conecta tu panel con Google Analytics o Plausible en la configuración.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 whitespace-nowrap transition-colors">
          Conectar Analytics
        </button>
      </div>
    </div>
  );
}
