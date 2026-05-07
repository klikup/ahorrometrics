"use client";
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Phone, Mail, Globe, Download, RefreshCw, Building2, AlertCircle, ChevronDown, X } from "lucide-react";

interface Business {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  lat: number;
  lon: number;
}

interface SearchResult {
  location: { name: string; lat: number; lon: number; radiusKm: number };
  stats: { total: number; conTelefono: number; conEmail: number; conWeb: number };
  results: Business[];
}

// Dynamic imports for Leaflet (client-side only)
let L: typeof import("leaflet") | null = null;

export default function ScraperView() {
  const [localidad, setLocalidad] = useState("");
  const [radio, setRadio] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [filter, setFilter] = useState<"todos" | "telefono" | "email" | "web">("todos");
  const [mapReady, setMapReady] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [useMap, setUseMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!useMap || mapReady) return;

    const initMap = async () => {
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

      const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6); // Spain center
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      // Markers layer for business results
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng: lon } = e.latlng;
        setMapCoords({ lat, lon });

        // Update/create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L!.marker([lat, lon]).addTo(map);
        }
        markerRef.current.bindPopup(`<b>Buscar aqui</b><br>${lat.toFixed(4)}, ${lon.toFixed(4)}`).openPopup();

        // Update/create radius circle
        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lon]);
          circleRef.current.setRadius(radio * 1000);
        } else {
          circleRef.current = L!.circle([lat, lon], {
            radius: radio * 1000,
            color: "#6366f1",
            fillColor: "#6366f1",
            fillOpacity: 0.1,
            weight: 2,
          }).addTo(map);
        }
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      // Fix map size after render
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        markersLayerRef.current = null;
        setMapReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMap]);

  // Update circle radius when radio changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radio * 1000);
    }
  }, [radio]);

  // Show business markers on map when results arrive
  useEffect(() => {
    if (!result || !markersLayerRef.current || !L) return;
    markersLayerRef.current.clearLayers();

    const businessIcon = L.divIcon({
      html: `<div style="background:#6366f1;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    for (const b of result.results) {
      if (b.lat && b.lon) {
        const marker = L.marker([b.lat, b.lon], { icon: businessIcon });
        marker.bindPopup(`
          <b>${b.nombre}</b><br>
          <small>${b.tipo}</small><br>
          ${b.telefono ? `📞 ${b.telefono}<br>` : ""}
          ${b.email ? `📧 ${b.email}<br>` : ""}
          ${b.direccion ? `📍 ${b.direccion}` : ""}
        `);
        markersLayerRef.current!.addLayer(marker);
      }
    }
  }, [result]);

  const handleSearch = async () => {
    if (!useMap && !localidad.trim()) return;
    if (useMap && !mapCoords) {
      setError("Haz clic en el mapa para seleccionar una ubicacion");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body = useMap
        ? { lat: mapCoords!.lat, lon: mapCoords!.lon, radio }
        : { localidad, radio };

      const res = await fetch("/api/admin/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error en la busqueda");
      }

      const data = await res.json();
      setResult(data);

      // Center map on results
      if (mapInstanceRef.current && data.location) {
        mapInstanceRef.current.setView([data.location.lat, data.location.lon], getZoomForRadius(radio));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getZoomForRadius = (km: number): number => {
    if (km <= 1) return 15;
    if (km <= 3) return 13;
    if (km <= 5) return 12;
    if (km <= 10) return 11;
    if (km <= 20) return 10;
    return 9;
  };

  const filtered = result?.results.filter((b) => {
    if (filter === "telefono") return !!b.telefono;
    if (filter === "email") return !!b.email;
    if (filter === "web") return !!b.web;
    return true;
  }) || [];

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = "Nombre,Tipo,Direccion,Telefono,Email,Web\n";
    const rows = filtered.map((b) =>
      `"${b.nombre}","${b.tipo}","${b.direccion}","${b.telefono}","${b.email}","${b.web}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `empresas_${result?.location.name.split(",")[0] || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search Mode Toggle */}
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <button
          onClick={() => setUseMap(false)}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${!useMap ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-white"}`}
        >
          <Search className="w-3.5 h-3.5" /> Buscar por localidad
        </button>
        <button
          onClick={() => setUseMap(true)}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${useMap ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-white"}`}
        >
          <MapPin className="w-3.5 h-3.5" /> Seleccionar en mapa
        </button>
      </div>

      {/* Search Controls */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {!useMap ? (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Localidad</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ej: Sevilla, Madrid, Malaga..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                Ubicacion seleccionada
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                {mapCoords ? (
                  <span className="text-white">
                    {mapCoords.lat.toFixed(4)}, {mapCoords.lon.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-slate-700">Haz clic en el mapa para seleccionar</span>
                )}
              </div>
            </div>
          )}

          <div className="w-full lg:w-44">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
              Radio ({radio} km)
            </label>
            <div className="relative">
              <select
                value={radio}
                onChange={(e) => setRadio(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/10"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Buscando...</>
              ) : (
                <><Search className="w-4 h-4" /> Buscar empresas</>
              )}
            </button>
          </div>
        </div>

        {/* Map */}
        {useMap && (
          <div className="mt-4">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
            <div
              ref={mapRef}
              className="w-full h-[350px] rounded-xl border border-slate-800 overflow-hidden"
              style={{ zIndex: 1 }}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
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
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/30" onClick={() => setFilter(filter === "telefono" ? "todos" : "telefono")}>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con telefono</p>
              <p className="text-2xl font-bold text-emerald-400">{result.stats.conTelefono}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-blue-500/30" onClick={() => setFilter(filter === "email" ? "todos" : "email")}>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con email</p>
              <p className="text-2xl font-bold text-blue-400">{result.stats.conEmail}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer hover:border-purple-500/30" onClick={() => setFilter(filter === "web" ? "todos" : "web")}>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Con web</p>
              <p className="text-2xl font-bold text-purple-400">{result.stats.conWeb}</p>
            </div>
          </div>

          {/* Filter + Export */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["todos", "telefono", "email", "web"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === f ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "bg-slate-900/40 text-slate-600 border-slate-800/60 hover:text-white"}`}
                >
                  {f === "todos" ? `Todos (${result.stats.total})` :
                   f === "telefono" ? `Con tel. (${result.stats.conTelefono})` :
                   f === "email" ? `Con email (${result.stats.conEmail})` :
                   `Con web (${result.stats.conWeb})`}
                </button>
              ))}
            </div>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-30"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-[10px] text-slate-600 uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-bold"><Building2 className="w-3 h-3 inline mr-1" />Nombre</th>
                    <th className="px-4 py-2.5 text-left font-bold">Tipo</th>
                    <th className="px-4 py-2.5 text-left font-bold"><MapPin className="w-3 h-3 inline mr-1" />Direccion</th>
                    <th className="px-4 py-2.5 text-left font-bold"><Phone className="w-3 h-3 inline mr-1" />Telefono</th>
                    <th className="px-4 py-2.5 text-left font-bold"><Mail className="w-3 h-3 inline mr-1" />Email</th>
                    <th className="px-4 py-2.5 text-left font-bold"><Globe className="w-3 h-3 inline mr-1" />Web</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-white max-w-[200px] truncate">{b.nombre}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {b.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-[200px] truncate">{b.direccion || "—"}</td>
                      <td className="px-4 py-2.5">
                        {b.telefono ? (
                          <a href={`tel:${b.telefono}`} className="text-emerald-400 hover:underline font-medium">{b.telefono}</a>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {b.email ? (
                          <a href={`mailto:${b.email}`} className="text-blue-400 hover:underline">{b.email}</a>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {b.web ? (
                          <a href={b.web} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline truncate max-w-[150px] block">
                            {b.web.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                          </a>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-700 py-16 text-sm">
                        {result.stats.total === 0 ? "No se encontraron empresas en esta zona" : "No hay resultados con este filtro"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
