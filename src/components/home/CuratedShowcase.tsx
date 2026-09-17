'use client';

import React from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/src/data/mockData';
import { useEco } from '@/src/context/EcoContext';
import { ArrowRight } from 'lucide-react';

export default function CuratedShowcase() {
  const { setSelectedProductModal } = useEco();

  // Exactly 4 items
  const showcaseItems = INITIAL_PRODUCTS.slice(0, 4);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Section Title */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
          Kreasi Unggulan Siswa
        </h2>
      </div>

      {/* 4-Card Grid: Thumbnail, Name, Price, Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {showcaseItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedProductModal(item)}
            className="clay-card p-4 flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#EAE5DC] mb-3.5 shadow-clay-inset">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5]/90 text-[10px] font-bold text-[#1A4D3A] backdrop-blur-sm shadow-sm">
                Siswa SMK
              </span>
            </div>

            {/* Title & Price */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1A4D3A] line-clamp-1 group-hover:text-[#357A59] transition-colors">
                {item.name}
              </h3>
              <p className="text-sm font-extrabold text-[#1A4D3A] font-mono">
                Rp {item.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Single Clean Button Centered Below */}
      <div className="flex justify-center pt-2">
        <Link
          href="/market"
          className="clay-button px-8 py-3.5 text-sm font-bold shadow-clay-green flex items-center gap-2"
        >
          <span>Buka Katalog Lengkap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
