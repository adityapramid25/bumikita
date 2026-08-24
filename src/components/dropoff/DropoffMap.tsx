'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { INITIAL_DROPOFF_LOCATIONS } from '@/src/data/mockData';
import { DropoffLocation } from '@/src/types';
import { 
  MapPin, 
  Search, 
  QrCode, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  Coins, 
  Sparkles, 
  Leaf, 
  Building2,
  X
} from 'lucide-react';

export default function DropoffMap() {
  const { addDaunPoints } = useEco();

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<DropoffLocation | null>(INITIAL_DROPOFF_LOCATIONS[0]);
  const [depositModal, setDepositModal] = useState<DropoffLocation | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositWeight, setDepositWeight] = useState(1.5);

  const filteredLocations = INITIAL_DROPOFF_LOCATIONS.filter((loc) => {
    if (selectedCity !== 'all' && loc.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.acceptedMaterials.some((m) => m.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSimulateDeposit = () => {
    if (!depositModal) return;
    const earned = Math.floor(depositWeight * depositModal.pointsPerKg);
    addDaunPoints(earned, `Setor Sampah ${depositWeight}kg di ${depositModal.name}`);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setDepositModal(null);
    }, 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#6DB677]/40 text-[#1A4D3A] text-xs font-bold shadow-clay-sm">
            <MapPin className="w-3.5 h-3.5 text-[#357A59]" />
            <span>Campus & City Eco Hub Locator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
            Titik Drop-off & Smart Reverse Vending
          </h2>
          <p className="text-sm sm:text-base text-[#1A4D3A]/70 max-w-2xl">
            Setor sampah botol plastik, e-waste, dan kain perca di dropbox terdekat kampusmu untuk mendapatkan Daun Points langsung!
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-[#1A4D3A] text-white shadow-clay-button'
                  : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-pill border border-white hover:bg-[#EDE8E0]'
              }`}
            >
              {city === 'all' ? 'Semua Kota' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Map & Location Interactive Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Directory List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#1A4D3A]/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Cari lokasi kampus, RVM, jenis sampah..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/40 focus:outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F2ED] border-[#357A59] shadow-clay-card scale-[1.01]'
                      : 'bg-[#FAF8F5] border-white shadow-clay-card hover:bg-[#F6F3EC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#357A59] bg-[#FAF8F5] px-2 py-0.5 rounded-full shadow-clay-sm">
                        {loc.type}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#1A4D3A] mt-1">
                        {loc.name}
                      </h4>
                      <p className="text-xs text-[#1A4D3A]/70 mt-0.5 line-clamp-1">
                        {loc.address}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-[#357A59]">
                        +{loc.pointsPerKg} Daun/kg
                      </span>
                      <p className="text-[10px] font-semibold text-[#1A4D3A]/50 mt-0.5">
                        {loc.distanceKm} km
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {loc.acceptedMaterials.map((mat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] text-[#1A4D3A]/80 border border-white/80"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Simulated Hub Map Preview */}
        <div className="lg:col-span-7 bg-[#FAF8F5] rounded-[32px] p-6 sm:p-8 shadow-clay-card border border-white flex flex-col justify-between space-y-6">
          {selectedLocation ? (
            <div className="space-y-6">
              {/* Simulated Visual Interactive Pin Map Card */}
              <div className="relative w-full h-60 rounded-2xl bg-gradient-to-br from-[#EAE5DC] via-[#E8F2ED] to-[#FAF8F5] shadow-clay-inset border border-white overflow-hidden p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#1A4D3A] shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                    <span>Live Hub Status: {selectedLocation.status}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1A4D3A]/70">
                    GPS: ACTIVE
                  </span>
                </div>

                {/* Center Pin Marker */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-earth text-white flex items-center justify-center mx-auto shadow-clay-green text-xl animate-bounce">
                    📍
                  </div>
                  <p className="text-xs font-extrabold text-[#1A4D3A] bg-[#FAF8F5]/90 px-3 py-0.5 rounded-full inline-block shadow-sm">
                    {selectedLocation.name}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#1A4D3A]/70">
                  <span>Jarak dari kamu: ~{selectedLocation.distanceKm} km</span>
                  <span>Buka: {selectedLocation.hours}</span>
                </div>
              </div>

              {/* Detail Info Card */}
              <div className="space-y-3">
                <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs text-[#1A4D3A]/80 leading-relaxed">
                  {selectedLocation.address}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] shadow-clay-card border border-white">
                    <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Reward Setor</p>
                    <p className="text-base font-black text-[#357A59]">
                      +{selectedLocation.pointsPerKg} Daun / kg
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] shadow-clay-card border border-white">
                    <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Jam Operasional</p>
                    <p className="text-xs font-bold text-[#1A4D3A] mt-1">
                      {selectedLocation.hours}
                    </p>
                  </div>
                </div>

                {/* Accepted Materials List */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#1A4D3A]">
                    Material yang Diterima:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.acceptedMaterials.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4EE] text-[#357A59] border border-[#6DB677]/30 shadow-clay-sm"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1A4D3A]/10">
                <button
                  onClick={() => setDepositModal(selectedLocation)}
                  className="flex-1 py-3.5 rounded-full bg-gradient-earth text-white font-bold text-xs sm:text-sm shadow-clay-green hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Setor Sampah (+Daun Pts)</span>
                </button>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation.name + ' ' + selectedLocation.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-[#FAF8F5] text-[#1A4D3A] font-bold text-xs sm:text-sm shadow-clay-button border border-white hover:bg-[#EDE8E0] transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-[#357A59]" />
                  <span>Buka di Google Maps</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#1A4D3A]/60">
              Pilih lokasi di daftar sebelah kiri untuk melihat detail hub.
            </div>
          )}
        </div>
      </div>

      {/* Deposit QR & Simulation Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-clay-card border border-white text-center space-y-5 relative"
          >
            <button
              onClick={() => setDepositModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A]"
            >
              <X className="w-4 h-4" />
            </button>

            {depositSuccess ? (
              <div className="py-6 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-earth text-white flex items-center justify-center mx-auto text-3xl shadow-clay-green">
                  🍃
                </div>
                <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                  Setor Sampah Berhasil!
                </h3>
                <p className="text-xs text-[#1A4D3A]/70">
                  +{Math.floor(depositWeight * depositModal.pointsPerKg)} Daun Points telah ditambahkan ke akunmu. Terima kasih sudah merawat bumi!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-sm">
                  <QrCode className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                    Setor Sampah di {depositModal.name}
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
                      className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-[#357A59]">
                      {depositWeight} kg
                    </span>
                    <button
                      onClick={() => setDepositWeight((w) => Number((w + 0.5).toFixed(1)))}
                      className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9E20]/30 text-xs font-bold text-[#D97E0D]">
                  🎁 Estimasi Reward: +{Math.floor(depositWeight * depositModal.pointsPerKg)} Daun Points!
                </div>

                <button
                  onClick={handleSimulateDeposit}
                  className="w-full py-3.5 rounded-full bg-gradient-earth text-white font-bold text-xs sm:text-sm shadow-clay-green hover:scale-105 transition-all cursor-pointer"
                >
                  Konfirmasi Setor Sampah
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
