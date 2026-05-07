"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Mail, CheckCircle2, Award, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
  };

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Introduce un correo válido";
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^[+]?[\d\s()-]{6,}$/.test(formData.telefono)) {
      newErrors.telefono = "Introduce un teléfono válido";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Ha ocurrido un error. Inténtalo de nuevo.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setServerError("Error de conexión. Comprueba tu internet e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <main className="flex-1 relative overflow-hidden bg-white text-slate-900 selection:bg-indigo-500/20">
      
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative pt-44 pb-24 lg:pb-32 px-6 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[70%] rounded-full bg-indigo-100/60 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-50/80 blur-[120px]" />
          <div className="absolute top-[30%] right-[20%] w-[20%] h-[30%] rounded-full bg-violet-100/30 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[70vh]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="w-full lg:w-1/2 flex flex-col items-start"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Si no ahorras, no cobramos
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-[2.75rem] md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight leading-[1.08] mb-8">
              Reducimos los gastos de tu empresa.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
                Tú solo cobras.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
              Auditamos tus facturas de luz, telecomunicaciones y gastos fijos. Negociamos por ti y solo cobramos si logramos ahorrarte dinero.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/#contacto" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0">
                Solicitar Auditoría Gratis
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/como-funciona" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                ¿Cómo funciona?
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full lg:w-1/2 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-[2rem] translate-x-3 translate-y-3 opacity-15 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500" />
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/80">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
                alt="Dashboard de Análisis" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-5 left-5 right-5 md:left-6 md:right-auto bg-white/95 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Modelo</p>
                  <p className="text-xl font-extrabold text-slate-900">100% a Éxito</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────── CONTACT (NOW RIGHT AFTER HERO) ─────────────────────────── */}
      <section id="contacto" className="py-24 bg-indigo-600 relative overflow-hidden scroll-mt-20">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/30 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-3">Contacto</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Hablemos de cómo reducir tus gastos</h2>
              <p className="text-lg text-indigo-100 mb-10 leading-relaxed">
                Déjanos tus datos y un experto en optimización se pondrá en contacto contigo para realizar una evaluación preliminar sin compromiso.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Email corporativo</p>
                  <p className="font-semibold text-white text-lg">contacto@ahorrometrics.com</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl relative"
            >
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">¡Consulta enviada!</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Hemos recibido tus datos correctamente. Un experto se pondrá en contacto contigo lo antes posible.
                  </p>
                </div>
              ) : (
                <form className="relative space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.nombre ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'}`} 
                        placeholder="Juan Pérez" 
                      />
                      {errors.nombre && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.nombre}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Empresa <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.empresa}
                        onChange={(e) => handleChange("empresa", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                        placeholder="Mi Empresa S.L." 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'}`} 
                      placeholder="juan@miempresa.com" 
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.telefono ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'}`} 
                      placeholder="+34 600 000 000" 
                    />
                    {errors.telefono && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.telefono}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      ¿En qué podemos ayudarte? <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <textarea 
                      rows={3} 
                      value={formData.mensaje}
                      onChange={(e) => handleChange("mensaje", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                      placeholder="Me gustaría conocer más sobre sus servicios..." 
                    />
                  </div>

                  {serverError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold rounded-xl px-4 py-4 mt-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Consulta
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-4">
                    Al enviar este formulario, aceptas nuestra <Link href="/politica-privacidad" className="underline hover:text-indigo-600">política de privacidad</Link>.
                  </p>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────── VALUE STRIP ─────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "0€", label: "Coste Inicial" },
            { value: "25-40%", label: "Ahorro Medio" },
            { value: "100%", label: "Modelo a Éxito" },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              key={i}
              className="flex items-center gap-4"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-sm text-slate-500 font-medium text-left leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── ABOUT / TRUST ─────────────────────────── */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 relative group"
            >
               <div className="absolute inset-0 bg-indigo-100 rounded-3xl -translate-x-3 -translate-y-3 group-hover:-translate-x-5 group-hover:-translate-y-5 transition-transform duration-500" />
               <img 
                 src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000" 
                 alt="Reunión de Optimización" 
                 className="relative z-10 w-full h-[480px] object-cover rounded-3xl shadow-lg" 
               />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 space-y-7"
            >
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Quiénes Somos</p>
              <h2 className="text-3xl md:text-[2.5rem] font-bold text-slate-900 leading-snug">Tu escudo contra los sobrecostes ocultos</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                AhorroMetrics nace con un objetivo muy claro: acabar con las facturas infladas que las empresas asumen por falta de tiempo para negociar. No somos intermediarios. Somos tu departamento de optimización externo.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                Revisamos tus tarifas de luz, telefonía e internet, peleamos por los mejores precios del mercado y blindamos tus contratos para que no haya sorpresas a fin de mes.
              </p>
              <ul className="space-y-4 pt-2">
                {["Atención 100% personalizada", "Negociadores expertos del sector", "Ahorro garantizado por contrato"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/como-funciona" className="inline-flex items-center text-indigo-600 font-semibold hover:gap-3 gap-2 transition-all">
                  Descubre cómo trabajamos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SERVICES PREVIEW ─────────────────────────── */}
      <section className="py-28 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Lo Que Hacemos</p>
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-slate-900 mb-4">Optimizamos donde más duele</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Nos centramos en los tres pilares de gasto que más impactan tu cuenta de resultados.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Consumo Eléctrico", desc: "Ajustamos potencia, eliminamos penalizaciones y negociamos los mejores precios KWh del mercado.", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600" },
              { title: "Telecomunicaciones", desc: "Auditamos líneas móviles, fibra y centralitas para eliminar servicios fantasma y sobrecostes.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600" },
              { title: "Gastos Recurrentes", desc: "Revisamos seguros, mantenimientos y licencias de software para encontrar alternativas más baratas.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600" },
            ].map((svc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:shadow-slate-200/60 transition-all hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{svc.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{svc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/servicios" className="inline-flex items-center text-indigo-600 font-semibold hover:gap-3 gap-2 transition-all">
              Ver todos los servicios en detalle
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA BANNER ─────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-slate-900 rounded-[2.5rem] px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-indigo-500/30">
                <Award className="w-4 h-4" />
                Oferta de lanzamiento activa
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">¿Listo para pagar solo lo justo?</h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
                Tu auditoría es completamente gratuita. Si no encontramos ahorro, no te cuesta nada. Sin letras pequeñas.
              </p>
              <Link href="/#contacto" className="inline-flex items-center justify-center px-10 py-5 text-base font-bold text-slate-900 bg-white rounded-full hover:bg-indigo-50 transition-all shadow-2xl hover:scale-[1.03] active:scale-100 duration-200">
                Solicitar Auditoría Gratis
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
