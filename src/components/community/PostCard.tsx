'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Check, 
  Send, 
  Sparkles, 
  LogIn,
  Loader2
} from 'lucide-react';
import { CommunityPostItem, CommunityComment } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { togglePostLike, createCommunityComment, fetchPostComments } from '@/src/lib/communityService';
import SharePostModal from '@/src/components/community/SharePostModal';

interface PostCardProps {
  post: CommunityPostItem;
  onPostUpdated?: (updatedPost: CommunityPostItem) => void;
}

function formatIndonesianRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSeconds = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSeconds < 60) return 'Baru saja';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} hari lalu`;

    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Baru saja';
  }
}

export default function PostCard({ post, onPostUpdated }: PostCardProps) {
  const { user, profile, openAuthModal } = useAuth();
  const router = useRouter();

  // Reactive state with local interaction overrides
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const [likeDelta, setLikeDelta] = useState<number>(0);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const [showComments, setShowComments] = useState<boolean>(false);
  const [liveComments, setLiveComments] = useState<CommunityComment[] | null>(null);
  const [addedComments, setAddedComments] = useState<CommunityComment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const isLiked = localLiked !== null ? localLiked : Boolean(post.is_liked);
  const likesCount = Math.max(0, (post.likes_count || 0) + likeDelta);
  
  // Combine initial post comments (or refreshed comments) with newly added ones
  const baseComments = liveComments !== null ? liveComments : (post.comments || []);
  const allComments = [...baseComments, ...addedComments];

  // Helper to redirect unauthenticated visitors
  const handleUnauthenticatedRedirect = (actionName: string) => {
    if (openAuthModal) {
      openAuthModal('login', `Silakan masuk terlebih dahulu untuk ${actionName}.`);
    } else {
      router.push('/auth?mode=login');
    }
  };

  // Handle Optimistic Like Toggle backed by live Supabase mutation
  const handleToggleLike = async () => {
    if (!user) {
      handleUnauthenticatedRedirect('menyukai postingan ini');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const nextLiked = !prevLiked;
    const prevDelta = likeDelta;
    const nextDelta = nextLiked ? prevDelta + 1 : prevDelta - 1;

    setLocalLiked(nextLiked);
    setLikeDelta(nextDelta);

    try {
      const res = await togglePostLike(post.id, user.id, prevLiked);
      if (!res.success) {
        // Rollback on failure
        setLocalLiked(prevLiked);
        setLikeDelta(prevDelta);
      } else if (onPostUpdated) {
        onPostUpdated({
          ...post,
          is_liked: nextLiked,
          likes_count: Math.max(0, (post.likes_count || 0) + nextDelta),
        });
      }
    } catch {
      setLocalLiked(prevLiked);
      setLikeDelta(prevDelta);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Comments Drawer Toggle with live refresh
  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    if (nextShow && liveComments === null) {
      setIsLoadingComments(true);
      try {
        const freshComments = await fetchPostComments(post.id);
        setLiveComments(freshComments);
        setAddedComments([]);
      } catch (err) {
        console.error('Failed to fetch fresh comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  // Handle Submit Comment directly to public.comments
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    if (!user) {
      handleUnauthenticatedRedirect('menulis komentar pada diskusi ini');
      return;
    }

    setIsSubmittingComment(true);

    const authorProfile = {
      id: user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || 'Eco Warrior',
      username: profile?.nickname || user.user_metadata?.nickname || `eco_${user.id.slice(0, 6)}`,
      role: profile?.eco_role === 'artisan' ? 'Upcycle Artisan' : 'Eco Warrior',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    };

    try {
      const res = await createCommunityComment({
        postId: post.id,
        userId: user.id,
        content: newCommentText.trim(),
        authorProfile,
      });

      if (res.success && res.comment) {
        const nextAdded = [...addedComments, res.comment];
        setAddedComments(nextAdded);
        setNewCommentText('');

        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            comments: [...baseComments, ...nextAdded],
            comments_count: (post.comments_count || 0) + 1,
          });
        }
      }
    } catch (err) {
      console.error('Failed to post live comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Opening Multi-Platform Interactive Share Modal
  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const authorName = post.profiles?.full_name || 'Eco Warrior';
  const authorUsername = post.profiles?.username || `eco_${post.user_id.slice(0, 6)}`;
  const authorRole = post.profiles?.role || 'Eco Warrior';
  const authorAvatar = post.profiles?.avatar_url;
  const relativeTime = formatIndonesianRelativeTime(post.created_at);

  return (
    <article
      id={`post-${post.id}`}
      className="w-full bg-[#FAF8F5] border border-white/90 rounded-3xl p-5 sm:p-6 shadow-clay-card scroll-mt-24 transition-all hover:border-[#6DB677]/30"
    >
      {/* 1. Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar with initial fallback */}
          <div className="w-11 h-11 rounded-2xl bg-[#E8F2ED] text-[#357A59] border border-white shadow-clay-sm flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{authorName[0].toUpperCase()}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-[#1A4D3A] leading-tight">
                {authorName}
              </h3>
              {/* Eco role pill badge */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shadow-clay-sm">
                {authorRole}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#1A4D3A]/60 font-semibold mt-0.5">
              <span>@{authorUsername}</span>
              <span>•</span>
              <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString('id-ID')}>
                {relativeTime}
              </time>
            </div>
          </div>
        </div>

        {/* Anchor link helper icon */}
        <button
          type="button"
          onClick={handleOpenShareModal}
          className="text-[#1A4D3A]/40 hover:text-[#357A59] transition-colors p-1"
          title="Bagikan postingan ini"
        >
          <span className="text-[11px] font-bold">#</span>
        </button>
      </div>

      {/* 2. Post Content Area with Multi-line Support */}
      <div className="text-xs sm:text-sm text-[#1A4D3A]/90 font-medium leading-relaxed whitespace-pre-wrap break-words mb-3.5 pl-0.5">
        {post.content}
      </div>

      {/* Optional Attached Image Preview */}
      {post.image_url && (
        <div className="relative rounded-2xl overflow-hidden border border-[#1A4D3A]/10 shadow-clay-card mb-4 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt="Foto karya upcycle komunitas"
            className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* 3. Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1A4D3A]/10 text-xs font-bold text-[#1A4D3A]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Like Button */}
          <motion.button
            type="button"
            id={`btn-like-${post.id}`}
            whileTap={{ scale: 0.88 }}
            onClick={handleToggleLike}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-clay-sm'
                : 'bg-white text-[#1A4D3A]/75 border border-white shadow-clay-sm hover:bg-rose-50/50 hover:text-rose-500 active:scale-95'
            }`}
            title={user ? (isLiked ? 'Batal Suka' : 'Sukai Postingan') : 'Masuk untuk menyukai'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span className="text-xs font-black">{likesCount}</span>
          </motion.button>

          {/* Comment Toggle Button */}
          <button
            type="button"
            id={`btn-toggle-comments-${post.id}`}
            onClick={handleToggleComments}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              showComments
                ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/30 shadow-clay-sm'
                : 'bg-white text-[#1A4D3A]/75 border border-white shadow-clay-sm hover:bg-[#FAF8F5] hover:text-[#357A59] active:scale-95'
            }`}
            title="Lihat & Tulis Komentar"
          >
            <MessageCircle className="w-4 h-4 text-[#357A59]" />
            <span className="text-xs font-black">{allComments.length}</span>
          </button>
        </div>

        {/* Share Button Triggering Multi-Platform Claymorphic Popup Modal */}
        <button
          type="button"
          id={`btn-share-${post.id}`}
          onClick={handleOpenShareModal}
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer bg-white text-[#1A4D3A]/75 border border-white shadow-clay-sm hover:bg-[#FAF8F5] hover:text-[#357A59] active:scale-95"
          title="Bagikan aksi ini ke WhatsApp, Instagram, X, Telegram, LinkedIn, atau Salin Tautan"
        >
          <Share2 className="w-3.5 h-3.5 text-[#FF9E20]" />
          <span className="text-xs font-black">Bagikan</span>
        </button>
      </div>

      {/* 4. Inline Drawer for Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-4 mt-3 border-t border-[#1A4D3A]/10 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-extrabold text-[#1A4D3A]">
              <span>
                Komentar ({allComments.length})
              </span>
              {isLoadingComments && (
                <span className="flex items-center gap-1 text-[10px] text-[#357A59]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Memperbarui...</span>
                </span>
              )}
            </div>

            {/* Comments List: strictly live records */}
            {allComments.length === 0 && !isLoadingComments ? (
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white text-center text-xs text-[#1A4D3A]/60 shadow-clay-sm">
                Belum ada komentar untuk postingan ini.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {allComments.map((comment) => {
                  const cAuthorName = comment.profiles?.full_name || 'Eco Warrior';
                  const cUsername = comment.profiles?.username || `eco_${comment.user_id.slice(0, 5)}`;
                  const cTime = formatIndonesianRelativeTime(comment.created_at);

                  return (
                    <div
                      key={comment.id}
                      className="p-3 rounded-2xl bg-white border border-white shadow-clay-sm flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#357A59] border border-white shadow-clay-sm flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={comment.profiles.avatar_url}
                            alt={cAuthorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{cAuthorName[0].toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-[#1A4D3A]">
                            {cAuthorName}
                          </span>
                          <span className="text-[10px] text-[#1A4D3A]/50 font-semibold">
                            @{cUsername}
                          </span>
                          <span className="text-[10px] text-[#1A4D3A]/40">• {cTime}</span>
                        </div>
                        <p className="text-xs text-[#1A4D3A]/85 font-medium leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment Input Form (Auth Guarded) */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  id={`input-comment-${post.id}`}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Tulis tanggapan atau tips tambahan..."
                  disabled={isSubmittingComment}
                  className="flex-1 bg-white border border-[#1A4D3A]/15 rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/45 shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-[#357A59]/40"
                />
                <button
                  type="submit"
                  id={`btn-submit-comment-${post.id}`}
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-earth text-white text-xs font-black shadow-clay-button hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim</span>
                </button>
              </form>
            ) : (
              <div className="p-3 rounded-2xl bg-[#E8F2ED]/60 border border-[#357A59]/20 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#1A4D3A]/80 font-bold">
                  Ingin ikut berdiskusi? Masuk ke akunmu.
                </span>
                <button
                  type="button"
                  id={`btn-comment-login-${post.id}`}
                  onClick={() => handleUnauthenticatedRedirect('menulis komentar')}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#357A59] border border-white font-extrabold shadow-clay-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Multi-Platform Interactive Share Modal */}
      <SharePostModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
      />
    </article>
  );
}
