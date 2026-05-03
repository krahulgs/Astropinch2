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
import { Geist, Geist_Mono, Poppins, Inter, Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Gujarati } from "next/font/google";
import "../globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AstroPinch — India's Most Precise Vedic AI Platform",
  description: "AstroPinch — India's only Vedic astrology platform where NASA-grade precision meets AI that reads your chart, not your sign. Free Kundali in 30 seconds.",
  keywords: ["Vedic Astrology", "AI Astrology", "Kundali Matching", "NASA-grade Precision", "Daily Horoscope", "AstroPinch"],
};

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-noto-telugu',
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
});

const notoGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  variable: '--font-noto-gujarati',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${notoDevanagari.variable} ${notoBengali.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoGujarati.variable} antialiased`}>
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
