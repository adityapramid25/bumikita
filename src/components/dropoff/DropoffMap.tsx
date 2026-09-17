'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { INITIAL_DROPOFF_LOCATIONS } from '@/src/data/mockData';
import { DropoffLocation } from '@/src/types';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ExternalLink, 
  QrCode, 
  Sparkles, 
  Leaf, 
  School,
  X,
  CheckCircle2,
  Send,
  Building2,
  Award
} from 'lucide-react';

interface EcoBadgeProps {
  variant?: 'green' | 'light' | 'warm';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}

function EcoBadge({
  variant = 'green',
  icon,
  children,
  className = '',
  uppercase = false,
}: EcoBadgeProps) {
  const variantStyles = {
    // Category A: Status / Verified (Green Theme)
    green: 'bg-[#EBF7F2] text-[#1A4D3A] border border-[#6DB677]/10',
    // Category B: Informational / Project Type (Light Theme)
    light: 'bg-[#FAFBF9] text-[#357A59] border border-[#357A59]/10',
    // Category C: Highlight / Partnerships (Warm Theme)
    warm: 'bg-[#FFF8F0] text-[#996D00] border border-[#CC9900]/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider shadow-clay-inset select-none ${
        uppercase ? 'uppercase' : ''
      } ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

export default function DropoffMap() {
  const { addDaunPoints } = useEco();

  const [activeFilter, setActiveFilter] = useState<'all' | 'semarang'>('all');
  const [pilotLocation] = useState<DropoffLocation>(INITIAL_DROPOFF_LOCATIONS[0]);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositWeight, setDepositWeight] = useState(1.5);

  // Partnership Proposal Modal State
  const [partnershipModalOpen, setPartnershipModalOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    institutionName: '',
    institutionType: 'Sekolah (SMA/SMK/SMP)',
    city: '',
    coordinatorName: '',
    contactNumber: '',
    notes: '',
  });

  const handleSimulateDeposit = () => {
    if (!pilotLocation) return;
    const earned = Math.floor(depositWeight * pilotLocation.pointsPerKg);
    addDaunPoints(earned, `Setor Sampah ${depositWeight}kg di ${pilotLocation.name}`);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setDepositModalOpen(false);
    }, 2000);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setPartnershipModalOpen(false);
      setPartnerForm({
        institutionName: '',
        institutionType: 'Sekolah (SMA/SMK/SMP)',
        city: '',
        coordinatorName: '',
        contactNumber: '',
        notes: '',
      });
    }, 2400);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
      {/* 1. Header & Subtitle Refinement */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#1A4D3A]/10">
        <div className="space-y-2">
          <EcoBadge
            variant="light"
            icon={<Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />}
          >
            Pilot Project Ekonomi Sirkular
          </EcoBadge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A4D3A] tracking-tight">
            Titik Drop-off Sampah & Bank Sampah
          </h1>
          <p className="text-sm sm:text-base text-[#1A4D3A]/75 max-w-2xl leading-relaxed">
            Setor sampah anorganik terpilah langsung ke lokasi mitra untuk ditimbang dan ditukar Daun Points.
          </p>
        </div>

        {/* 2. City Filter Chips & Expansion Note */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#1A4D3A] text-white shadow-clay-button'
                  : 'bg-[#FAFBF9] text-[#1A4D3A]/75 shadow-clay-inset border border-[#357A59]/10 hover:bg-[#FAF8F5]'
              }`}
            >
              Semua Titik (1)
            </button>
            <button
              onClick={() => setActiveFilter('semarang')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'semarang'
                  ? 'bg-[#EBF7F2] text-[#1A4D3A] border border-[#6DB677]/10 shadow-clay-inset'
                  : 'bg-[#FAFBF9] text-[#1A4D3A]/70 shadow-clay-inset border border-[#357A59]/10 hover:bg-[#FAF8F5]'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Semarang (Aktif)</span>
            </button>
          </div>
          <p className="text-[11px] font-semibold text-[#1A4D3A]/60 italic">
            * Ekspansi ke sekolah & kampus lain segera hadir.
          </p>
        </div>
      </div>

      {/* 3. Active Pilot Location Card (Tactile Clay Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Details Card */}
        <div className="lg:col-span-7 bg-[#FCFBF8] rounded-3xl p-5 sm:p-7 shadow-clay-card border border-white/80 space-y-6">
          {/* Top Bar: Badge & Reward Rate */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A4D3A]/10">
            <div className="flex items-center gap-2 flex-wrap">
              <EcoBadge
                variant="green"
                uppercase
                icon={<Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />}
              >
                PILOT ADIWIYATA SMKN 9
              </EcoBadge>
              <EcoBadge
                variant="green"
                icon={
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                }
              >
                Aktif & Beroperasi
              </EcoBadge>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3.5 py-1.5 rounded-full shadow-clay-inset border border-white">
              <span className="text-[11px] sm:text-xs font-semibold text-[#1A4D3A]/60">Reward Rate:</span>
              <span className="text-xs sm:text-sm font-black text-[#1A4D3A]">
                +50 Daun/kg
              </span>
            </div>
          </div>

          {/* Location Title & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#357A59]">
              <School className="w-4 h-4 text-[#357A59]" />
              <span>Sekolah Menengah Kejuruan Negeri 9 Semarang</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
              EcoDrop Hub & Bank Sampah — SMK Negeri 9 Semarang
            </h2>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/75 leading-relaxed">
              Titik pusat percontohan ekonomi sirkular berbasis sekolah Adiwiyata. Terintegrasi dengan bank sampah terpilah untuk upcycle kerajinan kreatif dan reverse vending reward.
            </p>
          </div>

          {/* Address & Operational Hours Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D3A]">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Alamat Lengkap</span>
              </div>
              <p className="text-xs text-[#1A4D3A]/80 leading-relaxed pl-6">
                Jl. Peterongansari No. 2, Peterongan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah 50242
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D3A]">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Jam Operasional</span>
              </div>
              <p className="text-xs font-extrabold text-[#1A4D3A] pl-6">
                Senin – Jumat (07.30 – 15.30 WIB)
              </p>
              <p className="text-[11px] text-[#1A4D3A]/60 pl-6">
                Sabtu, Minggu & Libur Nasional tutup.
              </p>
            </div>
          </div>

          {/* Accepted Materials List */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider flex items-center gap-1.5">
              <span>Material Sampah yang Diterima</span>
              <span className="text-[11px] font-normal lowercase text-[#1A4D3A]/60">(wajib bersih & kering)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {pilotLocation.acceptedMaterials.map((mat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF8F5] text-[#1A4D3A] border border-white shadow-clay-sm select-none"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1A4D3A]/10 flex flex-col sm:flex-row gap-3">
            {/* Primary Google Maps Navigation Link */}
            <a
              id="btn-open-google-maps"
              href="https://maps.google.com/?q=SMK+Negeri+9+Semarang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-[#1A4D3A] text-white font-extrabold text-xs sm:text-sm shadow-clay-btn hover:bg-[#143d2e] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 text-center"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Buka Rute Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Simulated Deposit Modal Trigger */}
            <button
              id="btn-simulate-deposit"
              onClick={() => setDepositModalOpen(true)}
              className="py-3.5 px-5 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] font-extrabold text-xs sm:text-sm shadow-clay-button border border-white hover:bg-white hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#357A59]" />
              <span>Scan QR / Setor Sampah (+Daun)</span>
            </button>
          </div>
        </div>

        {/* Visual Map Guidance Preview & Eco Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Interactive Map Preview Card */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 sm:p-6 shadow-clay-card border border-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider">
                Peta Lokasi Hub
              </span>
              <EcoBadge
                variant="green"
                icon={<Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />}
              >
                GPS Terverifikasi
              </EcoBadge>
            </div>

            {/* Stylized Visual Pin Frame */}
            <div className="relative w-full h-56 rounded-2xl bg-gradient-to-br from-[#EAE5DC] via-[#E8F2ED] to-[#FAF8F5] shadow-clay-inset border border-white overflow-hidden p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <EcoBadge
                  variant="green"
                  icon={
                    <span className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </span>
                  }
                >
                  Semarang Selatan
                </EcoBadge>
                <EcoBadge
                  variant="light"
                  uppercase
                  icon={<Leaf className="w-3.5 h-3.5 shrink-0 text-[#357A59]" />}
                >
                  SMKN 9 PILOT
                </EcoBadge>
              </div>

              {/* Center Map Graphic / Marker */}
              <div className="text-center space-y-1 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-earth text-white flex items-center justify-center mx-auto shadow-clay-green text-2xl animate-bounce">
                  🏫
                </div>
                <div className="inline-block bg-[#FAF8F5] px-3 py-1 rounded-full shadow-clay-sm border border-white/80">
                  <p className="text-xs font-black text-[#1A4D3A]">
                    SMK Negeri 9 Semarang
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-[#1A4D3A]/65">
                  Kec. Semarang Selatan, Kota Semarang
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-[#1A4D3A]/75 pt-2 border-t border-[#1A4D3A]/10">
                <span>📍 Peterongan</span>
                <a 
                  href="https://maps.google.com/?q=SMK+Negeri+9+Semarang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#357A59] underline hover:text-[#1A4D3A] flex items-center gap-1 font-bold"
                >
                  <span>Navigasi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Tips for Dropping Waste */}
            <div className="p-3.5 rounded-2xl bg-[#E8F2ED]/60 border border-[#6DB677]/20 space-y-2">
              <p className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Panduan Setor Sampah di Lokasi:</span>
              </p>
              <ul className="text-[11px] text-[#1A4D3A]/80 space-y-1 list-disc list-inside">
                <li>Bawa sampah dalam wadah atau kantong yang dapat dipakai ulang.</li>
                <li>Tunjukkan QR kode profil BumiKita ke petugas bank sampah sekolah.</li>
                <li>Sampah akan ditimbang di timbangan digital dan poin langsung masuk.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Empty State / Suggest Next Location Teaser Card */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-clay-card border border-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <EcoBadge
            variant="warm"
            icon={<Building2 className="w-3.5 h-3.5 shrink-0 text-[#996D00]" />}
          >
            Kemitraan Komunitas & Sekolah
          </EcoBadge>
          <h3 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
            Ingin sekolah atau kampusmu jadi titik EcoDrop berikutnya?
          </h3>
          <p className="text-xs sm:text-sm text-[#1A4D3A]/70 leading-relaxed">
            BumiKita membuka program adopsi circular economy hub untuk sekolah Adiwiyata, universitas, dan bank sampah komunitas di seluruh Indonesia.
          </p>
        </div>

        <button
          id="btn-propose-partnership"
          onClick={() => setPartnershipModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-[#357A59] hover:bg-[#285d43] text-white font-extrabold text-xs sm:text-sm shadow-clay-btn hover:scale-103 active:scale-97 transition-all cursor-pointer shrink-0"
        >
          Ajukan Kemitraan Titik Baru
        </button>
      </div>

      {/* 5. Deposit QR & Weigh Simulation Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-clay-card border border-white text-center space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setDepositModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {depositSuccess ? (
              <div className="py-6 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-earth text-white flex items-center justify-center mx-auto text-3xl shadow-clay-green animate-bounce">
                  🍃
                </div>
                <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                  Setor Sampah Berhasil!
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 max-w-xs mx-auto">
                  +{Math.floor(depositWeight * pilotLocation.pointsPerKg)} Daun Points telah ditambahkan ke akunmu. Terima kasih sudah mendukung pilot project SMKN 9 Semarang!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-sm">
                  <QrCode className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1A4D3A]">
                    Setor Sampah di SMKN 9 Semarang
                  </h3>
                  <p className="text-xs text-[#1A4D3A]/70">
                    Masukkan estimasi berat sampah terpilah yang kamu setor:
                  </p>
                </div>

                {/* Weight Stepper */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A4D3A]">Berat Sampah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDepositWeight((w) => Math.max(0.5, Number((w - 0.5).toFixed(1))))}
                      className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-[#357A59]">
                      {depositWeight} kg
                    </span>
                    <button
                      onClick={() => setDepositWeight((w) => Number((w + 0.5).toFixed(1)))}
                      className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9E20]/30 text-xs font-bold text-[#D97E0D]">
                  🎁 Estimasi Reward: +{Math.floor(depositWeight * pilotLocation.pointsPerKg)} Daun Points!
                </div>

                <button
                  onClick={handleSimulateDeposit}
                  className="w-full py-3.5 rounded-full bg-gradient-earth text-white font-bold text-xs sm:text-sm shadow-clay-green hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  Konfirmasi Setor Sampah (+Daun)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Partnership Proposal Form Modal */}
      {partnershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-clay-card border border-white space-y-5 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setPartnershipModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {partnerSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-clay-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                  Pengajuan Kemitraan Diterima!
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 max-w-sm mx-auto leading-relaxed">
                  Terima kasih! Tim ekspansi circular hub BumiKita akan segera menghubungi koordinator melalui WhatsApp / Email untuk survei lokasi.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4 text-left">
                <div>
                  <EcoBadge
                    variant="warm"
                    className="mb-2"
                    icon={<School className="w-3.5 h-3.5 shrink-0 text-[#996D00]" />}
                  >
                    Formulir Calon Titik Hub
                  </EcoBadge>
                  <h3 className="text-lg font-black text-[#1A4D3A]">
                    Ajukan Kemitraan Titik EcoDrop
                  </h3>
                  <p className="text-xs text-[#1A4D3A]/70">
                    Bantu percepat pemilahan sampah dan reward sirkular di lingkungan institusimu.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#1A4D3A] mb-1">
                      Nama Institusi / Sekolah / Kampus *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMA Negeri 1 Semarang / Kampus B"
                      value={partnerForm.institutionName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, institutionName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none focus:border-[#357A59]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A4D3A] mb-1">
                        Jenis Institusi
                      </label>
                      <select
                        value={partnerForm.institutionType}
                        onChange={(e) => setPartnerForm({ ...partnerForm, institutionType: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none"
                      >
                        <option value="Sekolah (SMA/SMK/SMP)">Sekolah (SMA/SMK/SMP)</option>
                        <option value="Universitas / Kampus">Universitas / Kampus</option>
                        <option value="Bank Sampah Komunitas">Bank Sampah Komunitas</option>
                        <option value="Instansi / Kantor">Instansi / Kantor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A4D3A] mb-1">
                        Kota / Kabupaten *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kota Semarang"
                        value={partnerForm.city}
                        onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none focus:border-[#357A59]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A4D3A] mb-1">
                        Nama Koordinator / Guru / PIC *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama penanggung jawab"
                        value={partnerForm.coordinatorName}
                        onChange={(e) => setPartnerForm({ ...partnerForm, coordinatorName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none focus:border-[#357A59]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A4D3A] mb-1">
                        No. WhatsApp Aktif *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={partnerForm.contactNumber}
                        onChange={(e) => setPartnerForm({ ...partnerForm, contactNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none focus:border-[#357A59]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A4D3A] mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Informasi mengenai bank sampah yang sudah ada atau fasilitas ruang pilah..."
                      value={partnerForm.notes}
                      onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#1A4D3A]/15 text-[#1A4D3A] shadow-clay-inset focus:outline-none focus:border-[#357A59]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1A4D3A]/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPartnershipModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] text-[#1A4D3A] font-bold text-xs shadow-clay-button border border-white hover:bg-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#357A59] text-white font-extrabold text-xs shadow-clay-btn hover:bg-[#285d43] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pengajuan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
