import { getSupabase as getSharedClient, isSupabaseConfigured as checkConfigured } from '@/src/lib/supabase/client';
import { createClient as createClientJs, SupabaseClient } from '@supabase/supabase-js';

// Types for the Community feature
export interface CommunityProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string;
  avatar_url: string | null;
  created_at?: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: CommunityProfile | null;
}

export interface CommunityLike {
  post_id: string;
  user_id: string;
  created_at?: string;
}

export interface CommunityPostItem {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: CommunityProfile | null;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  comments?: CommunityComment[];
}

let fallbackClient: SupabaseClient | null = null;

/**
 * Checks if Supabase URL and Anon Key are configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return checkConfigured();
}

/**
 * Returns the unified shared Supabase client initialized with auth session persistence.
 * Uses the shared client instance from @/src/lib/supabase/client so that user authentication
 * tokens and sessions are automatically attached to all database operations.
 */
export function createClient(): SupabaseClient {
  const shared = getSharedClient();
  if (shared) {
    return shared;
  }

  // Fallback if not configured or during SSR
  if (!fallbackClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    fallbackClient = createClientJs(supabaseUrl, supabaseAnonKey);
  }

  return fallbackClient;
}

/**
 * Alias for createClient() to align with standard Supabase conventions
 */
export const getSupabaseBrowserClient = createClient;
