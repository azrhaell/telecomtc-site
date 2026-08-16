import type { Metadata } from 'next';
import Script from 'next/script';
import { Bree_Serif, Montserrat } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const breeSerif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bree-serif',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TC TELECOM – Parceiro Autorizado Vivo Empresas',
    template: '%s – TC TELECOM',
  },
  description:
    'TC Telecom é o maior parceiro autorizado Vivo Empresas do Rio de Janeiro. Vivo Móvel, Vivo Fibra, Vivo Tech e soluções de fixa avançada para o seu negócio.',
  alternates: { canonical: './' },
  other: {
    'facebook-domain-verification': 'esf9tpilmeogkrjmgleuxpo75kv6y8',
  },
  icons: {
    icon: [
      { url: '/wp-content/uploads/2022/02/cropped-vivo-1-1-32x32.png', sizes: '32x32' },
      { url: '/wp-content/uploads/2022/02/cropped-vivo-1-1-192x192.png', sizes: '192x192' },
    ],
    apple: '/wp-content/uploads/2022/02/cropped-vivo-1-1-180x180.png',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${breeSerif.variable} ${montserrat.variable}`}>
      <body className="flex min-h-screen flex-col font-[var(--font-montserrat)] text-zinc-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />

        {/* RD Station — loader de automação de marketing (carregado em todo o site na versão anterior) */}
        <Script
          src="https://d335luupugsy2.cloudfront.net/js/loader-scripts/1d67f0f8-3a7b-4474-8daa-846e9ff074b1-loader.js"
          strategy="afterInteractive"
        />

        {/* Google tag (gtag.js) — GA4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-0FFBNFM94W" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0FFBNFM94W');
          `}
        </Script>
      </body>
    </html>
  );
}
