'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CommunityPostItem, CommunityProfile } from '@/src/lib/supabase';
import { createCommunityPost } from '@/src/lib/communityService';

interface CreatePostCardProps {
  onPostCreated: (newPost: CommunityPostItem) => void;
}

export default function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const { user, profile } = useAuth();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unauthenticated guests see no post creation box
  if (!user) {
    return null;
  }

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

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
          });
        } catch {}
      } else {
        setErrorMsg(result.error || 'Gagal menerbitkan postingan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat membuat postingan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const maxChars = 500;

  return (
    <div className="w-full bg-[#FCFBF8] border border-white/90 rounded-2xl p-4 sm:p-5 shadow-clay-card relative">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Author Header row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F2ED] text-[#357A59] border border-white shadow-clay-sm flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
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

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#1A4D3A] truncate">
                {authorProfile.full_name}
              </span>
              <span className="text-[11px] text-[#1A4D3A]/60 font-medium truncate">
                @{authorProfile.username}
              </span>
            </div>
          </div>
        </div>

        {/* Textarea with tactile clay-inset highlight */}
        <div className="relative">
          <textarea
            id="input-community-post-content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
            placeholder="Bagikan progres kreasi upcycle, ide daur ulang, atau tips hari ini..."
            rows={2}
            className="w-full bg-white border border-[#1A4D3A]/10 rounded-xl p-3 text-xs sm:text-sm font-medium text-[#1A4D3A] placeholder-[#1A4D3A]/40 shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 resize-none transition-all"
          />
          <div className="absolute right-2.5 bottom-2 text-[10px] font-bold text-[#1A4D3A]/40 pointer-events-none">
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
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  id="input-community-image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Tempel URL tautan gambar (https://...)"
                  className="flex-1 bg-white border border-[#1A4D3A]/15 rounded-xl px-3 py-1.5 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/40 shadow-clay-sm focus:outline-none focus:ring-1 focus:ring-[#357A59]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setShowImageInput(false);
                  }}
                  className="w-7 h-7 rounded-lg bg-white border border-white shadow-clay-sm flex items-center justify-center text-[#1A4D3A]/60 hover:text-[#1A4D3A] cursor-pointer shrink-0"
                  title="Tutup input gambar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-40 border border-[#1A4D3A]/10 shadow-clay-card mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview foto"
                    className="w-full h-36 object-cover"
                    onError={() => setErrorMsg('URL foto tidak dapat dimuat. Pastikan tautan gambar dapat diakses secara publik.')}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
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
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1A4D3A]/10">
          <button
            type="button"
            id="btn-community-toggle-image"
            onClick={() => setShowImageInput((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showImageInput || imageUrl
                ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shadow-clay-sm'
                : 'bg-white text-[#1A4D3A]/70 border border-white hover:bg-[#FAF8F5] shadow-clay-sm'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#357A59]" />
            <span className="text-[11px]">{imageUrl ? 'Foto Terpasang' : 'Foto'}</span>
          </button>

          <button
            type="submit"
            id="btn-community-publish-post"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menerbitkan...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
