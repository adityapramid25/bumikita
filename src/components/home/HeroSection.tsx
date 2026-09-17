'use client';

import React from 'react';
import Link from 'next/link';
import { useEco } from '@/src/context/EcoContext';
import { 
  Sparkles, 
  ShoppingBag, 
  TreePine, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  RotateCcw,
  Zap,
  Globe2,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function HeroSection() {
  const { 
    co2SavedKg, 
    wasteDivertedKg, 
    treesPlanted, 
    daunPoints 
  } = useEco();

  return (
    <section className="relative w-full pt-4 pb-8 px-4 sm:px-6 overflow-hidden">
      {/* Background Subtle Organic Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#6DB677]/10 via-[#357A59]/10 to-[#FF9E20]/10 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Main Hero Card Container */}
        <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-clay-card border border-white/80 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A4D3A] tracking-tight leading-[1.15]">
                Ubah Sampah Jadi <span className="text-[#357A59] underline decoration-[#6DB677]/50 decoration-wavy decoration-2">Cuan & Karya</span>, Selamatkan Bumi.
              </h1>

              <p className="text-base sm:text-lg text-[#1A4D3A]/75 font-medium max-w-2xl leading-relaxed">
                Platform kurasi produk <span className="text-[#1A4D3A] font-bold">upcycled streetwear</span>, zero-waste campus kit, dan <span className="text-[#357A59] font-bold">AI Scanner</span> yang menyulap jeans robek, botol plastik, & sampah jadi kreasi bernilai tinggi.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  id="hero-btn-scan-ai"
                  href="/scanner"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-earth text-white font-bold text-sm sm:text-base shadow-clay-green hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-[#FAF8F5] group-hover:rotate-12 transition-transform" />
                  <span>Scan Sampah dengan AI</span>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  id="hero-btn-explore-market"
                  href="/market"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FAF8F5] text-[#1A4D3A] font-bold text-sm sm:text-base shadow-clay-button border border-white hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#357A59]" />
                  <span>Jelajahi Green Market</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-semibold text-[#1A4D3A]/70 border-t border-[#1A4D3A]/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#357A59]" />
                  <span>Zero-Plastic Packing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#357A59]" />
                  <span>Verified Student Makers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#357A59]" />
                  <span>Program Tanam Pohon Ber-GPS</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Clay Floating Matrix */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 sm:gap-4">
              {/* Tile 1: AI Scanner Quick Launch */}
              <Link
                href="/scanner"
                className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl shadow-clay-button border border-white hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF5E6] flex items-center justify-center text-[#FF9E20] mb-3 shadow-clay-sm group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 fill-[#FF9E20]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A4D3A] leading-snug">
                  AI Scanner
                </h3>
                <p className="text-xs text-[#1A4D3A]/60 mt-1">
                  Upload foto sampah & dapatkan resep DIY
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#357A59]">
                  <span>Mulai Coba</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Tile 2: Rework Fashion */}
              <Link
                href="/market"
                className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl shadow-clay-button border border-white hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] flex items-center justify-center text-[#357A59] mb-3 shadow-clay-sm group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A4D3A] leading-snug">
                  Green Market
                </h3>
                <p className="text-xs text-[#1A4D3A]/60 mt-1">
                  Denim patchwork & vintage streetwear
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#357A59]">
                  <span>Lihat Katalog</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Tile 3: Eco Quests */}
              <Link
                href="/quests"
                className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl shadow-clay-button border border-white hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4EBEB] flex items-center justify-center text-[#DC2626] mb-3 shadow-clay-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 fill-[#DC2626]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A4D3A] leading-snug">
                  Hutan & Quest
                </h3>
                <p className="text-xs text-[#1A4D3A]/60 mt-1">
                  Klaim poin Daun untuk aksi ramah lingkungan
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#357A59]">
                  <span>+50 Daun Pts</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Tile 4: Real Tree Planting */}
              <Link
                href="/quests"
                className="bg-gradient-earth p-4 sm:p-5 rounded-2xl shadow-clay-green text-white hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/25 border border-white/20 flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <TreePine className="w-5 h-5 fill-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  Hutan Nyata
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Tanam mangrove & pohon hutan ber-GPS
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-white">
                  <span>{treesPlanted} Pohon Terdaftar</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Community Impact Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-[#FAF8F5] p-4 rounded-2xl shadow-clay-card border border-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] flex items-center justify-center text-[#357A59] font-bold shadow-clay-sm flex-shrink-0">
              ♻️
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1A4D3A]/60 uppercase tracking-wider">
                Sampah Terdiversi
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#1A4D3A]">
                {wasteDivertedKg} <span className="text-xs font-bold text-[#357A59]">kg</span>
              </p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl shadow-clay-card border border-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2ED] flex items-center justify-center text-[#357A59] font-bold shadow-clay-sm flex-shrink-0">
              ☁️
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1A4D3A]/60 uppercase tracking-wider">
                Emisi CO2 Ditekan
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#1A4D3A]">
                {co2SavedKg} <span className="text-xs font-bold text-[#357A59]">kg CO2e</span>
              </p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl shadow-clay-card border border-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5E6] flex items-center justify-center text-[#FF9E20] font-bold shadow-clay-sm flex-shrink-0">
              🌱
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1A4D3A]/60 uppercase tracking-wider">
                Pohon Ditanam
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#1A4D3A]">
                1,420+ <span className="text-xs font-bold text-[#FF9E20]">Pohon</span>
              </p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl shadow-clay-card border border-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] flex items-center justify-center text-[#357A59] font-bold shadow-clay-sm flex-shrink-0">
              🎓
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1A4D3A]/60 uppercase tracking-wider">
                Gen-Z Makers Aktif
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#1A4D3A]">
                4,890+ <span className="text-xs font-bold text-[#357A59]">Siswa/Mhs</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
