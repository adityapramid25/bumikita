-- ==============================================================================
-- 20260923_crowdfunded_forest_and_certificates.sql
-- Crowdfunded Forest Restoration, Donations & Certificate System
-- ==============================================================================

-- 1. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.forest_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 50000000, -- e.g. Rp 50.000.000
  collected_amount NUMERIC NOT NULL DEFAULT 0,
  target_trees INT NOT NULL DEFAULT 500,
  planted_trees INT NOT NULL DEFAULT 0,
  end_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.forest_campaigns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forest_campaigns' AND policyname = 'Allow public read forest_campaigns'
  ) THEN
    CREATE POLICY "Allow public read forest_campaigns"
      ON public.forest_campaigns FOR SELECT
      USING (true);
  END IF;
END $$;

-- Seed initial pilot campaign: Hutan Kalimantan
INSERT INTO public.forest_campaigns (title, location, description, target_amount, collected_amount, target_trees, planted_trees, end_date, image_url)
VALUES (
  'Restorasi Hutan Hujan Tropis Bukit Soeharto',
  'Kalimantan Timur',
  'Penanaman pohon Meranti dan Ulin untuk memulihkan koridor habitat satwa liar dan menyerap jejak karbon.',
  25000000,
  11850000,
  250,
  118,
  now() + interval '24 days',
  'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80'
) ON CONFLICT DO NOTHING;

-- 2. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.forest_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.forest_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 5000),
  daun_points_earned INT NOT NULL,
  donor_name TEXT NOT NULL,
  message TEXT,
  payment_status TEXT NOT NULL DEFAULT 'completed', -- Mocked instant success
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for donations
ALTER TABLE public.forest_donations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forest_donations' AND policyname = 'Allow public read forest_donations'
  ) THEN
    CREATE POLICY "Allow public read forest_donations"
      ON public.forest_donations FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forest_donations' AND policyname = 'Allow authenticated insert forest_donations'
  ) THEN
    CREATE POLICY "Allow authenticated insert forest_donations"
      ON public.forest_donations FOR INSERT
      WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 3. USER CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.user_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_code TEXT UNIQUE NOT NULL,
  level_name TEXT NOT NULL,
  level_tier INT NOT NULL,
  trees_funded INT NOT NULL DEFAULT 1,
  carbon_offset_kg NUMERIC NOT NULL DEFAULT 22.5,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for user certificates
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_certificates' AND policyname = 'Allow public read user_certificates'
  ) THEN
    CREATE POLICY "Allow public read user_certificates"
      ON public.user_certificates FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_certificates' AND policyname = 'Allow insert user_certificates'
  ) THEN
    CREATE POLICY "Allow insert user_certificates"
      ON public.user_certificates FOR INSERT
      WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 4. ATOMIC DONATION & LEVEL UP FUNCTION
CREATE OR REPLACE FUNCTION public.process_mock_donation(
  p_campaign_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_donor_name TEXT,
  p_message TEXT
) RETURNS JSONB AS $$
DECLARE
  v_points_earned INT;
  v_new_points INT;
  v_new_level INT;
  v_level_title TEXT;
  v_cert_code TEXT;
  v_created_cert BOOLEAN := false;
  v_cert_data JSONB := null;
BEGIN
  -- Rule: Min donation Rp 5.000
  IF p_amount < 5000 THEN
    RAISE EXCEPTION 'Minimal donasi adalah Rp 5.000';
  END IF;

  -- Rule: Every Rp 100 = 1 Daun Point (e.g. Rp 5.000 = 50 Daun)
  v_points_earned := FLOOR(p_amount / 100);

  -- 1. Record Donation
  INSERT INTO public.forest_donations (campaign_id, user_id, amount, daun_points_earned, donor_name, message, payment_status)
  VALUES (p_campaign_id, p_user_id, p_amount, v_points_earned, p_donor_name, p_message, 'completed');

  -- 2. Update Campaign Collected Amount
  UPDATE public.forest_campaigns
  SET collected_amount = collected_amount + p_amount,
      planted_trees = planted_trees + FLOOR(p_amount / 100000) -- Each 100k = 1 actual tree
  WHERE id = p_campaign_id;

  -- 3. Update User Daun Points & planted trees in profiles table
  UPDATE public.profiles
  SET daun_points = COALESCE(daun_points, 0) + v_points_earned,
      trees_planted = COALESCE(trees_planted, 0) + FLOOR(p_amount / 100000)
  WHERE id = p_user_id
  RETURNING daun_points INTO v_new_points;

  -- Fallback if profile didn't exist or wasn't updated
  IF v_new_points IS NULL THEN
    v_new_points := v_points_earned;
  END IF;

  -- 4. Check Level-up Thresholds
  -- Level 1: < 200 pts | Level 2 (Eco Artisan): >= 200 pts | Level 3 (Forest Guardian): >= 500 pts | Level 4 (Earth Champion): >= 1000 pts
  IF v_new_points >= 1000 THEN
    v_new_level := 4;
    v_level_title := 'Earth Champion';
  ELSIF v_new_points >= 500 THEN
    v_new_level := 3;
    v_level_title := 'Forest Guardian';
  ELSIF v_new_points >= 200 THEN
    v_new_level := 2;
    v_level_title := 'Eco Artisan';
  ELSE
    v_new_level := 1;
    v_level_title := 'Eco Seedling';
  END IF;

  -- 5. Issue Certificate if reaching Tier 2, 3, or 4 and certificate not yet issued for that tier
  IF v_new_level >= 2 AND NOT EXISTS (
    SELECT 1 FROM public.user_certificates WHERE user_id = p_user_id AND level_tier = v_new_level
  ) THEN
    v_cert_code := 'CERT-TREE-' || SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8);
    INSERT INTO public.user_certificates (user_id, certificate_code, level_name, level_tier, trees_funded, carbon_offset_kg)
    VALUES (p_user_id, v_cert_code, v_level_title, v_new_level, GREATEST(1, FLOOR(v_new_points / 200)), (v_new_level * 18.5));
    v_created_cert := true;

    v_cert_data := jsonb_build_object(
      'certificate_code', v_cert_code,
      'level_name', v_level_title,
      'level_tier', v_new_level,
      'trees_funded', GREATEST(1, FLOOR(v_new_points / 200)),
      'carbon_offset_kg', (v_new_level * 18.5),
      'issued_at', now()
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'points_earned', v_points_earned,
    'total_points', v_new_points,
    'new_level', v_level_title,
    'level_tier', v_new_level,
    'certificate_issued', v_created_cert,
    'certificate', v_cert_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
