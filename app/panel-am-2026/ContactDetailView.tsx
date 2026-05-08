"use client";
import { useState, useRef } from "react";
import { X, Trash2, CheckCircle2, RefreshCw, UploadCloud, FileText, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { ESTADOS } from "./page";
import DetailServices from "./DetailServices";

export default function ContactDetailView({
  sel,
  selAud,
  setSelAud,
  setPage,
  setSelId,
  delContact,
  saveAud,
  saving,
  saved,
  tarifas
}: any) {
  const [detailMode, setDetailMode] = useState<"servicios" | "observaciones" | "facturas">("servicios");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeInvoiceIndex, setActiveInvoiceIndex] = useState(0);

  let facturas: string[] = [];
  if (selAud.facturaUrl) {
    if (selAud.facturaUrl.startsWith("[")) {
      try { facturas = JSON.parse(selAud.facturaUrl); } catch {}
    } else {
      facturas = [selAud.facturaUrl];
    }
  }
  const activeInvoiceUrl = facturas[activeInvoiceIndex] || "";

  const analyzeInvoice = async (fileUrl: string) => {
    setAnalyzing(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/admin/analyze-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
      } else {
        setAiError(json.error || "No se pudo analizar la factura");
      }
    } catch {
      setAiError("Error de conexión al analizar factura");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAiData = () => {
    if (!aiResult) return;
    const tipo = aiResult.tipo?.toLowerCase() || "";

    if (tipo.includes("electri")) {
      const elecData = JSON.stringify({
        proveedor_actual: aiResult.proveedor_actual || "",
        plan_actual: aiResult.plan_actual || "",
        coste_mensual: aiResult.coste_mensual || "",
        consumo_kwh: aiResult.consumo_kwh || "",
        potencia_kw: aiResult.potencia_kw || "",
        notas: `[IA] Titular: ${aiResult.titular || "N/D"} | Periodo: ${aiResult.periodo_facturacion || "N/D"} | CUPS: ${aiResult.cups_o_referencia || "N/D"}${aiResult.notas ? " | " + aiResult.notas : ""}`,
      });
      setSelAud((prev: any) => ({ ...prev, Electricidad: elecData }));
    } else if (tipo.includes("teleco")) {
      const telData = JSON.stringify({
        proveedor_actual: aiResult.proveedor_actual || "",
        plan_actual: aiResult.plan_actual || "",
        coste_mensual: aiResult.coste_mensual || "",
        num_lineas: aiResult.num_lineas || "",
        notas: `[IA] Titular: ${aiResult.titular || "N/D"} | Periodo: ${aiResult.periodo_facturacion || "N/D"} | Ref: ${aiResult.cups_o_referencia || "N/D"}${aiResult.notas ? " | " + aiResult.notas : ""}`,
      });
      setSelAud((prev: any) => ({ ...prev, Telecom: telData }));
    } else {
      const otrosData = JSON.stringify({
        proveedor_actual: aiResult.proveedor_actual || "",
        plan_actual: aiResult.plan_actual || "",
        coste_mensual: aiResult.coste_mensual || "",
        notas: `[IA] Tipo: ${aiResult.tipo || "N/D"} | Titular: ${aiResult.titular || "N/D"} | ${aiResult.notas || ""}`,
      });
      setSelAud((prev: any) => ({ ...prev, OtrosGastos: otrosData }));
    }

    setAiResult(null);
    setDetailMode("servicios");
    // Trigger save
    setTimeout(() => document.getElementById("btn-guardar")?.click(), 100);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const newFacturas = [...facturas, data.url];
        setSelAud((prev: any) => ({ ...prev, facturaUrl: JSON.stringify(newFacturas) }));
        setActiveInvoiceIndex(newFacturas.length - 1);
        // Auto-analyze with AI
        analyzeInvoice(data.url);
        // Trigger save
        setTimeout(() => document.getElementById("btn-guardar")?.click(), 100);
      } else {
        alert("Error al subir la factura");
      }
    } catch {
      alert("Error de conexión al subir factura");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteInvoice = (idx: number) => {
    if (!confirm("¿Eliminar esta factura permanentemente?")) return;
    const newFacturas = facturas.filter((_, i) => i !== idx);
    setSelAud((prev: any) => ({ ...prev, facturaUrl: newFacturas.length ? JSON.stringify(newFacturas) : "" }));
    setActiveInvoiceIndex(Math.max(0, idx - 1));
    setTimeout(() => document.getElementById("btn-guardar")?.click(), 100);
    setAiResult(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <button onClick={() => { setPage("contacts"); setSelId(null); setSelAud(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-800 px-4 py-2 rounded-xl">
          <X className="w-4 h-4" /> Volver al CRM
        </button>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</span>}
          <button id="btn-guardar" onClick={saveAud} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Info & Status */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => delContact(sel.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl font-bold text-indigo-400 mb-4 shadow-inner">
                {sel.Nombre.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white">{sel.Nombre}</h2>
              <p className="text-sm text-indigo-400 font-medium mt-1">{sel.Empresa || "Sin Empresa"}</p>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Email</p>
                <p className="text-sm font-medium text-slate-300 break-all">{sel.Email}</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Teléfono</p>
                <p className="text-sm font-medium text-slate-300">{sel.Telefono || "No proporcionado"}</p>
              </div>
              {sel.Notas && (
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Nota inicial del cliente</p>
                  <p className="text-xs text-slate-400 italic">&quot;{sel.Notas}&quot;</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Estado del Lead</h3>
            <div className="flex flex-col gap-2">
              {ESTADOS.map(e => (
                <button 
                  key={e.key} 
                  onClick={() => setSelAud((prev: any) => prev ? { ...prev, Estado: e.key } : prev)} 
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl border transition-all ${selAud.Estado === e.key ? `${e.bg} ${e.text} ${e.border} ring-2 ring-current ring-offset-2 ring-offset-slate-950` : 'bg-slate-950/40 text-slate-500 border-slate-800/60 hover:border-slate-700 hover:text-slate-300'}`}
                >
                  {e.label}
                  {selAud.Estado === e.key && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Workspace */}
        <div className="xl:col-span-2 space-y-6">
          {/* Workspace Tabs */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md sticky top-0 z-10 overflow-x-auto">
            {([
              ["servicios", "Comparador y Ahorro"],
              ["facturas", "Facturas (PDF)"],
              ["observaciones", "Notas Internas"]
            ] as const).map(([k, l]) => (
              <button 
                key={k} 
                onClick={() => setDetailMode(k)} 
                className={`flex-1 min-w-[120px] px-4 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${detailMode === k ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Workspace Content */}
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-2 sm:p-6 min-h-[500px]">
            {detailMode === "servicios" && (
              <DetailServices aud={selAud} setAud={setSelAud} tarifas={tarifas} />
            )}

            {detailMode === "facturas" && (
              <div className="space-y-6">
                {/* AI Analysis Banner */}
                {analyzing && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-300">Analizando factura con IA...</p>
                      <p className="text-xs text-purple-400/70 mt-0.5">Gemini está leyendo el documento y extrayendo los datos del cliente</p>
                    </div>
                    <RefreshCw className="w-5 h-5 text-purple-400 animate-spin ml-auto shrink-0" />
                  </div>
                )}

                {aiError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{aiError}</p>
                    {activeInvoiceUrl && (
                      <button onClick={() => analyzeInvoice(activeInvoiceUrl)} className="ml-auto px-3 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg hover:bg-red-500/30">
                        Reintentar
                      </button>
                    )}
                  </div>
                )}

                {/* AI Results Card */}
                {aiResult && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Datos Detectados por IA</p>
                          <p className="text-xs text-purple-400">Tipo: {aiResult.tipo || "Desconocido"}</p>
                        </div>
                      </div>
                      <button onClick={() => setAiResult(null)} className="p-1.5 text-slate-500 hover:text-white rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ["Proveedor", aiResult.proveedor_actual],
                        ["Plan/Tarifa", aiResult.plan_actual],
                        ["Coste Mensual", aiResult.coste_mensual ? `${aiResult.coste_mensual}€` : ""],
                        ["Consumo (kWh)", aiResult.consumo_kwh],
                        ["Potencia (kW)", aiResult.potencia_kw],
                        ["Nº Líneas", aiResult.num_lineas],
                        ["Titular", aiResult.titular],
                        ["Periodo", aiResult.periodo_facturacion],
                        ["CUPS/Ref", aiResult.cups_o_referencia],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label as string} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-400/60 mb-1">{label as string}</p>
                          <p className="text-sm font-semibold text-white truncate">{value as string}</p>
                        </div>
                      ))}
                    </div>

                    {aiResult.notas && (
                      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-purple-400/60 mb-1">Observaciones de la IA</p>
                        <p className="text-xs text-slate-400">{aiResult.notas}</p>
                      </div>
                    )}

                    <button 
                      onClick={applyAiData} 
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Aplicar Datos al Comparador de Ahorro
                    </button>
                  </div>
                )}

                {!facturas.length ? (
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/50 hover:bg-indigo-500/5 rounded-3xl p-12 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-20 h-20 bg-slate-800 group-hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                      {uploading ? <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /> : <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{uploading ? "Subiendo factura..." : "Subir Factura del Cliente"}</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Arrastra aquí el PDF o imagen de la factura de luz o telecomunicaciones, o haz clic para seleccionar.</p>
                    <p className="text-purple-400/60 text-xs mt-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> La IA detectará automáticamente el proveedor, plan, consumo y precio</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
                    <button disabled={uploading} className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                      Explorar Archivos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* FACTURAS LIST HEADER */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-4">
                      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                        {facturas.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setActiveInvoiceIndex(idx); setAiResult(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeInvoiceIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Factura {idx + 1}
                          </button>
                        ))}
                      </div>
                      <div className="flex shrink-0">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors whitespace-nowrap">
                          {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          {uploading ? "Subiendo..." : "Subir Otra Factura"}
                        </button>
                      </div>
                    </div>

                    {/* ACTIVE INVOICE */}
                    {activeInvoiceUrl && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">Visualizando Factura {activeInvoiceIndex + 1}</p>
                            <a href={activeInvoiceUrl.startsWith("/uploads/") ? `/api/admin${activeInvoiceUrl}` : activeInvoiceUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-0.5">
                              Ver documento original en nueva pestaña <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => analyzeInvoice(activeInvoiceUrl)} disabled={analyzing} className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-xs font-bold text-purple-400 border border-purple-500/30 rounded-lg transition-colors">
                              {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              {analyzing ? "Analizando..." : "Extraer datos con IA"}
                            </button>
                            <button onClick={() => handleDeleteInvoice(activeInvoiceIndex)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20 rounded-lg transition-colors">
                              Eliminar Factura {activeInvoiceIndex + 1}
                            </button>
                          </div>
                        </div>

                        <div className="w-full h-[600px] bg-white rounded-2xl overflow-hidden border border-slate-800">
                          {activeInvoiceUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={activeInvoiceUrl.startsWith("/uploads/") ? `/api/admin${activeInvoiceUrl}` : activeInvoiceUrl} className="w-full h-full" frameBorder="0" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 overflow-auto">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={activeInvoiceUrl.startsWith("/uploads/") ? `/api/admin${activeInvoiceUrl}` : activeInvoiceUrl} alt="Factura" className="max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {detailMode === "observaciones" && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-white">Observaciones Internas (Privadas)</label>
                  <span className="text-xs text-slate-500 font-medium">Autoguardado al salir</span>
                </div>
                <textarea 
                  rows={15} 
                  value={selAud.Notas} 
                  onChange={e => setSelAud((prev: any) => prev ? { ...prev, Notas: e.target.value } : prev)} 
                  placeholder="Escribe aquí cualquier detalle importante sobre el cliente: necesidades, comentarios de llamadas, precios de la competencia..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl px-5 py-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
