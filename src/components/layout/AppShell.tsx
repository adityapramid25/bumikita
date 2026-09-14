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
import InsufficientDaunModal from '@/src/components/scanner/InsufficientDaunModal';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth' || pathname?.startsWith('/auth');
  const isPrivacyPage = pathname === '/privacy-policy' || pathname?.startsWith('/privacy-policy');
  const isIsolatedPage = isAuthPage || isPrivacyPage;

  // If on isolated pages (auth or privacy policy), render only the page content without navbar, footer, or auxiliary modals
  if (isIsolatedPage) {
    return (
      <div className="min-h-screen w-full bg-[#F5F2ED] text-[#1A4D3A]">
        {children}
      </div>
    );
  }

  return (
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
      <InsufficientDaunModal />

      {/* Footer */}
      <Footer />
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
