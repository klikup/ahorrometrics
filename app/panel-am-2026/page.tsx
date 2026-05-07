"use client";
import { useState, useEffect, useCallback } from "react";
import { LogOut, Trash2, RefreshCw, Lock, AlertCircle, CheckCircle2, X, Search, Users, ChevronRight, BarChart3, Clock, Tag, Database, Radar } from "lucide-react";
import Image from "next/image";
import TarifasView from "./TarifasView";
import DetailServices from "./DetailServices";
import DatabaseView from "./DatabaseView";
import ScraperView from "./ScraperView";

interface Contact { id:number; Nombre:string; Email:string; Telefono:string; Empresa:string; Notas:string; Activo:boolean; }
interface Auditoria { id:number; Nombre:string; ContactoID:number; Estado:string; FechaContacto:string; Electricidad:string; Telecom:string; OtrosGastos:string; AhorroTotal:string; Notas:string; [k:string]:any; }

const ESTADOS=[
  {key:"nuevo",label:"Nuevo",dot:"bg-blue-400",bg:"bg-blue-500/10",text:"text-blue-400",border:"border-blue-500/20"},
  {key:"contactado",label:"Contactado",dot:"bg-amber-400",bg:"bg-amber-500/10",text:"text-amber-400",border:"border-amber-500/20"},
  {key:"auditoria",label:"En Auditoría",dot:"bg-purple-400",bg:"bg-purple-500/10",text:"text-purple-400",border:"border-purple-500/20"},
  {key:"propuesta",label:"Propuesta",dot:"bg-cyan-400",bg:"bg-cyan-500/10",text:"text-cyan-400",border:"border-cyan-500/20"},
  {key:"ganado",label:"Cerrado ✓",dot:"bg-emerald-400",bg:"bg-emerald-500/10",text:"text-emerald-400",border:"border-emerald-500/20"},
  {key:"perdido",label:"Perdido",dot:"bg-red-400",bg:"bg-red-500/10",text:"text-red-400",border:"border-red-500/20"},
];
const getE=(k:string)=>ESTADOS.find(e=>e.key===k)||ESTADOS[0];
const Badge=({estado}:{estado:string})=>{const e=getE(estado);return<span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${e.bg} ${e.text} ${e.border}`}><span className={`w-1.5 h-1.5 rounded-full ${e.dot}`}/>{e.label}</span>;};

export default function AdminPanel() {
  const [auth,setAuth]=useState(false);
  const [pw,setPw]=useState("");const [loginErr,setLoginErr]=useState("");const [loginLoad,setLoginLoad]=useState(false);
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [auditorias,setAuditorias]=useState<Auditoria[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tarifas,setTarifas]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [page,setPage]=useState<"dashboard"|"contacts"|"detail"|"tarifas"|"database"|"scraper">("dashboard");
  const [selId,setSelId]=useState<number|null>(null);
  const [selAud,setSelAud]=useState<Auditoria|null>(null);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [search,setSearch]=useState("");
  const [filterE,setFilterE]=useState("todos");
  const [detailMode,setDetailMode]=useState<"servicios"|"observaciones">("servicios");

  const sel = contacts.find(c=>c.id===selId)||null;
  const getAud=(cid:number)=>auditorias.find(a=>String(a.ContactoID)===String(cid));

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const[cr,ar,tr]=await Promise.all([fetch("/api/admin/contacts"),fetch("/api/admin/auditorias"),fetch("/api/admin/tarifas")]);
      if(cr.status===401){setAuth(false);return;}
      const[cd,ad]=await Promise.all([cr.json(),ar.json()]);
      setContacts(cd.results||[]);
      const auds:Auditoria[]=ad.results||[];
      setAuditorias(auds);
      if(tr.ok)setTarifas(await tr.json());
      // Refresh selAud if viewing a detail
      if(selId){const fresh=auds.find((a:Auditoria)=>String(a.ContactoID)===String(selId));if(fresh)setSelAud(fresh);}
    }catch{}finally{setLoading(false);}
  },[selId]);

  useEffect(()=>{if(auth)load();},[auth,load]);
  useEffect(()=>{fetch("/api/admin/contacts").then(r=>{if(r.ok)setAuth(true);});},[]);

  const login=async(e:React.FormEvent)=>{e.preventDefault();setLoginErr("");setLoginLoad(true);try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});if(r.ok){setAuth(true);setPw("");}else setLoginErr("Contraseña incorrecta");}catch{setLoginErr("Error");}finally{setLoginLoad(false);}};
  const logout=async()=>{await fetch("/api/admin/logout",{method:"POST"});setAuth(false);};

  const openDetail=async(c:Contact)=>{
    setSelId(c.id);setDetailMode("servicios");setPage("detail");
    let aud=auditorias.find(a=>String(a.ContactoID)===String(c.id));
    if(!aud){
      try{const r=await fetch("/api/admin/auditorias",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({Nombre:c.Nombre,ContactoID:c.id,Estado:"nuevo",FechaContacto:"",Electricidad:"",Telecom:"",OtrosGastos:"",AhorroTotal:"",Notas:""})});aud=await r.json();setAuditorias(p=>[...p,aud!]);}catch{}
    }
    if(aud)setSelAud({...aud});
  };

  const saveAud=async()=>{
    if(!selAud)return;
    setSaving(true);setSaved(false);
    try{
      const{id,...fields}=selAud;
      await fetch("/api/admin/auditorias",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,...fields})});
      // Update local state immediately
      setAuditorias(prev=>prev.map(a=>a.id===id?{...selAud}:a));
      setSaved(true);setTimeout(()=>setSaved(false),2000);
    }catch{}finally{setSaving(false);}
  };

  const delContact=async(id:number)=>{
    if(!confirm("¿Eliminar?"))return;
    try{await fetch("/api/admin/contacts",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(selId===id){setSelId(null);setSelAud(null);setPage("contacts");}setContacts(p=>p.filter(c=>c.id!==id));}catch{}
  };

  const filtered=contacts.filter(c=>{const aud=getAud(c.id);const estado=aud?.Estado||"nuevo";const ms=!search||[c.Nombre,c.Email,c.Empresa,c.Telefono].some(f=>f?.toLowerCase().includes(search.toLowerCase()));return ms&&(filterE==="todos"||estado===filterE);});

  if(!auth)return(<div className="min-h-screen bg-slate-950 flex items-center justify-center px-6"><div className="w-full max-w-sm space-y-8"><div className="text-center"><div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-800"><Lock className="w-7 h-7 text-indigo-400"/></div><h1 className="text-xl font-bold text-white">Panel de Gestión</h1><p className="text-slate-600 text-sm mt-1">AhorroMetrics</p></div><form onSubmit={login} className="space-y-3"><input type="password" value={pw} onChange={e=>{setPw(e.target.value);setLoginErr("");}} placeholder="Contraseña" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500" autoFocus/>{loginErr&&<p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{loginErr}</p>}<button type="submit" disabled={loginLoad} className="w-full bg-indigo-600 text-white font-semibold rounded-xl py-3 hover:bg-indigo-700 disabled:opacity-50 text-sm">{loginLoad?"Verificando...":"Acceder"}</button></form></div></div>);

  const statsByE=ESTADOS.map(e=>({...e,count:contacts.filter(c=>(getAud(c.id)?.Estado||"nuevo")===e.key).length}));
  const totalAhorro=auditorias.reduce((s,a)=>s+(parseFloat(a.AhorroTotal)||0),0);
  const navItems=[["dashboard","Dashboard",<BarChart3 key="d" className="w-4 h-4"/>],["contacts","Contactos",<Users key="c" className="w-4 h-4"/>],["tarifas","Tarifas",<Tag key="t" className="w-4 h-4"/>],["scraper","Scraper",<Radar key="s" className="w-4 h-4"/>],["database","Base de Datos",<Database key="db" className="w-4 h-4"/>]] as const;

  return(<div className="min-h-screen bg-slate-950 text-white flex">
    <aside className="w-56 border-r border-slate-800/80 bg-slate-900/30 flex flex-col fixed h-full z-40">
      <div className="p-5 border-b border-slate-800/80"><Image src="/logo.png" alt="Logo" width={120} height={30} className="object-contain brightness-0 invert opacity-80"/><p className="text-[10px] text-slate-700 font-bold mt-2 uppercase tracking-widest">Gestión</p></div>
      <nav className="flex-1 p-3 space-y-0.5">{navItems.map(([k,l,ic])=>(<button key={k} onClick={()=>{setPage(k);setSelId(null);setSelAud(null);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page===k||(page==="detail"&&k==="contacts")?'bg-indigo-500/10 text-indigo-400':'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>{ic}{l}</button>))}</nav>
      <div className="p-3 border-t border-slate-800/80"><button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-white hover:bg-slate-800/50"><LogOut className="w-4 h-4"/>Salir</button></div>
    </aside>

    <main className="flex-1 ml-56">
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-8 py-4 flex items-center justify-between"><h1 className="text-lg font-bold">{page==="dashboard"?"Dashboard":page==="tarifas"?"Comparador de Tarifas":page==="database"?"Base de Datos":page==="scraper"?"Scraper de Empresas":page==="detail"&&sel?sel.Nombre:"Contactos"}</h1><button onClick={load} disabled={loading} className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button></header>

      <div className="p-8">
        {/* DASHBOARD */}
        {page==="dashboard"&&(<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[["Total Leads",contacts.length,"text-white"],["En Proceso",statsByE.filter(s=>["contactado","auditoria","propuesta"].includes(s.key)).reduce((a,b)=>a+b.count,0),"text-amber-400"],["Cerrados",statsByE.find(s=>s.key==="ganado")?.count||0,"text-emerald-400"],["Ahorro Total",totalAhorro?`${totalAhorro.toLocaleString("es")}€`:"0€","text-indigo-400"]].map(([l,v,c],i)=>(<div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5"><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">{l as string}</p><p className={`text-3xl font-bold tracking-tight ${c}`}>{v as string|number}</p></div>))}</div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 mb-8"><h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pipeline</h2><div className="flex gap-1.5 h-3 rounded-full overflow-hidden bg-slate-800 mb-4">{statsByE.filter(s=>s.count>0).map(s=><div key={s.key} className={`${s.dot} transition-all`} style={{width:`${(s.count/Math.max(contacts.length,1))*100}%`}}/>)}</div><div className="flex flex-wrap gap-4">{statsByE.map(s=><div key={s.key} className="flex items-center gap-2 text-xs"><span className={`w-2.5 h-2.5 rounded-full ${s.dot}`}/><span className="text-slate-500">{s.label}</span><span className="font-bold">{s.count}</span></div>)}</div></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden"><div className="px-6 py-4 border-b border-slate-800/60 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600"/><h2 className="text-sm font-bold text-slate-500">Últimos Contactos</h2></div>{contacts.slice(0,8).map(c=>{const aud=getAud(c.id);return(<button key={c.id} onClick={()=>openDetail(c)} className="w-full flex items-center gap-4 px-6 py-3 hover:bg-slate-800/30 transition-colors border-b border-slate-800/30 last:border-0 text-left"><div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">{c.Nombre.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{c.Nombre}</p><p className="text-xs text-slate-600 truncate">{c.Empresa||c.Email}</p></div><Badge estado={aud?.Estado||"nuevo"}/><ChevronRight className="w-3.5 h-3.5 text-slate-700"/></button>);})}</div>
        </>)}

        {/* CONTACTS */}
        {page==="contacts"&&(<>
          <div className="flex flex-col sm:flex-row gap-3 mb-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500"/></div><select value={filterE} onChange={e=>setFilterE(e.target.value)} className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"><option value="todos">Todos</option>{ESTADOS.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}</select></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-slate-800/60 text-[10px] text-slate-600 uppercase tracking-wider"><th className="px-5 py-3 text-left font-bold">Estado</th><th className="px-5 py-3 text-left font-bold">Nombre</th><th className="px-5 py-3 text-left font-bold hidden md:table-cell">Email</th><th className="px-5 py-3 text-left font-bold hidden lg:table-cell">Teléfono</th><th className="px-5 py-3 text-left font-bold hidden lg:table-cell">Empresa</th><th className="px-5 py-3 text-left font-bold">Ahorro</th><th className="px-5 py-3 w-10"></th></tr></thead><tbody>{filtered.map(c=>{const aud=getAud(c.id);return(<tr key={c.id} onClick={()=>openDetail(c)} className="border-b border-slate-800/30 hover:bg-slate-800/20 cursor-pointer"><td className="px-5 py-3"><Badge estado={aud?.Estado||"nuevo"}/></td><td className="px-5 py-3 font-semibold">{c.Nombre}</td><td className="px-5 py-3 text-slate-500 hidden md:table-cell">{c.Email}</td><td className="px-5 py-3 text-slate-500 hidden lg:table-cell">{c.Telefono}</td><td className="px-5 py-3 text-slate-600 hidden lg:table-cell">{c.Empresa||"—"}</td><td className="px-5 py-3 font-semibold text-indigo-400">{aud?.AhorroTotal?`${aud.AhorroTotal}€`:"—"}</td><td className="px-5 py-3" onClick={e=>e.stopPropagation()}><button onClick={()=>delContact(c.id)} className="p-1.5 text-slate-800 hover:text-red-400 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>);})}</tbody></table>{filtered.length===0&&<p className="text-center text-slate-700 py-16 text-sm">Sin resultados</p>}</div>
        </>)}

        {/* TARIFAS */}
        {page==="tarifas"&&<TarifasView tarifas={tarifas} onRefresh={load}/>}

        {/* SCRAPER */}
        {page==="scraper"&&<ScraperView/>}

        {/* DATABASE */}
        {page==="database"&&<DatabaseView/>}

        {/* DETAIL */}
        {page==="detail"&&sel&&selAud&&(<>
          <button onClick={()=>{setPage("contacts");setSelId(null);setSelAud(null);}} className="flex items-center gap-1 text-xs text-slate-600 hover:text-white mb-6"><X className="w-3.5 h-3.5"/>Volver</button>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-400 shrink-0">{sel.Nombre.charAt(0)}</div>
            <div className="flex-1 min-w-0"><h2 className="text-lg font-bold">{sel.Nombre}</h2><p className="text-xs text-slate-500">{sel.Email} · {sel.Telefono}{sel.Empresa?` · ${sel.Empresa}`:""}</p>{sel.Notas&&<p className="text-xs text-slate-600 mt-1 italic max-w-lg truncate">&ldquo;{sel.Notas}&rdquo;</p>}</div>
            <button onClick={()=>delContact(sel.id)} className="p-2 text-slate-700 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
          </div>
          {/* Estado */}
          <div className="flex flex-wrap gap-2 mb-6">{ESTADOS.map(e=><button key={e.key} onClick={()=>setSelAud(prev=>prev?{...prev,Estado:e.key}:prev)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${selAud.Estado===e.key?`${e.bg} ${e.text} ${e.border} ring-1 ring-current`:'bg-slate-900/40 text-slate-600 border-slate-800/60 hover:border-slate-700'}`}>{e.label}</button>)}</div>
          {/* Mode tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">{([["servicios","Servicios y Ahorro"],["observaciones","Observaciones"]] as const).map(([k,l])=><button key={k} onClick={()=>setDetailMode(k)} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${detailMode===k?'bg-slate-800 text-white':'text-slate-600 hover:text-white'}`}>{l}</button>)}</div>
          {detailMode==="servicios"&&<DetailServices aud={selAud} setAud={setSelAud} tarifas={tarifas}/>}
          {detailMode==="observaciones"&&<div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6"><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Observaciones Internas</label><textarea rows={12} value={selAud.Notas} onChange={e=>setSelAud(prev=>prev?{...prev,Notas:e.target.value}:prev)} placeholder="Notas internas..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"/></div>}
          {/* Save */}
          <div className="mt-6 flex items-center justify-between">
            <div>{selAud.AhorroTotal&&<span className="text-sm text-slate-500">Ahorro: <span className="font-bold text-emerald-400">{parseFloat(selAud.AhorroTotal).toLocaleString("es")}€/año</span></span>}</div>
            <div className="flex items-center gap-3">
              {saved&&<span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/>Guardado</span>}
              <button onClick={saveAud} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/10">{saving?<><RefreshCw className="w-4 h-4 animate-spin"/>Guardando...</>:<><CheckCircle2 className="w-4 h-4"/>Guardar</>}</button>
            </div>
          </div>
        </>)}
      </div>
    </main>
  </div>);
}
