'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import AuthCard from '@/src/components/auth/AuthCard';
import { ArrowLeft, X, ShieldCheck, Leaf } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, authNoticeMessage, closeAuthModal } = useAuth();

  // Prevent background body scroll while the full-screen takeover modal is active
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  // Support pressing the Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          key="auth-fullscreen-takeover"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] w-screen h-screen bg-[#F5F2ED] overflow-y-auto flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-6"
        >
          {/* Ambient Background Glows */}
          <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-0" />
          <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-0" />

          {/* Top Bar Header with Tactile Dismiss Buttons */}
          <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-20 mb-4 shrink-0">
            {/* Top-Left: Tactile Clay "← Kembali ke Beranda" Button */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF8F5] text-xs sm:text-sm font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#357A59]" />
              <span>← Kembali ke Beranda</span>
            </button>

            {/* Top-Right: Tactile Clay "X" Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-card border border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Tutup Modal Autentikasi"
              >
                <X className="w-5 h-5 text-[#1A4D3A]" />
              </button>
            </div>
          </header>

          {/* Centered Auth Card Container */}
          <main className="flex-1 flex flex-col items-center justify-center my-auto z-10 py-4 w-full max-w-lg mx-auto">
            {/* Gentle Informational Banner if opened with specific notice */}
            {authNoticeMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-4 p-4 rounded-3xl bg-[#FFF9E6] border border-[#FF9E20]/40 shadow-clay-card flex items-center gap-3 text-xs sm:text-sm font-bold text-[#1A4D3A]"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#FF9E20]/20 flex items-center justify-center text-lg shrink-0 shadow-clay-sm">
                  🍃
                </div>
                <div className="flex-1 leading-snug">
                  {authNoticeMessage}
                </div>
              </motion.div>
            )}

            <AuthCard
              defaultMode={authModalMode}
              isModal={true}
              onClose={closeAuthModal}
              onSuccess={closeAuthModal}
            />
          </main>

          {/* Minimalist Footnote Strip */}
          <footer className="max-w-5xl w-full mx-auto text-center pt-4 pb-2 text-xs text-[#1A4D3A]/50 z-10 shrink-0 flex items-center justify-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
            <span>© 2026 BumiKita — Green Market, Upcycle, & Sustainable. Dikembangkan oleh Tim Smartova untuk bumi Indonesia.</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
