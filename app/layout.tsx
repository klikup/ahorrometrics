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

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}>
      <head>
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KH34H343');`
        }} />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KH34H343" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        }} />
        {children}
      </body>
    </html>
  );
}
