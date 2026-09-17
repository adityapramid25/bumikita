import { getSupabase } from '@/src/lib/supabase/client';

export interface ForestCampaign {
  id: string;
  title: string;
  location: string;
  description: string;
  target_amount: number;
  collected_amount: number;
  target_trees: number;
  planted_trees: number;
  end_date: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface ForestDonation {
  id: string;
  campaign_id: string;
  user_id?: string;
  amount: number;
  daun_points_earned: number;
  donor_name: string;
  message?: string;
  payment_status: string;
  created_at: string;
}

export interface UserCertificate {
  id: string;
  user_id: string;
  certificate_code: string;
  level_name: string;
  level_tier: number;
  trees_funded: number;
  carbon_offset_kg: number;
  issued_at: string;
}

export interface DonationProcessResult {
  success: boolean;
  points_earned: number;
  total_points: number;
  new_level: string;
  level_tier: number;
  certificate_issued: boolean;
  certificate?: UserCertificate | null;
  error?: string;
}

// Initial fallback campaign matching the seeded database record
export const DEFAULT_PILOT_CAMPAIGN: ForestCampaign = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Restorasi Hutan Hujan Tropis Bukit Soeharto',
  location: 'Kalimantan Timur',
  description:
    'Penanaman pohon Meranti dan Ulin untuk memulihkan koridor habitat satwa liar dan menyerap jejak karbon.',
  target_amount: 25000000,
  collected_amount: 11850000,
  target_trees: 250,
  planted_trees: 118,
  // 24 days in the future from initial deploy
  end_date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
  image_url:
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  is_active: true,
};

const CAMPAIGN_STORAGE_KEY = 'bumikita_campaign_state';
const DONATIONS_STORAGE_KEY = 'bumikita_donations_list';
const CERTIFICATES_STORAGE_KEY = 'bumikita_user_certificates';

/**
 * Fetch active forest campaigns from Supabase, with local persistence fallback.
 */
export async function getActiveForestCampaign(): Promise<ForestCampaign> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('forest_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          location: data.location,
          description: data.description || DEFAULT_PILOT_CAMPAIGN.description,
          target_amount: Number(data.target_amount) || DEFAULT_PILOT_CAMPAIGN.target_amount,
          collected_amount: Number(data.collected_amount) || 0,
          target_trees: Number(data.target_trees) || DEFAULT_PILOT_CAMPAIGN.target_trees,
          planted_trees: Number(data.planted_trees) || 0,
          end_date: data.end_date || DEFAULT_PILOT_CAMPAIGN.end_date,
          image_url: data.image_url || DEFAULT_PILOT_CAMPAIGN.image_url,
          is_active: data.is_active,
        };
      }
    } catch (err) {
      console.warn('Supabase fetch forest_campaigns fallback to local state:', err);
    }
  }

  // Local storage fallback for resilient offline / sandbox usage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  return DEFAULT_PILOT_CAMPAIGN;
}

/**
 * Fetch recent donations for a campaign
 */
