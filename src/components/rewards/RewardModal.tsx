'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { 
  X, 
  Gift, 
  Sparkles, 
  TreePine, 
  Tag, 
  ShoppingBag, 
  CheckCircle2, 
  Coins,
  Ticket
} from 'lucide-react';

interface RewardItem {
  id: string;
  title: string;
  category: 'Voucher' | 'Merch Eco' | 'Bibit Pohon' | 'Workshop Pass';
  cost: number;
  description: string;
  icon: string;
  badge?: string;
}

const REWARDS_LIST: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Voucher Diskon Rp 15.000',
    category: 'Voucher',
    cost: 150,
    description: 'Potongan langsung untuk semua produk Green Market tanpa minimum belanja.',
    icon: '🎟️',
    badge: 'Populer'
  },
  {
    id: 'rew-2',
    title: 'Free Ongkir Zero-Carbon',
    category: 'Voucher',
    cost: 100,
    description: 'Gratis ongkos kirim ramah lingkungan untuk 1 transaksi belanja.',
    icon: '🚚'
  },
  {
    id: 'rew-3',
    title: 'Bibit Pohon Mangrove Asli (GPS)',
    category: 'Bibit Pohon',
    cost: 400,
    description: 'Tanam 1 bibit mangrove atas namamu di konservasi pesisir & dapat sertifikat resmi.',
    icon: '🌱',
    badge: 'Dampak Nyata'
  },
  {
    id: 'rew-4',
    title: 'Pouch Serut Upcycle Denim',
    category: 'Merch Eco',
    cost: 350,
    description: 'Pouch buatan mahasiswa maker dari jeans daur ulang untuk kabel & kosmetik.',
    icon: '👖'
  },
  {
    id: 'rew-5',
    title: 'Tiket VIP Workshop Upcycle',
    category: 'Workshop Pass',
    cost: 250,
    description: 'Akses kelas live DIY bersama mentor circular design & kit bahan gratis.',
    icon: '🎓'
  },
  {
    id: 'rew-6',
    title: 'Stainless Straw & Brush Kit',
    category: 'Merch Eco',
    cost: 120,
    description: 'Sedotan stainless steel higienis dengan pouch kain katun organik.',
    icon: '🥤'
  }
];

export default function RewardModal() {
  const { 
    isRewardModalOpen, 
    setIsRewardModalOpen, 
    daunPoints, 
    spendDaunPoints, 
    plantRealTree 
  } = useEco();

  const [claimedReward, setClaimedReward] = useState<RewardItem | null>(null);

  if (!isRewardModalOpen) return null;

  const handleClaim = (reward: RewardItem) => {
    if (daunPoints < reward.cost) {
      alert(`Poin Daun kamu (${daunPoints}) belum cukup. Butuh ${reward.cost} Daun Points! Selesaikan quest atau setor sampah dulu ya!`);
      return;
    }

    if (reward.id === 'rew-3') {
      const success = plantRealTree();
      if (success) {
        setClaimedReward(reward);
      }
      return;
    }

    const success = spendDaunPoints(reward.cost);
    if (success) {
      setClaimedReward(reward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-clay-card border border-white p-6 sm:p-8 relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsRewardModalOpen(false);
            setClaimedReward(null);
          }}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A4D3A]/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A4D3A]">
              Pusat Penukaran Reward Eco
            </h3>
            <p className="text-xs text-[#1A4D3A]/70">
              Gunakan Daun Points hasil pilah sampah & quest untuk hadiah ramah lingkungan!
            </p>
          </div>

          {/* User Points Badge */}
          <div className="bg-[#FAF8F5] px-4 py-2.5 rounded-2xl shadow-clay-card border border-white flex items-center gap-2.5 flex-shrink-0">
            <span className="text-2xl">🍃</span>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#1A4D3A]/60">Saldo Poin Kamu</p>
              <p className="text-lg font-black text-[#357A59]">{daunPoints} Daun</p>
            </div>
          </div>
        </div>

        {/* Claim Success Banner */}
        {claimedReward && (
          <div className="p-4 rounded-2xl bg-[#E8F2ED] border border-[#357A59]/30 shadow-clay-inset flex items-center gap-3 text-xs text-[#1A4D3A] animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-[#357A59] text-white flex items-center justify-center text-lg flex-shrink-0">
              ✓
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-[#1A4D3A]">Penukaran Berhasil!</h4>
              <p className="text-[11px] text-[#1A4D3A]/80">
                Kamu telah menukar {claimedReward.cost} Daun Points untuk <strong>{claimedReward.title}</strong>. Kode/voucher aktif di keranjang atau profilmu.
              </p>
            </div>
            <button
              onClick={() => setClaimedReward(null)}
              className="text-xs font-bold text-[#357A59] underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Reward Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REWARDS_LIST.map((rew) => {
            const canAfford = daunPoints >= rew.cost;
            return (
              <div
                key={rew.id}
                className="bg-[#FAF8F5] rounded-2xl p-4 shadow-clay-card border border-white flex flex-col justify-between space-y-3 relative group"
              >
                {rew.badge && (
                  <span className="absolute top-3 right-3 bg-[#FF9E20] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                    {rew.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] flex items-center justify-center text-xl shadow-clay-sm">
                    {rew.icon}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#357A59]">
                      {rew.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#1A4D3A] leading-snug">
                      {rew.title}
                    </h4>
                    <p className="text-xs text-[#1A4D3A]/70 mt-1 leading-relaxed">
                      {rew.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1A4D3A]/10 flex items-center justify-between">
                  <span className="text-xs font-black text-[#357A59]">
                    {rew.cost} Daun Points
                  </span>

                  <button
                    onClick={() => handleClaim(rew)}
                    disabled={!canAfford}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-gradient-earth text-white shadow-clay-green hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-[#FAF8F5] text-[#1A4D3A]/40 shadow-clay-pill border border-white cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Tukar Sekarang' : 'Poin Kurang'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 rounded-2xl bg-[#FFF5E6] border border-[#FF9E20]/20 text-center text-xs text-[#D97E0D] font-medium">
          💡 Mau kumpulkan Daun Points lebih cepat? Scan sampah di <strong>AI Scanner</strong> atau ikuti <strong>Misi Harian</strong> di halaman Hutan & Quest!
        </div>
      </div>
    </div>
  );
}
