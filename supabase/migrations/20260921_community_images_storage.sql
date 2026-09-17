-- ==============================================================================
-- Migration: Setup Supabase Storage Bucket for Community Images
-- Bucket name: community-images (public read, authenticated insert/delete)
-- ==============================================================================

-- 1. Create community-images bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public read access to community-images bucket
DROP POLICY IF EXISTS "Public community images access" ON storage.objects;
CREATE POLICY "Public community images access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-images');

-- 3. Allow authenticated users to upload their own images
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Allow authenticated users to update their own images
DROP POLICY IF EXISTS "Authenticated users can update community images" ON storage.objects;
CREATE POLICY "Authenticated users can update community images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'community-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'community-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. Allow authenticated users to delete their own images
DROP POLICY IF EXISTS "Authenticated users can delete community images" ON storage.objects;
CREATE POLICY "Authenticated users can delete community images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
