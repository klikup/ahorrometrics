"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/servicios", label: "Servicios" },
  { href: "/beneficios", label: "Beneficios" },
  { href: "/como-funciona", label: "Cómo Funciona" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <>
      {/* Promo Banner */}
      {bannerVisible && (
        <div className="fixed w-full z-[60] top-0 bg-indigo-600 text-white text-center text-sm font-medium py-2.5 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
            <Gift className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">🎉 <strong>Oferta de lanzamiento:</strong> Los primeros clientes disfrutarán de condiciones exclusivas.</span>
            <span className="sm:hidden"><strong>Oferta de lanzamiento</strong> · Condiciones exclusivas para los primeros clientes</span>
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Cerrar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed w-full z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${bannerVisible ? 'top-[42px]' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" onClick={() => setIsOpen(false)} className="shrink-0">
            <Image
              src="/logo.png"
              alt="AhorroMetrics Logo"
              width={170}
              height={42}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4">
              <Link href="/#contacto" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-px">
                Contactar
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-20 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="md:hidden bg-white border-b border-slate-200 shadow-2xl absolute w-full"
              >
                <div className="flex flex-col px-6 py-6 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3.5 px-4 rounded-xl text-slate-700 font-semibold text-base hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 pb-2">
                    <Link
                      href="/#contacto"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-4 bg-indigo-600 text-white text-center rounded-xl shadow-md font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Contactar
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
