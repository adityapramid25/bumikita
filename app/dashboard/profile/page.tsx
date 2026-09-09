'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import UserProfileCard from '@/src/components/auth/UserProfileCard';
import { ArrowLeft, ShieldCheck, MapPin, Sparkles, User, LogIn, Leaf, TreePine } from 'lucide-react';

export default function UserProfileDashboardPage() {
  const { user, profile, isLoading, isConfigured, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb & Quick Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D3A]/60">
              <Link href="/" className="hover:text-[#1A4D3A] transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-[#357A59]">Dashboard Profil & Alamat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
              Profil & Hierarki Alamat
            </h1>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
              Kelola identitas publik, alias <span className="font-bold text-[#357A59]">@handle</span>, dan alamat pengiriman pesanan Green Market & Reverse Vending di Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] text-xs font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#357A59]" />
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        {/* Auth Guard Check */}
        {!user && !isLoading ? (
          <div className="clay-card p-8 sm:p-12 border border-white/80 text-center space-y-5 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#E8F2ED] mx-auto flex items-center justify-center text-[#357A59] shadow-clay-card">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-[#1A4D3A]">
                Masuk untuk Mengakses Dashboard
              </h3>
              <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                Anda perlu masuk ke akun BumiKita untuk memperbarui alamat pengiriman Indonesia, alias publik, dan memantau koin daun Anda.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full clay-button py-3 px-6 text-xs sm:text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Buka Layar Masuk / Daftar</span>
            </button>
          </div>
        ) : (
          /* Profile & Address Component */
          <div className="space-y-6">
            <UserProfileCard />

            {/* Educational Help Card */}
            <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-white shadow-clay-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center shrink-0 shadow-clay-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#1A4D3A]">
                    Pengiriman Bebas Plastik & Drop-off Komunitas
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#1A4D3A]/60">
                    Alamat Anda digunakan oleh kurir ramah lingkungan BumiKita dan koordinasi penjemputan sampah plastik terpilah.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/market"
                  className="px-3.5 py-1.5 rounded-full bg-white text-xs font-bold text-[#357A59] border border-white shadow-clay-sm hover:scale-105 transition-transform"
                >
                  Ke Green Market
                </Link>
                <Link
                  href="/dropoff"
                  className="px-3.5 py-1.5 rounded-full bg-white text-xs font-bold text-[#1A4D3A] border border-white shadow-clay-sm hover:scale-105 transition-transform"
                >
                  Reverse Vending
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
