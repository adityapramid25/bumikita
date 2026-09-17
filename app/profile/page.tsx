'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import UserProfileCard from '@/src/components/auth/UserProfileCard';
import { ArrowLeft, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#357A59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full pt-10 sm:pt-14 md:pt-16 pb-16 px-4 sm:px-6">
      {/* Container */}
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            id="btn-profile-return-home"
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] text-xs font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#357A59]" />
            <span>Kembali ke Beranda</span>
          </Link>

          {user && (
            <button
              id="btn-profile-logout"
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] text-xs font-extrabold text-[#DC2626] border border-white shadow-clay-pill hover:bg-[#FDF2F2] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>

        {/* Content */}
        {user ? (
          <UserProfileCard />
        ) : (
          <div className="clay-card p-8 sm:p-10 text-center max-w-md mx-auto space-y-5 border border-white">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#1A4D3A]">
                Silakan Masuk Terlebih Dahulu
              </h2>
              <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
                Kamu perlu masuk atau mendaftar untuk mengakses informasi profil, saldo Daun Points, dan alamat pengiriman karya daur ulang.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-gradient-earth text-white font-extrabold text-sm shadow-clay-btn hover:scale-105 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Menuju Halaman Autentikasi</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
