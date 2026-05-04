import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import CosmicBackground from '@/components/CosmicBackground';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import SidebarWrapper from '@/components/SidebarWrapper';
import {
  Plus_Jakarta_Sans,
  Playfair_Display,
  DM_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Telugu,
  Noto_Sans_Tamil,
  Noto_Sans_Gujarati
} from "next/font/google";
import "../globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AstroPinch — India's Most Precise Vedic AI Platform",
  description: "AstroPinch — India's only Vedic astrology platform where NASA-grade precision meets AI that reads your chart, not your sign. Free Kundali in 30 seconds.",
  keywords: ["Vedic Astrology", "AI Astrology", "Kundali Matching", "NASA-grade Precision", "Daily Horoscope", "AstroPinch"],
};

// ── Primary UI font: warm, modern, highly readable ──────────────────────────
const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// ── Serif/display font: elegant for titles & italic accents ─────────────────
const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

// ── Mono font: clean for data, numbers, chart values ────────────────────────
const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// ── Indic script fonts ───────────────────────────────────────────────────────
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-noto-telugu',
  display: 'swap',
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'swap',
});

const notoGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  variable: '--font-noto-gujarati',
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} className={`dark ${plusJakarta.variable} ${playfair.variable} ${dmMono.variable} ${notoDevanagari.variable} ${notoBengali.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoGujarati.variable} antialiased`}>
      <body>
        <CosmicBackground />
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <div className="min-h-screen relative overflow-hidden">
            <SidebarWrapper>
              <Breadcrumbs />
              <main className="animate-in fade-in slide-in-from-right-8 duration-300 ease-out fill-mode-both pb-24 lg:pb-0">
                {children}
              </main>
            </SidebarWrapper>
          </div>
          <BottomNav />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
