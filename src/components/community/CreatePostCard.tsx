'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CommunityPostItem, CommunityProfile } from '@/src/lib/supabase';
import { createCommunityPost, uploadCommunityImage } from '@/src/lib/communityService';

interface CreatePostCardProps {
  onPostCreated: (newPost: CommunityPostItem) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const { user, profile } = useAuth();

  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Unauthenticated guests see no post creation card
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 1. File type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMsg('Format foto tidak didukung. Silakan gunakan format JPG, PNG, atau WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. File size validation (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('Ukuran foto terlalu besar. Maksimal ukuran foto adalah 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Revoke previous preview URL if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // Reset native input value so user can pick the same file again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setErrorMsg(null);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      let uploadedImageUrl: string | null = null;

      // Step 1: Direct File Upload to Supabase Storage if an image was selected
      if (selectedFile) {
        setStatusMessage('Mengunggah foto kreasi...');
        const uploadResult = await uploadCommunityImage(selectedFile, user.id);

        if (!uploadResult.success || !uploadResult.publicUrl) {
          setErrorMsg(uploadResult.error || 'Gagal mengunggah foto. Draf teks Anda tetap tersimpan.');
          setIsSubmitting(false);
          setStatusMessage(null);
          return;
        }

        uploadedImageUrl = uploadResult.publicUrl;
      }

      // Step 2: Create live community post in Supabase
      setStatusMessage('Menerbitkan postingan...');
      const result = await createCommunityPost({
        userId: user.id,
        content: content.trim(),
        imageUrl: uploadedImageUrl,
        authorProfile,
      });

      if (result.success && result.post) {
        onPostCreated(result.post);

        // Reset text and file state
        setContent('');
        handleRemovePhoto();
        setStatusMessage(null);

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
          });
        } catch {}
      } else {
        setErrorMsg(result.error || 'Gagal menerbitkan postingan. Draf teks Anda tetap aman.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala sistem saat menerbitkan postingan.');
    } finally {
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  const charCount = content.length;
  const maxChars = 500;

  return (
    <div 
      id="card-community-create-post"
      className="w-full bg-[#FCFBF8] border border-white/90 rounded-2xl p-4 sm:p-5 shadow-clay-card relative transition-all"
    >
      {/* Hidden native file input with camera/gallery support */}
      <input
        type="file"
        ref={fileInputRef}
        id="input-community-file-upload"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isSubmitting}
      />

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
            disabled={isSubmitting}
            className="w-full bg-white border border-[#1A4D3A]/10 rounded-xl p-3 text-xs sm:text-sm font-medium text-[#1A4D3A] placeholder-[#1A4D3A]/40 shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 resize-none transition-all disabled:opacity-60"
          />
          <div className="absolute right-2.5 bottom-2 text-[10px] font-bold text-[#1A4D3A]/40 pointer-events-none">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Seamless Claymorphic Image Preview with Loading Overlay & Remove Floating Button */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div
              id="container-community-image-preview"
              initial={{ opacity: 0, scale: 0.95, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-2xl border border-white/60 shadow-clay-card overflow-hidden max-h-64 w-full bg-[#1A4D3A]/5 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="preview-community-post-image"
                src={previewUrl}
                alt="Pratinjau foto kreasi"
                className="w-full max-h-64 object-cover block"
              />

              {/* Floating "X" (Delete/Remove) Button */}
              {!isSubmitting && (
                <button
                  type="button"
                  id="btn-community-remove-photo"
                  onClick={handleRemovePhoto}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center z-10"
                  title="Hapus foto terpilih"
                  aria-label="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Subtle Loading Spinner / Overlay During Upload */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-3 z-20">
                  <Loader2 className="w-7 h-7 animate-spin text-[#6DB677] mb-2" />
                  <span className="text-xs font-bold tracking-wide text-white drop-shadow-sm">
                    {statusMessage || 'Mengunggah foto...'}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Notification with safe text retention indicator */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
            </div>
          </motion.div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1A4D3A]/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-community-pick-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFile
                  ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shadow-clay-sm'
                  : 'bg-white text-[#1A4D3A]/70 border border-white hover:bg-[#FAF8F5] shadow-clay-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={selectedFile ? 'Ganti foto yang dipilih' : 'Pilih foto dari perangkat'}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#357A59]" />
              <span className="text-[11px]">
                {selectedFile ? 'Foto Terpilih' : 'Foto'}
              </span>
              {selectedFile && (
                <CheckCircle2 className="w-3 h-3 text-[#357A59] ml-0.5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            id="btn-community-publish-post"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{statusMessage || 'Menerbitkan...'}</span>
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
