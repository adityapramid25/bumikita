import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  bio: string | null;
  daun_points: number;
  trees_planted: number;
  eco_role: 'citizen' | 'artisan' | 'bank_sampah_admin' | 'super_admin';
  // Indonesian Address Hierarchy
  province: string | null;
  city_district: string | null;
  subdistrict: string | null;
  village: string | null;
  postal_code: string | null;
  address_detail: string | null;
  created_at?: string;
  updated_at?: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !url.startsWith('http')) return null;
    return createClient(url, key);
  }

  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !url.startsWith('http')) {
    console.warn(
      '⚠️ [BumiKita] Supabase URL or Anon Key is missing in environment variables. Running in resilient hybrid mode.'
    );
    return null;
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}
