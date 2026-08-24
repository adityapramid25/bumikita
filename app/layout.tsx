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
  title: 'BumiKita — Green Market, AI Upcycle & Gen-Z Sustainable Hub',
  description: 'Ubah sampah jadi cuan & karya. Temukan produk streetwear upcycled, scan sampah jadi resep DIY dengan AI, dan tanam pohon nyata ber-GPS melalui misi harian.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="bg-[#F5F2ED] text-[#1A4D3A] font-sans antialiased min-h-screen selection:bg-[#6DB677]/30 selection:text-[#1A4D3A]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
