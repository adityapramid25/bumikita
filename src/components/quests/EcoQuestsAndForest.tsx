'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useEco } from '@/src/context/EcoContext';
import { 
  TreePine, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  MapPin, 
  Zap, 
  Flame, 
  Coins, 
  ShieldCheck, 
  ChevronRight, 
  Download,
  Calendar,
  Compass,
  CalendarCheck,
  Share2,
  ShoppingBag,
  BookOpen,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';

export default function EcoQuestsAndForest() {
  const { 
    daunPoints, 
    quests, 
    completeQuest, 
    dailyMissions,
    claimDailyMission,
    treesPlanted, 
    plantedTreesList, 
    plantRealTree,
    co2SavedKg 
  } = useEco();

  const [selectedTreeCert, setSelectedTreeCert] = useState<any | null>(null);
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTipModal, setActiveTipModal] = useState<boolean>(false);

  // Growth calculation (400 points per tree)
  const treeCost = 400;
  const progressToNextTree = Math.min(100, Math.floor((daunPoints / treeCost) * 100));

  const handleCompleteQuest = (id: string) => {
    completeQuest(id);
  };

  const handleClaimDaily = async (missionId: string, actionType: string) => {
    setClaimingMissionId(missionId);

    if (actionType === 'share') {
      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'BumiKita - AI Upcycling & Circular Economy',
            text: 'Yuk pilah sampah dan hasilkan cuan karya kreatif bersama BumiKita!',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://bumikita.id',
          });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(
            `${typeof window !== 'undefined' ? window.location.origin : 'https://bumikita.id'} - Yuk pilah sampah & dapatkan cuan di BumiKita!`
          );
        }
      } catch (err) {
        // User may cancel native sheet, continue to claim
      }
    }

    const res = await claimDailyMission(missionId);
    setClaimingMissionId(null);

    if (res.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#357A59', '#6DB677', '#FF9E20', '#FAF8F5'],
        });
      } catch {}
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getRank = () => {
    if (treesPlanted >= 5) return { title: 'Earth Guardian 🌍', level: 'Lv. 5', color: '#1A4D3A' };
    if (treesPlanted >= 3) return { title: 'Forest Champion 🌲', level: 'Lv. 3', color: '#357A59' };
    if (treesPlanted >= 1) return { title: 'Eco Artisan 🌿', level: 'Lv. 2', color: '#6DB677' };
    return { title: 'Sprout Novice 🌱', level: 'Lv. 1', color: '#FF9E20' };
  };

  const currentRank = getRank();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 shadow-clay-card border border-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
              Hutan Virtual & Pohon Nyata Ber-GPS
            </h2>
            <p className="text-sm sm:text-base text-[#1A4D3A]/70 max-w-2xl">
              Kumpulkan Daun Points dari quest harian & belanja sirkular. Setiap <span className="font-bold text-[#357A59]">400 Daun Points</span> bisa kamu tukar untuk menanam 1 bibit pohon asli di konservasi mangrove & hutan hujan Indonesia!
            </p>
          </div>

          {/* User Rank Card */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl shadow-clay-button border border-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-earth text-white flex items-center justify-center font-extrabold text-xl shadow-clay-green">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A4D3A]/60">Peringkat Eco Kamu</span>
              <h4 className="text-base font-extrabold text-[#1A4D3A]">{currentRank.title}</h4>
              <p className="text-xs font-bold text-[#357A59]">{currentRank.level} • {treesPlanted} Pohon Terdaftar</p>
            </div>
          </div>
        </div>

        {/* Tree Growth Interactive Canvas Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 border-t border-[#1A4D3A]/10">
          {/* Left: Animated Tree Visualization */}
          <div className="lg:col-span-6 bg-gradient-to-b from-[#EBF4EE] to-[#FAF8F5] p-6 sm:p-8 rounded-3xl shadow-clay-card border border-white text-center space-y-4 relative overflow-hidden">
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Pulsing tree glow */}
              <div className="absolute inset-0 bg-[#6DB677]/20 rounded-full blur-xl animate-pulse" />
              
              <div className="relative text-7xl select-none transform hover:scale-110 transition-transform duration-300">
                {progressToNextTree < 30 ? '🌱' : progressToNextTree < 70 ? '🌿' : progressToNextTree < 100 ? '🌳' : '🌲'}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-[#1A4D3A]">
                {progressToNextTree < 30 
                  ? 'Benih Mangrove Baru (Fase Bibit)' 
                  : progressToNextTree < 70 
                  ? 'Tunas Muda Bertumbuh Subur' 
                  : progressToNextTree < 100 
                  ? 'Pohon Siap Ditanam di Lapangan!' 
                  : '🎉 Siap Ditanam Secara Nyata!'}
              </h4>
              <p className="text-xs text-[#1A4D3A]/70 font-medium">
                {daunPoints} / {treeCost} Daun Points terkumpul ({progressToNextTree}%)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-[#FAF8F5] rounded-full shadow-clay-inset p-0.5 border border-white overflow-hidden">
              <div 
                className="h-full bg-gradient-earth rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressToNextTree}%` }}
              />
            </div>

            {/* Plant Real Tree Action Button */}
            <button
              id="btn-plant-real-tree"
              onClick={plantRealTree}
              disabled={daunPoints < treeCost}
              className={`w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-clay-button border border-white flex items-center justify-center gap-2 ${
                daunPoints >= treeCost
                  ? 'bg-gradient-earth text-white shadow-clay-green hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-[#FAF8F5] text-[#1A4D3A]/40 opacity-70 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FF9E20]" />
              <span>Tanam Pohon Nyata Sekarang (Tukar 400 Daun)</span>
            </button>
          </div>

          {/* Right: Verified Planted Trees Registry */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1A4D3A] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#357A59]" />
                <span>Sertifikat Pohon Nyata Kamu ({plantedTreesList.length})</span>
              </h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {plantedTreesList.map((tree) => (
                <div
                  key={tree.id}
                  onClick={() => setSelectedTreeCert(tree)}
                  className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white hover:bg-[#F6F3EC] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center text-lg font-bold shadow-clay-sm flex-shrink-0">
                      🌴
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                        {tree.species}
                      </h4>
                      <p className="text-[11px] text-[#1A4D3A]/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#357A59]" />
                        <span>{tree.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#357A59] bg-[#E8F2ED] px-2 py-0.5 rounded-full border border-[#357A59]/20">
                      {tree.certificateId}
                    </span>
                    <p className="text-[10px] text-[#1A4D3A]/50 mt-1">
                      -{tree.co2AbsorbedPerYearKg} kg CO2/th
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1A4D3A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#FF9E20]" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          DAILY MISSIONS (PRIMARY REVENUE SOURCE FOR DAUN POINTS)
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A4D3A] tracking-tight">
              Misi Harian Daun (Daily Missions)
            </h3>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
              Klaim Daun setiap hari untuk membiayai AI Scanner sampah (50 Daun/scan) atau menanam pohon!
            </p>
          </div>
          <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-white shadow-clay-sm text-xs font-bold text-[#357A59] flex items-center gap-1.5">
            <span>Saldo:</span>
            <span className="text-[#1A4D3A] font-extrabold">{daunPoints} Daun 🍃</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyMissions.map((mission) => {
            const isClaimed = mission.is_claimed;
            const isLoading = claimingMissionId === mission.id;

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
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isClaimed
                    ? 'bg-[#E8F2ED]/60 border-[#357A59]/20 shadow-clay-sm opacity-85'
                    : 'bg-[#FAF8F5] border-white shadow-clay-card hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-clay-sm flex items-center justify-center">
                      {renderIcon()}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                      +{mission.reward_points} Daun 🍃
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A4D3A]">
                      {mission.title}
                    </h4>
                    <p className="text-xs text-[#1A4D3A]/70 leading-relaxed mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  {mission.id === 'read_eco_tip' && !isClaimed ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTipModal(true);
                          handleClaimDaily(mission.id, 'read');
                        }}
                        disabled={isLoading}
                        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca & Klaim +{mission.reward_points} Daun</span>
                      </button>
                    </div>
                  ) : mission.id === 'explore_market' && !isClaimed ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleClaimDaily(mission.id, 'navigate')}
                        disabled={isLoading}
                        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Klaim +{mission.reward_points} Daun</span>
                      </button>
                      <Link
                        href="/market"
                        className="w-full text-center block text-[11px] font-bold text-[#357A59] hover:underline"
                      >
                        Kunjungi Market →
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClaimDaily(mission.id, mission.action_type)}
                      disabled={isClaimed || isLoading}
                      className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isClaimed
                          ? 'bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/30 cursor-default'
                          : 'bg-gradient-earth text-white shadow-clay-button hover:scale-[1.02] active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Telah Diklaim Hari Ini</span>
                        </>
                      ) : isLoading ? (
                        <span>Memproses Klaim...</span>
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
      </div>

      {/* Gamified Daily & Weekly Eco Quests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A4D3A] tracking-tight">
              Misi Harian & Mingguan Gen-Z
            </h3>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
              Selesaikan aksi nyata di sekolah/kampus untuk mendapatkan Daun Points!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                quest.completed
                  ? 'bg-[#E8F2ED] border-[#357A59]/30 shadow-clay-inset'
                  : 'bg-[#FAF8F5] border-white shadow-clay-card'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    quest.category === 'daily' 
                      ? 'bg-[#FFF5E6] text-[#D97E0D]' 
                      : quest.category === 'weekly' 
                      ? 'bg-[#EBF4EE] text-[#357A59]' 
                      : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-sm'
                  }`}>
                    {quest.category === 'daily' ? 'Harian' : quest.category === 'weekly' ? 'Mingguan' : 'Aksi Kampus'}
                  </span>

                  <span className="text-[11px] font-bold text-[#357A59]">
                    +{quest.daunPoints} Daun 🍃
                  </span>
                </div>

                <h4 className={`text-sm sm:text-base font-extrabold text-[#1A4D3A] ${quest.completed ? 'line-through opacity-75' : ''}`}>
                  {quest.title}
                </h4>

                <p className="text-xs text-[#1A4D3A]/75 leading-relaxed">
                  {quest.description}
                </p>

                <p className="text-[11px] font-bold text-[#357A59] pt-1">
                  🌱 Dampak: Menekan {quest.co2ReducedKg} kg CO2e
                </p>
              </div>

              {/* Action Button */}
              <button
                id={`btn-quest-action-${quest.id}`}
                onClick={() => handleCompleteQuest(quest.id)}
                disabled={quest.completed}
                className={`px-4 py-2.5 rounded-full font-bold text-xs flex-shrink-0 transition-all ${
                  quest.completed
                    ? 'bg-[#357A59] text-white shadow-sm cursor-default'
                    : 'bg-gradient-earth text-white shadow-clay-green hover:scale-105 active:scale-95 cursor-pointer'
                }`}
              >
                {quest.completed ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesai
                  </span>
                ) : (
                  <span>Klaim Selesai</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tree Certificate Detail Modal */}
      {selectedTreeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-clay-card border border-white space-y-6 relative text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-earth text-white flex items-center justify-center mx-auto text-3xl shadow-clay-green">
              🌲
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#357A59] bg-[#E8F2ED] px-3 py-1 rounded-full">
                Sertifikat Resmi Restorasi BumiKita
              </span>
              <h3 className="text-xl font-extrabold text-[#1A4D3A] pt-2">
                {selectedTreeCert.species}
              </h3>
              <p className="text-xs font-mono text-[#1A4D3A]/60">
                ID: {selectedTreeCert.certificateId}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F2ED] text-left space-y-2 text-xs border border-[#357A59]/20">
              <div className="flex justify-between">
                <span className="text-[#1A4D3A]/70">Lokasi Penanaman:</span>
                <span className="font-bold text-[#1A4D3A]">{selectedTreeCert.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A4D3A]/70">Koordinat GPS:</span>
                <span className="font-mono font-bold text-[#357A59]">{selectedTreeCert.coordinates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A4D3A]/70">Tanggal Tanam:</span>
                <span className="font-bold text-[#1A4D3A]">{selectedTreeCert.plantedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A4D3A]/70">Daya Serap Karbon:</span>
                <span className="font-bold text-[#357A59]">{selectedTreeCert.co2AbsorbedPerYearKg} kg CO2 / tahun</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTreeCert(null)}
              className="w-full py-3 rounded-full bg-[#1A4D3A] text-white font-bold text-xs shadow-clay-button hover:bg-[#357A59] transition-all cursor-pointer"
            >
              Tutup Sertifikat
            </button>
          </div>
        </div>
      )}

      {/* Eco Tip Education Modal */}
      {activeTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-clay-card border border-white space-y-5 relative text-left"
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
                  Cara Memilah Plastik & Kardus Sebelum Upcycle
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#1A4D3A]">
              <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                <span className="font-extrabold text-[#357A59]">1. Bilas & Keringkan Botol PET</span>
                <p className="text-[#1A4D3A]/75">
                  Sisa cairan manis atau minyak menurunkan daya rekat lem dan memicu jamur saat proses kreasi kerajinan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                <span className="font-extrabold text-[#357A59]">2. Pisahkan Tutup HDPE dari Botol</span>
                <p className="text-[#1A4D3A]/75">
                  Tutup botol memiliki titik leleh lebih rendah dan sangat ideal untuk dilelehkan menjadi tatakan gelas tahan panas.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white shadow-clay-sm border border-[#1A4D3A]/5 space-y-1">
                <span className="font-extrabold text-[#357A59]">3. Lipat Kardus Tanpa Lakban Plastik</span>
                <p className="text-[#1A4D3A]/75">
                  Lepas pita perekat plastik terlebih dahulu sebelum memotong pola kotak organizer atau lampu tidur skandinavia.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTipModal(false)}
              className="w-full py-3 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-button hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
            >
              Saya Mengerti & Tutup Edukasi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
