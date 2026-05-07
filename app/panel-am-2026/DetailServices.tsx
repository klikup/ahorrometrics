"use client";
import { Zap, Smartphone, FileText, TrendingDown } from "lucide-react";

interface Tarifas { electricidad:{proveedor:string;precio_kwh:number;potencia_kw_mes:number;plan:string}[]; telecom:{proveedor:string;precio_mes:number;plan:string;fibra_mb:number;gb_datos:number}[]; lineas_moviles_extra:{proveedor:string;precio_mes:number;plan:string;gb_datos:number}[]; }
interface ServicioCliente { proveedor_actual:string; plan_actual:string; coste_mensual:string; consumo_kwh?:string; potencia_kw?:string; num_lineas?:string; notas:string; }
interface Auditoria { id:number; Electricidad:string; Telecom:string; OtrosGastos:string; AhorroTotal:string; [k:string]:unknown; }

const Input=({label,value,onChange,placeholder,className}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;className?:string})=>(
  <div className={className}><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">{label}</label><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500"/></div>
);

function parse(raw:string):ServicioCliente { try{return JSON.parse(raw);}catch{return{proveedor_actual:"",plan_actual:"",coste_mensual:"",consumo_kwh:"",potencia_kw:"",num_lineas:"",notas:raw||""};} }

