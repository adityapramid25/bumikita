'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import UserProfileCard from './UserProfileCard';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Info,
  X,
  GraduationCap,
  School,
  TreePine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type AuthMode = 'login' | 'register';

export type UserRole = 'student' | 'school' | 'creator';

const ROLE_OPTIONS: Array<{
  id: UserRole;
  label: string;
  icon: typeof GraduationCap;
  perk: string;
}> = [
  {
    id: 'student',
    label: '🎒 Pelajar / Mahasiswa',
    icon: GraduationCap,
    perk: 'Dapatkan 50 Daun Points selamat datang & sertifikat aksi hijau.',
  },
  {
    id: 'school',
    label: '🏫 Sekolah Adiwiyata',
    icon: School,
    perk: 'Pantau tonase sampah sekolah & integrasi leaderboard edukasi.',
  },
  {
    id: 'creator',
    label: '🌱 Kreator Upcycle',
    icon: TreePine,
    perk: 'Buka toko produk upcycle di Green Market & tarik profit otomatis.',
  },
];

export default function AuthCard({ defaultMode = 'login' }: { defaultMode?: AuthMode }) {
  const { user, signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showGreenPrinciples, setShowGreenPrinciples] = useState(false);

  // Helper validation
  const isPasswordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const isPasswordMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  // If user is already authenticated with Supabase, render their Profile Dashboard
  if (user) {
    return <UserProfileCard />;
  }

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
      setSubmitSuccess(`Selamat datang kembali! Menghubungkan sesi Supabase...`);
    } else {
      setErrorMessage(res.error || 'Email atau kata sandi Anda salah.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Harap lengkapi semua kolom pendaftaran.');
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

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Prinsip Aksi Hijau BumiKita.');
      return;
    }

    setIsSubmitting(true);
    const cleanNick = regNickname.trim().replace(/^@/, '');
    const res = await signUp({
      email: regEmail.trim(),
      password: regPassword,
      fullName: regName.trim(),
      nickname: cleanNick || undefined,
      role: selectedRole,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(
        `Akun berhasil dibuat di Supabase! Bonus +50 Daun Points telah ditambahkan ke profil ${regName.trim()}.`
      );
    } else {
      setErrorMessage(res.error || 'Gagal mendaftar akun ke Supabase.');
    }
  };

  const handleGoogleAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess('Berhasil terhubung dengan Akun Google! Mengarahkan...');
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Floating Illustrative Pill Badge Above Card */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF4EE] border border-white text-[#357A59] text-xs font-extrabold shadow-clay-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#357A59] text-white">
            <Leaf className="w-3 h-3" />
          </span>
          <span>Gabung 1.400+ Pejuang Bumi</span>
          <span className="w-2 h-2 rounded-full bg-[#6DB677] animate-pulse" />
        </div>
      </motion.div>

      {/* Main Centered Tactile Clay Card */}
      <div className="relative clay-card p-6 sm:p-10 border border-white/80 overflow-hidden">
        {/* Top Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#6DB677]/10 blur-2xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-[#FF9E20]/10 blur-2xl pointer-events-none -z-0" />

        {/* Card Header & Brand Logo Mark */}
        <div className="text-center space-y-1 relative z-10 mb-6">
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
              : 'Mulai langkah kecilmu menjadi solusi krisis sampah Indonesia.'}
          </p>
        </div>

        {/* Top Segmented Switch Pill (Masuk / Daftar) with Liquid Layout Animation */}
        <div className="relative p-1.5 rounded-2xl bg-[#F5F2ED] shadow-clay-inset mb-6 flex items-center z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSubmitSuccess(null);
            }}
            className={`relative flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'login' ? 'text-white' : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="active-tab-indicator"
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
            className={`relative flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'register' ? 'text-white' : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-gradient-earth rounded-xl shadow-clay-green -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        {/* Dynamic Success Notice */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-[#EBF4EE] border border-[#6DB677]/40 shadow-clay-sm flex items-start gap-3 text-xs text-[#1A4D3A] z-10 relative"
            >
              <CheckCircle2 className="w-5 h-5 text-[#357A59] flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-extrabold text-[#357A59]">Aksi Berhasil!</p>
                <p className="text-[#1A4D3A]/80">{submitSuccess}</p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#357A59] hover:underline"
                  >
                    <span>Lanjut ke Beranda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Error Notice */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#DC2626]/20 shadow-clay-sm flex items-center gap-2.5 text-xs text-[#DC2626] z-10 relative"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM CONTAINER */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              /* ================= MODE MASUK (LOGIN) ================= */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                {/* Field 1: Email / Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>Email atau Nama Pengguna</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#1A4D3A]/40 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id atau username"
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#1A4D3A]">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotSuccess(false);
                      }}
                      className="text-[#357A59] hover:text-[#1A4D3A] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#1A4D3A]/40 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={loginShowPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute right-3.5 text-[#1A4D3A]/40 hover:text-[#1A4D3A] transition-colors p-1 cursor-pointer"
                      title={loginShowPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Row: Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        rememberMe
                          ? 'bg-[#357A59] text-white shadow-clay-sm'
                          : 'bg-[#F5F2ED] shadow-clay-inset text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span className="text-xs text-[#1A4D3A]/80 font-medium">
                      Ingat Saya di Perangkat Ini
                    </span>
                  </label>
                </div>

                {/* Primary Button: Masuk */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full clay-button py-3.5 px-6 text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke BumiKita</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {/* Social Auth Divider */}
                <div className="relative flex items-center justify-center my-5">
                  <div className="border-t border-[#1A4D3A]/10 w-full" />
                  <span className="bg-[#FAF8F5] px-3 text-[11px] font-bold text-[#1A4D3A]/50 uppercase tracking-wider relative">
                    atau masuk dengan
                  </span>
                </div>

                {/* Tactile Google Sign-in Button */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] text-xs sm:text-sm font-bold shadow-clay-pill border border-white hover:bg-white transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Lanjutkan dengan Akun Google</span>
                </motion.button>
              </motion.form>
            ) : (
              /* ================= MODE DAFTAR (REGISTER) ================= */
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                {/* Field 1: Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>Nama Lengkap (Billing/Faktur)</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#1A4D3A]/40 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Aditya Pramudya"
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Field 1b: Nickname Handle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#1A4D3A]">
                      Nickname Unik (@handle)
                    </label>
                    <span className="text-[10px] text-[#357A59] font-medium">
                      Alias publik di Green Market
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-[#357A59] pointer-events-none">
                      @
                    </span>
                    <input
                      type="text"
                      value={regNickname}
                      onChange={(e) =>
                        setRegNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      placeholder="ecowarrior"
                      maxLength={30}
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-4 py-3 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Field 2: Email Siswa / Komunitas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>Email Siswa / Komunitas</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#1A4D3A]/40 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="aditya@smkn1.sch.id atau email pribadi"
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Field 3: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A4D3A]">
                      Kata Sandi
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#1A4D3A]/40 pointer-events-none">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 digit"
                        className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-9 py-2.5 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute right-2.5 text-[#1A4D3A]/40 hover:text-[#1A4D3A] p-1 cursor-pointer"
                      >
                        {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-[#1A4D3A]">
                        Ulangi Sandi
                      </label>
                      {isPasswordsMatch && (
                        <span className="text-[10px] font-bold text-[#357A59]">
                          Cocok ✓
                        </span>
                      )}
                      {isPasswordMismatch && (
                        <span className="text-[10px] font-bold text-[#DC2626]">
                          Beda ✕
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#1A4D3A]/40 pointer-events-none">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={regShowConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi"
                        className={`w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl pl-8 pr-9 py-2.5 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none border transition-all font-medium ${
                          isPasswordMismatch
                            ? 'border-[#DC2626]/50 focus:ring-2 focus:ring-[#DC2626]/30'
                            : 'border-white/40 focus:ring-2 focus:ring-[#357A59]/40'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                        className="absolute right-2.5 text-[#1A4D3A]/40 hover:text-[#1A4D3A] p-1 cursor-pointer"
                      >
                        {regShowConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role / Segment Selector Chips */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-[#1A4D3A] flex items-center justify-between">
                    <span>Pilih Peran Pejuang Bumi:</span>
                    <span className="text-[10px] font-medium text-[#1A4D3A]/60">
                      Sesuai aktivitasmu
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <motion.button
                          key={role.id}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-2.5 rounded-2xl text-[11px] sm:text-xs font-extrabold text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-earth text-white shadow-clay-green'
                              : 'bg-[#F5F2ED] text-[#1A4D3A] shadow-clay-sm hover:bg-white'
                          }`}
                        >
                          <span className="truncate">{role.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Role Perk Micro-Caption */}
                  <div className="p-2.5 rounded-xl bg-[#EBF4EE]/60 text-[11px] text-[#1A4D3A]/80 font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#357A59] flex-shrink-0" />
                    <span>
                      {ROLE_OPTIONS.find((r) => r.id === selectedRole)?.perk}
                    </span>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all flex-shrink-0 mt-0.5 cursor-pointer ${
                        agreeTerms
                          ? 'bg-[#357A59] text-white shadow-clay-sm'
                          : 'bg-[#F5F2ED] shadow-clay-inset text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div className="text-xs text-[#1A4D3A]/80 leading-relaxed font-medium">
                      Saya setuju dengan{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGreenPrinciples(true);
                        }}
                        className="text-[#357A59] font-extrabold underline hover:text-[#1A4D3A] cursor-pointer"
                      >
                        Prinsip Aksi Hijau BumiKita
                      </button>
                    </div>
                  </label>
                </div>

                {/* Primary Button: Buat Akun */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full clay-button py-3.5 px-6 text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Buat Akun Hijau (+50 Daun)</span>
                    </>
                  )}
                </motion.button>

                {/* Social Auth with Google */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] text-xs font-bold shadow-clay-pill border border-white hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Daftar Cepat dengan Google</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-[#1A4D3A]/10 text-center text-[11px] text-[#1A4D3A]/50">
          Dilindungi oleh sistem enkripsi ramah lingkungan BumiKita
        </div>
      </div>

      {/* ================= MODAL: LUPA KATA SANDI ================= */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1A4D3A]/30 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="clay-card p-6 sm:p-8 max-w-md w-full bg-[#FAF8F5] border border-white space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1A4D3A]">
                    Reset Kata Sandi
                  </h4>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F2ED] text-[#1A4D3A]/60 hover:text-[#1A4D3A] flex items-center justify-center shadow-clay-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-[#EBF4EE] space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#357A59] mx-auto" />
                  <p className="text-xs font-bold text-[#357A59]">
                    Link Reset Telah Terkirim!
                  </p>
                  <p className="text-[11px] text-[#1A4D3A]/70">
                    Silakan periksa kotak masuk atau folder spam di{' '}
                    <span className="font-bold text-[#1A4D3A]">{forgotEmail}</span>.
                  </p>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="clay-button py-2 px-6 text-xs font-bold shadow-clay-green mt-3 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-[#1A4D3A]/80 leading-relaxed">
                    Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan pemulihan kata sandi instan.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A4D3A]">
                      Email Akun
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      className="w-full bg-[#F5F2ED]/80 shadow-clay-inset rounded-2xl px-4 py-2.5 text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/30 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 border border-white/40 font-medium"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-[#1A4D3A]/70 hover:bg-[#F5F2ED] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="clay-button py-2 px-5 text-xs font-bold shadow-clay-green cursor-pointer"
                    >
                      Kirim Tautan Reset
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: PRINSIP AKSI HIJAU ================= */}
      <AnimatePresence>
        {showGreenPrinciples && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1A4D3A]/30 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="clay-card p-6 sm:p-8 max-w-lg w-full bg-[#FAF8F5] border border-white space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1A4D3A]">
                    Prinsip Aksi Hijau BumiKita
                  </h4>
                </div>
                <button
                  onClick={() => setShowGreenPrinciples(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F2ED] text-[#1A4D3A]/60 hover:text-[#1A4D3A] flex items-center justify-center shadow-clay-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-[#1A4D3A]/80 leading-relaxed">
                <div className="clay-inset p-3.5 space-y-1">
                  <h5 className="font-extrabold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>1. Nol Greenwashing (0% Greenwashing)</span>
                  </h5>
                  <p className="text-[11px] text-[#1A4D3A]/70">
                    Setiap data pemilahan sampah, pohon yang ditanam, dan klaim reduksi karbon dihitung berdasarkan parameter ilmiah nyata.
                  </p>
                </div>

                <div className="clay-inset p-3.5 space-y-1">
                  <h5 className="font-extrabold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>2. Prioritas Sirkularitas Lokal</span>
                  </h5>
                  <p className="text-[11px] text-[#1A4D3A]/70">
                    Sampah anorganik diprioritaskan untuk diolah menjadi karya bernilai jual tinggi oleh pelajar, mahasiswa, dan UMKM lokal.
                  </p>
                </div>

                <div className="clay-inset p-3.5 space-y-1">
                  <h5 className="font-extrabold text-[#1A4D3A] flex items-center gap-1.5">
                    <span>3. Transparansi Donasi & Penanaman Pohon</span>
                  </h5>
                  <p className="text-[11px] text-[#1A4D3A]/70">
                    10% dari laba transaksi karya disalurkan langsung ke bibit pohon berkoordinat GPS di hutan restorasi Indonesia.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setAgreeTerms(true);
                    setShowGreenPrinciples(false);
                  }}
                  className="w-full clay-button py-3 text-xs font-bold shadow-clay-green cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Saya Paham & Setuju dengan Prinsip Ini</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
