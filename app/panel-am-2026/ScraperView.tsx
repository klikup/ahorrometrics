"use client";
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Phone, Mail, Globe, Download, RefreshCw, Building2, AlertCircle, ChevronDown, X, Eye, EyeOff, Send, CheckCircle2, Save } from "lucide-react";

interface Business {
  id: number; nombre: string; tipo: string; direccion: string;
  telefono: string; email: string; web: string; lat: number; lon: number;
}

interface SavedBusiness extends Business {
  dbId?: number; estado?: string; emailEnviado?: boolean; fechaEmail?: string;
}

interface SearchResult {
  location: { name: string; lat: number; lon: number; radiusKm: number };
  stats: { total: number; conTelefono: number; conEmail: number; conWeb: number };
  results: Business[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any = null;

const ESTADO_STYLES: Record<string,string> = {
  nuevo: "bg-slate-800 text-slate-400 border-slate-700",
  visto: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  contactado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  descartado: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ScraperView() {
  const [localidad, setLocalidad] = useState("");
  const [radio, setRadio] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [savedMap, setSavedMap] = useState<Record<number, SavedBusiness>>({});
  const [filter, setFilter] = useState<"todos"|"telefono"|"email"|"web">("todos");
  const [useMap, setUseMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat:number;lon:number}|null>(null);
  const [sendingId, setSendingId] = useState<number|null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!useMap || mapReady) return;
    const init = async () => {
      if (typeof window === "undefined") return;
      L = await import("leaflet");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OSM", maxZoom: 18 }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      map.on("click", (e: {latlng:{lat:number;lng:number}}) => {
        const { lat, lng: lon } = e.latlng;
        setMapCoords({ lat, lon });
        if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
        else markerRef.current = L.marker([lat, lon]).addTo(map);
        markerRef.current.bindPopup(`<b>Buscar aqui</b><br>${lat.toFixed(4)}, ${lon.toFixed(4)}`).openPopup();
        if (circleRef.current) { circleRef.current.setLatLng([lat, lon]); circleRef.current.setRadius(radio * 1000); }
        else circleRef.current = L.circle([lat, lon], { radius: radio*1000, color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.1, weight: 2 }).addTo(map);
      });
      mapInstanceRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 100);
    };
    init();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current=null; markerRef.current=null; circleRef.current=null; markersLayerRef.current=null; setMapReady(false); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMap]);

  useEffect(() => { if (circleRef.current) circleRef.current.setRadius(radio * 1000); }, [radio]);

  const handleSearch = async () => {
    if (!useMap && !localidad.trim()) return;
    if (useMap && !mapCoords) { setError("Haz clic en el mapa"); return; }
    setLoading(true); setError(""); setResult(null); setSavedMap({});
    try {
      const body = useMap ? { lat: mapCoords!.lat, lon: mapCoords!.lon, radio } : { localidad, radio };
      const res = await fetch("/api/admin/scraper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setResult(data);
      if (mapInstanceRef.current && data.location) mapInstanceRef.current.setView([data.location.lat, data.location.lon], radio <= 3 ? 13 : radio <= 5 ? 12 : radio <= 10 ? 11 : 10);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const saveAll = async () => {
    if (!result || !result.results.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/scraper/businesses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses: result.results, localidad: result.location.name.split(",")[0] }),
      });
      const d = await res.json();
      setSuccessMsg(`${d.saved} empresas guardadas`);
      setTimeout(() => setSuccessMsg(""), 3000);
      // Load saved statuses
      await loadSavedStatuses();
    } catch { setError("Error al guardar"); }
    finally { setSaving(false); }
  };

  const loadSavedStatuses = async () => {
    if (!result) return;
    const loc = result.location.name.split(",")[0];
    try {
      const res = await fetch(`/api/admin/scraper/businesses?localidad=${encodeURIComponent(loc)}`);
      const d = await res.json();
      const map: Record<number, SavedBusiness> = {};
      for (const b of d.results || []) { map[b.osmId] = { ...b, dbId: b.id }; }
      setSavedMap(map);
    } catch { /* ignore */ }
  };

  const updateEstado = async (osmId: number, dbId: number, estado: string) => {
    try {
      await fetch("/api/admin/scraper/businesses", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbId, estado }),
      });
      setSavedMap(prev => ({ ...prev, [osmId]: { ...prev[osmId], estado } }));
    } catch { /* ignore */ }
  };

  const sendEmail = async (osmId: number, dbId: number, nombre: string, email: string) => {
    if (!confirm(`Enviar email promocional a ${nombre} (${email})?`)) return;
    setSendingId(osmId);
    try {
      const res = await fetch("/api/admin/scraper/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: dbId, emailOverride: email }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSavedMap(prev => ({ ...prev, [osmId]: { ...prev[osmId], estado: "contactado", emailEnviado: true, fechaEmail: new Date().toISOString() } }));
      setSuccessMsg(`Email enviado a ${email}`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) { setError(e instanceof Error ? e.message : "Error al enviar"); }
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
    const rows = filtered.map(b => {
      const s = savedMap[b.id];
      return `"${b.nombre}","${b.tipo}","${b.direccion}","${b.telefono}","${b.email}","${b.web}","${s?.estado||"nuevo"}"`;
    }).join("\n");
    const blob = new Blob([h + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `empresas_${result?.location.name.split(",")[0]||"export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const hasSaved = Object.keys(savedMap).length > 0;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <button onClick={() => setUseMap(false)} className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${!useMap ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-white"}`}>
          <Search className="w-3.5 h-3.5" /> Buscar por localidad
        </button>
        <button onClick={() => setUseMap(true)} className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${useMap ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-white"}`}>
          <MapPin className="w-3.5 h-3.5" /> Seleccionar en mapa
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {!useMap ? (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Localidad</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input value={localidad} onChange={e => setLocalidad(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Ej: Sevilla, Madrid..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Ubicacion</label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                {mapCoords ? <span className="text-white">{mapCoords.lat.toFixed(4)}, {mapCoords.lon.toFixed(4)}</span> : <span className="text-slate-700">Haz clic en el mapa</span>}
              </div>
            </div>
          )}
          <div className="w-full lg:w-44">
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
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Buscando...</> : <><Search className="w-4 h-4" /> Buscar empresas</>}
            </button>
          </div>
        </div>
        {useMap && (
          <div className="mt-4">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
            <div ref={mapRef} className="w-full h-[350px] rounded-xl border border-slate-800 overflow-hidden" style={{ zIndex: 1 }} />
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">{successMsg}</p>
        </div>
      )}

      {/* Results */}
      {result && (<>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Ubicacion</p>
            <p className="text-xs font-semibold text-white truncate">{result.location.name.split(",")[0]}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{result.stats.total}</p>
          </div>
          {(["telefono","email","web"] as const).map(k => (
            <div key={k} className={`bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-${k==="telefono"?"emerald":k==="email"?"blue":"purple"}-500/30`} onClick={() => setFilter(filter===k?"todos":k)}>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con {k}</p>
              <p className={`text-2xl font-bold text-${k==="telefono"?"emerald":k==="email"?"blue":"purple"}-400`}>{result.stats[k==="telefono"?"conTelefono":k==="email"?"conEmail":"conWeb"]}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1.5">
            {(["todos","telefono","email","web"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter===f?"bg-indigo-500/15 text-indigo-400 border-indigo-500/30":"bg-slate-900/40 text-slate-600 border-slate-800/60 hover:text-white"}`}>
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
                  const s = savedMap[b.id];
                  const estado = s?.estado || "nuevo";
                  const dbId = s?.dbId;
                  return (
                    <tr key={b.id} className={`border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors ${estado==="visto"?"opacity-60":estado==="descartado"?"opacity-30":""}`}>
                      <td className="px-3 py-2">
                        {dbId ? (
                          <select value={estado} onChange={e => updateEstado(b.id, dbId, e.target.value)} className={`text-[10px] font-bold px-2 py-1 rounded-md border appearance-none cursor-pointer ${ESTADO_STYLES[estado]||ESTADO_STYLES.nuevo}`}>
                            <option value="nuevo">nuevo</option>
                            <option value="visto">visto</option>
                            <option value="contactado">contactado</option>
                            <option value="descartado">descartado</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-white max-w-[180px] truncate">{b.nombre}</td>
                      <td className="px-3 py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">{b.tipo}</span></td>
                      <td className="px-3 py-2">{b.telefono ? <a href={`tel:${b.telefono}`} className="text-emerald-400 hover:underline font-medium">{b.telefono}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2">{b.email ? <a href={`mailto:${b.email}`} className="text-blue-400 hover:underline">{b.email}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2">{b.web ? <a href={b.web} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline truncate max-w-[120px] block">{b.web.replace(/^https?:\/\/(www\.)?/,"").split("/")[0]}</a> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {dbId && estado !== "visto" && estado !== "descartado" && (
                            <button onClick={() => updateEstado(b.id, dbId, "visto")} title="Marcar como visto" className="p-1.5 text-slate-600 hover:text-amber-400 rounded hover:bg-slate-800">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {dbId && estado === "visto" && (
                            <button onClick={() => updateEstado(b.id, dbId, "nuevo")} title="Desmarcar" className="p-1.5 text-amber-400 hover:text-slate-400 rounded hover:bg-slate-800">
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {dbId && b.email && !s?.emailEnviado && (
                            <button onClick={() => sendEmail(b.id, dbId, b.nombre, b.email)} disabled={sendingId === b.id} title="Enviar email promo" className="p-1.5 text-slate-600 hover:text-indigo-400 rounded hover:bg-slate-800 disabled:opacity-50">
                              {sendingId === b.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {s?.emailEnviado && (
                            <span title={`Email enviado ${s.fechaEmail ? new Date(s.fechaEmail).toLocaleDateString("es-ES") : ""}`} className="p-1.5 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-700 py-16 text-sm">{result.stats.total === 0 ? "No se encontraron empresas" : "Sin resultados con este filtro"}</td></tr>}
                {filtered.length > 200 && <tr><td colSpan={7} className="text-center text-slate-600 py-4 text-xs">Mostrando 200 de {filtered.length} resultados. Usa filtros o exporta CSV para ver todos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}
