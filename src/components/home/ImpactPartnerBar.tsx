'use client';

import React from 'react';
import { Award, GraduationCap, School, ShieldCheck, TreePine } from 'lucide-react';

export default function ImpactPartnerBar() {
  const stats = [
    { label: 'Sampah Terolah', value: '1.200+ Kg' },
    { label: 'Sekolah Mitra', value: '48 Sekolah' },
    { label: 'Donasi Terkumpul', value: 'Rp 12 Jt' },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="clay-card p-6 sm:p-10 space-y-8">
        {/* Simple 1-row stat bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1A4D3A]/10 text-center">
          <div className="py-3 md:py-0 md:px-6">
            <p className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
              1.200+ Kg
            </p>
            <p className="text-xs font-bold text-[#1A4D3A]/60 mt-1 uppercase tracking-wider">
              Sampah Terolah
            </p>
          </div>

          <div className="py-3 md:py-0 md:px-6">
            <p className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
              SMKN 9
            </p>
            <p className="text-xs font-bold text-[#1A4D3A]/60 mt-1 uppercase tracking-wider">
              Pilot Project Semarang
            </p>
          </div>

          <div className="py-3 md:py-0 md:px-6">
            <p className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
              Rp 12 Jt
            </p>
            <p className="text-xs font-bold text-[#1A4D3A]/60 mt-1 uppercase tracking-wider">
              Donasi
            </p>
          </div>
        </div>

        {/* Monochrome Muted School / Partner Marks (No text captions) */}
        <div className="pt-6 border-t border-[#1A4D3A]/10 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-40 grayscale hover:opacity-70 transition-opacity">
          <div className="flex items-center gap-2 text-[#1A4D3A]">
            <GraduationCap className="w-6 h-6" />
            <span className="font-mono text-xs font-extrabold tracking-widest">SMKN 9 SEMARANG</span>
          </div>

          <div className="flex items-center gap-2 text-[#1A4D3A]">
            <School className="w-6 h-6" />
            <span className="font-mono text-xs font-extrabold tracking-widest">ADIWIYATA</span>
          </div>

          <div className="flex items-center gap-2 text-[#1A4D3A]">
            <Award className="w-6 h-6" />
            <span className="font-mono text-xs font-extrabold tracking-widest">VOKASI-ID</span>
          </div>

          <div className="flex items-center gap-2 text-[#1A4D3A]">
            <TreePine className="w-6 h-6" />
            <span className="font-mono text-xs font-extrabold tracking-widest">ECOLAB</span>
          </div>

          <div className="flex items-center gap-2 text-[#1A4D3A]">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-mono text-xs font-extrabold tracking-widest">PILOT PROJECT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
