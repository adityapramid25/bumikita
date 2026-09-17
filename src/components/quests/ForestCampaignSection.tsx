'use client';

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/src/context/AuthContext';
import { useEco } from '@/src/context/EcoContext';
import {
  ForestCampaign,
  ForestDonation,
  UserCertificate,
  getActiveForestCampaign,
  getCampaignDonations,
  getUserCertificates,
  executeMockDonation,
  getNextTierThreshold,
  getLevelTier,
  getLevelTitle,
} from '@/src/lib/forestService';
import CertificateModal from './CertificateModal';
import {
  Trees,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Leaf,
  Users,
  TrendingUp,
  Download,
  Share2
} from 'lucide-react';

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function ForestCampaignSection() {
  const { user, profile, openAuthModal, refreshProfile } = useAuth();
  const { daunPoints, addDaunPoints } = useEco();

  const [campaign, setCampaign] = useState<ForestCampaign | null>(null);
  const [recentDonations, setRecentDonations] = useState<ForestDonation[]>([]);
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>([]);

  // Donation state
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  // Modal celebration state
  const [activeCertificateModal, setActiveCertificateModal] = useState<UserCertificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<UserCertificate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  // Fetch campaign, donations, and certificates
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const c = await getActiveForestCampaign();
        if (isMounted) setCampaign(c);

        if (c?.id) {
          const dons = await getCampaignDonations(c.id);
          if (isMounted) setRecentDonations(dons);
        }
      } catch (err) {
        console.warn('Error loading campaign data:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user certificates whenever user/profile changes
  useEffect(() => {
    let isMounted = true;
    async function loadCerts() {
      if (user?.id) {
        const certs = await getUserCertificates(user.id);
        if (isMounted) setUserCertificates(certs);
      } else {
        const certs = await getUserCertificates();
        if (isMounted) setUserCertificates(certs);
      }
    }
    loadCerts();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real-Time Countdown Timer calculation
  const campaignEndDate = campaign?.end_date;
  useEffect(() => {
    if (!campaignEndDate) return;

    function updateCountdown() {
      const now = Date.now();
      const end = new Date(campaignEndDate!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaignEndDate]);

  // Computed active donation amount
  const effectiveAmount = useMemo(() => {
    if (customAmountInput) {
      const parsed = parseInt(customAmountInput.replace(/\D/g, ''), 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount;
  }, [customAmountInput, selectedAmount]);

  // Points preview: Every Rp 100 = 1 Daun Point
  const pointsToEarn = useMemo(() => {
    if (effectiveAmount < 5000) return 0;
    return Math.floor(effectiveAmount / 100);
  }, [effectiveAmount]);

  const treeContributionCount = useMemo(() => {
    return Math.floor(effectiveAmount / 100000);
  }, [effectiveAmount]);

  // User Level progression calculations
  const effectiveUserPoints = profile?.daun_points ?? daunPoints;
  const currentTier = getLevelTier(effectiveUserPoints);
  const currentLevelTitle = getLevelTitle(currentTier);
  const tierProgress = getNextTierThreshold(effectiveUserPoints);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountInput('');
    setDonationError(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmountInput(raw);
    setSelectedAmount(0);
    setDonationError(null);
  };

  // Process Donation
  const handleDonate = async () => {
    setDonationError(null);

    // Rule: minimum Rp 5.000
    if (effectiveAmount < 5000) {
      setDonationError('Minimal donasi adalah Rp 5.000');
      return;
    }

    // Auth gate check
    if (!user) {
      if (openAuthModal) {
        openAuthModal();
      } else {
        showToast('Silakan masuk untuk mencatat sertifikat dan daun points.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const donorDisplayName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Pejuang Hijau';

      const res = await executeMockDonation({
        campaignId: campaign?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        userId: user.id,
        amount: effectiveAmount,
        donorName: donorDisplayName,
        message: donorMessage.trim() || undefined,
        currentPoints: effectiveUserPoints,
      });

      if (res.success) {
        // Confetti burst
        try {
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
          });
        } catch {}

        // Optimistic UI updates
        addDaunPoints(res.points_earned, `Donasi Hutan: +${res.points_earned} Daun 🍃`);
        if (refreshProfile) {
          await refreshProfile();
        }

        // Update campaign collected metrics locally
        if (campaign) {
          setCampaign((prev) =>
            prev
              ? {
                  ...prev,
                  collected_amount: prev.collected_amount + effectiveAmount,
                  planted_trees: prev.planted_trees + Math.floor(effectiveAmount / 100000),
                }
              : prev
          );
        }

        // Add to recent donations list
        const newDonItem: ForestDonation = {
          id: 'don-' + Date.now(),
          campaign_id: campaign?.id || '',
          user_id: user.id,
          amount: effectiveAmount,
          daun_points_earned: res.points_earned,
          donor_name: donorDisplayName,
          message: donorMessage.trim() || undefined,
          payment_status: 'completed',
          created_at: new Date().toISOString(),
        };
        setRecentDonations((prev) => [newDonItem, ...prev.slice(0, 5)]);

        // Reset inputs
        setDonorMessage('');

        // If certificate issued, show modal celebration!
        if (res.certificate_issued && res.certificate) {
          setActiveCertificateModal(res.certificate);
          setUserCertificates((prev) => [res.certificate!, ...prev]);
        } else {
          showToast(
            `Terima kasih ${donorDisplayName}! Donasi ${formatIDR(effectiveAmount)} berhasil disalurkan (+${res.points_earned} Daun 🍃)`
          );
        }
      } else {
        setDonationError(res.error || 'Terjadi kendala saat memproses donasi.');
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      setDonationError(err.message || 'Gagal memproses donasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = campaign
    ? Math.min(100, Math.floor((campaign.collected_amount / campaign.target_amount) * 100))
    : 0;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1A4D3A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-2 border border-white/20">
          <Sparkles className="w-4 h-4 text-[#FF9E20]" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. ACTIVE CAMPAIGN HERO CARD (RESTIK BUKIT SOEHARTO, KALIMANTAN)
      ========================================================================= */}
      <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 shadow-clay-card border-2 border-white space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shadow-clay-sm flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
                Kampanye Restorasi Hutan Aktif
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#1A4D3A]/80 shadow-clay-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF9E20]" />
                {campaign?.location || 'Kalimantan Timur'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A4D3A] tracking-tight">
              {campaign?.title || 'Restorasi Hutan Hujan Tropis Bukit Soeharto'}
            </h1>

            <p className="text-sm sm:text-base text-[#1A4D3A]/75 max-w-3xl leading-relaxed">
              {campaign?.description ||
                'Penanaman pohon Meranti dan Ulin untuk memulihkan koridor habitat satwa liar dan menyerap jejak karbon secara transparan.'}
            </p>
          </div>

          {/* Real-time Dynamic Countdown Timer */}
          <div className="self-start lg:self-auto bg-white/90 p-4 sm:p-5 rounded-2xl shadow-clay-button border border-white flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A4D3A]/70">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#357A59]" />
                Sisa Waktu Kampanye:
              </span>
              <span className="w-2 h-2 rounded-full bg-[#6DB677] animate-ping" />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#1A4D3A]/5 shadow-clay-inset">
                <span className="block text-lg font-black text-[#1A4D3A]">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Hari</span>
              </div>
              <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#1A4D3A]/5 shadow-clay-inset">
                <span className="block text-lg font-black text-[#1A4D3A]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Jam</span>
              </div>
              <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#1A4D3A]/5 shadow-clay-inset">
                <span className="block text-lg font-black text-[#1A4D3A]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Mnt</span>
              </div>
              <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#1A4D3A]/5 shadow-clay-inset">
                <span className="block text-lg font-black text-[#357A59]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#357A59] uppercase">Dtk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Metrics & Visual Progress Bar */}
        <div className="bg-white/80 p-6 sm:p-8 rounded-3xl shadow-clay-card border border-white space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#1A4D3A]/10 pb-5">
            <div>
              <span className="text-xs font-bold text-[#1A4D3A]/60 uppercase tracking-wider block">
                Dana Terkumpul
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#1A4D3A]">
                  {formatIDR(campaign?.collected_amount || 0)}
                </span>
                <span className="text-xs font-bold text-[#357A59] bg-[#E8F2ED] px-2 py-0.5 rounded-full">
                  {progressPercent}%
                </span>
              </div>
              <span className="text-xs text-[#1A4D3A]/60 mt-0.5 block">
                Target: {formatIDR(campaign?.target_amount || 25000000)}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1A4D3A]/60 uppercase tracking-wider block">
                Bibit Pohon Terkumpul
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#357A59]">
                  {campaign?.planted_trees || 118}
                </span>
                <span className="text-sm font-bold text-[#1A4D3A]/70">
                  / {campaign?.target_trees || 250} Pohon
                </span>
              </div>
              <span className="text-xs text-[#1A4D3A]/60 mt-0.5 block">
                Jenis: Meranti & Ulin endemik
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1A4D3A]/60 uppercase tracking-wider block">
                Potensi Serapan Emisi
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#1A4D3A]">
                  {((campaign?.planted_trees || 118) * 22.5).toFixed(0)}
                </span>
                <span className="text-xs font-bold text-[#1A4D3A]/70">kg CO2e / tahun</span>
              </div>
              <span className="text-xs text-[#357A59] font-semibold mt-0.5 block">
                ✓ Terverifikasi Satelit & GPS
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-[#FAF8F5] rounded-full shadow-clay-inset p-0.5 border border-white overflow-hidden">
              <div
                className="h-full bg-gradient-earth rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-[#1A4D3A]/70">
              <span>Progress Pemulihan Hutan</span>
              <span>{progressPercent}% dari Target Rp 25.000.000</span>
            </div>
          </div>
        </div>

        {/* =======================================================================
            2. INTERACTIVE DONATION FLOW (MOCK PAYMENT GATEWAY)
        ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column: Preset Chips & Amount Input */}
          <div className="lg:col-span-7 bg-white/70 p-6 sm:p-8 rounded-3xl shadow-clay-card border border-white space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-[#1A4D3A] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#357A59]" />
                <span>Pilih Nilai Donasi Restorasi</span>
              </h3>
              <p className="text-xs text-[#1A4D3A]/70">
                Pilih nominal cepat atau masukkan jumlah kustom (minimal Rp 5.000).
              </p>
            </div>

            {/* Quick Preset Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmountInput;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-earth text-white shadow-clay-green border-white scale-[1.02]'
                        : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border-white hover:bg-white active:scale-95'
                    }`}
                  >
                    <span>{formatIDR(amt)}</span>
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-[#357A59]'}`}>
                      +{Math.floor(amt / 100)} Daun 🍃
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1A4D3A]">
                Atau Masukkan Nominal Kustom (Rp):
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#1A4D3A]/50">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 15.000"
                  value={
                    customAmountInput
                      ? Number(customAmountInput).toLocaleString('id-ID')
                      : ''
                  }
                  onChange={handleCustomAmountChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white text-sm font-black text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]"
                />
              </div>
            </div>

            {/* Optional Donor Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A4D3A]">
                Pesan / Doa untuk Hutan (Opsional):
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="Tuliskan harapanmu untuk pemulihan bumi..."
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]"
              />
            </div>

            {/* Live Reward Preview */}
            <div className="p-4 rounded-2xl bg-[#E8F2ED] border border-[#357A59]/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#357A59]">
                <Sparkles className="w-4 h-4 text-[#FF9E20]" />
                <span>Pratinjau Dampak & Hadiah:</span>
              </div>
              <p className="text-xs text-[#1A4D3A] font-bold leading-relaxed">
                Kamu akan mendapatkan{' '}
                <span className="text-[#357A59] font-black">+{pointsToEarn} Daun Points</span>{' '}
                & berkontribusi menanam{' '}
                <span className="text-[#1A4D3A] font-black">
                  {treeContributionCount > 0
                    ? `${treeContributionCount} pohon nyata`
                    : 'bibit pohon hutan'}
                </span>
                .
              </p>
              <p className="text-[11px] text-[#1A4D3A]/70">
                Aturan rasio: Setiap donasi Rp 100 = 1 Daun Poin permanen.
              </p>
            </div>

            {/* Payment Gateway Toggle / Indicator */}
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] shadow-clay-sm border border-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1A4D3A] text-white flex items-center justify-center shadow-clay-sm">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1A4D3A] block">
                      Simulasi Pembayaran / Sandbox
                    </span>
                    <span className="text-[10px] text-[#357A59] font-bold">
                      BumiKita Instant Direct (Auto-Success)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#FF9E20] bg-[#FFF5E6] px-2.5 py-1 rounded-full border border-[#FF9E20]/30 whitespace-nowrap">
                  Sandbox Active
                </span>
              </div>
              <p className="text-[11px] text-[#1A4D3A]/60 italic flex items-center gap-1 pl-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#357A59]" />
                Payment gateway QRIS & GoPay resmi akan segera hadir pada fase produksi berikutnya.
              </p>
            </div>

            {/* Error Message if any */}
            {donationError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{donationError}</span>
              </div>
            )}

            {/* Action Donate Button */}
            <button
              id="btn-submit-forest-donation"
              type="button"
              onClick={handleDonate}
              disabled={isSubmitting || effectiveAmount < 5000}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all shadow-clay-button border border-white flex items-center justify-center gap-2.5 ${
                effectiveAmount >= 5000
                  ? 'bg-gradient-earth text-white shadow-clay-green hover:scale-[1.01] active:scale-98 cursor-pointer'
                  : 'bg-[#FAF8F5] text-[#1A4D3A]/40 opacity-70 cursor-not-allowed'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#FF9E20]" />
              <span>
                {isSubmitting
                  ? 'Memproses Donasi & Poin...'
                  : !user
                  ? 'Masuk untuk Donasi & Klaim Daun'
                  : `Donasi Sekarang ${formatIDR(effectiveAmount)}`}
              </span>
            </button>
          </div>

          {/* Right Column: User Gamified Level Progression & Certificates */}
          <div className="lg:col-span-5 space-y-5">
            {/* User Level Card */}
            <div className="bg-white/80 p-6 rounded-3xl shadow-clay-card border border-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A4D3A]/60">
                    Peringkat Pelestari Hutan
                  </span>
                  <h4 className="text-lg font-black text-[#1A4D3A] flex items-center gap-1.5">
                    <span>{currentLevelTitle}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                      Tier {currentTier}
                    </span>
                  </h4>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-earth text-white flex items-center justify-center text-2xl shadow-clay-green">
                  {currentTier >= 4 ? '🌍' : currentTier >= 3 ? '🌲' : currentTier >= 2 ? '🌿' : '🌱'}
                </div>
              </div>

              {/* Progress to Next Tier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#1A4D3A]/70">
                  <span>Progress ke {tierProgress.nextTitle}</span>
                  <span className="font-extrabold text-[#357A59]">
                    {effectiveUserPoints} Daun
                  </span>
                </div>
                <div className="w-full h-3 bg-[#FAF8F5] rounded-full shadow-clay-inset p-0.5 border border-white overflow-hidden">
                  <div
                    className="h-full bg-gradient-earth rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress.progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#1A4D3A]/60">
                  {currentTier >= 4
                    ? '🎉 Kamu telah mencapai tingkat tertinggi pelestari bumi!'
                    : `Kumpulkan hingga ${tierProgress.nextThreshold} Daun untuk membuka sertifikat ${tierProgress.nextTitle}.`}
                </p>
              </div>

              {/* Tier Threshold Reference Info */}
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-white text-[11px] space-y-1 text-[#1A4D3A]/80">
                <span className="font-bold text-[#1A4D3A] block">Ambang Batas Tingkat & Sertifikat:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>🌱 Seedling: &lt; 200 pts</div>
                  <div className="font-bold text-[#357A59]">🌿 Eco Artisan: ≥ 200 pts</div>
                  <div className="font-bold text-[#1A4D3A]">🌲 Forest Guardian: ≥ 500 pts</div>
                  <div className="font-black text-[#FF9E20]">🌍 Earth Champion: ≥ 1.000 pts</div>
                </div>
              </div>
            </div>

            {/* Unlocked Certificates Tray */}
            <div className="bg-white/80 p-6 rounded-3xl shadow-clay-card border border-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#1A4D3A] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#357A59]" />
                  <span>Sertifikat Terbuka ({userCertificates.length})</span>
                </h4>
                {userCertificates.length > 0 && (
                  <span className="text-[10px] font-bold text-[#357A59]">
                    Tersimpan Permanen
                  </span>
                )}
              </div>

              {userCertificates.length === 0 ? (
                <div className="text-center py-6 px-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#1A4D3A]/20 space-y-2">
                  <span className="text-3xl block">📜</span>
                  <p className="text-xs font-bold text-[#1A4D3A]">Belum Memiliki Sertifikat</p>
                  <p className="text-[11px] text-[#1A4D3A]/60 max-w-xs mx-auto">
                    Donasi mulai dari Rp 20.000 (atau kumpulkan 200 Daun) untuk membuka Sertifikat Tingkat 2 Eco Artisan!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {userCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setViewingCertificate(cert)}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-white shadow-clay-sm border border-white transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center font-bold text-base shadow-clay-sm">
                          📜
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                            {cert.level_name}
                          </h5>
                          <span className="text-[10px] font-mono text-[#357A59]">
                            {cert.certificate_code}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#1A4D3A]/60 block">
                          {new Date(cert.issued_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-[10px] text-[#357A59] font-bold">
                          Lihat / Unduh →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transparent Donations Feed */}
            <div className="bg-white/80 p-5 rounded-3xl shadow-clay-card border border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1A4D3A] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#357A59]" />
                  Donatur Terbaru (Transparan)
                </span>
                <span className="text-[10px] text-[#357A59] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6DB677] inline-block animate-pulse" />
                  Live Feed
                </span>
              </div>

              <div className="space-y-2">
                {recentDonations.slice(0, 3).map((don) => (
                  <div
                    key={don.id}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-white text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-black text-[#1A4D3A] block">{don.donor_name}</span>
                      {don.message && (
                        <p className="text-[10px] text-[#1A4D3A]/70 italic line-clamp-1">
                          &quot;{don.message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-extrabold text-[#357A59] text-xs">
                        {formatIDR(don.amount)}
                      </span>
                      <span className="block text-[9px] text-[#1A4D3A]/50">
                        +{don.daun_points_earned} Daun
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal when RPC issues a new Certificate */}
      {activeCertificateModal && (
        <CertificateModal
          certificate={activeCertificateModal}
          userName={
            profile?.full_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split('@')[0] ||
            'Pejuang Hijau'
          }
          onClose={() => setActiveCertificateModal(null)}
          onToast={showToast}
        />
      )}

      {/* Manual View Modal when user clicks an unlocked certificate */}
      {viewingCertificate && (
        <CertificateModal
          certificate={viewingCertificate}
          userName={
            profile?.full_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split('@')[0] ||
            'Pejuang Hijau'
          }
          onClose={() => setViewingCertificate(null)}
          onToast={showToast}
        />
      )}
    </div>
  );
}
