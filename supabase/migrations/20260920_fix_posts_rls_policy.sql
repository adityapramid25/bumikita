-- ==============================================================================
-- Migration: Hardened Row Level Security (RLS) Policies for Posts, Comments, and Likes
-- Fixes: "error: new row violates row-level security policy for table 'posts'"
-- Ensures authenticated users with valid auth.uid() can insert and manage their own records
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
CREATE POLICY "Posts are publicly readable" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
CREATE POLICY "Comments are publicly readable" ON public.comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Likes are publicly readable" ON public.likes;
CREATE POLICY "Likes are publicly readable" ON public.likes
  FOR SELECT USING (true);

-- 3. Authenticated Insert Policies (checking auth.uid() = user_id)
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
CREATE POLICY "Authenticated users can post comments" ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
CREATE POLICY "Authenticated users can insert likes" ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Update / Delete Policies
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
