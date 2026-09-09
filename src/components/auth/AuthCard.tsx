'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  Camera,
  ArrowRight,
  Leaf,
  TreePine,
  GraduationCap,
  School,
  ExternalLink,
  Loader2
} from 'lucide-react';

export type AuthMode = 'login' | 'register';
type UserRole = 'student' | 'school' | 'creator';

const ECO_AVATAR_PRESETS = [
  {
    id: 'sprout',
    label: '🌱 Tunas',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'leaf',
    label: '🍃 Daun Rimba',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'turtle',
    label: '🐢 Penyu Laut',
    url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'fox',
    label: '🦊 Rubah Hutan',
    url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=160&auto=format&fit=crop&q=80',
  },
];

const ROLE_OPTIONS: { id: UserRole; label: string; icon: React.ElementType; perk: string }[] = [
  {
    id: 'student',
    label: '🎓 Pelajar / Siswa',
    icon: GraduationCap,
    perk: 'Dapat koin daun & poin aksi hijau di sekolah.',
  },
  {
    id: 'school',
    label: '🏫 Komite Sekolah',
    icon: School,
    perk: 'Kelola bank sampah sekolah & monitor leaderboard.',
  },
  {
    id: 'creator',
    label: '🌱 Kreator Upcycle',
    icon: TreePine,
    perk: 'Buka etalase produk upcycle di Green Market.',
  },
];

