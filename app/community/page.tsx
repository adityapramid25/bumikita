'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RotateCw, 
  Leaf,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CommunityPostItem } from '@/src/lib/supabase';
import { fetchCommunityPosts } from '@/src/lib/communityService';
import CreatePostCard from '@/src/components/community/CreatePostCard';
import PostCard from '@/src/components/community/PostCard';

export default function CommunityPage() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  
  // Live state from Supabase, strictly zero mock data
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const currentUserId = user?.id;

  // Initial Data Fetch
  useEffect(() => {
    let isCancelled = false;

    async function loadInitial() {
      try {
        const livePosts = await fetchCommunityPosts(currentUserId);
        if (!isCancelled) {
          setPosts(livePosts);
        }
      } catch (err) {
        console.error('Failed to load live community posts from Supabase:', err);
        if (!isCancelled) {
          setPosts([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  // User-Triggered Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const livePosts = await fetchCommunityPosts(currentUserId);
      setPosts(livePosts);
    } catch (err) {
      console.error('Failed to refresh community posts:', err);
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

  // Callback when a user publishes a new post
  const handlePostCreated = (newPost: CommunityPostItem) => {
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    handleRefresh();
  };

  // Callback when a post is updated (e.g. liked or commented)
  const handlePostUpdated = (updatedPost: CommunityPostItem) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleLoginClick = () => {
    if (openAuthModal) {
      openAuthModal('login', 'Silakan masuk untuk mulai berdiskusi dan berbagi kreasi di komunitas.');
    } else {
      router.push('/auth?mode=login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] pt-8 sm:pt-12 pb-16 px-3.5 sm:px-6">
      <main className="max-w-xl mx-auto space-y-5">
        {/* 1. Minimalist Top Navigation Bar */}
        <header className="flex items-center justify-between pb-3.5 border-b border-[#1A4D3A]/10 mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A4D3A] tracking-tight">
            Komunitas
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-refresh-feed"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="w-8 h-8 rounded-xl bg-[#FCFBF8] border border-white text-[#1A4D3A] shadow-clay-sm hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Segarkan feed"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#357A59] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {!user && (
              <button
                type="button"
                id="btn-header-login"
                onClick={handleLoginClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-earth text-white text-xs font-bold shadow-clay-button hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </header>

        {/* 2. Direct Feed Hierarchy */}
        {/* Authenticated Users: Compact post creation input box right below header */}
        {user && (
          <section aria-label="Buat Postingan">
            <CreatePostCard onPostCreated={handlePostCreated} />
          </section>
        )}

        {/* 3. Live Posts Stream */}
        <section aria-label="Daftar Postingan Komunitas" className="space-y-3.5">
          {isLoading ? (
            /* Compact Skeleton Loaders */
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-full bg-[#FCFBF8] border border-white/80 rounded-2xl p-4 sm:p-5 shadow-clay-card animate-pulse space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F2ED]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-[#1A4D3A]/10 rounded w-1/3" />
                      <div className="h-3 bg-[#1A4D3A]/10 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 bg-[#1A4D3A]/10 rounded w-full" />
                    <div className="h-3 bg-[#1A4D3A]/10 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* Single Minimal Claymorphic Empty State (Zero Fake Mock Posts) */
            <div className="bg-[#FCFBF8] border border-white/90 rounded-2xl p-8 text-center shadow-clay-card space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-sm border border-white">
                <Leaf className="w-6 h-6 text-[#357A59]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A4D3A]">
                  Belum ada postingan
                </h3>
                <p className="text-xs text-[#1A4D3A]/60 max-w-sm mx-auto">
                  Jadilah yang pertama membagikan kreasi atau ide upcycle ke komunitas!
                </p>
              </div>
            </div>
          ) : (
            /* Live Posts Feed */
            <div className="space-y-3.5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
