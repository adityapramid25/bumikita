'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard, { AuthMode } from '@/src/components/auth/AuthCard';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode') as AuthMode | null;
  const defaultMode: AuthMode = modeParam === 'register' ? 'register' : 'login';

  return (
    <main className="relative min-h-screen w-full bg-[#F5F2ED] text-[#1A4D3A] flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient Blur Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] text-xs font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#357A59]" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#1A4D3A]/60">
          <ShieldCheck className="w-4 h-4 text-[#357A59]" />
          <span>Enkripsi Aman & 100% Bebas Sampah Digital</span>
        </div>
      </header>

      {/* Main Center Auth Container */}
      <div className="flex-1 flex items-center justify-center my-auto z-10">
        <AuthCard defaultMode={defaultMode} />
      </div>

      {/* Footer Minimal Strip */}
      <footer className="max-w-5xl w-full mx-auto text-center pt-8 text-xs text-[#1A4D3A]/50 z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 BumiKita — Platform Upcycle & Ekonomi Sirkular Pelajar Indonesia.</p>
        <div className="flex items-center gap-4">
          <Link href="/market" className="hover:text-[#1A4D3A] transition-colors">
            Katalog Karya
          </Link>
          <span>•</span>
          <Link href="/scanner" className="hover:text-[#1A4D3A] transition-colors">
            AI Scanner
          </Link>
          <span>•</span>
          <Link href="/dropoff" className="hover:text-[#1A4D3A] transition-colors">
            Peta Reverse Vending
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#F5F2ED] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#357A59] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