interface AuthCardProps {
  defaultMode?: AuthMode;
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function AuthCard({
  defaultMode = 'login',
  onSuccess,
  onClose,
  isModal = false,
}: AuthCardProps) {
  const { user, profile, signIn, signUp, signOut, isConfigured } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States (strictly simplified, no address fields)
  const [regName, setRegName] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(ECO_AVATAR_PRESETS[0].url);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals inside form
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showGreenPrinciples, setShowGreenPrinciples] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation helpers
  const isPasswordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const isPasswordMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  // Handle custom avatar upload
  const handleCustomAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Ukuran avatar foto maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // If user is already authenticated
  if (user) {
    return (
      <div className="relative w-full max-w-lg mx-auto clay-card p-6 sm:p-8 border border-white/80 space-y-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E8F2ED] border-2 border-white shadow-clay-card flex items-center justify-center overflow-hidden text-[#1A4D3A]">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'User Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-[#357A59]" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#1A4D3A]">
            Halo, {profile?.full_name || user.email?.split('@')[0]}!
          </h3>
          <p className="text-xs text-[#357A59] font-bold">
            @{profile?.nickname || `eco_${user.id.slice(0, 8)}`} • {profile?.daun_points ?? 100} Daun Points
          </p>
          <p className="text-xs text-[#1A4D3A]/60">
            Anda sudah masuk. Kelola alamat Indonesia dan profil lengkap di Dashboard.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              if (onSuccess) onSuccess();
              router.push('/dashboard/profile');
            }}
            className="w-full clay-button py-3 px-6 text-xs sm:text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Dashboard Profil & Alamat</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-full bg-[#FAF8F5] text-xs font-bold text-[#1A4D3A] border border-white shadow-clay-sm hover:bg-white transition-all cursor-pointer"
            >
              Lanjutkan Penjelajahan
            </button>
          )}

          <button
            onClick={() => signOut()}
            className="text-xs text-[#DC2626] font-bold hover:underline cursor-pointer block mx-auto pt-2"
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    );
  }

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Harap isi email dan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    const res = await signIn(loginEmail.trim(), loginPassword, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess('Selamat datang kembali! Menghubungkan sesi Anda...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        router.push('/dashboard/profile');
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Email atau kata sandi Anda salah.');
    }
  };

  // Handle Registration submission (frictionless, no address fields)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Harap lengkapi nama, email, dan kata sandi pendaftaran.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const cleanNick = regNickname.trim().replace(/^@/, '');
    if (cleanNick && !/^[a-zA-Z0-9_]{3,30}$/.test(cleanNick)) {
      setErrorMessage('Nickname harus 3-30 karakter (hanya huruf, angka, atau garis bawah).');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Prinsip Aksi Hijau BumiKita.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUp({
      email: regEmail.trim(),
      password: regPassword,
      fullName: regName.trim(),
      nickname: cleanNick || undefined,
      avatarUrl: selectedAvatarUrl || undefined,
      role: selectedRole,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(
        `Akun berhasil dibuat! Bonus sambutan +100 Daun Points telah ditambahkan untuk ${regName.trim()}.`
      );
      setTimeout(() => {
        if (onSuccess) onSuccess();
        router.push('/dashboard/profile');
      }, 1200);
    } else {
      setErrorMessage(res.error || 'Gagal mendaftar akun ke Supabase.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Floating Pill Badge Above Card */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4EE] border border-white text-[#357A59] text-xs font-extrabold shadow-clay-sm">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#357A59] text-white">
            <Leaf className="w-2.5 h-2.5" />
          </span>
          <span>Gabung Komunitas Sirkular Indonesia</span>
          <span className="w-2 h-2 rounded-full bg-[#6DB677] animate-pulse" />
        </div>
      </motion.div>

      {/* Main Tactile Clay Card */}
      <div className="relative clay-card p-6 sm:p-8 border border-white/80 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#6DB677]/10 blur-2xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-[#FF9E20]/10 blur-2xl pointer-events-none -z-0" />

        {/* Brand Header */}
        <div className="text-center space-y-1 relative z-10 mb-5">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-2xl bg-gradient-earth text-white flex items-center justify-center shadow-clay-sm font-bold text-sm">
              🌱
            </span>
            <span className="text-xl font-black text-[#1A4D3A] tracking-tight">
              Bumi<span className="text-[#357A59]">Kita</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1A4D3A]/70 font-medium">
            {mode === 'login'
              ? 'Masuk untuk memantau aksi hijau, poin daun & toko upcycle-mu.'
              : 'Pendaftaran cepat & tanpa ribet. Mulai langkah hijau hari ini!'}
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Daftar with Liquid Pill Animation */}
        <div className="relative p-1.5 rounded-2xl bg-[#F5F2ED] shadow-clay-inset mb-6 flex items-center z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSubmitSuccess(null);
            }}
            className={`relative flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'login' ? 'text-white' : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 bg-gradient-earth rounded-xl shadow-clay-green -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span>Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSubmitSuccess(null);
            }}
            className={`relative flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'register' ? 'text-white' : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 bg-gradient-earth rounded-xl shadow-clay-green -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="flex items-center justify-center gap-1.5">
              <span>Daftar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF9E20] text-white">
                +100 🍃
              </span>
            </span>
          </button>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-[#EBF4EE] border border-[#6DB677]/40 shadow-clay-sm flex items-center gap-2.5 text-xs text-[#357A59] font-bold mb-4 z-10 relative"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{submitSuccess}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#DC2626]/30 shadow-clay-sm flex items-center gap-2.5 text-xs text-[#DC2626] font-bold mb-4 z-10 relative"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. LOGIN FORM */}
        {mode === 'login' ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleLoginSubmit}
            className="space-y-4 relative z-10"
          >
            {/* Field: Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#357A59]" />
                <span>Email Terdaftar</span>
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
              />
            </div>

            {/* Field: Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#1A4D3A] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Kata Sandi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] font-bold text-[#357A59] hover:underline cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-3 text-[#1A4D3A]/40 hover:text-[#1A4D3A] cursor-pointer"
                >
                  {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#357A59] accent-[#357A59] cursor-pointer"
                />
                <span className="text-[#1A4D3A]/80 font-medium">Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full clay-button py-3 px-6 text-xs sm:text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Masuk ke BumiKita</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Alternative switch prompt */}
            <p className="text-center text-xs text-[#1A4D3A]/60 pt-2">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-[#357A59] hover:underline cursor-pointer"
              >
                Daftar sekarang (Dapat +100 Daun)
              </button>
            </p>
          </motion.form>
        ) : (
          /* 2. SIMPLIFIED REGISTRATION FORM (Frictionless, No Address Fields) */
          <motion.form
            key="register-form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-4 relative z-10"
          >
            {/* A. Avatar Picker / Upload (Optional / Presets) */}
            <div className="space-y-2 pb-1 border-b border-[#1A4D3A]/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Pilih Avatar Aksi Hijau:</span>
                </label>
                <span className="text-[10px] text-[#357A59] font-semibold">Opsional</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Chosen Avatar Preview with Click-to-Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-14 h-14 rounded-2xl bg-[#E8F2ED] border-2 border-white shadow-clay-card flex items-center justify-center overflow-hidden cursor-pointer shrink-0 hover:scale-105 transition-transform"
                  title="Klik untuk unggah foto kustom"
                >
                  <img
                    src={selectedAvatarUrl}
                    alt="Preview Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCustomAvatarFile}
                />

                {/* Preset Chips */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ECO_AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(preset.url)}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center truncate ${
                          isSelected
                            ? 'bg-[#357A59] text-white border-white shadow-clay-sm'
                            : 'bg-[#FAF8F5] text-[#1A4D3A] border-white/60 hover:bg-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* B. Full Name & Nickname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A4D3A]">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <User className="w-3.5 h-3.5 absolute left-3 text-[#1A4D3A]/40" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Aditya Pramudya"
                    className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-3 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                  />
                </div>
              </div>

              {/* Nickname Handle (@alias) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A4D3A] flex items-center justify-between">
                  <span>Nickname Unik</span>
                  <span className="text-[10px] text-[#357A59]">@handle</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-[#357A59]">@</span>
                  <input
                    type="text"
                    required
                    value={regNickname.replace(/^@/, '')}
                    onChange={(e) =>
                      setRegNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="ecowarrior"
                    maxLength={30}
                    className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-7 pr-3 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* C. Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A4D3A]">Email Siswa / Komunitas</label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 absolute left-3 text-[#1A4D3A]/40" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aditya@sekolah.sch.id atau email pribadi"
                  className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-3 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                />
              </div>
            </div>

            {/* D. Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A4D3A]">Kata Sandi</label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 absolute left-3 text-[#1A4D3A]/40" />
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 digit"
                    className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-8 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-2 text-[#1A4D3A]/40 hover:text-[#1A4D3A] cursor-pointer"
                  >
                    {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#1A4D3A]">Ulangi Sandi</label>
                  {isPasswordsMatch && <span className="text-[10px] font-bold text-[#357A59]">Cocok ✓</span>}
                  {isPasswordMismatch && <span className="text-[10px] font-bold text-[#DC2626]">Beda ✕</span>}
                </div>
                <div className="relative flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 absolute left-3 text-[#1A4D3A]/40" />
                  <input
                    type={regShowConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi"
                    className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-8 py-2 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                    className="absolute right-2 text-[#1A4D3A]/40 hover:text-[#1A4D3A] cursor-pointer"
                  >
                    {regShowConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* E. Role Segment Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#1A4D3A] flex items-center justify-between">
                <span>Peran Anda:</span>
                <span className="text-[10px] text-[#1A4D3A]/50">Dapat diubah di dashboard</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-gradient-earth text-white shadow-clay-green'
                          : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-sm hover:bg-white'
                      }`}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#1A4D3A]/80">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#357A59] accent-[#357A59] cursor-pointer"
                />
                <span>Saya menyetujui Prinsip Aksi Sirkular Hijau BumiKita.</span>
              </label>
            </div>

            {/* Submit Registration Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full clay-button py-3 px-6 text-xs sm:text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Daftar Akun & Dapatkan +100 Daun Points</span>
                </>
              )}
            </motion.button>

            {/* Switch prompt */}
            <p className="text-center text-xs text-[#1A4D3A]/60 pt-1">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#357A59] hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          </motion.form>
        )}
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="clay-card p-6 w-full max-w-sm border border-white space-y-4"
            >
              <h4 className="text-sm font-black text-[#1A4D3A]">Pemulihan Kata Sandi</h4>
              <p className="text-xs text-[#1A4D3A]/70">
                Masukkan email akun Anda. Kami akan mengirimkan instruksi pemulihan sandi.
              </p>

              {forgotSuccess ? (
                <div className="p-3 rounded-2xl bg-[#EBF4EE] text-xs text-[#357A59] font-bold">
                  Tautan pemulihan telah dikirimkan ke email Anda!
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@sekolah.sch.id"
                    className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-3.5 py-2.5 text-xs text-[#1A4D3A] focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-3 py-1.5 text-xs font-bold text-[#1A4D3A]/60 hover:text-[#1A4D3A] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="clay-button px-4 py-1.5 text-xs font-extrabold shadow-clay-green cursor-pointer"
                    >
                      Kirim Tautan
                    </button>
                  </div>
                </form>
              )}

              {forgotSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full clay-button py-2 text-xs font-bold shadow-clay-green cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
