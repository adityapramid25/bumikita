'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from '@/src/components/home/HeroSection';
import { INITIAL_PRODUCTS, INITIAL_DROPOFF_LOCATIONS, INITIAL_COMMUNITY_POSTS } from '@/src/data/mockData';
import { useEco } from '@/src/context/EcoContext';
import { 
  Sparkles, 
  ShoppingBag, 
  TreePine, 
  MapPin, 
  Users, 
  ArrowRight, 
  Droplet, 
  Leaf, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Check, 
  Compass,
  Award,
  Zap,
  GraduationCap,
  Recycle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const { 
    addToCart, 
    setSelectedProductModal, 
    daunPoints, 
    treesPlanted, 
    co2SavedKg, 
    wasteDivertedKg 
  } = useEco();

  const [addedIds, setAddedIds] = React.useState<string[]>([]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const featuredProducts = INITIAL_PRODUCTS.slice(0, 3);
  const featuredPosts = INITIAL_COMMUNITY_POSTS.slice(0, 3);
  const featuredLocations = INITIAL_DROPOFF_LOCATIONS.slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Main Hero Banner & Impact Stats */}
      <HeroSection />

      {/* 2. Quick Feature Gateway Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#357A59] bg-[#E8F2ED] px-3 py-1 rounded-full border border-[#357A59]/20">
                Fitur Unggulan BumiKita
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight mt-1.5">
                Eksplorasi Ekosistem Sirkular Gen-Z
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#1A4D3A]/70 max-w-md">
              Pilih halaman yang ingin kamu tuju dan mulai langkah kecilmu menjaga bumi hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* Market Card */}
            <Link
              href="/market"
              className="bg-[#FAF8F5] p-5 rounded-[24px] shadow-clay-card border border-white hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center text-xl shadow-clay-sm group-hover:scale-110 transition-transform">
                  🛍️
                </div>
                <h3 className="text-base font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                  Green Market
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                  Belanja streetwear upcycle, tumbler, case daur ulang, & produk ramah lingkungan.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#357A59]">
                <span>Buka Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* AI Scanner Card */}
            <Link
              href="/scanner"
              className="bg-[#FAF8F5] p-5 rounded-[24px] shadow-clay-card border border-white hover:-translate-y-1.5 transition-all group flex flex-col justify-between relative overflow-hidden"
            >
              <span className="absolute top-3 right-3 bg-[#FF9E20] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                AI Powered
              </span>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF5E6] text-[#FF9E20] flex items-center justify-center text-xl shadow-clay-sm group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <h3 className="text-base font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                  AI Scanner
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                  Foto sampahmu & dapatkan blueprint DIY upcycle bernilai jual tinggi seketika!
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#357A59]">
                <span>Mulai Scan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Community Card */}
            <Link
              href="/community"
              className="bg-[#FAF8F5] p-5 rounded-[24px] shadow-clay-card border border-white hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center text-xl shadow-clay-sm group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <h3 className="text-base font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                  Community DIY
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                  Lihat showroom karya mahasiswa se-Indonesia & ikuti workshop live bersertifikat.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#357A59]">
                <span>Gabung Komunitas</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Quests Card */}
            <Link
              href="/quests"
              className="bg-[#FAF8F5] p-5 rounded-[24px] shadow-clay-card border border-white hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-xl shadow-clay-sm group-hover:scale-110 transition-transform">
                  🌲
                </div>
                <h3 className="text-base font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                  Hutan & Quest
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                  Selesaikan misi harian & tukar 400 Daun Points untuk menanam 1 pohon nyata ber-GPS.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#357A59]">
                <span>Tanam Pohon</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Dropoff Card */}
            <Link
              href="/dropoff"
              className="bg-[#FAF8F5] p-5 rounded-[24px] shadow-clay-card border border-white hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F4EBEB] text-[#DC2626] flex items-center justify-center text-xl shadow-clay-sm group-hover:scale-110 transition-transform">
                  📍
                </div>
                <h3 className="text-base font-extrabold text-[#1A4D3A] group-hover:text-[#357A59] transition-colors">
                  Drop-off Map
                </h3>
                <p className="text-xs text-[#1A4D3A]/70 leading-relaxed">
                  Temukan titik reverse vending machine & dropbox sampah terdekat dari kampusmu.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#357A59]">
                <span>Cari Lokasi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Green Market Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 shadow-clay-card border border-white space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A4D3A]/10 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] text-[#357A59] text-xs font-bold border border-[#6DB677]/30">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Pilihan Kurasi Minggu Ini</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
                Koleksi Rework & Zero-Waste Terpopuler
              </h2>
              <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
                Setiap pembelian mengurangi limbah tekstil & plastik sekali pakai di Indonesia.
              </p>
            </div>

            <Link
              href="/market"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A4D3A] text-white font-bold text-xs sm:text-sm shadow-clay-button hover:bg-[#357A59] transition-all flex-shrink-0"
            >
              <span>Buka Seluruh Market</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Featured Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const isAdded = addedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductModal(product)}
                  className="bg-[#FAF8F5] rounded-[24px] p-4 shadow-clay-card border border-white hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#EAE5DC] mb-3.5 shadow-clay-inset">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#FAF8F5]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#1A4D3A] shadow-sm flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-[#0284C7] fill-[#0284C7]" />
                      <span>Hemat {product.impactStats.waterSavedLiters}L Air</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#357A59] bg-[#EBF4EE] px-2 py-0.5 rounded-full border border-[#357A59]/20">
                      {product.ecoTags[0]}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#1A4D3A] line-clamp-1 group-hover:text-[#357A59] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#1A4D3A]/70 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1A4D3A]/10 flex items-center justify-between mt-3">
                    <div>
                      <p className="text-[10px] text-[#1A4D3A]/50 font-medium">Harga</p>
                      <p className="text-sm sm:text-base font-black text-[#1A4D3A]">
                        Rp {product.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isAdded
                          ? 'bg-[#357A59] text-white'
                          : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border border-white hover:bg-gradient-earth hover:text-white'
                      }`}
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. AI Scanner Feature Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#FAF8F5] via-[#EBF4EE] to-[#FFF5E6] rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-clay-card border border-white relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#6DB677]/40 text-[#1A4D3A] text-xs font-bold shadow-clay-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9E20] fill-[#FF9E20]" />
                <span>Teknologi AI Gemini Vision</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A4D3A] tracking-tight leading-tight">
                Punya Sampah Kosan? Biarkan AI Memberi Ide Upcycle Kreatif!
              </h2>

              <p className="text-sm sm:text-base text-[#1A4D3A]/80 leading-relaxed max-w-xl">
                Cukup potret atau unggah foto celana jeans robek, botol plastik kopi, kaleng biskuit, atau kardus paket. Gemini AI akan menganalisis bahan dan memberikan panduan langkah-demi-langkah, taksiran nilai jual, hingga klaim Daun Points!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/scanner"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-earth text-white font-extrabold text-sm shadow-clay-green hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#FF9E20]" />
                  <span>Buka AI Scanner Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <span className="text-xs font-bold text-[#357A59]">
                  ✨ Gratis & Hasil Instan dalam 3 Detik
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/90 p-5 rounded-3xl shadow-clay-card border border-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A4D3A]/10">
                <span className="text-xs font-bold text-[#1A4D3A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                  Simulasi Hasil AI Scanner
                </span>
                <span className="text-[10px] font-bold text-[#357A59] bg-[#E8F2ED] px-2 py-0.5 rounded-full">
                  +50 Daun Pts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl overflow-hidden h-24 bg-[#EAE5DC] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1542272604-780c96856592?w=400&auto=format&fit=crop&q=80"
                    alt="Jeans"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
                    Sampah Masuk
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden h-24 bg-[#EAE5DC] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80"
                    alt="Pouch"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-[#357A59] text-white text-[8px] font-bold px-1 rounded">
                    Rekomendasi Upcycle
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-extrabold text-[#1A4D3A]">
                Proyek: Tote Bag Minimalis & Pouch Kabel
              </h4>
              <p className="text-[11px] text-[#1A4D3A]/70">
                Tingkat kesulitan: <strong>Mudah (15 menit)</strong> • Estimasi nilai jual: <strong>Rp 45.000</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Virtual Forest & Tree Restorations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 shadow-clay-card border border-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] text-[#357A59] text-xs font-bold">
                <TreePine className="w-3.5 h-3.5" />
                <span>Restorasi Hutan Ber-GPS Indonesia</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
                Pohon Nyata yang Ditanam dari Aksi Kamumu
              </h2>
              <p className="text-xs sm:text-sm text-[#1A4D3A]/70">
                Setiap 400 Daun Points langsung dialokasikan untuk penanaman mangrove dan meranti bersama mitra konservasi resmi.
              </p>
            </div>

            <Link
              href="/quests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-earth text-white font-bold text-xs sm:text-sm shadow-clay-green hover:scale-105 transition-transform flex-shrink-0"
            >
              <TreePine className="w-4 h-4" />
              <span>Buka Hutan & Misi Quest</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center text-2xl font-bold shadow-clay-sm">
                🌱
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Pohon Ditanam</p>
                <p className="text-lg font-extrabold text-[#1A4D3A]">{treesPlanted} Pohon Nyata</p>
                <p className="text-[10px] text-[#357A59] font-bold">Sertifikat Ber-GPS</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-2xl font-bold shadow-clay-sm">
                ☁️
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Daya Serap CO2</p>
                <p className="text-lg font-extrabold text-[#1A4D3A]">{co2SavedKg} kg / tahun</p>
                <p className="text-[10px] text-[#357A59] font-bold">Penyerapan Emisi</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFF5E6] text-[#FF9E20] flex items-center justify-center text-2xl font-bold shadow-clay-sm">
                🍃
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Poin Daun Aktif</p>
                <p className="text-lg font-extrabold text-[#1A4D3A]">{daunPoints} Daun</p>
                <p className="text-[10px] text-[#FF9E20] font-bold">Siap Ditukar Reward</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Community Showroom Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#357A59] bg-[#E8F2ED] px-3 py-1 rounded-full border border-[#357A59]/20">
                Karya Mahasiswa & Gen-Z Makers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight mt-1.5">
                Galeri DIY & Upcycle Terkini
              </h2>
            </div>
            <Link
              href="/community"
              className="text-xs sm:text-sm font-extrabold text-[#357A59] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Karya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href="/community"
                className="bg-[#FAF8F5] rounded-[24px] p-4 shadow-clay-card border border-white hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-xl overflow-hidden h-28 bg-[#EAE5DC]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
                      Sebelum
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden h-28 bg-[#EAE5DC]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.afterImage} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-[#357A59] text-white text-[8px] font-bold px-1 rounded">
                      Sesudah
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-[#357A59] font-bold">{post.author.name} • {post.author.campus}</p>
                  <h4 className="text-xs font-extrabold text-[#1A4D3A] line-clamp-1 group-hover:text-[#357A59] transition-colors">
                    {post.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#1A4D3A]/10 flex items-center justify-between text-xs text-[#1A4D3A]/60">
                  <span className="font-bold text-[#357A59]">🍃 {post.leavesCount} Daun Apresiasi</span>
                  <span className="font-medium">{post.commentsCount} Komentar</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Nearest Drop-off Points Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-8 shadow-clay-card border border-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] text-[#357A59] text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Drop-off & Reverse Vending</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#1A4D3A] tracking-tight mt-1.5">
                Titik Dropbox & Reverse Vending Terdekat
              </h2>
            </div>

            <Link
              href="/dropoff"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A4D3A] text-white font-bold text-xs shadow-clay-button hover:bg-[#357A59] transition-all"
            >
              <span>Buka Peta Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredLocations.map((loc) => (
              <div key={loc.id} className="p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#357A59] bg-[#E8F2ED] px-2 py-0.5 rounded-full">
                    {loc.type}
                  </span>
                  <span className="text-xs font-bold text-[#357A59]">+{loc.pointsPerKg} Daun/kg</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#1A4D3A]">{loc.name}</h4>
                <p className="text-xs text-[#1A4D3A]/70 line-clamp-1">{loc.address}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-[#1A4D3A]/60">
                  <span>Jarak: {loc.distanceKm} km</span>
                  <span>Buka: {loc.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
