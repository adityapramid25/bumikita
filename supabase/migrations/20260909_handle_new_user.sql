-- Migration: Update handle_new_user() trigger function
-- Gracefully handles null address fields, populates nickname and username,
-- ensures username constraint is satisfied, and prevents auth.users signup rollback.

-- Ensure username and nickname column can accept null if required
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN nickname DROP NOT NULL;

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
