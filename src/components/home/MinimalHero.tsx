'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Camera } from 'lucide-react';

export default function MinimalHero() {
  const scrollToScanner = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('scanner-widget');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative w-full pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative clay-card p-8 sm:p-14 lg:p-16 overflow-hidden">
          <div className="max-w-2xl space-y-6">
            {/* Headline: Exactly 6 words */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A4D3A] tracking-tight leading-[1.1]">
              Ubah Sampah Jadi Cuan & Karya.
            </h1>

            {/* Sub-headline: 1 sentence only */}
            <p className="text-base sm:text-lg text-[#1A4D3A]/80 font-normal leading-relaxed">
              Scan sampahmu dengan AI, hitung potensi keuntungan, dan jual langsung di Green Market.
            </p>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToScanner}
                className="clay-button px-7 py-3.5 flex items-center gap-2.5 text-sm sm:text-base font-bold shadow-clay-green cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Mulai Scan Sampah</span>
              </button>

              <Link
                href="/market"
                className="px-6 py-3.5 rounded-full bg-[#FAF8F5] text-[#1A4D3A] text-sm sm:text-base font-bold shadow-clay-pill hover:bg-white transition-all flex items-center gap-2 group"
              >
                <span>Jelajahi Produk</span>
                <ArrowRight className="w-4 h-4 text-[#357A59] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
