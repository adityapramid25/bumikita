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
    <div className="relative min-h-screen w-full bg-[#F5F2ED] text-[#1A4D3A] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient Blur Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-10" />

      {/* Discrete Top Left Exit Link */}
      <div className="w-full max-w-lg mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] text-xs font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#357A59]" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Auth Form Container */}
      <div className="w-full max-w-lg mx-auto z-10">
        <AuthCard defaultMode={defaultMode} />
      </div>
    </div>
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
