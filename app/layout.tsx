import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AhorroMetrics | Decisiones Inteligentes, Resultados Medibles",
  description: "Optimiza los gastos de tu empresa, reduce costes operativos y mejora tus métricas con AhorroMetrics. Soluciones financieras serias y efectivas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}>
      <body className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
