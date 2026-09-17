import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AppShell from '@/src/components/layout/AppShell';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bumikita.web.id'),
  title: {
    default: 'BumiKita — Green Market, Upcycle, & Sustainable',
    template: '%s | BumiKita',
  },
  description:
    'BumiKita: Green Market, Upcycle, & Sustainable. Platform ekonomi sirkular berbasis AI untuk mengubah sampah menjadi karya bernilai jual dan aksi nyata pelestarian lingkungan.',
  keywords: [
    'BumiKita',
    'Green Market',
    'Upcycle',
    'Sustainable',
    'Ekonomi Sirkular',
    'AI Upcycle Scanner',
    'Daur Ulang Kreatif',
    'Smartova',
    'SMK Negeri 9 Semarang',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://bumikita.web.id',
    siteName: 'BumiKita',
    title: 'BumiKita — Green Market, Upcycle, & Sustainable',
    description:
      'Ubah sampah jadi cuan dan karya bernilai dengan ekosistem Green Market, Upcycle, & Sustainable berbasis AI.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BumiKita: Green Market, Upcycle, & Sustainable',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BumiKita — Green Market, Upcycle, & Sustainable',
    description:
      'Platform ekonomi sirkular dan green market generasi muda berbasis kecerdasan buatan.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://bumikita.web.id',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BumiKita',
  alternateName: 'BumiKita — Green Market, Upcycle, & Sustainable',
  url: 'https://bumikita.web.id',
  description:
    'BumiKita: Green Market, Upcycle, & Sustainable. Platform ekonomi sirkular berbasis AI untuk mengubah sampah menjadi karya bernilai jual dan aksi nyata pelestarian lingkungan.',
  applicationCategory: 'EnvironmentalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
  },
  creator: {
    '@type': 'Organization',
    name: 'Smartova',
    url: 'https://bumikita.web.id',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#F5F2ED] text-[#1A4D3A] font-sans antialiased min-h-screen selection:bg-[#6DB677]/30 selection:text-[#1A4D3A]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
