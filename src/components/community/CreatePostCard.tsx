'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  X, 
  Leaf, 
  Recycle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CommunityPostItem, CommunityProfile } from '@/src/lib/supabase';
import { createCommunityPost } from '@/src/lib/communityService';

interface CreatePostCardProps {
  onPostCreated: (newPost: CommunityPostItem) => void;
}

const SAMPLE_IMAGE_PRESETS = [
  {
    label: '🪴 Pot Tanaman',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: '📦 Kardus Pilah',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: '🎒 Denim Upcycle',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: '✨ Lampu Sendok',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
  },
];

export default function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const { user, profile, openAuthModal } = useAuth();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unauthenticated Guest State: Elegant Clay Banner Prompt
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#FAF8F5] border border-white/90 rounded-3xl p-5 sm:p-7 shadow-clay-card relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-2xl shadow-clay-sm shrink-0 border border-white">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                  Komunitas Threads BumiKita
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#1A4D3A] tracking-tight mt-1">
                Punya ide atau karya upcycle baru?
              </h3>
              <p className="text-xs sm:text-sm text-[#1A4D3A]/70 leading-relaxed max-w-md">
                Masuk untuk berbagi foto progres, bertanya tips daur ulang polimer, dan berdiskusi dengan sesama pejuang lingkungan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            <button
              type="button"
              id="btn-community-prompt-login"
              onClick={() => openAuthModal('login', 'Silakan masuk untuk mulai membagikan karya upcycle di komunitas.')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white border border-white shadow-clay-button text-xs font-black text-[#1A4D3A] hover:bg-[#FAF8F5] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#357A59]" />
              <span>Masuk</span>
            </button>

            <Link
              href="/auth?mode=register"
              id="btn-community-prompt-register"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-earth text-white shadow-clay-button text-xs font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#FF9E20]" />
              <span>Daftar Gratis</span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Authenticated State: Interactive Clay Textarea Card
  const authorProfile: CommunityProfile = {
    id: user.id,
    full_name: profile?.full_name || user.user_metadata?.full_name || 'Eco Warrior',
    username: profile?.nickname || user.user_metadata?.nickname || `eco_${user.id.slice(0, 6)}`,
    role: profile?.eco_role === 'artisan' ? 'Upcycle Artisan' : 'Eco Warrior',
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await createCommunityPost({
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        authorProfile,
      });

      if (result.success && result.post) {
        onPostCreated(result.post);
        setContent('');
        setImageUrl('');
        setShowImageInput(false);

        // Confetti burst on successful post creation
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
          });
        } catch {}
      } else {
        setErrorMsg(result.error || 'Gagal menerbitkan postingan. Silakan coba lagi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
    setShowImageInput(true);
  };

  const charCount = content.length;
  const maxChars = 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#FAF8F5] border border-white/90 rounded-3xl p-5 sm:p-6 shadow-clay-card relative"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Author Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F2ED] text-[#357A59] border border-white shadow-clay-sm flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
              {authorProfile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorProfile.avatar_url}
                  alt={authorProfile.full_name || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(authorProfile.full_name || 'E')[0].toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#1A4D3A] leading-none">
                  {authorProfile.full_name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                  {authorProfile.role}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#1A4D3A]/60">
                @{authorProfile.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#357A59] bg-[#E8F2ED]/70 px-2.5 py-1 rounded-full border border-[#357A59]/20">
            <Sparkles className="w-3 h-3 text-[#FF9E20]" />
            <span>Threads Mode</span>
          </div>
        </div>

        {/* Textarea with tactile clay-inset highlight */}
        <div className="relative">
          <textarea
            id="input-community-thread-content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
            placeholder="Bagikan progres kreasi upcycle, ide daur ulang, atau tips pilah sampah hari ini..."
            rows={3}
            className="w-full bg-white border border-[#1A4D3A]/10 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-[#1A4D3A] placeholder-[#1A4D3A]/45 shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 resize-none transition-all"
          />
          <div className="absolute right-3 bottom-2.5 text-[10px] font-extrabold text-[#1A4D3A]/40 pointer-events-none">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Optional Image Preview and URL Input */}
        <AnimatePresence>
          {showImageInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden pt-1"
            >
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  id="input-community-image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Tempel URL foto kreasi (contoh: https://images.unsplash.com/...)"
                  className="flex-1 bg-white border border-[#1A4D3A]/15 rounded-xl px-3 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/40 shadow-clay-sm focus:outline-none focus:ring-1 focus:ring-[#357A59]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setShowImageInput(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-white border border-white shadow-clay-sm flex items-center justify-center text-[#1A4D3A]/60 hover:text-[#1A4D3A] cursor-pointer shrink-0"
                  title="Batalkan foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sample Presets Quick Pick */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-[#1A4D3A]/60 mr-1">Contoh Foto:</span>
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-white shadow-clay-sm text-[10px] font-bold text-[#1A4D3A]/80 hover:bg-[#E8F2ED] hover:text-[#357A59] transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Image Preview if valid */}
              {imageUrl && (
                <div className="relative rounded-2xl overflow-hidden max-h-48 border border-[#1A4D3A]/10 shadow-clay-card mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview foto upcycle"
                    className="w-full h-44 object-cover"
                    onError={() => setErrorMsg('URL foto tidak dapat dimuat. Pastikan tautan valid.')}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1A4D3A]/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-community-toggle-image"
              onClick={() => setShowImageInput((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showImageInput || imageUrl
                  ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/30 shadow-clay-sm'
                  : 'bg-white border border-white text-[#1A4D3A]/80 shadow-clay-sm hover:bg-[#FAF8F5]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#357A59]" />
              <span>{imageUrl ? 'Ganti Foto' : 'Sematkan Foto'}</span>
            </button>
          </div>

          <button
            type="submit"
            id="btn-community-publish-post"
            disabled={!content.trim() || isSubmitting}
            className="px-5 py-2.5 rounded-full bg-gradient-earth text-white text-xs sm:text-sm font-black shadow-clay-button hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Menerbitkan...</span>
            ) : (
              <>
                <span>Posting</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
