'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Copy, 
  MessageCircle, 
  Instagram, 
  Twitter, 
  Send, 
  Linkedin, 
  Share2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CommunityPostItem } from '@/src/lib/supabase';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPostItem | null;
}

export default function SharePostModal({ isOpen, onClose, post }: SharePostModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInstagramOption, setShowInstagramOption] = useState(false);

  const handleCloseModal = useCallback(() => {
    setToastMessage(null);
    setCopiedLink(false);
    setShowInstagramOption(false);
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCloseModal]);

  if (!isOpen || !post) return null;

  const authorName = post.profiles?.full_name || 'Eco Warrior';
  const snippet = post.content.length > 80 
    ? `${post.content.slice(0, 80).trim()}...` 
    : post.content.trim();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bumikita.id';
  const postUrl = `${origin}/community#post-${post.id}`;
  const title = `Aksi Hijau BumiKita oleh ${authorName}`;
  const fullShareMessage = `${authorName} di BumiKita: "${snippet}" 🌿\n\nYuk lihat selengkapnya dan dukung aksi daur ulang ini di BumiKita:\n${postUrl}`;

  const showToast = (msg: string, type: 'success' | 'info' = 'success', duration = 3500) => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  };

  // 1. WhatsApp
  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka WhatsApp...', 'info');
  };

  // 2. Instagram (Stories/Feed UX)
  const handleShareInstagram = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareMessage);
      }
      setCopiedLink(true);
      setShowInstagramOption(true);
      showToast('Teks & tautan disalin! Buka Instagram untuk menempelkannya.', 'success', 5000);
    } catch {
      showToast('Gagal menyalin otomatis. Silakan salin tautan secara manual.', 'info');
    }
  };

  // 3. X (Twitter)
  const handleShareTwitter = () => {
    const tweetText = `${authorName} di BumiKita: ${snippet}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka X / Twitter...', 'info');
  };

  // 4. Telegram
  const handleShareTelegram = () => {
    const telegramText = `${authorName} di BumiKita: ${snippet}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(telegramText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka Telegram...', 'info');
  };

  // 5. LinkedIn
  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka LinkedIn...', 'info');
  };

  // 6. Copy Link
  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        setCopiedLink(true);
        showToast('Tautan berhasil disalin ke clipboard!', 'success');
        setTimeout(() => setCopiedLink(false), 3000);
      } else {
        showToast('Tautan postingan: ' + postUrl, 'info');
      }
    } catch {
      showToast('Gagal menyalin tautan.', 'info');
    }
  };

  // Native Device Share (Bonus for Mobile Devices)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${authorName} di BumiKita: "${snippet}" 🌿`,
          url: postUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const platforms = [
    {
      id: 'btn-share-whatsapp',
      name: 'WhatsApp',
      colorClass: 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]',
      borderClass: 'border-[#2E7D32]/20',
      icon: MessageCircle,
      action: handleShareWhatsApp,
    },
    {
      id: 'btn-share-instagram',
      name: 'Instagram',
      colorClass: 'bg-[#FCE4EC] text-[#C2185B] hover:bg-[#F8BBD0]',
      borderClass: 'border-[#C2185B]/20',
      icon: Instagram,
      action: handleShareInstagram,
    },
    {
      id: 'btn-share-twitter',
      name: 'X (Twitter)',
      colorClass: 'bg-[#E1F5FE] text-[#0288D1] hover:bg-[#B3E5FC]',
      borderClass: 'border-[#0288D1]/20',
      icon: Twitter,
      action: handleShareTwitter,
    },
    {
      id: 'btn-share-telegram',
      name: 'Telegram',
      colorClass: 'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]',
      borderClass: 'border-[#0369A1]/20',
      icon: Send,
      action: handleShareTelegram,
    },
    {
      id: 'btn-share-linkedin',
      name: 'LinkedIn',
      colorClass: 'bg-[#E8EAF6] text-[#1A237E] hover:bg-[#C5CAE9]',
      borderClass: 'border-[#1A237E]/20',
      icon: Linkedin,
      action: handleShareLinkedIn,
    },
    {
      id: 'btn-share-copylink',
      name: copiedLink ? 'Tersalin!' : 'Salin Tautan',
      colorClass: copiedLink ? 'bg-[#E8F2ED] text-[#357A59]' : 'bg-[#FAF8F5] text-[#1A4D3A] hover:bg-[#E8F2ED]',
      borderClass: 'border-[#357A59]/25',
      icon: copiedLink ? Check : Copy,
      action: handleCopyLink,
    },
  ];

  return (
    <AnimatePresence>
      <div 
        id="modal-share-post-overlay"
        className="fixed inset-0 bg-[#1A4D3A]/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}
      >
        <motion.div
          id="card-share-post-modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#FCFBF8] border border-white/90 rounded-3xl p-5 sm:p-6 shadow-clay-card relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F2ED] text-[#357A59] border border-white shadow-clay-sm flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5 text-[#357A59]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1A4D3A] leading-tight">
                  Bagikan Aksi Hijau
                </h3>
                <p className="text-xs text-[#1A4D3A]/60 font-medium mt-0.5">
                  Sebarkan inspirasi daur ulang ini ke berbagai platform
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              id="btn-close-share-modal"
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-white text-[#1A4D3A]/60 hover:text-[#1A4D3A] border border-white shadow-clay-sm flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              title="Tutup jendela bagikan"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inline Preview Excerpt Box */}
          <div className="bg-[#F5F2ED] border border-[#1A4D3A]/10 rounded-2xl p-3 mb-5 shadow-clay-inset">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#357A59] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pratinjau Pesan yang Dibagikan</span>
            </div>
            <p className="text-xs text-[#1A4D3A]/85 italic line-clamp-2 leading-relaxed">
              &ldquo;{snippet}&rdquo;
            </p>
            <div className="text-[10px] text-[#1A4D3A]/50 font-mono mt-1 truncate">
              {postUrl}
            </div>
          </div>

          {/* Interactive Dynamic Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className={`mb-4 p-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                  toastType === 'success'
                    ? 'bg-[#E8F2ED] border-[#357A59]/30 text-[#1A4D3A]'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <Check className="w-4 h-4 text-[#357A59] shrink-0" />
                <span className="flex-1 text-[11px] sm:text-xs">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Platform Grid (3 columns on mobile, 3 or 6 on desktop) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-3.5 mb-5">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  id={platform.id}
                  type="button"
                  onClick={platform.action}
                  className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-white border border-white hover:bg-[#FAF8F5] shadow-clay-sm transition-all active:scale-95 cursor-pointer group"
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shadow-clay-button transition-transform group-hover:scale-105 ${platform.colorClass} ${platform.borderClass}`}
                  >
                    <Icon className="w-5 h-5 transition-transform" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1A4D3A] text-center leading-tight truncate max-w-full">
                    {platform.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instagram Post-Copy Helper Action */}
          {showInstagramOption && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-2xl bg-[#FCE4EC]/50 border border-[#C2185B]/20 mb-4 flex items-center justify-between gap-2"
            >
              <span className="text-xs text-[#C2185B] font-bold">
                Buka web Instagram sekarang?
              </span>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#C2185B] text-white text-xs font-bold shadow-clay-button hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <span>Buka Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}

          {/* Footer Quick Action: Direct URL Copy Box + System Share */}
          <div className="pt-3 border-t border-[#1A4D3A]/10 flex items-center justify-between gap-2">
            <div className="flex-1 bg-white border border-[#1A4D3A]/10 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-clay-inset text-xs min-w-0">
              <span className="text-[11px] text-[#1A4D3A]/60 font-mono truncate mr-2 select-all">
                {postUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] font-bold text-[#357A59] hover:underline shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Tersalin' : 'Salin'}
              </button>
            </div>

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                id="btn-share-native-device"
                onClick={handleNativeShare}
                className="px-3 py-1.5 rounded-xl bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/30 text-xs font-bold shadow-clay-sm hover:bg-[#FAF8F5] active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Buka menu bagikan bawaan perangkat"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Menu HP</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
