import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Types for the Threads-Style Community feature
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

let browserClient: SupabaseClient | null = null;

/**
 * Checks if Supabase URL and Anon Key are configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Creates or retrieves a Supabase Browser Client initialized with @supabase/ssr.
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

/**
 * Alias for createClient() to align with standard Supabase conventions
 */
export const getSupabaseBrowserClient = createClient;
