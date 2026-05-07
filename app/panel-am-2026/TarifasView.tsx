"use client";
import { useState } from "react";
import { Zap, Smartphone, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Database } from "lucide-react";

interface TarifaElec { proveedor:string; plan:string; precio_kwh:number; potencia_kw_mes:number; permanencia:string; url:string; detalles:string; }
interface TarifaTel { proveedor:string; plan:string; fibra_mb:number; lineas_moviles:number; gb_datos:number; precio_mes:number; permanencia:string; url:string; detalles:string; }
interface TarifaMov { proveedor:string; plan:string; gb_datos:number; precio_mes:number; url:string; detalles:string; }
interface Tarifas { electricidad:TarifaElec[]; telecom:TarifaTel[]; lineas_moviles_extra:TarifaMov[]; ultima_actualizacion:string; }

function ElecRow({t,best}:{t:TarifaElec;best:boolean}) {
  const [open,setOpen]=useState(false);
  return(<>
    <tr onClick={()=>setOpen(!open)} className={`border-b border-slate-800/20 cursor-pointer transition-colors ${best?'bg-emerald-500/5 hover:bg-emerald-500/10':'hover:bg-slate-800/30'}`}>
      <td className={`px-5 py-3.5 text-sm font-semibold ${best?'text-emerald-400':'text-white'}`}>{best&&'🏆 '}{t.proveedor}</td>
      <td className="px-5 py-3.5 text-sm text-slate-400">{t.plan}</td>
      <td className={`px-5 py-3.5 text-sm font-bold ${best?'text-emerald-400':'text-indigo-400'}`}>{t.precio_kwh}€</td>
      <td className="px-5 py-3.5 text-sm text-slate-400">{t.potencia_kw_mes}€</td>
      <td className="px-5 py-3.5 text-sm text-slate-500">{t.permanencia}</td>
      <td className="px-5 py-3.5">{open?<ChevronUp className="w-4 h-4 text-slate-600"/>:<ChevronDown className="w-4 h-4 text-slate-600"/>}</td>
    </tr>
    {open&&<tr className="bg-slate-800/20"><td colSpan={6} className="px-5 py-4"><div className="flex flex-col sm:flex-row gap-4 items-start"><div className="flex-1"><p className="text-sm text-slate-300 leading-relaxed mb-3">{t.detalles}</p><div className="flex gap-6 text-xs text-slate-500"><span>Precio kWh: <b className="text-indigo-400">{t.precio_kwh}€</b></span><span>Potencia: <b className="text-white">{t.potencia_kw_mes}€/kW/mes</b></span><span>Permanencia: <b className="text-white">{t.permanencia}</b></span></div></div><a href={t.url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shrink-0"><ExternalLink className="w-3.5 h-3.5"/>Ver Tarifa</a></div></td></tr>}
  </>);
}

function TelRow({t,best,isMov}:{t:TarifaTel|TarifaMov;best:boolean;isMov?:boolean}) {
  const [open,setOpen]=useState(false);
  const tel=t as TarifaTel;
  return(<>
    <tr onClick={()=>setOpen(!open)} className={`border-b border-slate-800/20 cursor-pointer transition-colors ${best?'bg-emerald-500/5 hover:bg-emerald-500/10':'hover:bg-slate-800/30'}`}>
      <td className={`px-5 py-3.5 text-sm font-semibold ${best?'text-emerald-400':'text-white'}`}>{best&&'🏆 '}{t.proveedor}</td>
      <td className="px-5 py-3.5 text-sm text-slate-400">{t.plan}</td>
      {!isMov&&<td className="px-5 py-3.5 text-sm text-slate-400">{tel.fibra_mb}Mb</td>}
      <td className="px-5 py-3.5 text-sm text-slate-400">{t.gb_datos}GB</td>
      <td className={`px-5 py-3.5 text-sm font-bold ${best?'text-emerald-400':'text-indigo-400'}`}>{t.precio_mes}€</td>
      {!isMov&&<td className="px-5 py-3.5 text-sm text-slate-500">{tel.permanencia}</td>}
      <td className="px-5 py-3.5">{open?<ChevronUp className="w-4 h-4 text-slate-600"/>:<ChevronDown className="w-4 h-4 text-slate-600"/>}</td>
    </tr>
    {open&&<tr className="bg-slate-800/20"><td colSpan={isMov?5:7} className="px-5 py-4"><div className="flex flex-col sm:flex-row gap-4 items-start"><div className="flex-1"><p className="text-sm text-slate-300 leading-relaxed mb-3">{t.detalles}</p></div><a href={t.url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shrink-0"><ExternalLink className="w-3.5 h-3.5"/>Ver Tarifa</a></div></td></tr>}
  </>);
}

export default function TarifasView({tarifas, onRefresh}:{tarifas:Tarifas|null, onRefresh:()=>void}) {
  const [tab,setTab]=useState<"elec"|"tel">("elec");
  const [scraping,setScraping]=useState(false);

  const handleScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch("/api/admin/scrape", { method: "POST" });
      if (res.ok) {
        onRefresh(); // Reload data in parent
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScraping(false);
    }
  };

  if(!tarifas) return <p className="text-slate-600 text-center py-20">Cargando tarifas...</p>;
  
  const bestElec=[...tarifas.electricidad].sort((a,b)=>a.precio_kwh-b.precio_kwh);
  const bestTel=[...tarifas.telecom].sort((a,b)=>a.precio_mes-b.precio_mes);
  const bestMov=[...tarifas.lineas_moviles_extra].sort((a,b)=>a.precio_mes-b.precio_mes);
  const Th="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider";

  return(<div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <button onClick={()=>setTab("elec")} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab==="elec"?'bg-amber-500/10 text-amber-400 border border-amber-500/20':'text-slate-500 hover:text-white border border-transparent'}`}><Zap className="w-4 h-4"/>Electricidad</button>
        <button onClick={()=>setTab("tel")} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab==="tel"?'bg-blue-500/10 text-blue-400 border border-blue-500/20':'text-slate-500 hover:text-white border border-transparent'}`}><Smartphone className="w-4 h-4"/>Telecomunicaciones</button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-600">Último scraping:</p>
          <p className="text-xs font-bold text-slate-400">{tarifas.ultima_actualizacion}</p>
        </div>
        <button onClick={handleScrape} disabled={scraping} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-semibold rounded-xl hover:bg-indigo-500/20 disabled:opacity-50 transition-colors">
          {scraping ? <><RefreshCw className="w-4 h-4 animate-spin"/>Scrapeando APIs...</> : <><Database className="w-4 h-4"/>Scrapear Datos Ahora</>}
        </button>
      </div>
    </div>

    {tab==="elec"&&(
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400"/><h3 className="font-bold text-sm">Tarifas de Electricidad (Mercado Real)</h3><span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold ml-auto">Mejor: {bestElec[0]?.proveedor} — {bestElec[0]?.precio_kwh}€/kWh</span></div>
        <p className="px-5 py-3 text-xs text-slate-400 border-b border-slate-800/40 bg-slate-800/20 flex items-center gap-2"><Database className="w-3.5 h-3.5"/><span>Conectado a la API de Red Eléctrica de España (REE). Haz clic en una fila para ver el contrato riguroso.</span></p>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800/40"><th className={Th}>Proveedor</th><th className={Th}>Plan</th><th className={Th}>€/kWh</th><th className={Th}>€/kW/mes</th><th className={Th}>Permanencia</th><th className="w-10"></th></tr></thead><tbody>
          {bestElec.map((t,i)=><ElecRow key={i} t={t} best={i===0}/>)}
        </tbody></table></div>
      </div>
    )}

    {tab==="tel"&&(<div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-400"/><h3 className="font-bold text-sm">Paquetes Fibra + Móvil</h3><span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold ml-auto">Mejor: {bestTel[0]?.proveedor} — {bestTel[0]?.precio_mes}€/mes</span></div>
        <p className="px-5 py-3 text-xs text-slate-400 border-b border-slate-800/40 bg-slate-800/20 flex items-center gap-2"><Database className="w-3.5 h-3.5"/><span>Monitorización activa de operadoras. Haz clic para ver condiciones legales.</span></p>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800/40"><th className={Th}>Proveedor</th><th className={Th}>Plan</th><th className={Th}>Fibra</th><th className={Th}>Datos</th><th className={Th}>€/mes</th><th className={Th}>Permanencia</th><th className="w-10"></th></tr></thead><tbody>
          {bestTel.map((t,i)=><TelRow key={i} t={t} best={i===0}/>)}
        </tbody></table></div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-400"/><h3 className="font-bold text-sm">Líneas Móviles Extra</h3><span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold ml-auto">Mejor: {bestMov[0]?.proveedor} — {bestMov[0]?.precio_mes}€/mes</span></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800/40"><th className={Th}>Proveedor</th><th className={Th}>Plan</th><th className={Th}>Datos</th><th className={Th}>€/mes</th><th className="w-10"></th></tr></thead><tbody>
          {bestMov.map((t,i)=><TelRow key={i} t={t} best={i===0} isMov/>)}
        </tbody></table></div>
      </div>
    </div>)}
  </div>);
}
