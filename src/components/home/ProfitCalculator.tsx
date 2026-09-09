'use client';

import React, { useState } from 'react';

export default function ProfitCalculator() {
  // Slider 1: Biaya Bahan/Alat Pendukung (Rp 0 – Rp 100.000)
  const [materialCost, setMaterialCost] = useState(15000);
  // Slider 2: Target Harga Jual (Rp 10.000 – Rp 250.000)
  const [sellingPrice, setSellingPrice] = useState(50000);

  // Calculations
  const netProfit = Math.max(0, sellingPrice - materialCost);
  const profitMarginPercent = sellingPrice > 0 ? Math.round((netProfit / sellingPrice) * 100) : 0;
  // Potensi donasi: 10% dari laba bersih (dibulatkan ke ratusan rupiah)
  const potentialDonation = Math.round((netProfit * 0.1) / 100) * 100;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="clay-card p-8 sm:p-12 lg:p-14 space-y-10">
        {/* Section Header: Minimalist */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#357A59] tracking-wider uppercase">
            Simulasi Cuan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
            Kalkulator Modal & Untung
          </h2>
        </div>

        {/* 2 Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Slider 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A4D3A]">
              <span className="text-[#1A4D3A]/70">Biaya Bahan & Alat</span>
              <span className="text-sm font-extrabold text-[#1A4D3A] font-mono">
                Rp {materialCost.toLocaleString('id-ID')}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={2500}
              value={materialCost}
              onChange={(e) => setMaterialCost(Number(e.target.value))}
              className="clay-slider"
            />
            <div className="flex justify-between text-[10px] font-medium text-[#1A4D3A]/40">
              <span>Rp 0</span>
              <span>Rp 100.000</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A4D3A]">
              <span className="text-[#1A4D3A]/70">Target Harga Jual</span>
              <span className="text-sm font-extrabold text-[#1A4D3A] font-mono">
                Rp {sellingPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={250000}
              step={5000}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="clay-slider"
            />
            <div className="flex justify-between text-[10px] font-medium text-[#1A4D3A]/40">
              <span>Rp 10.000</span>
              <span>Rp 250.000</span>
            </div>
          </div>
        </div>

        {/* 2 Large Visual Numbers Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1A4D3A]/10">
          {/* Number 1: Margin Laba */}
          <div className="clay-card p-6 sm:p-8 flex flex-col justify-center">
            <span className="text-xs font-bold text-[#1A4D3A]/60 uppercase tracking-wider mb-1">
              Margin Laba
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A4D3A] tracking-tight">
              {profitMarginPercent}%
            </span>
          </div>

          {/* Number 2: Potensi Donasi */}
          <div className="clay-card p-6 sm:p-8 flex flex-col justify-center">
            <span className="text-xs font-bold text-[#1A4D3A]/60 uppercase tracking-wider mb-2">
              Potensi Donasi
            </span>
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-[#EBF4EE] text-2xl sm:text-3xl font-extrabold text-[#357A59] shadow-clay-sm font-mono">
                Rp {potentialDonation.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
