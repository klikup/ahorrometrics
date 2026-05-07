"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ServiciosPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const services = [
    {
      id: "electricidad",
      title: "Optimización de Consumo Eléctrico",
      description: "Analizamos tu factura de luz al detalle. Revisamos la potencia contratada, identificamos penalizaciones ocultas y buscamos las mejores tarifas del mercado actual. Negociamos directamente con las comercializadoras para conseguirte un precio imbatible, sin que tengas que preocuparte de cortes o cambios de instalación.",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
      features: ["Ajuste exacto de potencia contratada", "Negociación de precios por KWh", "Eliminación de penalizaciones por reactiva"]
    },
    {
      id: "telecomunicaciones",
      title: "Auditoría de Telecomunicaciones",
      description: "Las facturas de internet, centralitas y líneas móviles suelen estar llenas de servicios que no utilizas o tarifas desactualizadas. Auditamos todos tus contratos de telecomunicaciones para eliminar sobrecostes y unificar servicios. Conseguimos que pagues exactamente por lo que tu negocio necesita.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      features: ["Revisión de líneas móviles y fibra", "Optimización de centralitas IP", "Baja de servicios fantasma o inactivos"]
    },
    {
      id: "recurrentes",
      title: "Revisión de Gastos Recurrentes",
      description: "Más allá de la luz y el internet, las empresas acumulan contratos de mantenimiento, seguros, licencias de software y otros gastos fijos. Hacemos un barrido completo de tus gastos operativos para detectar fugas de capital y proponerte alternativas idénticas pero mucho más económicas.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      features: ["Análisis de seguros corporativos", "Revisión de cuotas de mantenimiento", "Optimización de licencias de software"]
    }
  ];

  return (
    <main className="flex-1 pt-32 pb-20 relative overflow-hidden bg-white selection:bg-indigo-500/30">
      <div className="absolute top-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[100px] -z-10 pointer-events-none" />
      
      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none -z-20 w-[60vw] flex justify-center">
        <Image src="/logo.png" alt="AhorroMetrics" width={1000} height={500} className="object-contain" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4"
          >
            Nuestros Servicios
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 tracking-tight leading-[1.1]"
          >
            Servicios diseñados <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">para tu ahorro</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-3xl mx-auto text-xl font-light leading-relaxed"
          >
            Nos encargamos de auditar, negociar y optimizar tus facturas para que no pagues ni un céntimo de más.
          </motion.p>
        </div>

        {/* Modelo a Éxito Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 rounded-[2rem] p-8 md:p-12 mb-24 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.2),transparent_60%)] pointer-events-none" />
          <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/30 relative z-10">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Trabajamos 100% a Éxito</h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              Nuestra filosofía es simple: <strong className="text-white">Si tú no ahorras, nosotros no cobramos.</strong> Nuestro beneficio es un pequeño porcentaje del dinero que te hemos logrado ahorrar. No hay cuotas fijas, no hay costes ocultos.
            </p>
          </div>
        </motion.div>

        {/* Detailed Services */}
        <div className="space-y-28">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="w-full lg:w-1/2 relative group">
                <div className={`absolute inset-0 rounded-3xl transition-transform duration-500 ${index % 2 === 0 ? 'bg-indigo-100 translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5' : 'bg-blue-100 -translate-x-3 translate-y-3 group-hover:-translate-x-5 group-hover:translate-y-5'}`} />
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">{service.title}</h3>
                <p className="text-lg text-slate-500 leading-relaxed">
                  {service.description}
                </p>
                <div className="pt-2 space-y-4">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <Link href="/#contacto" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5">
            Quiero empezar a ahorrar ahora
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </div>
      </div>
    </main>
  );
}
