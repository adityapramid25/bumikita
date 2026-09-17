'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  Camera,
  MapPin,
  Lock,
  Leaf,
  FileText,
  Eye,
  CheckCircle2,
  Sparkles,
  Server,
  UserCheck,
  Mail,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('summary');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/auth?mode=register');
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F2ED] text-[#1A4D3A] selection:bg-[#6DB677]/30 selection:text-[#1A4D3A] py-6 sm:py-10 px-4 sm:px-6">
      {/* Ambient background glow */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Sticky Tactile Header Bar with Back Button */}
        <header className="sticky top-4 z-40 flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-[#FAF8F5]/90 backdrop-blur-md border border-white shadow-clay-card">
          <div className="flex items-center gap-3">
            <button
              id="btn-privacy-back"
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF8F5] text-xs sm:text-sm font-extrabold text-[#1A4D3A] shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#357A59]" />
              <span>← Kembali</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#1A4D3A]/70">
              <span>BumiKita</span>
              <span>/</span>
              <span className="text-[#357A59]">Kebijakan Privasi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-card border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Cetak Salinan Kebijakan"
            >
              <Printer className="w-4 h-4 text-[#357A59]" />
            </button>
          </div>
        </header>

        {/* Hero Title Card */}
        <div className="clay-card p-6 sm:p-10 border border-white space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-[#1A4D3A] tracking-tight leading-tight">
              Kebijakan Privasi BumiKita
            </h1>
            <p className="text-xs sm:text-sm text-[#556B61] leading-relaxed max-w-3xl">
              Komitmen kami untuk melindungi privasi Anda saat berpartisipasi dalam ekonomi sirkular: 
              dari pemindaian foto sampah cerdas AI, pengelolaan saldo Daun Points, hingga 
              kerahasiaan lokasi titik reverse vending dan alamat pengiriman karya upcycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-[#1A4D3A]/60 border-t border-[#1A4D3A]/10">
            <span>📅 Berlaku Efektif: 9 September 2026</span>
            <span>•</span>
            <span>Versi: 2.4 (Regulasi PDP Indonesia)</span>
            <span>•</span>
            <span className="text-[#357A59]">PT BumiKita Solusi Berkelanjutan</span>
          </div>
        </div>

        {/* Quick Jump Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'summary', label: 'Ringkasan Inti' },
            { id: 'waste-ai', label: 'Foto Sampah & AI Vision' },
            { id: 'account', label: 'Akun & Saldo Daun' },
            { id: 'location', label: 'Geolokasi & Peta' },
            { id: 'shipping', label: 'Alamat Pengiriman' },
            { id: 'rights', label: 'Hak Pemilik Data' },
            { id: 'contact', label: 'Kontak Tim Privasi' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => scrollTo(pill.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                activeSection === pill.id
                  ? 'bg-[#357A59] text-white border-[#357A59] shadow-clay-sm'
                  : 'bg-[#FAF8F5] text-[#1A4D3A]/80 border-white shadow-clay-pill hover:bg-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Section 1: Summary Cards */}
        <section id="summary" className="space-y-4">
          <h2 className="text-lg font-black text-[#1A4D3A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF9E20]" />
            <span>1. Tiga Pilar Komitmen Privasi BumiKita</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="clay-card p-5 border border-white space-y-3 bg-[#FAF8F5]">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A4D3A]">
                Foto Sampah Tanpa Identifikasi Wajah
              </h3>
              <p className="text-xs text-[#556B61] leading-relaxed">
                Kamera dan scanner Waste to Worth hanya mendeteksi material sampah (plastik, kertas, kaleng). Metadata EXIF sensitif (seperti identitas perangkat) otomatis diabaikan.
              </p>
            </div>

            <div className="clay-card p-5 border border-white space-y-3 bg-[#FAF8F5]">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A4D3A]">
                Enkripsi Akun & Saldo Daun
              </h3>
              <p className="text-xs text-[#556B61] leading-relaxed">
                Kredensial login Anda disimpan dengan enkripsi Supabase PostgreSQL dan Row Level Security (RLS). Daun Points dan transaksi Green Market Anda terisolasi secara aman.
              </p>
            </div>

            <div className="clay-card p-5 border border-white space-y-3 bg-[#FAF8F5]">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A4D3A]">
                Lokasi Real-Time Tidak Disimpan
              </h3>
              <p className="text-xs text-[#556B61] leading-relaxed">
                Sensor geolokasi hanya digunakan secara lokal di perangkat Anda untuk memetakan jarak ke Reverse Vending Machine atau drop-off bank sampah terdekat, tidak dilacak terus-menerus.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Waste Image & AI Processing */}
        <section id="waste-ai" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-earth text-white flex items-center justify-center shadow-clay-green">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                2. Pemrosesan Foto Sampah & Gemini AI Vision
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Transparansi Kerja Model Kecerdasan Buatan & Daur Ulang
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#556B61] leading-relaxed">
            <p>
              Saat Anda memindai atau mengunggah foto melalui fitur <strong>Waste to Worth AI Scanner</strong>, foto tersebut diproses secara server-side melalui model Google Gemini Vision untuk:
            </p>
            <ul className="space-y-2 pl-4 border-l-2 border-[#357A59]/30">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#357A59] shrink-0 mt-0.5" />
                <span>Mendeteksi jenis material (misal: botol PET, kardus karton, kaleng aluminium).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#357A59] shrink-0 mt-0.5" />
                <span>Mengestimasi massa (gram) dan potensi pengurangan jejak karbon (CO₂e).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#357A59] shrink-0 mt-0.5" />
                <span>Menghasilkan rekomendasi panduan kerajinan DIY upcycle yang memiliki nilai jual.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-[#EBF4EE]/80 border border-white text-xs space-y-1.5 text-[#1A4D3A]">
              <div className="font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#357A59]" />
                <span>Jaminan Tanpa Pengenalan Wajah (No Facial Profiling)</span>
              </div>
              <p className="text-[#556B61]">
                BumiKita secara ketat menolak pengenalan biometrik. Jika foto sampah secara tidak sengaja memuat wajah atau teks sensitif, sistem algoritma kami hanya memfokuskan ekstraksi pada objek anorganik/organik dan tidak pernah menyimpan atau memetakan identitas biometrik Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Account & Points Security */}
        <section id="account" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                3. Akun Pengguna, Kredensial, & Daun Points
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Keamanan Lapisan Database & Hak Kepemilikan Koin
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#556B61] leading-relaxed">
            <p>
              Saat Anda mendaftar, kami mengumpulkan informasi terbatas: nama lengkap, alamat email aktif, kata sandi, peran pejuang bumi (Siswa, Sekolah, atau Kreator Upcycle), serta alias publik (<code className="px-1.5 py-0.5 rounded bg-white font-mono text-[11px] text-[#1A4D3A]">@nickname</code>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white space-y-1">
                <span className="font-extrabold text-xs text-[#1A4D3A]">Enkripsi Kata Sandi</span>
                <p className="text-xs text-[#556B61]">Kata sandi tidak pernah disimpan dalam bentuk teks biasa. Kredensial di-hash dengan algoritma kriptografi satu arah.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white space-y-1">
                <span className="font-extrabold text-xs text-[#1A4D3A]">Integritas Daun Points</span>
                <p className="text-xs text-[#556B61]">Mutasi saldo poin hasil setoran sampah atau pembelian produk diverifikasi via basis data transaksional terenkripsi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Location & Reverse Vending Drop-off */}
        <section id="location" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                4. Data Lokasi & Reverse Vending Machine (RVM)
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Pencarian Mesin Penukar Sampah Tanpa Pelacakan Riwayat
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#556B61] leading-relaxed">
            <p>
              Fitur <strong>Drop-Off & Reverse Vending Locator</strong> memerlukan akses lokasi perangkat Anda untuk menghitung radius dan rute terdekat ke mesin penukar sampah botol plastik atau bank sampah binaan.
            </p>
            <ul className="space-y-2 pl-4 border-l-2 border-[#357A59]/30">
              <li>• Koordinat GPS hanya dibaca saat halaman peta dibuka dan tidak disimpan dalam basis data riwayat perjalanan.</li>
              <li>• Jika Anda memilih untuk tidak membagikan lokasi GPS, Anda tetap dapat menelusuri lokasi drop-off dengan memilih nama Kota atau Wilayah secara manual.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Shipping & Delivery Addresses */}
        <section id="shipping" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                5. Alamat Pengiriman & Transaksi Green Market
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Struktur Wilayah Indonesia & Kerahasiaan Penerima
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#556B61] leading-relaxed">
            <p>
              Data alamat pengiriman (Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan, Kode Pos, dan Detail Jalan) yang Anda masukkan di halaman Profil hanya digunakan untuk:
            </p>
            <div className="p-3.5 rounded-2xl bg-white/60 border border-white text-xs space-y-1.5 text-[#1A4D3A]">
              <p>• Mengirimkan pesanan produk upcycle dari kreator kepada Anda melalui ekspedisi logistik.</p>
              <p>• Menghitung perkiraan ongkos kirim dan jejak emisi transportasi pengiriman paket.</p>
              <p>• Data ini tidak pernah dibagikan kepada pihak iklan eksternal atau broker data pihak ketiga.</p>
            </div>
          </div>
        </section>

        {/* Section 6: User Rights Under UU PDP */}
        <section id="rights" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-earth text-white flex items-center justify-center shadow-clay-green">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                6. Hak Pemilik Data Pribadi (UU No. 27/2022)
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Kendali Penuh Atas Identitas & Rekam Jejak Aksi Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-white/70 border border-white space-y-1">
              <h4 className="font-extrabold text-xs text-[#1A4D3A]">Hak Akses & Portabilitas</h4>
              <p className="text-xs text-[#556B61]">Anda berhak meminta salinan data akun, riwayat poin daun, dan total sampah yang telah Anda setorkan.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-white space-y-1">
              <h4 className="font-extrabold text-xs text-[#1A4D3A]">Hak Koreksi & Pembaruan</h4>
              <p className="text-xs text-[#556B61]">Anda dapat memperbarui nama, foto profil, dan alamat domisili secara mandiri di halaman Profil.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-white space-y-1">
              <h4 className="font-extrabold text-xs text-[#1A4D3A]">Hak Penghapusan Akun</h4>
              <p className="text-xs text-[#556B61]">Anda dapat mengajukan penghapusan akun permanen (right to be forgotten) kapan saja tanpa biaya.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-white space-y-1">
              <h4 className="font-extrabold text-xs text-[#1A4D3A]">Hak Penarikan Persetujuan</h4>
              <p className="text-xs text-[#556B61]">Anda dapat menolak izin kamera atau lokasi sewaktu-waktu melalui pengaturan peramban/perangkat Anda.</p>
            </div>
          </div>
        </section>

        {/* Section 7: Contact DPO */}
        <section id="contact" className="clay-card p-6 sm:p-8 border border-white space-y-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center shadow-clay-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A4D3A]">
                7. Hubungi Pejabat Pelindungan Data (DPO)
              </h2>
              <p className="text-xs text-[#357A59] font-bold">
                Saluran Bantuan & Pertanyaan Terkait Privasi
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#556B61] leading-relaxed">
            <p>
              Jika Anda memiliki pertanyaan, keluhan, atau ingin menggunakan hak privasi Anda, silakan hubungi Tim Pelindungan Data kami melalui saluran resmi berikut:
            </p>

            <div className="p-4 rounded-2xl bg-white/80 border border-white space-y-2 text-xs text-[#1A4D3A]">
              <div className="flex items-center gap-2">
                <span className="font-extrabold w-28">Surel Resmi:</span>
                <a href="mailto:privasi@bumikita.id" className="text-[#357A59] font-bold underline hover:text-[#1A4D3A]">
                  privasi@bumikita.id
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold w-28">WhatsApp Bantuan:</span>
                <span className="font-medium">+62 812-3456-BUMI (Senin - Jumat, 09.00 - 17.00 WIB)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-extrabold w-28 shrink-0">Alamat Kantor:</span>
                <span className="font-medium">Gedung Restorasi Hijau Lt. 4, Kawasan Edukasi Senayan, Jakarta Pusat 10270, Indonesia</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Acknowledgment & Return Action */}
        <div className="clay-card p-6 sm:p-8 border border-white text-center space-y-4 bg-gradient-to-b from-[#FAF8F5] to-[#EBF4EE]/50">
          <div className="w-12 h-12 rounded-3xl bg-gradient-earth text-white flex items-center justify-center mx-auto shadow-clay-green">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-[#1A4D3A]">
              Siap Menjadi Pejuang Bumi?
            </h3>
            <p className="text-xs text-[#556B61]">
              Setelah membaca Kebijakan Privasi ini, kembali ke formulir pendaftaran untuk menyelesaikan pembuatan akun BumiKita Anda.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-bottom-return"
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-earth text-white text-xs sm:text-sm font-extrabold shadow-clay-btn hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Saya Mengerti & Kembali ke Formulir</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF8F5] border border-white text-[#1A4D3A] text-xs sm:text-sm font-extrabold shadow-clay-pill hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Jelajahi Beranda BumiKita</span>
            </Link>
          </div>
        </div>

        {/* Minimal Footer Note */}
        <div className="text-center pt-2 pb-6 text-xs text-[#1A4D3A]/50 flex items-center justify-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
          <span>BumiKita © 2026 • Platform Aksi Upcycle & Ekonomi Sirkular Berkelanjutan</span>
        </div>
      </div>
    </div>
  );
}
