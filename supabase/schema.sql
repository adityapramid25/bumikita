-- ==============================================================================
-- BumiKita Supabase Database Schema & Trigger Definitions
-- Platform Upcycle & Ekonomi Sirkular Pelajar Indonesia
-- ==============================================================================

-- 1. Create Profiles Table with Indonesian Address Hierarchy
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  nickname TEXT UNIQUE,
  avatar_url TEXT,
  phone_number TEXT,
  bio TEXT,
  daun_points INTEGER NOT NULL DEFAULT 100,
  trees_planted INTEGER NOT NULL DEFAULT 0,
  eco_role TEXT NOT NULL DEFAULT 'citizen' CHECK (eco_role IN ('citizen', 'artisan', 'bank_sampah_admin', 'super_admin')),
  
  -- Indonesian Address Hierarchy (Managed exclusively in User Profile Dashboard)
  province TEXT,
  city_district TEXT,
  subdistrict TEXT,
  village TEXT,
  postal_code TEXT,
  address_detail TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Security Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trigger Function: handle_new_user()
-- Gracefully handles null address fields during frictionless registration.
-- Automatically provisions 100 Daun Points as a welcome incentive.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name  TEXT;
  v_nickname   TEXT;
  v_avatar_url TEXT;
BEGIN
  v_full_name  := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Eco Warrior');
  v_nickname   := NULLIF(TRIM(NEW.raw_user_meta_data->>'nickname'), '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL);

  IF v_nickname IS NULL THEN
    v_nickname := 'eco_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    nickname,
    avatar_url,
    daun_points,
    trees_planted
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_nickname,
    v_avatar_url,
    100, -- Welcome point incentive
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Storage Bucket Configuration for Avatars
-- Run in Supabase SQL editor if avatars bucket is not yet created:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for Avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
