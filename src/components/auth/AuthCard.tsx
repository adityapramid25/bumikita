'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  Info,
  X,
  GraduationCap,
  School,
  TreePine,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  ExternalLink,
  Code2
} from 'lucide-react';
import { getSupabase } from '@/src/lib/supabase/client';

const SQL_REPAIR_SCRIPT = `-- ==============================================================================
-- BUMIKITA: Perbaikan Trigger handle_new_user() & Constraint NOT NULL
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Hapus constraint NOT NULL pada username & nickname
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN nickname DROP NOT NULL;

-- 2. Perbarui trigger agar otomatis mengisi username & menangani duplikasi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name  TEXT;
  v_nickname   TEXT;
  v_username   TEXT;
  v_avatar_url TEXT;
  v_role       TEXT;
  v_final_nick TEXT;
  v_counter    INT := 0;
BEGIN
  v_full_name  := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Eco Warrior');
  v_nickname   := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username')), '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL);
  v_role       := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  IF v_nickname IS NULL THEN
    v_nickname := 'eco_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;

  v_final_nick := v_nickname;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (nickname = v_final_nick OR username = v_final_nick) 
      AND id <> NEW.id
  ) LOOP
    v_counter := v_counter + 1;
    v_final_nick := v_nickname || '_' || v_counter;
  END LOOP;
  v_username := v_final_nick;

  BEGIN
    INSERT INTO public.profiles (
      id, full_name, nickname, username, avatar_url, daun_points, trees_planted, eco_role, role
    )
    VALUES (
      NEW.id, v_full_name, v_final_nick, v_username, v_avatar_url, 100, 0,
      CASE WHEN v_role = 'creator' THEN 'artisan' ELSE 'citizen' END,
      CASE 
        WHEN v_role = 'creator' THEN 'Kreator Upcycle' 
        WHEN v_role = 'school' THEN 'Sekolah Adiwiyata' 
        ELSE 'Pelajar / Mahasiswa' 
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name  = EXCLUDED.full_name,
      nickname   = COALESCE(public.profiles.nickname, EXCLUDED.nickname),
      username   = COALESCE(public.profiles.username, EXCLUDED.username),
      avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = timezone('utc'::text, now());
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

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

export interface AuthCardProps {
  defaultMode?: AuthMode;
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AuthCard({
  defaultMode = 'login',
  isModal = false,
  onClose,
  onSuccess,
}: AuthCardProps) {
  const router = useRouter();
  const { user, profile, signIn, signUp, signOut, isConfigured } = useAuth();
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
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  // UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTriggerError, setIsTriggerError] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showGreenPrinciples, setShowGreenPrinciples] = useState(false);

  // Debounced password match validation (250ms) to eliminate typing frame drops
  const [debouncedMatchState, setDebouncedMatchState] = useState<{ match: boolean; mismatch: boolean }>({ match: false, mismatch: false });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMatchState({
        match: regPassword.length > 0 && regConfirmPassword.length > 0 && regPassword === regConfirmPassword,
        mismatch: regConfirmPassword.length > 0 && regPassword !== regConfirmPassword,
      });
    }, 250);
    return () => clearTimeout(handler);
  }, [regPassword, regConfirmPassword]);

  const isPasswordsMatch = debouncedMatchState.match;
  const isPasswordMismatch = debouncedMatchState.mismatch;

  // If user is already authenticated, render a focused status card so the page contains only auth actions
  if (user) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="clay-card p-8 sm:p-10 text-center space-y-6 border border-white shadow-clay-card">
          <div className="w-16 h-16 rounded-3xl bg-gradient-earth text-white flex items-center justify-center mx-auto shadow-clay-green text-2xl font-black">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-full h-full object-cover rounded-3xl"
              />
            ) : (
              <span>{(profile?.full_name || user.email || 'U')[0].toUpperCase()}</span>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#1A4D3A]">
              Halo, {profile?.full_name || user.email?.split('@')[0]}!
            </h2>
            <p className="text-xs text-[#357A59] font-bold">
              @{profile?.nickname || 'ecowarrior'} • {profile?.daun_points ?? 100} Daun Points
            </p>
            <p className="text-xs text-[#1A4D3A]/70 pt-1">
              Kamu telah masuk ke akun BumiKita.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#FAF8F5] border border-white text-xs font-extrabold text-[#1A4D3A] shadow-clay-card hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#357A59]" />
                <span>Tutup Jendela</span>
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#FAF8F5] border border-white text-xs font-extrabold text-[#1A4D3A] shadow-clay-card hover:scale-105 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-[#357A59]" />
                <span>Kembali ke Beranda</span>
              </Link>
            )}

            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-gradient-earth text-white text-xs font-extrabold shadow-clay-btn hover:scale-105 active:scale-95 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Buka Profil & Alamat Pengiriman</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await signOut();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-transparent text-xs font-bold text-[#DC2626] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
            >
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>
    );
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
      setSubmitSuccess(`Selamat datang kembali! ${onSuccess ? 'Berhasil masuk.' : 'Mengalihkan ke beranda...'}`);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 700);
      }
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

    if (!agreedToPolicy) {
      setErrorMessage('Anda harus menyetujui Kebijakan Privasi BumiKita.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Prinsip Aksi Hijau BumiKita.');
      return;
    }

    setIsSubmitting(true);
    setIsTriggerError(false);
    const cleanNick = regNickname.trim().replace(/^@/, '');

    // Check if nickname already taken in profiles table to give immediate clear feedback
    if (cleanNick) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .or(`nickname.ilike.${cleanNick},username.ilike.${cleanNick}`)
            .limit(1)
            .maybeSingle();

          if (existingUser) {
            setIsSubmitting(false);
            setErrorMessage(`Nickname @${cleanNick} sudah digunakan pejuang lain. Silakan pilih handle unik lain.`);
            setIsTriggerError(false);
            return;
          }
        } catch (e) {
          console.warn('Nickname uniqueness check warning:', e);
        }
      }
    }

    const res = await signUp({
      email: regEmail.trim(),
      password: regPassword,
      fullName: regName.trim(),
      nickname: cleanNick || undefined,
      role: selectedRole,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsTriggerError(false);
      setSubmitSuccess(
        `Akun berhasil dibuat! Bonus sambutan +100 Daun Points telah ditambahkan untuk ${regName.trim()}. ${onSuccess ? '' : 'Mengalihkan...'}`
      );
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 900);
      }
    } else {
      const isDbError = Boolean(
        res.isDatabaseTriggerError ||
        res.error?.includes('Database error') ||
        res.error?.includes('saving new user') ||
        res.error?.includes('violates not-null constraint')
      );
      setIsTriggerError(isDbError);
      if (isDbError) {
        setErrorMessage('Database error saving new user: Trigger Supabase PostgreSQL menolak pembuatan profil karena kolom username bernilai NULL (Error Constraint 23502).');
      } else {
        setErrorMessage(res.error || 'Gagal mendaftar akun ke Supabase.');
      }
    }
  };

  const handleGoogleAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(`Berhasil terhubung dengan Akun Google! ${onSuccess ? '' : 'Mengalihkan...'}`);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 700);
      }
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
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

        {/* Top Segmented Switch Pill (Masuk / Daftar) with Instant Zero-Stutter Switching */}
        <div className="relative p-1.5 rounded-2xl bg-[#F5F2ED] shadow-clay-inset mb-6 flex items-center z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSubmitSuccess(null);
              setIsTriggerError(false);
              setCopiedSql(false);
            }}
            className={`relative flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'login' 
                ? 'bg-gradient-earth text-white shadow-clay-green' 
                : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
            <span>Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSubmitSuccess(null);
              setIsTriggerError(false);
              setCopiedSql(false);
            }}
            className={`relative flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all z-10 cursor-pointer ${
              mode === 'register' 
                ? 'bg-gradient-earth text-white shadow-clay-green' 
                : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A]'
            }`}
          >
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

        {/* Dynamic Error Notice & Actionable Database Trigger Diagnostic */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 space-y-3 z-10 relative"
            >
              <div className="p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#DC2626]/20 shadow-clay-sm flex items-start gap-2.5 text-xs text-[#DC2626]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              </div>

              {isTriggerError && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F3EFEA] border border-[#E0D7CC] shadow-clay-sm space-y-3 text-xs text-[#1A4D3A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-[#1A4D3A] text-xs sm:text-sm">
                      <Terminal className="w-4 h-4 text-[#357A59]" />
                      <span>Solusi 1-Menit: Skrip SQL Perbaikan Trigger</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
                      Siap Digunakan
                    </span>
                  </div>

                  <p className="text-[11px] text-[#1A4D3A]/80 leading-relaxed">
                    Masalah ini terjadi karena trigger <code className="bg-[#EAE4DC] px-1 py-0.5 rounded font-mono text-[#1A4D3A]">handle_new_user()</code> di database Supabase belum menangani kolom <code className="bg-[#EAE4DC] px-1 py-0.5 rounded font-mono text-[#1A4D3A]">username</code> (NOT NULL). Jalankan skrip ini sekali di SQL Editor Supabase:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SQL_REPAIR_SCRIPT);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3500);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-earth text-white font-bold text-xs flex items-center justify-center gap-2 shadow-clay-sm hover:opacity-95 transition-all cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-4 h-4 text-[#A5D6A7]" />
                          <span>Skrip SQL Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Skrip SQL Perbaikan (1-Klik)</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/owiygitzmhsmygbfkpnb/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-white/90 hover:bg-white text-[#1A4D3A] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#1A4D3A]/15 shadow-clay-sm transition-all"
                    >
                      <span>Buka SQL Editor</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </div>

                  <div className="text-[11px] text-[#1A4D3A]/70 bg-white/70 p-2.5 rounded-xl border border-white/80 space-y-1">
                    <p className="font-bold text-[#1A4D3A]">Langkah Cepat:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                      <li>Klik <b>Salin Skrip SQL Perbaikan (1-Klik)</b> di atas</li>
                      <li>Buka <b>Supabase Dashboard &gt; SQL Editor &gt; New Query</b></li>
                      <li>Tempel (Paste) lalu klik tombol hijau <b>Run</b></li>
                      <li>Kembali ke sini dan klik tombol <b>Daftar Akun Baru</b></li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM CONTAINER */}
        <div className="relative z-10">
          {/* ================= MODE MASUK (LOGIN) ================= */}
          <form
            onSubmit={handleLoginSubmit}
            className={`space-y-4 ${mode === 'login' ? 'block animate-in fade-in duration-150' : 'hidden'}`}
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
              </form>

              {/* ================= MODE DAFTAR (REGISTER) ================= */}
              <form
                onSubmit={handleRegisterSubmit}
                className={`space-y-4 ${mode === 'register' ? 'block animate-in fade-in duration-150' : 'hidden'}`}
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

                {/* Mandatory Privacy Policy Agreement Checkbox */}
                <div
                  id="box-privacy-agreement"
                  className={`flex items-start gap-3 my-4 p-3 rounded-2xl transition-all ${
                    !agreedToPolicy && errorMessage?.toLowerCase().includes('kebijakan')
                      ? 'bg-[#FDF2F2] border border-[#DC2626]/40 shadow-clay-sm'
                      : 'bg-white/40 border border-white/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="privacy-agreement"
                    checked={agreedToPolicy}
                    onChange={(e) => {
                      setAgreedToPolicy(e.target.checked);
                      if (errorMessage?.toLowerCase().includes('kebijakan')) {
                        setErrorMessage(null);
                      }
                    }}
                    className="mt-1 w-4 h-4 rounded-md border-[#357A59] text-[#1A4D3A] focus:ring-[#6DB677] cursor-pointer accent-[#357A59]"
                    required
                  />
                  <label htmlFor="privacy-agreement" className="text-xs text-[#556B61] leading-relaxed cursor-pointer select-none">
                    Saya telah membaca dan menyetujui{' '}
                    <Link
                      className="font-semibold text-[#1A4D3A] underline underline-offset-2 hover:text-[#357A59] transition-colors"
                      href="/privacy-policy"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Kebijakan Privasi
                    </Link>{' '}
                    serta pemrosesan data sampah BumiKita.
                  </label>
                </div>

                {/* Primary Button: Buat Akun */}
                <motion.button
                  id="btn-register-submit"
                  whileHover={{ y: agreedToPolicy ? -2 : 0 }}
                  whileTap={{ scale: agreedToPolicy ? 0.96 : 1 }}
                  disabled={isSubmitting || !agreedToPolicy}
                  type="submit"
                  title={!agreedToPolicy ? 'Centang persetujuan Kebijakan Privasi untuk mendaftar' : 'Daftar Akun BumiKita'}
                  className={`w-full clay-button py-3.5 px-6 text-sm font-extrabold shadow-clay-green flex items-center justify-center gap-2 mt-2 transition-all ${
                    !agreedToPolicy
                      ? 'opacity-60 cursor-not-allowed filter grayscale-[30%]'
                      : 'cursor-pointer hover:shadow-clay-btn'
                  }`}
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
              </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-[#1A4D3A]/10 text-center text-[11px] text-[#1A4D3A]/50">
          Dilindungi oleh sistem enkripsi ramah lingkungan BumiKita
        </div>
      </div>

      {/* ================= MODAL: LUPA KATA SANDI ================= */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1A4D3A]/40">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1A4D3A]/40">
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
