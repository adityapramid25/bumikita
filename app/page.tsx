'use client';

import React from 'react';
import HeroInteractiveScanner from '@/src/components/home/HeroInteractiveScanner';
import ThreeStepBento from '@/src/components/home/ThreeStepBento';
import ProfitCalculator from '@/src/components/home/ProfitCalculator';
import CuratedShowcase from '@/src/components/home/CuratedShowcase';
import ImpactPartnerBar from '@/src/components/home/ImpactPartnerBar';

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#F5F2ED] text-[#1A4D3A] space-y-10 sm:space-y-14 pb-24">
      {/* 1. Split Asymmetrical Bento Hero + Live Interactive Scanner */}
      <HeroInteractiveScanner />

      {/* 2. The 3-Step Bento Grid */}
      <ThreeStepBento />

      {/* 3. Kalkulator Modal & Untung (Interactive Sliders) */}
      <ProfitCalculator />

      {/* 4. Curated Showcase (Max 4 Items) */}
      <CuratedShowcase />

      {/* 5. Impact & Partner Bar (Minimalist Strip) */}
      <ImpactPartnerBar />
    </div>
  );
}
