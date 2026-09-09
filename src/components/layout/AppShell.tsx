'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/src/context/AuthContext';
import { EcoProvider } from '@/src/context/EcoContext';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import ProductModal from '@/src/components/market/ProductModal';
import CartDrawer from '@/src/components/market/CartDrawer';
import RewardModal from '@/src/components/rewards/RewardModal';
import EcoAIAssistant from '@/src/components/chat/EcoAIAssistant';
import AuthModal from '@/src/components/auth/AuthModal';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Isolate view: Never render top navbar, bottom nav, or footer on /auth route
  const isAuthPage = pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2ED] text-[#1A4D3A]">
      {/* Sticky Claymorphic Top Navbar (Hidden on Auth page) */}
      {!isAuthPage && <Navbar />}

      {/* Dynamic Route Page Body */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Global Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <RewardModal />
      <EcoAIAssistant />
      <AuthModal />

      {/* Footer (Hidden on Auth page) */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EcoProvider>
        <AppShellContent>
          {children}
        </AppShellContent>
      </EcoProvider>
    </AuthProvider>
  );
}
