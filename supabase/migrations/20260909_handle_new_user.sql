-- Migration: Update handle_new_user() trigger function
-- Gracefully handles null address fields during simplified registration
-- Sets default 100 Daun Points welcome bonus and supports avatar_url metadata

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
