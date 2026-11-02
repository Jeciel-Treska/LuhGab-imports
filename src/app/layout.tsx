import StoreConfigProvider from "@/components/StoreConfigProvider";
import { applyStoreOverrides } from "@/data/products";
import { loadStoreConfig } from "@/lib/storeConfig";
import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import CompareModal from "@/components/CompareModal";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Footer from "@/components/Footer";
import JsonLd, { organizationSchema } from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import TopBanner from "@/components/TopBanner";
import { SITE_NAME, SITE_URL } from "@/data/site";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const DESCRIPTION =
  "Whey protein, creatina, pré-treino e vitaminas 100% originais, nacionais e importados, com entrega para todo o Brasil. Monte seu combo e ganhe até 15% OFF.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LuhGab Imports | Suplementos de Alta Performance",
    template: `%s | ${SITE_NAME} - Suplementos de Alta Performance`,
  },
  description: DESCRIPTION,
  keywords: [
    "suplementos importados",
    "whey protein",
    "creatina",
    "pré-treino",
    "suplementos originais",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "pt_BR",
    title: "LuhGab Imports | Suplementos de Alta Performance",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "LuhGab Imports | Suplementos de Alta Performance",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const storeConfig = loadStoreConfig();
  applyStoreOverrides(storeConfig.products);
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-[#F8F9FA] font-sans text-zinc-900 antialiased">
        <JsonLd data={organizationSchema()} />
        <StoreConfigProvider config={storeConfig}>
        <Providers>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-dark"
          >
            Pular para o conteúdo
          </a>
          <TopBanner />
          <Navbar />
          <main id="conteudo">{children}</main>
          <Footer />
          <FloatingWhatsApp />
          <CartDrawer />
          <CompareModal />
        </Providers>
        </StoreConfigProvider>
      </body>
    </html>
  );
}
