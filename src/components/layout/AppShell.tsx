'use client';

import React from 'react';
import { EcoProvider } from '@/src/context/EcoContext';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import ProductModal from '@/src/components/market/ProductModal';
import CartDrawer from '@/src/components/market/CartDrawer';
import RewardModal from '@/src/components/rewards/RewardModal';
import EcoAIAssistant from '@/src/components/chat/EcoAIAssistant';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <EcoProvider>
      <div className="min-h-screen flex flex-col bg-[#F5F2ED] text-[#1A4D3A]">
        {/* Sticky Claymorphic Top Navbar */}
        <Navbar />

        {/* Dynamic Route Page Body */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Global Modals & Drawers */}
        <ProductModal />
        <CartDrawer />
        <RewardModal />
        <EcoAIAssistant />

        {/* Footer */}
        <Footer />
      </div>
    </EcoProvider>
  );
}
