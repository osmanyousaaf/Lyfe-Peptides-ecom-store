import type { Metadata } from "next";
import { Caveat, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import PromoBar from "@/components/PromoBar";
import WelcomePopup from "@/components/WelcomePopup";
import SiteChrome from "@/components/SiteChrome";
import Tracker from "@/components/Tracker";
import Providers from "@/components/Providers";
import { getCategories, productsByCategory } from "@/lib/products";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lyfepeptidescanada.com"),
  title: {
    default: "Lyfe Peptides | Your Canadian Source for Research Peptides",
    template: "%s | Lyfe Peptides",
  },
  description:
    "Canadian manufacturer and supplier of research-grade peptides. COA with every order, 99%+ purity, same-day dispatch, free shipping over $300. For research purposes only.",
  openGraph: {
    title: "Lyfe Peptides | Your Canadian Source for Research Peptides",
    description: "Research-grade peptides made in Canada. COA with every order, same-day dispatch.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories().map((name) => ({ name, count: productsByCategory(name).length }));
  return (
    <html lang="en" className={`${jakarta.variable} ${caveat.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full">
        <Providers>
          <SiteChrome
            top={
              <>
                <PromoBar />
                <Header categories={categories} />
              </>
            }
            bottom={
              <>
                <Footer />
                <ChatWidget />
                <WelcomePopup />
              </>
            }
          >
            {children}
          </SiteChrome>
          <Tracker />
        </Providers>
      </body>
    </html>
  );
}
