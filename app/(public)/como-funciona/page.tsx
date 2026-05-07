"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleDot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ComoFuncionaPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const steps = [
    {
      num: "01",
      title: "Nos envías tus facturas",
      description: "Solo necesitamos una copia de tus últimas facturas de luz, telecomunicaciones y otros gastos fijos. Puedes enviarlas por email o subirlas directamente. Es un proceso de 5 minutos.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    },
    {
      num: "02",
      title: "Analizamos al detalle",
      description: "Nuestro equipo revisa línea por línea cada factura. Identificamos potencias sobredimensionadas, penalizaciones injustas, servicios duplicados, líneas sin uso y tarifas desactualizadas.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    },
    {
      num: "03",
      title: "Negociamos por ti",
      description: "Con los datos en la mano, contactamos con las compañías proveedoras y negociamos las mejores condiciones del mercado. Conocemos las tarifas reales, los márgenes y las promociones que no se publicitan.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800",
    },
    {
      num: "04",
      title: "Tú ahorras, nosotros cobramos",
      description: "Te presentamos un informe con el ahorro conseguido. Solo cobramos un porcentaje del dinero que efectivamente te hemos ahorrado. Si el ahorro es cero, nuestro servicio te sale gratis.",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <main className="flex-1 pt-32 pb-20 relative overflow-hidden bg-white selection:bg-indigo-500/30">
      
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] rounded-full bg-blue-50/60 blur-[100px]" />
      </div>

      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none -z-20 w-[60vw] flex justify-center">
        <Image src="/logo.png" alt="AhorroMetrics" width={1000} height={500} className="object-contain" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4"
          >
            Proceso Paso a Paso
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8"
          >
            Así de fácil es <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              empezar a ahorrar
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Un proceso transparente en 4 pasos donde tú no arriesgas nada y nosotros hacemos todo el trabajo pesado.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden lg:block absolute left-[50%] top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-20 lg:space-y-32">
            {steps.map((step, i) => (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                key={step.num}
                className={`flex flex-col lg:flex-row items-center gap-12 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group">
                  <div className={`absolute inset-0 rounded-3xl transition-transform duration-500 ${i % 2 === 0 ? 'bg-indigo-100 translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5' : 'bg-blue-100 -translate-x-3 translate-y-3 group-hover:-translate-x-5 group-hover:translate-y-5'}`} />
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="relative z-10 w-full h-72 md:h-80 object-cover rounded-3xl shadow-lg" 
                  />
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 relative">
                  {/* Step Number Dot - on the timeline */}
                  <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 items-center justify-center" style={{ [i % 2 === 0 ? 'left' : 'right']: '-3.25rem' }}>
                    <CircleDot className="w-6 h-6 text-indigo-600 bg-white" />
                  </div>

                  <span className="inline-block text-7xl font-black text-indigo-100 leading-none mb-2 select-none">{step.num}</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-lg text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">¿Te convence? Solo faltas tú.</h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto mb-10">
            El primer paso lo das tú enviándonos tus facturas. Todo lo demás corre de nuestra cuenta.
          </p>
          <Link href="/#contacto" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5">
            Solicitar Auditoría Gratis
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
