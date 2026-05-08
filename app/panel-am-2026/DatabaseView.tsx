"use client";
import { useState, useEffect } from "react";
import { RefreshCw, Database, Table2, Hash, User, Mail, Phone, Building2, FileText, Calendar, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";

interface DbStats {
  contacts: number;
  auditorias: number;
  activos: number;
  inactivos: number;
  porEstado: Record<string, number>;
}

interface DbContact {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  activo: boolean;
  notas: string;
  created_at: string;
  updated_at: string;
}

interface DbAuditoria {
  id: number;
  nombre: string;
  contacto_id: number;
  estado: string;
  fecha_contacto: string;
  ahorro_total: string;
  electricidad: string;
  telecom: string;
  otros_gastos: string;
  notas: string;
  created_at: string;
  updated_at: string;
}

interface DbData {
  stats: DbStats;
  tables: {
    contacts: DbContact[];
    auditorias: DbAuditoria[];
  };
}

export default function DatabaseView() {
  const [data, setData] = useState<DbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTable, setActiveTable] = useState<"contacts" | "auditorias">("contacts");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/database");
      if (!res.ok) throw new Error("Error al cargar datos");
      setData(await res.json());
    } catch {
      setError("No se pudieron cargar los datos de la base de datos. Verifica que PostgreSQL esté configurado.");
    } finally {
      setLoading(false);
    }
  };

  const [clearing, setClearing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const clearDatabase = async () => {
    if (!confirm("⚠️ ¡ADVERTENCIA EXTREMA!\n\n¿Estás completamente seguro de que quieres ELIMINAR TODOS LOS DATOS de todas las tablas?\n\nEsta acción es irreversible y los datos reales se perderán para siempre.")) return;
    
    // Double confirmation for extreme safety
    if (!confirm("¿ÚLTIMA CONFIRMACIÓN?\nPresiona OK para borrar todos los datos definitivamente.")) return;

    setClearing(true);
    try {
      const res = await fetch("/api/admin/database/clear", { method: "POST" });
      if (!res.ok) throw new Error("Error al limpiar la base de datos");
      alert("¡Base de datos limpiada con éxito! Ya puedes empezar a recibir datos reales.");
      fetchData(); // Refresh to show 0
    } catch {
      alert("Hubo un error al intentar limpiar la base de datos.");
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const estadoColors: Record<string, string> = {
    nuevo: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    contactado: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    auditoria: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    propuesta: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    ganado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    perdido: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando datos de la base de datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium mb-1">Error de conexion</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Contactos</p>
          </div>
          <p className="text-3xl font-bold text-white">{data.stats.contacts}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Auditorias</p>
          </div>
          <p className="text-3xl font-bold text-white">{data.stats.auditorias}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Activos</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{data.stats.activos}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Inactivos</p>
          </div>
          <p className="text-3xl font-bold text-red-400">{data.stats.inactivos}</p>
        </div>
      </div>

      {/* Estado breakdown */}
      {Object.keys(data.stats.porEstado).length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Distribucion por Estado</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.stats.porEstado).map(([estado, count]) => (
              <span
                key={estado}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${estadoColors[estado] || "bg-slate-800 text-slate-400 border-slate-700"}`}
              >
                {estado}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table selector */}
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <button
          onClick={() => setActiveTable("contacts")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${activeTable === "contacts" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-white"}`}
        >
          <User className="w-3.5 h-3.5" />
          contacts ({data.tables.contacts.length})
        </button>
        <button
          onClick={() => setActiveTable("auditorias")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${activeTable === "auditorias" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "text-slate-600 hover:text-white"}`}
        >
          <Table2 className="w-3.5 h-3.5" />
          auditorias ({data.tables.auditorias.length})
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={clearDatabase} 
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
          >
            {clearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {clearing ? "Borrando..." : "Limpiar BD"}
          </button>
          <button onClick={fetchData} className="p-2.5 text-slate-600 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      {activeTable === "contacts" && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800/60 flex items-center gap-2">
            <Table2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tabla: contacts</span>
            <span className="text-[10px] text-slate-700 ml-auto">{data.tables.contacts.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left font-bold"><Hash className="w-3 h-3 inline mr-1" />id</th>
                  <th className="px-4 py-2.5 text-left font-bold"><User className="w-3 h-3 inline mr-1" />nombre</th>
                  <th className="px-4 py-2.5 text-left font-bold"><Mail className="w-3 h-3 inline mr-1" />email</th>
                  <th className="px-4 py-2.5 text-left font-bold"><Phone className="w-3 h-3 inline mr-1" />telefono</th>
                  <th className="px-4 py-2.5 text-left font-bold"><Building2 className="w-3 h-3 inline mr-1" />empresa</th>
                  <th className="px-4 py-2.5 text-left font-bold">activo</th>
                  <th className="px-4 py-2.5 text-left font-bold"><Calendar className="w-3 h-3 inline mr-1" />created_at</th>
                </tr>
              </thead>
              <tbody>
                {data.tables.contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-indigo-400">{c.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{c.nombre}</td>
                    <td className="px-4 py-2.5 text-slate-400">{c.email}</td>
                    <td className="px-4 py-2.5 text-slate-400">{c.telefono}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.empresa || "—"}</td>
                    <td className="px-4 py-2.5">
                      {c.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" />true</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" />false</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-[10px]">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
                {data.tables.contacts.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-slate-700 py-12">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auditorias Table */}
      {activeTable === "auditorias" && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800/60 flex items-center gap-2">
            <Table2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tabla: auditorias</span>
            <span className="text-[10px] text-slate-700 ml-auto">{data.tables.auditorias.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left font-bold"><Hash className="w-3 h-3 inline mr-1" />id</th>
                  <th className="px-4 py-2.5 text-left font-bold">nombre</th>
                  <th className="px-4 py-2.5 text-left font-bold">contacto_id</th>
                  <th className="px-4 py-2.5 text-left font-bold">estado</th>
                  <th className="px-4 py-2.5 text-left font-bold">ahorro_total</th>
                  <th className="px-4 py-2.5 text-left font-bold">electricidad</th>
                  <th className="px-4 py-2.5 text-left font-bold">telecom</th>
                  <th className="px-4 py-2.5 text-left font-bold">notas</th>
                  <th className="px-4 py-2.5 text-left font-bold"><Calendar className="w-3 h-3 inline mr-1" />created_at</th>
                </tr>
              </thead>
              <tbody>
                {data.tables.auditorias.map((a) => (
                  <tr key={a.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-purple-400">{a.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{a.nombre || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-indigo-400">{a.contacto_id}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${estadoColors[a.estado] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-400">{a.ahorro_total ? `${a.ahorro_total}€` : "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-[150px] truncate">{a.electricidad || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-[150px] truncate">{a.telecom || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-[150px] truncate">{a.notas || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-[10px]">{formatDate(a.created_at)}</td>
                  </tr>
                ))}
                {data.tables.auditorias.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-slate-700 py-12">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
