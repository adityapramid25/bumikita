'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Heart, Globe, Droplet, Sparkles, MapPin, TreePine, ShoppingBag, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#1A4D3A]/10 mt-16 text-[#1A4D3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-earth flex items-center justify-center text-white shadow-clay-sm group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#1A4D3A]">
                Bumi<span className="text-[#357A59]">Kita</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70 leading-relaxed max-w-sm">
              Platform ekonomi sirkular & upcycle masa depan untuk Gen-Z Indonesia. Menghubungkan karya streetwear upcycle mahasiswa, scanner AI pendeteksi sampah bernilai, misi restorasi hutan ber-GPS, hingga peta titik drop-off reverse vending se-Indonesia.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#357A59]">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>100% Zero-Carbon Powered Platform • Bahasa Indonesia</span>
            </div>
          </div>

          {/* Quick Nav Multi-Page Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A4D3A]/50">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs font-bold text-[#1A4D3A]/80">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/market"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Market</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/scanner"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF9E20]" />
                  <span>AI Scanner</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Community</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/quests"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <TreePine className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Hutan & Quest</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dropoff"
                  className="hover:text-[#357A59] transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#357A59]" />
                  <span>Drop-off Map</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Chapter Network */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A4D3A]/50">
              Jaringan Kampus & Komunitas
            </h4>
            <p className="text-xs text-[#1A4D3A]/70">
              Bergabung dengan 28+ Eco Chapter mahasiswa aktif di kampus-kampus ternama:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['UI Depok', 'ITB Bandung', 'UGM Yogyakarta', 'ITS Surabaya', 'Undip Semarang', 'Unair', 'Unud Bali', 'Unpad Jatinangor'].map((camp) => (
                <span
                  key={camp}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-sm border border-white"
                >
                  {camp}
                </span>
              ))}
            </div>
          </div>

          {/* Eco Pledge */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A4D3A]/50">
              Gerakan Sirkular
            </h4>
            <div className="p-3.5 rounded-2xl bg-[#EBF4EE] border border-[#6DB677]/40 shadow-clay-sm space-y-2">
              <p className="text-[11px] font-bold text-[#1A4D3A]">
                Pilah sampahmu hari ini, tanam pohon nyata untuk esok.
              </p>
              <span className="text-[10px] text-[#357A59] font-bold block">
                #GenerasiPilahSampah
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#1A4D3A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#1A4D3A]/60 font-semibold">
          <p>© 2026 BumiKita. Hak Cipta Dilindungi. Dibuat dengan cinta untuk bumi Indonesia.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#357A59] cursor-pointer">Panduan Zero Waste</span>
            <span className="hover:text-[#357A59] cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-[#357A59] cursor-pointer">Mitra Kampus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
