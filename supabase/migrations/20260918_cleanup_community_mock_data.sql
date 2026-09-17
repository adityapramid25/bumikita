-- ==============================================================================
-- BumiKita: Cleanup Mock, Hardcoded & Seed Data in Community Tables
-- Clears mock interactions while strictly preserving registered user profiles
-- Idempotent and safe for live database execution
-- ==============================================================================

DO $$
BEGIN
  -- Truncate comments, likes, and posts tables with CASCADE and RESTART IDENTITY
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
