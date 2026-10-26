import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";

import { EVENT } from "@/config/event";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${EVENT.hostName} · Aniversário ${EVENT.dateShort}`,
    template: `%s · ${EVENT.hostName}`,
  },
  description: `Aniversário de ${EVENT.hostName} em ${EVENT.dateLabel}, ${EVENT.timeLabel.toLowerCase()}, em Aparecida de Goiânia. Piscina, churrasco e boa companhia. Confirme sua presença.`,
  applicationName: `Aniversário de ${EVENT.hostName}`,
  keywords: [
    "aniversário",
    EVENT.hostName,
    "convite digital",
    "piscina",
    "churrasco",
    "Aparecida de Goiânia",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: `Aniversário de ${EVENT.hostName}`,
    title: `${EVENT.hostName} · Aniversário ${EVENT.dateShort}`,
    description: `${EVENT.dateHeroLine} · ${EVENT.timeHeroLine}. Piscina, churrasco e boa companhia. Confirme sua presença.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.hostName} · Aniversário ${EVENT.dateShort}`,
    description: `${EVENT.dateHeroLine} · ${EVENT.timeHeroLine}. Confirme sua presença.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#030605",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${bodoni.variable}`}>
      <body className="grain min-h-screen bg-ink text-[#eef5f1] antialiased">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-glow focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