export default function DetailServices({aud,setAud,tarifas}:{aud:Auditoria;setAud:(a:Auditoria)=>void;tarifas:Tarifas|null}) {
  const elec=parse(aud.Electricidad);
  const tel=parse(aud.Telecom);
  const otros=parse(aud.OtrosGastos);

  const setElec=(k:string,v:string)=>{const n={...elec,[k]:v};setAud({...aud,Electricidad:JSON.stringify(n)});};
  const setTel=(k:string,v:string)=>{const n={...tel,[k]:v};setAud({...aud,Telecom:JSON.stringify(n)});};
  const setOtros=(k:string,v:string)=>{const n={...otros,[k]:v};setAud({...aud,OtrosGastos:JSON.stringify(n)});};

  // Calcular ahorros
  const bestElecKwh=tarifas?Math.min(...tarifas.electricidad.map(t=>t.precio_kwh)):0;
  const bestTelMes=tarifas?Math.min(...tarifas.telecom.map(t=>t.precio_mes)):0;
  const bestMovMes=tarifas?Math.min(...tarifas.lineas_moviles_extra.map(t=>t.precio_mes)):0;

  const costeElec=parseFloat(elec.coste_mensual)||0;
  const costeTel=parseFloat(tel.coste_mensual)||0;
  const costeOtros=parseFloat(otros.coste_mensual)||0;

  // Estimated savings calculation
  let ahorroElec=0;
  if(costeElec>0 && elec.consumo_kwh && elec.potencia_kw && tarifas){
    const consumo=parseFloat(elec.consumo_kwh)||0;
    const potencia=parseFloat(elec.potencia_kw)||0;
    const bestPot=Math.min(...tarifas.electricidad.map(t=>t.potencia_kw_mes));
    const mejorCoste=(consumo*bestElecKwh)+(potencia*bestPot);
    ahorroElec=Math.max(0,costeElec-mejorCoste);
  }

  let ahorroTel=0;
  if(costeTel>0 && tarifas){
    const numLineas=parseInt(tel.num_lineas||"1")||1;
    const mejorPack=bestTelMes+(numLineas-1)*bestMovMes;
    ahorroTel=Math.max(0,costeTel-mejorPack);
  }

  const ahorroTotal=Math.round((ahorroElec+ahorroTel)*12);

  // Auto-update AhorroTotal if we have data
  const newTotal=ahorroTotal>0?ahorroTotal.toString():"";
  if(newTotal&&newTotal!==aud.AhorroTotal){setTimeout(()=>setAud({...aud,AhorroTotal:newTotal}),0);}

  const Card=({icon,color,title,children}:{icon:React.ReactNode;color:string;title:string;children:React.ReactNode})=>(
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className={`px-5 py-3.5 border-b border-slate-800/60 flex items-center gap-2`}><div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>{icon}</div><h3 className="font-bold text-sm">{title}</h3></div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  return(<div className="space-y-6">
    {/* Savings Summary */}
    {(ahorroElec>0||ahorroTel>0)&&(
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0"><TrendingDown className="w-6 h-6 text-emerald-400"/></div>
        <div className="flex-1"><p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Ahorro Estimado Anual</p><p className="text-2xl font-bold text-emerald-400">{ahorroTotal.toLocaleString("es")}€/año</p></div>
        <div className="flex gap-6 text-sm">
          {ahorroElec>0&&<div><p className="text-[10px] text-slate-600 uppercase font-bold">Electricidad</p><p className="font-bold text-amber-400">{Math.round(ahorroElec*12).toLocaleString("es")}€</p></div>}
          {ahorroTel>0&&<div><p className="text-[10px] text-slate-600 uppercase font-bold">Telecom</p><p className="font-bold text-blue-400">{Math.round(ahorroTel*12).toLocaleString("es")}€</p></div>}
        </div>
      </div>
    )}

    <Card icon={<Zap className="w-4 h-4 text-amber-400"/>} color="bg-amber-500/10 border border-amber-500/20" title="Electricidad — Servicio Actual">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input label="Proveedor Actual" value={elec.proveedor_actual} onChange={v=>setElec("proveedor_actual",v)} placeholder="Ej: Iberdrola"/>
        <Input label="Plan/Tarifa" value={elec.plan_actual} onChange={v=>setElec("plan_actual",v)} placeholder="Ej: Plan Estable"/>
        <Input label="Coste Mensual (€)" value={elec.coste_mensual} onChange={v=>setElec("coste_mensual",v)} placeholder="Ej: 180"/>
        <Input label="Potencia (kW)" value={elec.potencia_kw||""} onChange={v=>setElec("potencia_kw",v)} placeholder="Ej: 5.5"/>
      </div>
      <Input label="Consumo Medio Mensual (kWh)" value={elec.consumo_kwh||""} onChange={v=>setElec("consumo_kwh",v)} placeholder="Ej: 850"/>
      <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Notas</label><textarea value={elec.notas} onChange={e=>setElec("notas",e.target.value)} rows={3} placeholder="Observaciones sobre el suministro eléctrico..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"/></div>
      {costeElec>0&&bestElecKwh>0&&<p className="text-xs text-slate-600">Mejor tarifa del mercado: <span className="text-emerald-400 font-bold">{bestElecKwh}€/kWh</span> ({tarifas?.electricidad.find(t=>t.precio_kwh===bestElecKwh)?.proveedor})</p>}
    </Card>

    <Card icon={<Smartphone className="w-4 h-4 text-blue-400"/>} color="bg-blue-500/10 border border-blue-500/20" title="Telecomunicaciones — Servicio Actual">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input label="Proveedor Actual" value={tel.proveedor_actual} onChange={v=>setTel("proveedor_actual",v)} placeholder="Ej: Movistar"/>
        <Input label="Plan/Tarifa" value={tel.plan_actual} onChange={v=>setTel("plan_actual",v)} placeholder="Ej: Fusión Empresas"/>
        <Input label="Coste Mensual Total (€)" value={tel.coste_mensual} onChange={v=>setTel("coste_mensual",v)} placeholder="Ej: 120"/>
        <Input label="Nº Líneas Móviles" value={tel.num_lineas||""} onChange={v=>setTel("num_lineas",v)} placeholder="Ej: 3"/>
      </div>
      <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Notas</label><textarea value={tel.notas} onChange={e=>setTel("notas",e.target.value)} rows={3} placeholder="Detalles de fibra, centralita, líneas..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"/></div>
      {costeTel>0&&bestTelMes>0&&<p className="text-xs text-slate-600">Mejor pack fibra+móvil: <span className="text-emerald-400 font-bold">{bestTelMes}€/mes</span> ({tarifas?.telecom.find(t=>t.precio_mes===bestTelMes)?.proveedor})</p>}
    </Card>

    <Card icon={<FileText className="w-4 h-4 text-emerald-400"/>} color="bg-emerald-500/10 border border-emerald-500/20" title="Otros Gastos — Servicio Actual">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input label="Proveedor/Tipo" value={otros.proveedor_actual} onChange={v=>setOtros("proveedor_actual",v)} placeholder="Ej: Mapfre"/>
        <Input label="Servicio" value={otros.plan_actual} onChange={v=>setOtros("plan_actual",v)} placeholder="Ej: Seguro oficina"/>
        <Input label="Coste Mensual (€)" value={otros.coste_mensual} onChange={v=>setOtros("coste_mensual",v)} placeholder="Ej: 85"/>
      </div>
      <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Notas</label><textarea value={otros.notas} onChange={e=>setOtros("notas",e.target.value)} rows={3} placeholder="Seguros, mantenimientos, software..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"/></div>
    </Card>
  </div>);
}