export async function getCampaignDonations(campaignId: string): Promise<ForestDonation[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('forest_donations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          campaign_id: d.campaign_id,
          user_id: d.user_id,
          amount: Number(d.amount),
          daun_points_earned: Number(d.daun_points_earned),
          donor_name: d.donor_name,
          message: d.message,
          payment_status: d.payment_status,
          created_at: d.created_at,
        }));
      }
    } catch (err) {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(DONATIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  // Starter sample donations for pilot transparency
  return [
    {
      id: 'don-1',
      campaign_id: campaignId,
      amount: 50000,
      daun_points_earned: 500,
      donor_name: 'Budi Santoso',
      message: 'Semoga hutan Kalimantan cepat pulih dan lestari! 🌲',
      payment_status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'don-2',
      campaign_id: campaignId,
      amount: 25000,
      daun_points_earned: 250,
      donor_name: 'Siti Rahmawati',
      message: 'Dari siswa SMKN 9 Semarang untuk Bumi!',
      payment_status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'don-3',
      campaign_id: campaignId,
      amount: 100000,
      daun_points_earned: 1000,
      donor_name: 'Komunitas Generasi Hijau',
      message: 'Langkah kecil berdampak nyata bagi alam.',
      payment_status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
  ];
}

/**
 * Fetch certificates for a user
 */
export async function getUserCertificates(userId?: string): Promise<UserCertificate[]> {
  if (!userId) return [];

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          certificate_code: c.certificate_code,
          level_name: c.level_name,
          level_tier: Number(c.level_tier),
          trees_funded: Number(c.trees_funded),
          carbon_offset_kg: Number(c.carbon_offset_kg),
          issued_at: c.issued_at,
        }));
      }
    } catch (err) {
      console.warn('Error fetching user_certificates:', err);
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`${CERTIFICATES_STORAGE_KEY}_${userId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  return [];
}

/**
 * Execute mock donation transaction:
 * - Checks min amount >= 5000
 * - Calculates points: floor(amount / 100)
 * - Invokes Supabase RPC process_mock_donation
 * - Fallback to deterministic local execution if Supabase RPC is pending migration
 */
export async function executeMockDonation(params: {
  campaignId: string;
  userId?: string;
  amount: number;
  donorName: string;
  message?: string;
  currentPoints?: number;
}): Promise<DonationProcessResult> {
  const { campaignId, userId, amount, donorName, message, currentPoints = 0 } = params;

  if (amount < 5000) {
    throw new Error('Minimal donasi adalah Rp 5.000');
  }

  const supabase = getSupabase();

  if (supabase && userId) {
    try {
      const { data, error } = await supabase.rpc('process_mock_donation', {
        p_campaign_id: campaignId,
        p_user_id: userId,
        p_amount: amount,
        p_donor_name: donorName,
        p_message: message || '',
      });

      if (!error && data && data.success) {
        let certificate: UserCertificate | null = null;
        if (data.certificate_issued && data.certificate) {
          certificate = {
            id: 'cert-' + Date.now(),
            user_id: userId,
            certificate_code: data.certificate.certificate_code,
            level_name: data.certificate.level_name,
            level_tier: data.certificate.level_tier,
            trees_funded: data.certificate.trees_funded,
            carbon_offset_kg: data.certificate.carbon_offset_kg,
            issued_at: data.certificate.issued_at || new Date().toISOString(),
          };
        } else if (data.certificate_issued) {
          // If returned as boolean without nested object, fetch the latest certificate
          const certs = await getUserCertificates(userId);
          if (certs.length > 0) {
            certificate = certs[0];
          }
        }

        return {
          success: true,
          points_earned: data.points_earned,
          total_points: data.total_points,
          new_level: data.new_level,
          level_tier: data.level_tier || getLevelTier(data.total_points),
          certificate_issued: Boolean(data.certificate_issued),
          certificate,
        };
      } else if (error) {
        console.warn('Supabase process_mock_donation RPC returned error, switching to resilient fallback:', error);
      }
    } catch (rpcErr) {
      console.warn('Error executing process_mock_donation RPC, continuing with resilient client logic:', rpcErr);
    }
  }

  // Resilient Client / Local Sandbox Execution
  // Rule: Every Rp 100 = 1 Daun Point
  const pointsEarned = Math.floor(amount / 100);
  const newTotalPoints = currentPoints + pointsEarned;
  const newLevelTier = getLevelTier(newTotalPoints);
  const levelTitle = getLevelTitle(newLevelTier);

  // Check if certificate should be issued
  let certificateIssued = false;
  let newCert: UserCertificate | null = null;

  if (newLevelTier >= 2) {
    // Check if user already has certificate for this tier
    const userKey = userId ? `${CERTIFICATES_STORAGE_KEY}_${userId}` : CERTIFICATES_STORAGE_KEY;
    let existingCerts: UserCertificate[] = [];
    if (typeof window !== 'undefined') {
      try {
        existingCerts = JSON.parse(localStorage.getItem(userKey) || '[]');
      } catch {}
    }

    const alreadyHasTier = existingCerts.some((c) => c.level_tier === newLevelTier);
    if (!alreadyHasTier) {
      const codeSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      newCert = {
        id: 'cert-' + Date.now(),
        user_id: userId || 'anon-guest',
        certificate_code: `CERT-TREE-${codeSuffix}`,
        level_name: levelTitle,
        level_tier: newLevelTier,
        trees_funded: Math.max(1, Math.floor(newTotalPoints / 200)),
        carbon_offset_kg: Number((newLevelTier * 18.5).toFixed(1)),
        issued_at: new Date().toISOString(),
      };
      existingCerts = [newCert, ...existingCerts];
      certificateIssued = true;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(userKey, JSON.stringify(existingCerts));
        } catch {}
      }
    }
  }

  // Update local campaign progress
  if (typeof window !== 'undefined') {
    try {
      const currentCampaign = await getActiveForestCampaign();
      const updatedCampaign: ForestCampaign = {
        ...currentCampaign,
        collected_amount: currentCampaign.collected_amount + amount,
        planted_trees: currentCampaign.planted_trees + Math.floor(amount / 100000),
      };
      localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(updatedCampaign));

      // Append to donations list
      const donationsList = await getCampaignDonations(campaignId);
      const newDonation: ForestDonation = {
        id: 'don-' + Date.now(),
        campaign_id: campaignId,
        user_id: userId,
        amount,
        daun_points_earned: pointsEarned,
        donor_name: donorName,
        message,
        payment_status: 'completed',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(
        DONATIONS_STORAGE_KEY,
        JSON.stringify([newDonation, ...donationsList.slice(0, 8)])
      );
    } catch {}
  }

  return {
    success: true,
    points_earned: pointsEarned,
    total_points: newTotalPoints,
    new_level: levelTitle,
    level_tier: newLevelTier,
    certificate_issued: certificateIssued,
    certificate: newCert,
  };
}

export function getLevelTier(points: number): number {
  if (points >= 1000) return 4;
  if (points >= 500) return 3;
  if (points >= 200) return 2;
  return 1;
}

export function getLevelTitle(tier: number): string {
  switch (tier) {
    case 4:
      return 'Earth Champion';
    case 3:
      return 'Forest Guardian';
    case 2:
      return 'Eco Artisan';
    default:
      return 'Eco Seedling';
  }
}

export function getNextTierThreshold(points: number): { nextThreshold: number; nextTitle: string; progressPercent: number } {
  if (points >= 1000) {
    return {
      nextThreshold: 1000,
      nextTitle: 'Maksimum Tier (Earth Champion)',
      progressPercent: 100,
    };
  }
  if (points >= 500) {
    const progress = Math.min(100, Math.floor(((points - 500) / 500) * 100));
    return {
      nextThreshold: 1000,
      nextTitle: 'Earth Champion',
      progressPercent: progress,
    };
  }
  if (points >= 200) {
    const progress = Math.min(100, Math.floor(((points - 200) / 300) * 100));
    return {
      nextThreshold: 500,
      nextTitle: 'Forest Guardian',
      progressPercent: progress,
    };
  }
  const progress = Math.min(100, Math.floor((points / 200) * 100));
  return {
    nextThreshold: 200,
    nextTitle: 'Eco Artisan',
    progressPercent: progress,
  };
}
