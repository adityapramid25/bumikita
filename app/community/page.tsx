'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCw, 
  Sparkles, 
  MessageSquareText, 
  GraduationCap, 
  Filter, 
  TrendingUp,
  Leaf,
  Users
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CommunityPostItem } from '@/src/lib/supabase';
import { fetchCommunityPosts } from '@/src/lib/communityService';
import CreatePostCard from '@/src/components/community/CreatePostCard';
import PostCard from '@/src/components/community/PostCard';
import CommunityDIYFeed from '@/src/components/community/CommunityDIYFeed';

const CATEGORY_TAGS = [
  { id: 'all', label: 'Semua Obrolan', icon: '✨' },
  { id: 'plastik', label: 'Plastik & Polimer', icon: '🧴' },
  { id: 'kardus', label: 'Kardus & Kertas', icon: '📦' },
  { id: 'tekstil', label: 'Kain & Tekstil', icon: '🧵' },
  { id: 'tips', label: 'Tips & Tutorial', icon: '💡' },
];

export default function CommunityPage() {
  const { user } = useAuth();

  const [activeView, setActiveView] = useState<'threads' | 'workshops'>('threads');
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const currentUserId = user?.id;

  // Initial Data Fetch
  useEffect(() => {
    let isCancelled = false;

    async function loadInitialPosts() {
      try {
        const fetched = await fetchCommunityPosts(currentUserId);
        if (!isCancelled) {
          setPosts(fetched);
        }
      } catch (err) {
        console.error('Failed to load community threads:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialPosts();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  // Explicit User-Triggered Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fetched = await fetchCommunityPosts(currentUserId);
      setPosts(fetched);
    } catch (err) {
      console.error('Failed to refresh community threads:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle URL Anchor scrolling on initial load (e.g., #post-[id])
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [posts]);

  // Callback when user publishes a new post
  const handlePostCreated = (newPost: CommunityPostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Callback when a post is updated (e.g. liked or commented)
  const handlePostUpdated = (updatedPost: CommunityPostItem) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  // Filter posts by active category chip
  const filteredPosts = posts.filter((post) => {
    if (selectedTag === 'all') return true;
    const text = (post.content + ' ' + (post.profiles?.role || '')).toLowerCase();
    if (selectedTag === 'plastik') {
      return text.includes('plastik') || text.includes('botol') || text.includes('hdpe') || text.includes('pet');
    }
    if (selectedTag === 'kardus') {
      return text.includes('kardus') || text.includes('kertas') || text.includes('karton') || text.includes('box');
    }
    if (selectedTag === 'tekstil') {
      return text.includes('kain') || text.includes('tekstil') || text.includes('denim') || text.includes('jeans') || text.includes('jahit');
    }
    if (selectedTag === 'tips') {
      return text.includes('tips') || text.includes('tutorial') || text.includes('rahasia') || text.includes('cara');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-6 sm:py-10 px-3.5 sm:px-6">
      <main className="max-w-2xl mx-auto space-y-6">
        {/* Header Hero Strip */}
        <header className="bg-[#FAF8F5] border border-white/90 rounded-3xl p-6 sm:p-8 shadow-clay-card text-center space-y-3 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#6DB677]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F2ED] border border-[#357A59]/20 text-[#357A59] text-xs font-black shadow-clay-sm">
            <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
            <span>Threads Komunitas BumiKita</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
            Ruang Diskusi & Karya Upcycle
          </h1>

          <p className="text-xs sm:text-sm text-[#1A4D3A]/70 max-w-lg mx-auto leading-relaxed">
            Berbagi proses daur ulang sampah, tanya-jawab material polimer, dan saling mengapresiasi inovasi sirkular pelajar se-Indonesia.
          </p>

          {/* Navigation Mode Pill Tabs (Threads vs Workshops) */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-white shadow-clay-inset">
              <button
                type="button"
                id="tab-view-threads"
                onClick={() => setActiveView('threads')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'threads'
                    ? 'bg-gradient-earth text-white shadow-clay-button'
                    : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Threads Feed</span>
              </button>

              <button
                type="button"
                id="tab-view-workshops"
                onClick={() => setActiveView('workshops')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'workshops'
                    ? 'bg-gradient-earth text-white shadow-clay-button'
                    : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Workshop Kreator</span>
              </button>
            </div>
          </div>
        </header>

        {activeView === 'workshops' ? (
          /* Workshop Sub-View */
          <div className="space-y-4">
            <CommunityDIYFeed />
          </div>
        ) : (
          /* Threads Microblogging Main Feed */
          <div className="space-y-5">
            {/* 1. Create Post Interactive Clay Card */}
            <section aria-label="Buat Postingan Komunitas">
              <CreatePostCard onPostCreated={handlePostCreated} />
            </section>

            {/* 2. Control Bar: Category Quick Chips & Refresh Action */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {CATEGORY_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTag(tag.id)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      selectedTag === tag.id
                        ? 'bg-[#1A4D3A] text-white shadow-clay-button'
                        : 'bg-[#FAF8F5] text-[#1A4D3A]/70 border border-white hover:bg-white shadow-clay-sm'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>

              {/* Refresh Feed Button */}
              <button
                type="button"
                id="btn-refresh-threads-feed"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="px-3 py-1.5 rounded-2xl bg-[#FAF8F5] border border-white text-[#1A4D3A] text-xs font-bold shadow-clay-button hover:bg-white active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Segarkan feed obrolan"
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#357A59] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>

            {/* 3. Feed List / Loading / Empty States */}
            <section aria-label="Daftar Postingan Komunitas" className="space-y-4">
              {isLoading ? (
                /* Skeleton Loaders */
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="w-full bg-[#FAF8F5] border border-white/80 rounded-3xl p-6 shadow-clay-card animate-pulse space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#E8F2ED]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-[#1A4D3A]/10 rounded w-1/3" />
                          <div className="h-3 bg-[#1A4D3A]/10 rounded w-1/4" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="h-3.5 bg-[#1A4D3A]/10 rounded w-full" />
                        <div className="h-3.5 bg-[#1A4D3A]/10 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                /* Clean Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FAF8F5] border border-white/90 rounded-3xl p-8 sm:p-12 text-center shadow-clay-card space-y-3"
                >
                  <div className="w-16 h-16 rounded-3xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-3xl mx-auto shadow-clay-sm border border-white">
                    💬
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A4D3A]">
                    Belum Ada Obrolan di Topik Ini
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1A4D3A]/65 max-w-sm mx-auto leading-relaxed">
                    Jadilah yang pertama membagikan progres daur ulang atau tips unik upcycling karya kamu!
                  </p>
                  {selectedTag !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedTag('all')}
                      className="mt-2 px-4 py-2 rounded-2xl bg-white border border-white text-xs font-bold text-[#357A59] shadow-clay-sm hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF9E20]" />
                      <span>Tampilkan Semua Obrolan</span>
                    </button>
                  )}
                </motion.div>
              ) : (
                /* Thread Posts Stream */
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
