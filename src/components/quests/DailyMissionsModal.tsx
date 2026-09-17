'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  CalendarCheck, 
  Share2, 
  ShoppingBag, 
  BookOpen, 
  Check, 
  ChevronRight, 
  Coins, 
  TreePine, 
  ExternalLink,
  Info,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { useEco } from '@/src/context/EcoContext';
import { useAuth } from '@/src/context/AuthContext';

export default function DailyMissionsModal() {
  const { 
    daunPoints, 
    isMissionsOpen, 
    setIsMissionsOpen,
    dailyMissions, 
    claimDailyMission,
    setIsRewardModalOpen 
  } = useEco();

  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTipModal, setActiveTipModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMissionsOpen) {
        setIsMissionsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMissionsOpen, setIsMissionsOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isMissionsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMissionsOpen]);

  if (!isMissionsOpen) return null;

  const totalMissions = dailyMissions.length;
  const completedMissions = dailyMissions.filter((m) => m.is_claimed).length;
  const progressPercent = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  const handleClaim = async (missionId: string, actionType?: string) => {
    if (!user) {
      setIsMissionsOpen(false);
      openAuthModal('login', 'Silakan masuk terlebih dahulu untuk mengklaim misi harian dan mengumpulkan Daun.');
      return;
    }

    setClaimingId(missionId);

    if (actionType === 'share') {
      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'BumiKita - Upcycle Sampah Jadi Cuan',
            text: 'Yuk pilah sampah, klaim Daun Points harian, dan buat karya upcycle bernilai tinggi di BumiKita!',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://bumikita.id',
          });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(
            `${typeof window !== 'undefined' ? window.location.origin : 'https://bumikita.id'} - Yuk pilah sampah & dapatkan cuan di BumiKita!`
          );
          setToastMessage('Link BumiKita berhasil disalin ke clipboard! 📋');
        }
      } catch (err) {
        // Continue even if share dialog dismissed
      }
    }

    const res = await claimDailyMission(missionId);
    setClaimingId(null);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
        });
      } catch {}
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleNavigateMarket = async (missionId: string) => {
    await handleClaim(missionId, 'navigate');
    setIsMissionsOpen(false);
    router.push('/market');
  };

  const handleOpenTip = () => {
    setActiveTipModal(true);
  };

  const handleCompleteTip = async () => {
    setActiveTipModal(false);
    await handleClaim('read_eco_tip', 'read');
  };

  return (
    <AnimatePresence>
      <div 
        id="modal-daily-missions-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 overflow-y-auto"
        onClick={() => setIsMissionsOpen(false)}
      >
        <motion.div
          id="modal-daily-missions-content"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#FAF8F5] rounded-[32px] max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-white text-left relative my-auto max-h-[90vh] flex flex-col justify-between overflow-hidden"
        >
          {/* Header Strip */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1A4D3A]/10">
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
                Klaim Daun Gratis & Bangun Hutan
              </h2>

              <p className="text-xs sm:text-sm text-[#1A4D3A]/70 max-w-md leading-relaxed">
                Selesaikan aksi cepat harian untuk membiayai <span className="font-bold text-[#357A59]">AI Scanner (50 Daun/scan)</span> atau menabung untuk menanam bibit pohon asli!
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              id="btn-close-daily-missions-modal"
              onClick={() => setIsMissionsOpen(false)}
              className="w-10 h-10 rounded-2xl bg-white shadow-clay-card border border-white/90 flex items-center justify-center text-[#1A4D3A] hover:bg-[#FAF8F5] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Points Status & Progress Bar */}
          <div className="py-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-[#1A4D3A]/70">Progres Hari Ini:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F2ED] text-[#357A59] font-black">
                  {completedMissions} dari {totalMissions} Misi
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white shadow-clay-sm border border-white font-extrabold text-[#1A4D3A]">
                <span>Saldo Kamu:</span>
                <motion.span 
                  key={daunPoints}
                  initial={{ scale: 1.25, color: '#357A59' }}
                  animate={{ scale: 1, color: '#1A4D3A' }}
                  className="text-[#357A59] font-black"
                >
                  🍃 {daunPoints} Daun
                </motion.span>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E8F2ED] rounded-full overflow-hidden p-0.5 shadow-clay-inset">
              <div 
                className="h-full bg-gradient-earth rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toast banner inside modal if triggered */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 px-4 py-2.5 rounded-2xl bg-[#1A4D3A] text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#FF9E20]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {/* Missions List */}
          <div className="overflow-y-auto space-y-3 pr-1 max-h-[50vh] py-1">
            {dailyMissions.map((mission) => {
              const isClaimed = mission.is_claimed;
              const isLoading = claimingId === mission.id;

              const renderIcon = () => {
                if (mission.icon_name === 'CalendarCheck' || mission.id === 'daily_checkin') {
                  return <CalendarCheck className="w-5 h-5 text-[#357A59]" />;
                }
                if (mission.icon_name === 'Share2' || mission.id === 'share_friend') {
                  return <Share2 className="w-5 h-5 text-[#FF9E20]" />;
                }
                if (mission.icon_name === 'ShoppingBag' || mission.id === 'explore_market') {
                  return <ShoppingBag className="w-5 h-5 text-[#357A59]" />;
                }
                return <BookOpen className="w-5 h-5 text-[#357A59]" />;
              };

              return (
                <div
                  key={mission.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isClaimed
                      ? 'bg-[#E8F2ED]/60 border-[#357A59]/20 shadow-clay-sm opacity-85'
                      : 'bg-white border-white shadow-clay-card hover:border-[#6DB677]/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] shadow-clay-sm flex items-center justify-center shrink-0 border border-white">
                      {renderIcon()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm sm:text-base text-[#1A4D3A]">
                          {mission.title}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                          +{mission.reward_points} Daun 🍃
                        </span>
                      </div>

                      <p className="text-xs text-[#1A4D3A]/70 leading-relaxed max-w-sm">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:self-center shrink-0 w-full sm:w-auto">
                    {mission.id === 'read_eco_tip' && !isClaimed ? (
                      <button
                        type="button"
                        id={`btn-daily-mission-${mission.id}`}
                        onClick={handleOpenTip}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca & Klaim (+{mission.reward_points})</span>
                      </button>
                    ) : mission.id === 'explore_market' && !isClaimed ? (
                      <button
                        type="button"
                        id={`btn-daily-mission-${mission.id}`}
                        onClick={() => handleNavigateMarket(mission.id)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Jelajahi & Klaim (+{mission.reward_points})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`btn-daily-mission-${mission.id}`}
                        onClick={() => handleClaim(mission.id, mission.action_type)}
                        disabled={isClaimed || isLoading}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          isClaimed
                            ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/30 cursor-default'
                            : 'bg-gradient-earth text-white shadow-clay-button hover:scale-105 active:scale-95 cursor-pointer'
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#357A59]" />
                            <span>Telah Diklaim Hari Ini</span>
                          </>
                        ) : isLoading ? (
                          <span>Mengklaim...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-[#FF9E20]" />
                            <span>Klaim +{mission.reward_points} Daun</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation Strip */}
          <div className="mt-4 pt-3.5 border-t border-[#1A4D3A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A4D3A]/70">
            <div className="flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-[#357A59] shrink-0" />
              <span>400 Daun Points = 1 Bibit Pohon Asli Ber-GPS</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMissionsOpen(false);
                setIsRewardModalOpen(true);
              }}
              className="text-[#357A59] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Katalog Hadiah & Tukar Pohon</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Nested Eco Tip Education Modal */}
        {activeTipModal && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setActiveTipModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white space-y-5 text-left relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-2xl shadow-clay-sm">
                  💡
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#357A59] bg-[#E8F2ED] px-2.5 py-0.5 rounded-full">
                    Edukasi 1 Menit BumiKita
                  </span>
                  <h3 className="text-lg font-black text-[#1A4D3A] pt-1">
                    Cara Memilah Sampah Sebelum Daur Ulang
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#1A4D3A]">
                <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                  <span className="font-extrabold text-[#357A59]">1. Bilas & Keringkan Botol PET</span>
                  <p className="text-[#1A4D3A]/75">
                    Sisa cairan manis atau minyak menurunkan daya rekat lem dan memicu jamur saat proses kreasi kerajinan upcycle.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                  <span className="font-extrabold text-[#357A59]">2. Pisahkan Tutup HDPE dari Botol</span>
                  <p className="text-[#1A4D3A]/75">
                    Tutup botol memiliki titik leleh berbeda dan sangat ideal untuk dicetak ulang menjadi tatakan gelas tahan panas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                  <span className="font-extrabold text-[#357A59]">3. Lepaskan Lakban Plastik dari Kardus</span>
                  <p className="text-[#1A4D3A]/75">
                    Kardus bersih bebas lakban siap dipotong menjadi kotak organizer meja atau rangka kap lampu skandinavia.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteTip}
                className="w-full py-3 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai Membaca & Klaim +20 Daun 🍃</span>
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
