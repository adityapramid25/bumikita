'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard, { AuthMode } from '@/src/components/auth/AuthCard';
import { ArrowLeft, X, ShieldCheck, Leaf } from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode') as AuthMode | null;
  const defaultMode: AuthMode = modeParam === 'register' ? 'register' : 'login';

  return (
    <main className="fixed inset-0 z-[100] w-screen h-screen bg-[#F5F2ED] overflow-y-auto flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-6">
      {/* Ambient Blur Orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-0" />

      {/* Top Header with Tactile Dismiss & Close Buttons */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-20 mb-4 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF8F5] text-xs sm:text-sm font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#357A59]" />
          <span>← Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-white text-[#357A59] text-xs font-bold shadow-clay-sm">
            <ShieldCheck className="w-4 h-4 text-[#357A59]" />
            <span>Supabase Auth & Database</span>
          </div>

          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-card border border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Tutup & Kembali"
          >
            <X className="w-5 h-5 text-[#1A4D3A]" />
          </Link>
        </div>
      </header>

      {/* Main Center Auth Container */}
      <div className="flex-1 flex items-center justify-center my-auto z-10 py-4">
        <AuthCard defaultMode={defaultMode} isModal={false} />
      </div>

      {/* Footer Minimal Strip */}
      <footer className="max-w-5xl w-full mx-auto text-center pt-4 pb-2 text-xs text-[#1A4D3A]/50 z-10 shrink-0 flex items-center justify-center gap-2">
        <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
        <span>© 2026 BumiKita — Platform Upcycle & Ekonomi Sirkular Pelajar Indonesia.</span>
      </footer>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 w-screen h-screen bg-[#F5F2ED] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#357A59] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
