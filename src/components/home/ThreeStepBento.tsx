'use client';

import React from 'react';
import { Camera, Calculator, ShoppingBag } from 'lucide-react';

export default function ThreeStepBento() {
  const steps = [
    {
      num: '01',
      icon: Camera,
      title: 'Scan AI',
      caption: 'Foto sampah, dapatkan ide upcycle dalam 3 detik.',
    },
    {
      num: '02',
      icon: Calculator,
      title: 'Hitung Cuan',
      caption: 'Modal alat terhitung, proyeksi laba otomatis.',
    },
    {
      num: '03',
      icon: ShoppingBag,
      title: 'Pajang & Donasi',
      caption: 'Jual ke pasar, dapat sertifikat untuk LinkedIn.',
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="clay-card p-6 sm:p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1A4D3A]/40 tracking-wider">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="text-lg font-bold text-[#1A4D3A] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#1A4D3A]/75 leading-relaxed">
                    {step.caption}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
