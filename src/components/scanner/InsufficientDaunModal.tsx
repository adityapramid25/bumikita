'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  X, 
  Sparkles, 
  Share2, 
  CalendarCheck, 
  ShoppingBag, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useEco } from '@/src/context/EcoContext';
import { useRouter } from 'next/navigation';

export default function InsufficientDaunModal() {
  const { 
    daunPoints, 
    isInsufficientModalOpen, 
    setIsInsufficientModalOpen,
    dailyMissions,
    claimDailyMission,
    setActiveTab,
    setNotificationToast
  } = useEco();

  const router = useRouter();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTipModal, setActiveTipModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isInsufficientModalOpen) return null;

  const neededPoints = 50;
  const deficit = Math.max(0, neededPoints - daunPoints);
  const hasEnough = daunPoints >= neededPoints;

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      await claimDailyMission(missionId);
    } catch (e) {
      console.error('Error claiming mission in modal:', e);
    } finally {
      setClaimingId(null);
    }
  };

  const handleShare = async (missionId: string) => {
    const shareText = 'Yuk pilah sampah dan buat kreasi upcycling bernilai tinggi di BumiKita! https://bumikita.id';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'BumiKita - Upcycle Sampah Jadi Berkah',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        // user cancelled or share failed, proceed to claim
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      } catch (err) {}
    }
    await handleClaim(missionId);
  };

  const handleNavigateMarket = async (missionId: string) => {
    await handleClaim(missionId);
    setIsInsufficientModalOpen(false);
    setActiveTab('market');
    router.push('/market');
  };

  const handleOpenEcoTip = () => {
    setActiveTipModal(true);
  };

  const handleClaimTip = async () => {
    await handleClaim('read_eco_tip');
    setActiveTipModal(false);
  };

  return (
    <div 
      id="modal-insufficient-daun-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={() => setIsInsufficientModalOpen(false)}
    >
      <motion.div
        id="modal-insufficient-daun-card"
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-[32px] p-6 sm:p-8 shadow-clay-card border-2 border-white space-y-6 text-[#1A4D3A] overflow-hidden"
      >
        {/* Top Close Button */}
        <button
          id="btn-close-insufficient-modal"
          onClick={() => setIsInsufficientModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white text-[#1A4D3A]/60 hover:text-[#1A4D3A] shadow-clay-button border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5E6] border border-[#FF9E20]/30 text-[#D97E0D] flex items-center justify-center text-2xl shadow-clay-card shrink-0">
            🍂
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
              Daun Poin Tidak Cukup
            </h3>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70 leading-relaxed">
              Memindai sampah dengan model AI memerlukan <span className="font-bold text-[#1A4D3A]">50 Daun Points</span>. Poin kamu saat ini: <span className="font-extrabold text-[#D97E0D]">{daunPoints} Daun</span>.
            </p>
          </div>
        </div>

        {/* Progress Toward 50 Daun */}
        <div className="bg-white/80 p-4 rounded-2xl border border-[#1A4D3A]/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1A4D3A]/70 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
              Status Poin Daun
            </span>
            <span className={hasEnough ? 'text-[#357A59]' : 'text-[#D97E0D]'}>
              {daunPoints} / 50 Daun {hasEnough ? '(Poin Cukup!)' : `(Kurang ${deficit} Daun)`}
            </span>
          </div>
          <div className="w-full h-3 bg-[#E8F2ED] rounded-full overflow-hidden p-0.5 shadow-clay-inset">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                hasEnough ? 'bg-[#357A59]' : 'bg-gradient-to-r from-[#FF9E20] to-[#6DB677]'
              }`}
              style={{ width: `${Math.min(100, Math.round((daunPoints / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* If user reached >= 50 Daun through modal actions */}
        {hasEnough ? (
          <div className="p-4 rounded-2xl bg-[#E8F2ED] border border-[#357A59]/40 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-sm font-black text-[#1A4D3A]">
              <Sparkles className="w-4 h-4 text-[#FF9E20]" />
              <span>Hore! Poin Daun kamu sudah cukup ({daunPoints} Daun)</span>
            </div>
            <p className="text-xs text-[#1A4D3A]/80">
              Sekarang kamu bisa langsung melanjutkan proses pemindaian sampah dengan AI.
            </p>
            <button
              id="btn-continue-scan-after-sufficient"
              onClick={() => setIsInsufficientModalOpen(false)}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjut Scan Sampah Sekarang (Biaya 50 Daun)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Quick Missions List */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A4D3A]">
                🎯 Selesaikan Misi Harian Cepat (+Poin)
              </span>
              <span className="text-[11px] font-bold text-[#357A59]">
                Reset tiap hari
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {dailyMissions.map((mission) => {
                const isClaiming = claimingId === mission.id;
                const isDone = mission.is_claimed;

                return (
                  <div
                    key={mission.id}
                    id={`modal-mission-${mission.id}`}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-[#E8F2ED]/60 border-[#357A59]/20 opacity-75'
                        : 'bg-white border-[#1A4D3A]/10 shadow-clay-card hover:border-[#357A59]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                        isDone ? 'bg-[#E8F2ED] text-[#357A59]' : 'bg-[#FFF5E6] text-[#D97E0D]'
                      }`}>
                        {mission.id === 'daily_checkin' && <CalendarCheck className="w-4 h-4 text-[#357A59]" />}
                        {mission.id === 'share_friend' && <Share2 className="w-4 h-4 text-[#FF9E20]" />}
                        {mission.id === 'explore_market' && <ShoppingBag className="w-4 h-4 text-[#357A59]" />}
                        {mission.id === 'read_eco_tip' && <BookOpen className="w-4 h-4 text-[#1A4D3A]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-black text-[#1A4D3A] truncate ${isDone ? 'line-through text-[#1A4D3A]/60' : ''}`}>
                            {mission.title}
                          </h4>
                          <span className="text-[11px] font-black text-[#357A59] shrink-0">
                            +{mission.reward_points} 🍃
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1A4D3A]/70 truncate">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F2ED] text-[#357A59] text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Klaim
                        </span>
                      ) : mission.action_type === 'share' ? (
                        <button
                          id="btn-modal-mission-share"
                          onClick={() => handleShare(mission.id)}
                          disabled={isClaiming}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-earth text-white text-xs font-bold shadow-clay-button hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{copiedLink ? 'Tersalin & Klaim' : 'Bagikan (+50)'}</span>
                        </button>
                      ) : mission.action_type === 'navigate' ? (
                        <button
                          id="btn-modal-mission-navigate"
                          onClick={() => handleNavigateMarket(mission.id)}
                          disabled={isClaiming}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#1A4D3A]/20 text-[#1A4D3A] text-xs font-bold hover:bg-[#E8F2ED] hover:border-[#357A59] hover:text-[#357A59] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka (+30)</span>
                        </button>
                      ) : mission.id === 'read_eco_tip' ? (
                        <button
                          id="btn-modal-mission-tip"
                          onClick={handleOpenEcoTip}
                          disabled={isClaiming}
                          className="px-3.5 py-1.5 rounded-xl bg-[#357A59] text-white text-xs font-bold shadow-clay-button hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Baca (+20)</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-modal-claim-${mission.id}`}
                          onClick={() => handleClaim(mission.id)}
                          disabled={isClaiming}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-earth text-white text-xs font-bold shadow-clay-button hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-[#FF9E20]" />
                          <span>{isClaiming ? 'Mengambil...' : `Klaim (+${mission.reward_points})`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="pt-2 border-t border-[#1A4D3A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            id="btn-go-to-quests-page"
            onClick={() => {
              setIsInsufficientModalOpen(false);
              setActiveTab('quests-forest');
              router.push('/quests');
            }}
            className="text-[#357A59] hover:text-[#1A4D3A] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Buka Halaman Misi & Hutan Virtual</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-cancel-insufficient"
            onClick={() => setIsInsufficientModalOpen(false)}
            className="text-[#1A4D3A]/60 hover:text-[#1A4D3A] font-semibold transition-colors cursor-pointer"
          >
            Kembali ke Scanner
          </button>
        </div>

        {/* Sub-Modal: Edukasi 1 Menit (Eco Tip) */}
        {activeTipModal && (
          <div 
            className="absolute inset-0 bg-[#FAF8F5] p-6 rounded-[32px] z-20 flex flex-col justify-between animate-in fade-in zoom-in-95"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-[#EBF4EE] text-[#357A59] text-[10px] font-black uppercase tracking-wider">
                  🌱 Edukasi 1 Menit Hari Ini
                </span>
                <span className="text-xs font-black text-[#357A59]">+20 Daun Points</span>
              </div>
              <h4 className="text-base font-extrabold text-[#1A4D3A]">
                Mengenal Polimer PET & Potensi Upcycling
              </h4>
              <p className="text-xs text-[#1A4D3A]/80 leading-relaxed">
                Botol air mineral terbuat dari plastik jenis <strong>PET (Polyethylene Terephthalate)</strong> dengan kode daur ulang 1. PET memiliki ketahanan mekanik tinggi dan titik leleh ~250°C. 
              </p>
              <div className="p-3 bg-white rounded-xl border border-[#357A59]/20 text-xs text-[#1A4D3A]/80 space-y-1">
                <strong className="text-[#357A59] block">💡 Tip Upcycle BumiKita:</strong>
                Sebelum dipotong menjadi pot tanaman atau diolah, pisahkan tutup botol (biasanya HDPE #2) dan label (PP #5) agar kemurnian material terjaga dan tidak mencemari lingkungan.
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveTipModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#1A4D3A]/20 text-xs font-bold text-[#1A4D3A]"
              >
                Batal
              </button>
              <button
                id="btn-confirm-claim-tip"
                onClick={handleClaimTip}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-earth text-white text-xs font-bold shadow-clay-button hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF9E20]" />
                <span>Paham & Klaim +20 Daun</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
