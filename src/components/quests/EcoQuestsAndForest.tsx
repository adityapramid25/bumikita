'use client';

import React, { useState } from 'react';
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
  Compass
} from 'lucide-react';

export default function EcoQuestsAndForest() {
  const { 
    daunPoints, 
    quests, 
    completeQuest, 
    treesPlanted, 
    plantedTreesList, 
    plantRealTree,
    co2SavedKg 
  } = useEco();

  const [selectedTreeCert, setSelectedTreeCert] = useState<any | null>(null);

  // Growth calculation (400 points per tree)
  const treeCost = 400;
  const progressToNextTree = Math.min(100, Math.floor((daunPoints / treeCost) * 100));

  const handleCompleteQuest = (id: string) => {
    completeQuest(id);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#6DB677]/40 text-[#1A4D3A] text-xs font-bold shadow-clay-sm">
              <TreePine className="w-3.5 h-3.5 text-[#357A59]" />
              <span>Program Restorasi Hutan & Pesisir BumiKita</span>
            </div>
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
    </section>
  );
}
