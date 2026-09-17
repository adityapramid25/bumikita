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
-- Gracefully handles user registration, populates nickname and username,
-- handles duplicates gracefully, and prevents rollback of auth.users signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name  TEXT;
  v_nickname   TEXT;
  v_username   TEXT;
  v_avatar_url TEXT;
  v_role       TEXT;
  v_final_nick TEXT;
  v_counter    INT := 0;
BEGIN
  v_full_name  := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Eco Warrior');
  v_nickname   := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username')), '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL);
  v_role       := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  IF v_nickname IS NULL THEN
    v_nickname := 'eco_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;

  v_final_nick := v_nickname;
  -- Deduplicate if nickname or username already exists in profiles
  WHILE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (nickname = v_final_nick OR username = v_final_nick) 
      AND id <> NEW.id
  ) LOOP
    v_counter := v_counter + 1;
    v_final_nick := v_nickname || '_' || v_counter;
  END LOOP;
  v_username := v_final_nick;

  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      nickname,
      username,
      avatar_url,
      daun_points,
      trees_planted,
      eco_role,
      role
    )
    VALUES (
      NEW.id,
      v_full_name,
      v_final_nick,
      v_username,
      v_avatar_url,
      100, -- Welcome point incentive
      0,
      CASE WHEN v_role = 'creator' THEN 'artisan' ELSE 'citizen' END,
      CASE 
        WHEN v_role = 'creator' THEN 'Kreator Upcycle' 
        WHEN v_role = 'school' THEN 'Sekolah Adiwiyata' 
        ELSE 'Pelajar / Mahasiswa' 
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name  = EXCLUDED.full_name,
      nickname   = COALESCE(public.profiles.nickname, EXCLUDED.nickname),
      username   = COALESCE(public.profiles.username, EXCLUDED.username),
      avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = timezone('utc'::text, now());
  EXCEPTION WHEN OTHERS THEN
    -- Resilient fallback: log warning to postgres logs, but NEVER crash the auth.users signup transaction!
    RAISE WARNING 'handle_new_user notice for user %: %', NEW.id, SQLERRM;
  END;

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

-- =============================================================================
-- 4. BUMIKITA - DAILY MISSIONS & DAUN ECONOMY SCHEMA
-- =============================================================================

-- Master Daily Missions Table
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id TEXT PRIMARY KEY,               -- e.g. 'daily_checkin', 'share_friend', 'read_tip', 'explore_market'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 30,
  action_type TEXT NOT NULL,         -- 'instant' | 'share' | 'navigate'
  target_count INTEGER NOT NULL DEFAULT 1,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial Easy Missions
INSERT INTO public.daily_missions (id, title, description, reward_points, action_type, target_count, icon_name)
VALUES
  ('daily_checkin', 'Absen Harian', 'Buka aplikasi dan klaim bonus harianmu', 30, 'instant', 1, 'CalendarCheck'),
  ('share_friend', 'Ajak Teman Pilah Sampah', 'Bagikan tautan BumiKita ke WhatsApp / media sosial', 50, 'share', 1, 'Share2'),
  ('explore_market', 'Jelajahi Green Market', 'Lihat minimal 2 karya kreasi upcycle mahasiswa', 30, 'navigate', 2, 'ShoppingBag'),
  ('read_eco_tip', 'Edukasi 1 Menit', 'Baca tip daur ulang sampah polimer hari ini', 20, 'instant', 1, 'BookOpen')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  reward_points = EXCLUDED.reward_points,
  action_type = EXCLUDED.action_type,
  target_count = EXCLUDED.target_count,
  icon_name = EXCLUDED.icon_name;

-- User Mission Progress / Log (Reset every midnight UTC+7 / day)
CREATE TABLE IF NOT EXISTS public.user_mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_mission_per_day UNIQUE (user_id, mission_id, completed_date)
);

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Daily missions are viewable by everyone" ON public.daily_missions;
CREATE POLICY "Daily missions are viewable by everyone"
  ON public.daily_missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own mission logs" ON public.user_mission_logs;
CREATE POLICY "Users can view their own mission logs"
  ON public.user_mission_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RPC: Atomic Deduction of 50 Daun for AI Scan
CREATE OR REPLACE FUNCTION public.deduct_scan_points(cost INTEGER DEFAULT 50)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_points INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;

  SELECT daun_points INTO v_current_points
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_current_points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Profil tidak ditemukan');
  END IF;

  IF v_current_points < cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INSUFFICIENT_POINTS',
      'current_points', v_current_points,
      'message', 'Daun Poin tidak cukup untuk memindai sampah.'
    );
  END IF;

  UPDATE public.profiles
  SET daun_points = daun_points - cost,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_points', v_current_points - cost,
    'deducted', cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Atomic Claim of Daily Mission Reward
CREATE OR REPLACE FUNCTION public.claim_daily_mission(p_mission_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reward INTEGER;
  v_already_claimed BOOLEAN;
  v_new_points INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;

  SELECT reward_points INTO v_reward
  FROM public.daily_missions
  WHERE id = p_mission_id AND is_active = true;

  IF v_reward IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Misi tidak valid');
  END IF;

  -- Check if already claimed today
  SELECT is_claimed INTO v_already_claimed
  FROM public.user_mission_logs
  WHERE user_id = v_user_id AND mission_id = p_mission_id AND completed_date = CURRENT_DATE;

  IF v_already_claimed = true THEN
    RETURN jsonb_build_object('success', false, 'message', 'Misi ini sudah diklaim hari ini');
  END IF;

  -- Insert or update mission log as claimed
  INSERT INTO public.user_mission_logs (user_id, mission_id, completed_date, is_claimed, claimed_at)
  VALUES (v_user_id, p_mission_id, CURRENT_DATE, true, now())
  ON CONFLICT (user_id, mission_id, completed_date)
  DO UPDATE SET is_claimed = true, claimed_at = now();

  -- Add points to user profile
  UPDATE public.profiles
  SET daun_points = daun_points + v_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING daun_points INTO v_new_points;

  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward,
    'new_total_points', v_new_points,
    'message', 'Berhasil mendapatkan ' || v_reward || ' Daun!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 5. BUMIKITA - COMMUNITY SCHEMA (POSTS, COMMENTS, LIKES)
-- =============================================================================

-- Ensure username and role exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Eco Warrior';

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Policies for posts
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
CREATE POLICY "Authenticated users can post comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Policies for likes
DROP POLICY IF EXISTS "Likes are publicly readable" ON public.likes;
CREATE POLICY "Likes are publicly readable" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 6. COMMUNITY CLEANUP (ELIMINATE MOCK/SEED DATA SAFELY)
-- =============================================================================
-- Truncates dummy comments, likes, and posts while preserving user profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    TRUNCATE TABLE public.comments RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'likes') THEN
    TRUNCATE TABLE public.likes RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
    TRUNCATE TABLE public.posts RESTART IDENTITY CASCADE;
  END IF;
END $$;



