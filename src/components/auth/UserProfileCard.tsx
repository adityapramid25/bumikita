'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, UserProfile } from '@/src/context/AuthContext';
import {
  User,
  MapPin,
  Camera,
  Check,
  AlertCircle,
  TreePine,
  ShieldCheck,
  Mail,
  Phone,
  Save,
  Loader2
} from 'lucide-react';

const INDONESIAN_PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'DI Yogyakarta',
  'Bali',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kalimantan Timur',
  'Kalimantan Barat',
  'Sulawesi Selatan',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
];

interface UserProfileFormProps {
  initialProfile: UserProfile | null;
  email: string | null;
  userId: string | null;
}

function UserProfileForm({ initialProfile, email, userId }: UserProfileFormProps) {
  const { updateProfile, uploadAvatar } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form State initialized directly from initialProfile
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [nickname, setNickname] = useState(initialProfile?.nickname || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phone_number || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');

  // Address Hierarchy State
  const [province, setProvince] = useState(initialProfile?.province || '');
  const [cityDistrict, setCityDistrict] = useState(initialProfile?.city_district || '');
  const [subdistrict, setSubdistrict] = useState(initialProfile?.subdistrict || '');
  const [village, setVillage] = useState(initialProfile?.village || '');
  const [postalCode, setPostalCode] = useState(initialProfile?.postal_code || '');
  const [addressDetail, setAddressDetail] = useState(initialProfile?.address_detail || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Ukuran avatar maksimal 2MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setSaveError(null);

    const res = await uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (res.success) {
      setSaveSuccess('Foto profil berhasil diperbarui ke Supabase Storage!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } else {
      setSaveError(res.error || 'Gagal mengunggah foto profil.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    // Validation for nickname
    const cleanNick = nickname.trim().replace(/^@/, '');
    if (cleanNick && !/^[a-zA-Z0-9_]{3,30}$/.test(cleanNick)) {
      setSaveError('Nickname harus 3-30 karakter dan hanya huruf, angka, atau garis bawah (_).');
      setIsSaving(false);
      return;
    }

    const res = await updateProfile({
      full_name: fullName.trim() || null,
      nickname: cleanNick || null,
      phone_number: phoneNumber.trim() || null,
      bio: bio.trim() || null,
      province: province.trim() || null,
      city_district: cityDistrict.trim() || null,
      subdistrict: subdistrict.trim() || null,
      village: village.trim() || null,
      postal_code: postalCode.trim() || null,
      address_detail: addressDetail.trim() || null,
    });

    setIsSaving(false);

    if (res.success) {
      setSaveSuccess('Profil dan hierarki alamat Indonesia berhasil disimpan ke Supabase!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } else {
      setSaveError(res.error || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="clay-card p-6 sm:p-8 border border-white/80 space-y-6 overflow-hidden relative">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#6DB677]/10 blur-2xl pointer-events-none -z-0" />

      {/* 1. Header: Avatar & Main Identity */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 pb-6 border-b border-[#1A4D3A]/10">
        {/* Avatar Container with Upload Hover */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#E8F2ED] border-2 border-white shadow-clay-card flex items-center justify-center overflow-hidden text-[#1A4D3A]">
            {initialProfile?.avatar_url ? (
              <img
                src={initialProfile.avatar_url}
                alt={initialProfile.full_name || 'User Avatar'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/avatar-placeholder.webp';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/assets/avatar-placeholder.webp"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Camera Overlay Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#357A59] text-white flex items-center justify-center shadow-clay-btn hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Unggah Foto Profil (Supabase Storage)"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Identity & Alias Details */}
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-black text-[#1A4D3A] tracking-tight">
              {initialProfile?.full_name || email?.split('@')[0] || 'Pejuang Bumi'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF4EE] text-[#357A59] border border-[#357A59]/20 capitalize">
              {initialProfile?.eco_role || 'Citizen'}
            </span>
          </div>

          <p className="text-xs font-bold text-[#357A59] flex items-center justify-center sm:justify-start gap-1">
            <span>@{initialProfile?.nickname || `eco_${userId?.slice(0, 8) || 'warrior'}`}</span>
            <span className="text-[10px] text-[#1A4D3A]/40 font-normal">• Alias Publik</span>
          </p>

          <p className="text-xs text-[#1A4D3A]/70 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#1A4D3A]/50" />
            <span>{email || 'email@bumikita.id'}</span>
          </p>
        </div>
      </div>

      {/* 2. Gamification Balance Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] shadow-clay-sm border border-white/60 text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-black text-[#1A4D3A]">
            <span>🍃</span>
            <span>{initialProfile?.daun_points ?? 480}</span>
          </div>
          <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase tracking-wider">
            Daun Points
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] shadow-clay-sm border border-white/60 text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-black text-[#357A59]">
            <TreePine className="w-4 h-4 text-[#357A59]" />
            <span>{initialProfile?.trees_planted ?? 2} Pohon</span>
          </div>
          <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase tracking-wider">
            Tertanam di GPS
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#FAF8F5] shadow-clay-sm border border-white/60 text-center flex flex-col justify-center">
          <span className="text-xs font-extrabold text-[#D97E0D]">Tingkat 2</span>
          <span className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase tracking-wider">
            Eco Pioneer
          </span>
        </div>
      </div>

      {/* Feedback Notifications */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3.5 rounded-2xl bg-[#EBF4EE] border border-[#6DB677]/40 shadow-clay-sm flex items-center gap-2.5 text-xs text-[#357A59] font-bold"
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#DC2626]/30 shadow-clay-sm flex items-center gap-2.5 text-xs text-[#DC2626] font-bold"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Form: Identity & Indonesian Address Hierarchy */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#1A4D3A]/10">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#357A59] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Informasi Profil & Alias Publik</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A4D3A]">Nama Lengkap (Billing/Faktur)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama resmi Anda"
              className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
            />
          </div>

          {/* Nickname Handle */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A4D3A]">Nickname Unik (@handle)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-[#357A59]">@</span>
              <input
                type="text"
                value={nickname.replace(/^@/, '')}
                onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="ecowarrior"
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-7 pr-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 font-mono"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A4D3A]">Nomor WhatsApp / HP</label>
            <div className="relative flex items-center">
              <Phone className="w-3.5 h-3.5 absolute left-3 text-[#1A4D3A]/40" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="081234567890"
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A4D3A]">Bio Singkat</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Penggiat daur ulang plastik & kain"
              className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
            />
          </div>
        </div>

        {/* 4. Indonesian Address Hierarchy Section */}
        <div className="pt-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A4D3A]/10 mb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#357A59] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Hierarki Alamat Indonesia (Pengiriman & Reverse Vending)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Provinsi */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#1A4D3A]">Provinsi</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
              >
                <option value="">Pilih Provinsi...</option>
                {INDONESIAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Kota / Kabupaten */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#1A4D3A]">Kota / Kabupaten</label>
              <input
                type="text"
                value={cityDistrict}
                onChange={(e) => setCityDistrict(e.target.value)}
                placeholder="Contoh: Jakarta Selatan atau Kota Bandung"
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
              />
            </div>

            {/* Kecamatan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#1A4D3A]">Kecamatan</label>
              <input
                type="text"
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
                placeholder="Contoh: Kebayoran Baru atau Coblong"
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
              />
            </div>

            {/* Kelurahan / Desa & Kode Pos */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1A4D3A]">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Senayan"
                  className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1A4D3A]">Kode Pos</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12190"
                  maxLength={7}
                  className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Detail Alamat Lengkap */}
          <div className="space-y-1 pt-3">
            <label className="text-[11px] font-bold text-[#1A4D3A]">
              Alamat Lengkap (Nama Jalan, RT/RW, No. Rumah, Patokan)
            </label>
            <textarea
              rows={2}
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="Jl. Bumi Indah No. 42, RT 02 / RW 05, pagar hijau dekat pos satpam"
              className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 resize-none"
            />
            <p className="text-[10px] text-[#1A4D3A]/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#357A59]" />
              <span>Detail alamat dilindungi Row Level Security (RLS) dan hanya tampak untuk Anda.</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isSaving}
            className="w-full clay-button py-3 px-6 text-xs sm:text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan ke Supabase</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default function UserProfileCard() {
  const { user, profile } = useAuth();

  return (
    <div className="relative w-full max-w-xl mx-auto space-y-6">
      {/* Render the form keyed by user/profile so state mounts cleanly without side effects */}
      <UserProfileForm
        key={profile?.id || user?.id || 'profile-form'}
        initialProfile={profile}
        email={user?.email ?? null}
        userId={user?.id ?? null}
      />
    </div>
  );
}
