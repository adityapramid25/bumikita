-- ==============================================================================
-- Migration: Deduplicate Foreign Key Constraints for Posts & Comments
-- Resolves PostgREST Error: "Could not embed because more than one relationship was found"
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
    post_fkey_count INT;
    comment_fkey_count INT;
BEGIN
    -- 1. Deduplicate foreign keys on public.posts pointing to public.profiles
    SELECT count(*) INTO post_fkey_count
    FROM pg_constraint
    WHERE conrelid = 'public.posts'::regclass
      AND contype = 'f'
      AND confrelid = 'public.profiles'::regclass;

    IF post_fkey_count > 1 THEN
        -- Drop all existing foreign key constraints from posts to profiles
        FOR r IN (
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'public.posts'::regclass
              AND contype = 'f'
              AND confrelid = 'public.profiles'::regclass
        ) LOOP
            EXECUTE 'ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;

        -- Re-add a single canonical constraint
        ALTER TABLE public.posts
          ADD CONSTRAINT posts_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- 2. Deduplicate foreign keys on public.comments pointing to public.profiles
    SELECT count(*) INTO comment_fkey_count
    FROM pg_constraint
    WHERE conrelid = 'public.comments'::regclass
      AND contype = 'f'
      AND confrelid = 'public.profiles'::regclass;

    IF comment_fkey_count > 1 THEN
        -- Drop all existing foreign key constraints from comments to profiles
        FOR r IN (
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'public.comments'::regclass
              AND contype = 'f'
              AND confrelid = 'public.profiles'::regclass
        ) LOOP
            EXECUTE 'ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;

        -- Re-add a single canonical constraint
        ALTER TABLE public.comments
          ADD CONSTRAINT comments_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
