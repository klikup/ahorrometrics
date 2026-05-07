"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Phone, Mail, Globe, Download, RefreshCw, Building2, AlertCircle, ChevronDown, X, Eye, EyeOff, Send, CheckCircle2, Save } from "lucide-react";

interface Business {
  id: number; nombre: string; tipo: string; direccion: string;
  telefono: string; email: string; web: string; lat: number; lon: number;
}

interface SavedBiz { dbId: number; estado: string; emailEnviado: boolean; fechaEmail: string | null; }

interface SearchResult {
  location: { name: string; lat: number; lon: number; radiusKm: number };
  stats: { total: number; conTelefono: number; conEmail: number; conWeb: number };
  results: Business[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any = null;

const ESTADO_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  nuevo:      { bg: "bg-slate-800", border: "border-slate-700", dot: "#94a3b8" },
  visto:      { bg: "bg-amber-500/15", border: "border-amber-500/30", dot: "#f59e0b" },
  contactado: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "#10b981" },
  descartado: { bg: "bg-red-500/15", border: "border-red-500/30", dot: "#ef4444" },
};

export default function ScraperView() {
  const [localidad, setLocalidad] = useState("");
  const [radio, setRadio] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, SavedBiz>>({});
  const [filter, setFilter] = useState<"todos"|"telefono"|"email"|"web">("todos");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Init map
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined" || mapInstanceRef.current) return;
      L = await import("leaflet");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OSM", maxZoom: 18 }).addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setMapLoaded(true);
      setTimeout(() => map.invalidateSize(), 200);
    };
    init();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markersRef.current = null; setMapLoaded(false); } };
  }, []);

  // Update map markers when results or savedMap change
  const updateMarkers = useCallback(() => {
    if (!markersRef.current || !L || !result) return;
    markersRef.current.clearLayers();

    for (const b of result.results) {
      if (!b.lat || !b.lon) continue;
      const s = savedMap[String(b.id)];
      const estado = s?.estado || "nuevo";
      const color = ESTADO_COLORS[estado]?.dot || "#94a3b8";
      const size = 16;

      const icon = L.divIcon({
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5),0 0 12px ${color}40;"></div>`,
        className: "", iconSize: [size + 6, size + 6], iconAnchor: [(size + 6) / 2, (size + 6) / 2],
      });

      const marker = L.marker([b.lat, b.lon], { icon });
      const estadoBadge = `<span style="background:${color};color:white;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold">${estado}</span>`;
      marker.bindPopup(`<b>${b.nombre}</b><br><small>${b.tipo}</small> ${estadoBadge}<br>${b.telefono ? "📞 " + b.telefono + "<br>" : ""}${b.email ? "📧 " + b.email + "<br>" : ""}${b.direccion ? "📍 " + b.direccion : ""}`);
      markersRef.current.addLayer(marker);
    }
  }, [result, savedMap]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  const handleSearch = async () => {
    if (!localidad.trim()) return;
    setLoading(true); setError(""); setResult(null); setSavedMap({});
    try {
      const res = await fetch("/api/admin/scraper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ localidad, radio }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setResult(data);
      if (mapInstanceRef.current && data.location) {
        mapInstanceRef.current.setView([data.location.lat, data.location.lon], radio <= 3 ? 13 : radio <= 5 ? 12 : radio <= 10 ? 11 : 10);
      }
      // Auto-load saved statuses
      loadSaved(data.location.name.split(",")[0]);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const loadSaved = async (loc: string) => {
    try {
      const res = await fetch(`/api/admin/scraper/businesses?localidad=${encodeURIComponent(loc)}`);
      if (!res.ok) return;
      const d = await res.json();
      const map: Record<string, SavedBiz> = {};
      for (const b of d.results || []) map[String(b.osmId)] = { dbId: b.id, estado: b.estado, emailEnviado: b.emailEnviado, fechaEmail: b.fechaEmail };
      setSavedMap(map);
    } catch { /* ignore */ }
  };

  const saveAll = async () => {
    if (!result?.results.length) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/scraper/businesses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses: result.results, localidad: result.location.name.split(",")[0] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSuccessMsg(`${d.saved} empresas guardadas${d.skipped ? ` (${d.skipped} errores)` : ""}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadSaved(result.location.name.split(",")[0]);
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar"); }
    finally { setSaving(false); }
  };

  const updateEstado = async (osmId: number, dbId: number, estado: string) => {
    try {
      await fetch("/api/admin/scraper/businesses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: dbId, estado }) });
      setSavedMap(prev => ({ ...prev, [String(osmId)]: { ...prev[String(osmId)], estado } }));
    } catch { /* ignore */ }
  };

  const sendEmail = async (osmId: number, dbId: number, nombre: string, email: string) => {
    if (!confirm(`Enviar email promocional a ${nombre} (${email})?`)) return;
    setSendingId(osmId);
    try {
      const res = await fetch("/api/admin/scraper/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: dbId, emailOverride: email }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSavedMap(prev => ({ ...prev, [String(osmId)]: { ...prev[String(osmId)], estado: "contactado", emailEnviado: true, fechaEmail: new Date().toISOString() } }));
      setSuccessMsg(`Email enviado a ${email}`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSendingId(null); }
  };

  const filtered = result?.results.filter(b => {
    if (filter === "telefono") return !!b.telefono;
    if (filter === "email") return !!b.email;
    if (filter === "web") return !!b.web;
    return true;
  }) || [];

  const exportCSV = () => {
    if (!filtered.length) return;
    const h = "Nombre,Tipo,Direccion,Telefono,Email,Web,Estado\n";
    const rows = filtered.map(b => `"${b.nombre}","${b.tipo}","${b.direccion}","${b.telefono}","${b.email}","${b.web}","${savedMap[String(b.id)]?.estado || "nuevo"}"`).join("\n");
    const blob = new Blob([h + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
    a.download = `empresas_${result?.location.name.split(",")[0] || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const hasSaved = Object.keys(savedMap).length > 0;

  return (
    <div className="space-y-6">
      {/* Map always visible */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div ref={mapRef} className="w-full h-[400px]" style={{ zIndex: 1 }} />
        {/* Map legend */}
        <div className="px-4 py-2 flex items-center gap-4 border-t border-slate-800/60 bg-slate-950/50">
          {Object.entries(ESTADO_COLORS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div style={{ background: v.dot }} className="w-2.5 h-2.5 rounded-full" />
              <span className="text-[10px] text-slate-500 capitalize">{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Localidad</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              <input value={localidad} onChange={e => setLocalidad(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Ej: Sevilla, Madrid, Fuente Vaqueros..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="w-full lg:w-40">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Radio ({radio} km)</label>
            <div className="relative">
              <select value={radio} onChange={e => setRadio(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none">
                {[1,2,3,5,10,15,20].map(v => <option key={v} value={v}>{v} km</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} disabled={loading} className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Buscando...</> : <><Search className="w-4 h-4" /> Buscar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-400 shrink-0" /><p className="text-sm text-red-400">{error}</p><button onClick={() => setError("")} className="ml-auto text-red-400"><X className="w-4 h-4" /></button></div>}
      {successMsg && <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><p className="text-sm text-emerald-400">{successMsg}</p></div>}

      {result && (<>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4"><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Ubicacion</p><p className="text-xs font-semibold text-white truncate">{result.location.name.split(",")[0]}</p></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4"><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Total</p><p className="text-2xl font-bold text-white">{result.stats.total}</p></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/30" onClick={() => setFilter(filter==="telefono"?"todos":"telefono")}><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con telefono</p><p className="text-2xl font-bold text-emerald-400">{result.stats.conTelefono}</p></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-blue-500/30" onClick={() => setFilter(filter==="email"?"todos":"email")}><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con email</p><p className="text-2xl font-bold text-blue-400">{result.stats.conEmail}</p></div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-purple-500/30" onClick={() => setFilter(filter==="web"?"todos":"web")}><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con web</p><p className="text-2xl font-bold text-purple-400">{result.stats.conWeb}</p></div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1.5">
            {(["todos","telefono","email","web"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${filter===f?"bg-indigo-500/15 text-indigo-400 border-indigo-500/30":"bg-slate-900/40 text-slate-600 border-slate-800/60 hover:text-white"}`}>
                {f==="todos"?`Todos (${result.stats.total})`:f==="telefono"?`Tel (${result.stats.conTelefono})`:f==="email"?`Email (${result.stats.conEmail})`:`Web (${result.stats.conWeb})`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {hasSaved ? "Actualizar" : "Guardar todas"}
            </button>
            <button onClick={exportCSV} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-30">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-slate-600 uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-left font-bold">Estado</th>
                  <th className="px-3 py-2.5 text-left font-bold"><Building2 className="w-3 h-3 inline mr-1" />Nombre</th>
                  <th className="px-3 py-2.5 text-left font-bold">Tipo</th>
                  <th className="px-3 py-2.5 text-left font-bold"><Phone className="w-3 h-3 inline mr-1" />Tel</th>
                  <th className="px-3 py-2.5 text-left font-bold"><Mail className="w-3 h-3 inline mr-1" />Email</th>
                  <th className="px-3 py-2.5 text-left font-bold"><Globe className="w-3 h-3 inline mr-1" />Web</th>
                  <th className="px-3 py-2.5 text-center font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map(b => {
                  const s = savedMap[String(b.id)];
                  const estado = s?.estado || "nuevo";
                  const ec = ESTADO_COLORS[estado] || ESTADO_COLORS.nuevo;
                  return (
                    <tr key={b.id} className={`border-b border-slate-800/30 hover:bg-slate-800/20 ${estado==="descartado"?"opacity-30":estado==="visto"?"opacity-60":""}`}>
                      <td className="px-3 py-2">
                        {s ? (
                          <select value={estado} onChange={e => updateEstado(b.id, s.dbId, e.target.value)} className={`text-[10px] font-bold px-2 py-1 rounded-md border appearance-none cursor-pointer ${ec.bg} ${ec.border} text-white`}>
                            <option value="nuevo">nuevo</option><option value="visto">visto</option><option value="contactado">contactado</option><option value="descartado">descartado</option>
                          </select>
                        ) : <span className="text-[10px] text-slate-700">sin guardar</span>}
                      </td>
                      <td className="px-3 py-2 font-semibold text-white max-w-[180px] truncate">{b.nombre}</td>
                      <td className="px-3 py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">{b.tipo}</span></td>
                      <td className="px-3 py-2">{b.telefono ? <a href={`tel:${b.telefono}`} className="text-emerald-400 hover:underline">{b.telefono}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2">{b.email ? <a href={`mailto:${b.email}`} className="text-blue-400 hover:underline">{b.email}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2">{b.web ? <a href={b.web} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline max-w-[120px] block truncate">{b.web.replace(/^https?:\/\/(www\.)?/,"").split("/")[0]}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2 text-center">
                        {s ? (
                          <div className="flex items-center justify-center gap-1">
                            {estado !== "visto" && estado !== "descartado" && <button onClick={() => updateEstado(b.id, s.dbId, "visto")} title="Marcar visto" className="p-1.5 text-slate-600 hover:text-amber-400 rounded hover:bg-slate-800"><Eye className="w-3.5 h-3.5" /></button>}
                            {estado === "visto" && <button onClick={() => updateEstado(b.id, s.dbId, "nuevo")} title="Desmarcar" className="p-1.5 text-amber-400 rounded hover:bg-slate-800"><EyeOff className="w-3.5 h-3.5" /></button>}
                            {b.email && !s.emailEnviado && <button onClick={() => sendEmail(b.id, s.dbId, b.nombre, b.email)} disabled={sendingId===b.id} title="Enviar email" className="p-1.5 text-slate-600 hover:text-indigo-400 rounded hover:bg-slate-800 disabled:opacity-50">{sendingId===b.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}</button>}
                            {s.emailEnviado && <span title="Email enviado" className="p-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></span>}
                          </div>
                        ) : <span className="text-[10px] text-slate-700">—</span>}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-700 py-16 text-sm">Sin resultados</td></tr>}
                {filtered.length > 200 && <tr><td colSpan={7} className="text-center text-slate-600 py-4 text-xs">Mostrando 200 de {filtered.length}. Exporta CSV para ver todos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}
