"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BeneficiosPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const benefits = [
    {
      num: "01",
      title: "Cero Riesgo",
      description: "No cobramos tarifas iniciales, estudios ni cuotas de mantenimiento. Analizamos tu caso de forma gratuita y solo ganamos un porcentaje si logramos que tú pagues menos. Tu éxito es literalmente el nuestro.",
    },
    {
      num: "02",
      title: "Ahorro Automático",
      description: "Olvídate de estar llamando a las operadoras de telefonía o entender la factura de la luz. Nosotros somos tu departamento externalizado. Hacemos el trabajo sucio mientras tú ves caer tus gastos fijos mes a mes.",
    },
    {
      num: "03",
      title: "Impacto en EBITDA",
      description: "Recortar 5.000€ en gastos operativos tiene el mismo efecto en tu cuenta de resultados que vender decenas de miles de euros más. Mejoramos tu rentabilidad de forma rápida, directa y medible.",
    },
    {
      num: "04",
      title: "Misma Calidad",
      description: "Optimizar no significa perder prestaciones. Buscamos la eficiencia: que pagues exactamente por lo que usas y necesitas, manteniendo la máxima calidad de tu fibra, líneas o suministro eléctrico.",
    }
  ];

  return (
    <main className="flex-1 pt-32 pb-20 relative overflow-hidden bg-white selection:bg-indigo-500/30">
      
      {/* Background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[150px] pointer-events-none -z-10" />

      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none -z-20 w-[60vw] flex justify-center">
        <Image src="/logo.png" alt="AhorroMetrics" width={1000} height={500} className="object-contain" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-8 border border-indigo-100"
          >
            <Sparkles className="w-4 h-4" />
            La Metodología AhorroMetrics
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8"
          >
            Aumenta el margen de <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              tu negocio sin vender más
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Invertimos los riesgos: nosotros asumimos el trabajo y la negociación. Tú simplemente disfrutas de la reducción de tus costes fijos.
          </motion.p>
        </div>

        {/* Feature Image */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full h-[350px] md:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 mb-24 relative group"
        >
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600" 
            alt="Equipo AhorroMetrics" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent flex items-end p-8 md:p-12">
             <div className="text-white max-w-xl">
               <p className="text-2xl md:text-3xl font-bold mb-2">Un equipo dedicado a ti</p>
               <p className="text-slate-200 text-base md:text-lg">Dejamos que te enfoques en crecer, mientras nosotros auditamos cada céntimo que sale de tu empresa.</p>
             </div>
          </div>
        </motion.div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {benefits.map((benefit, i) => (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              transition={{ delay: i * 0.08 }}
              key={i} 
              className="group relative bg-slate-50 p-10 md:p-12 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-colors overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-10 text-[180px] font-black text-slate-200/40 group-hover:text-indigo-100/60 transition-colors leading-none pointer-events-none select-none">
                {benefit.num}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-slate-900 mb-6">{benefit.title}</h3>
                <p className="text-lg text-slate-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-28 bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">¿Preparado para dejar de perder dinero?</h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
              Las empresas que no revisan sus contratos anualmente están regalando miles de euros a las grandes corporaciones. Recupera tu capital hoy.
            </p>
            <Link href="/#contacto" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-slate-900 bg-white rounded-full hover:bg-indigo-50 transition-colors shadow-2xl hover:scale-[1.03] active:scale-100 duration-200">
              Quiero empezar a ahorrar
              <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
