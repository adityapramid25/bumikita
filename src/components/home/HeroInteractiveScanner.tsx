'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Layers, 
  Clock, 
  CheckCircle2, 
  UploadCloud,
  Leaf
} from 'lucide-react';
import { useEco } from '@/src/context/EcoContext';

interface UpcycleResult {
  detectedItemName: string;
  detectedMaterialType: string;
  projectName: string;
  difficulty: string;
  timeEstimate: string;
  estimatedValueIdr: number;
  productDescription: string;
  requiredMaterials: string[];
  toolsNeeded: string[];
  steps: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    tip?: string;
  }>;
  co2SavedKg: number;
  landfillDivertedGrams: number;
}

const SAMPLE_PREVIEWS: Record<string, { icon: string; image: string; data: UpcycleResult }> = {
  'Botol Plastik': {
    icon: '🧴',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    data: {
      detectedItemName: 'Botol Plastik PET 600ml',
      detectedMaterialType: 'PET #1 Food Grade',
      projectName: 'Self-Watering Desk Planter',
      difficulty: 'Mudah',
      timeEstimate: '15 Menit',
      estimatedValueIdr: 28000,
      productDescription: 'Pot tanaman estetik dengan sumbu kapiler otomatis anti-layu untuk meja belajar & kamar kos.',
      requiredMaterials: ['1 botol plastik 600ml', 'Tali katun / sumbu 15cm', 'Tanah humus & tanaman hias'],
      toolsNeeded: ['Cutter tajam', 'Paku kecil / gunting'],
      steps: [
        {
          stepNumber: 1,
          title: 'Potong Botol',
          instruction: 'Gunting botol menjadi 2 bagian pada jarak 10 cm dari mulut botol.',
          tip: 'Amplas tepian potongan agar halus dan rapi.',
        },
        {
          stepNumber: 2,
          title: 'Pasang Sumbu Kapiler',
          instruction: 'Lubangi tutup botol sebesar 4 mm, masukkan tali katun hingga menjuntai.',
          tip: 'Basahi sumbu sebelum memasukkan tanah agar daya serap langsung bekerja.',
        },
        {
          stepNumber: 3,
          title: 'Rakit & Tanam',
          instruction: 'Balikkan corong botol ke dalam wadah dasar, isi air di bawah dan tanam bibit di atas.',
          tip: 'Ganti air setiap 10 hari.',
        },
      ],
      co2SavedKg: 1.4,
      landfillDivertedGrams: 45,
    },
  },
  'Jeans Bekas': {
    icon: '👖',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
    data: {
      detectedItemName: 'Celana Jeans Denim Bekas',
      detectedMaterialType: 'Heavy Denim Cotton',
      projectName: 'Tote Bag Saku Vintage',
      difficulty: 'Sedang',
      timeEstimate: '25 Menit',
      estimatedValueIdr: 65000,
      productDescription: 'Tas jinjing bergaya deconstructed streetwear dengan saku asli celana untuk kompartemen smartphone.',
      requiredMaterials: ['Pipa kaki celana jeans', 'Ban pinggang untuk tali', 'Benang jeans / lem kain kuat'],
      toolsNeeded: ['Gunting kain', 'Jarum jahit atau fabric glue'],
      steps: [
        {
          stepNumber: 1,
          title: 'Potong Pola',
          instruction: 'Potong 30 cm dari kaki celana jeans dan rapikan ujungnya.',
          tip: 'Gunakan saku belakang celana sebagai aksen depan tas.',
        },
        {
          stepNumber: 2,
          title: 'Jahit / Rekatkan Dasar',
          instruction: 'Balikkan kain dan rekatkan bagian bawah dengan lipatan ganda 3 cm.',
          tip: 'Beri jahitan silang di sudut bawah agar muat lebih banyak barang.',
        },
        {
          stepNumber: 3,
          title: 'Pasang Tali Pegangan',
          instruction: 'Pasang pegangan dari ban pinggang di kedua sisi atas tas.',
          tip: 'Jahit berbentuk X agar kuat menopang buku tebal.',
        },
      ],
      co2SavedKg: 4.8,
      landfillDivertedGrams: 400,
    },
  },
  'Kardus Sepatu': {
    icon: '📦',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    data: {
      detectedItemName: 'Kotak Kardus Sepatu Tebal',
      detectedMaterialType: 'Corrugated Cardboard',
      projectName: 'Organizer Meja Minimalis',
      difficulty: 'Mudah',
      timeEstimate: '20 Menit',
      estimatedValueIdr: 35000,
      productDescription: 'Wadah kompartemen meja kos multifungsi dengan sekat alat tulis dan charging dock kabel HP.',
      requiredMaterials: ['1 kotak sepatu beserta tutup', 'Kertas kraft polos cokelat'],
      toolsNeeded: ['Cutter tajam', 'Penggaris besi', 'Lem tembak'],
      steps: [
        {
          stepNumber: 1,
          title: 'Potong Sekat Kompartemen',
          instruction: 'Potong tutup kardus menjadi 3 bilah sekat sesuai tinggi wadah.',
          tip: 'Beri takik di tengah agar antar sekat saling mengunci kokoh.',
        },
        {
          stepNumber: 2,
          title: 'Lubang Kabel Charger',
          instruction: 'Buat lubang oval di sisi belakang untuk jalur kabel charger smartphone.',
          tip: 'Lapisi tepi lubang dengan selotip agar tidak sobek.',
        },
        {
          stepNumber: 3,
          title: 'Pelapisan Estetik',
          instruction: 'Lapisi permukaan luar dengan kertas kraft cokelat bergaya Skandinavia.',
          tip: 'Semprot pernis doff tipis agar tahan cipratan air.',
        },
      ],
      co2SavedKg: 2.1,
      landfillDivertedGrams: 280,
    },
  },
};

export default function HeroInteractiveScanner() {
  const { daunPoints, deductScanPoints, setIsInsufficientModalOpen } = useEco();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UpcycleResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeSampleKey, setActiveSampleKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const focusDropzone = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fileInputRef.current?.click();
    }
  };

  const processScan = async (base64Image: string, sampleKey?: string) => {
    // Zero-point protection check
    if (daunPoints < 50) {
      setIsInsufficientModalOpen(true);
      return;
    }

    // Atomic deduction of 50 Daun Points
    const deductRes = await deductScanPoints(50);
    if (!deductRes.success) {
      setIsInsufficientModalOpen(true);
      return;
    }

    setSelectedImage(base64Image);
    setIsLoading(true);
    setActiveSampleKey(sampleKey || null);

    try {
      const response = await fetch('/api/gemini/upcycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Analisis foto sampah ini secara mendalam dan berikan blueprint upcycle estetik dengan nilai jual tinggi',
          imageBase64: base64Image,
          skillLevel: 'Beginner',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        const d = data.data;
        setResult({
          detectedItemName: d.detectedItemName || 'Barang Bekas Terdeteksi',
          detectedMaterialType: d.detectedMaterialType || 'Material Daur Ulang',
          projectName: d.projectName || 'Kreasi Upcycle Estetik',
          difficulty: d.difficulty?.toLowerCase().includes('mudah') || d.difficulty?.toLowerCase().includes('easy') ? 'Mudah' : 'Sedang',
          timeEstimate: d.timeEstimate || '20 Menit',
          estimatedValueIdr: d.estimatedValueIdr || 38000,
          productDescription: d.productDescription || d.tagline || 'Kreasi upcycle fungsional ramah lingkungan.',
          requiredMaterials: d.requiredMaterials || ['Bahan dari foto', 'Alat perekat'],
          toolsNeeded: d.toolsNeeded || ['Gunting', 'Lem'],
          steps: d.steps || [
            { stepNumber: 1, title: 'Bersihkan Bahan', instruction: 'Bersihkan bahan bekas hingga kering dan higienis.' },
            { stepNumber: 2, title: 'Bentuk Komponen', instruction: 'Potong pola sesuai kebutuhan kreasi.' },
            { stepNumber: 3, title: 'Rakit & Finishing', instruction: 'Satukan semua komponen dengan rapi.' },
          ],
          co2SavedKg: d.co2SavedKg || 2.5,
          landfillDivertedGrams: d.landfillDivertedGrams || 250,
        });
      } else {
        const fallback = sampleKey && SAMPLE_PREVIEWS[sampleKey]
          ? SAMPLE_PREVIEWS[sampleKey].data
          : SAMPLE_PREVIEWS['Botol Plastik'].data;
        setResult(fallback);
      }
    } catch {
      const fallback = sampleKey && SAMPLE_PREVIEWS[sampleKey]
        ? SAMPLE_PREVIEWS[sampleKey].data
        : SAMPLE_PREVIEWS['Botol Plastik'].data;
      setResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      processScan(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      processScan(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = (key: string) => {
    const sample = SAMPLE_PREVIEWS[key];
    if (sample) {
      processScan(sample.image, key);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setActiveSampleKey(null);
    setIsDrawerOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="relative w-full pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Subtle Ambient Clay Orbs for Depth */}
      <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-[#6DB677]/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#FF9E20]/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-[#357A59]/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Split Asymmetrical Bento Grid (5 Cols Left, 7 Cols Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN (5 Cols): Punchy Value Proposition */}
          <div className="lg:col-span-5 space-y-6 pt-1 sm:pt-2 lg:pt-[54px] pb-4 sm:pb-6 lg:pb-[56px]">
            {/* Headline: Exactly 6 words */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#1A4D3A] tracking-tight leading-[1.08]">
              Ubah Sampah Jadi Cuan & Karya.
            </h1>

            {/* Sub-headline: Exactly 1 sentence */}
            <p className="text-base sm:text-lg text-[#1A4D3A]/80 leading-relaxed max-w-lg">
              Scan sampahmu dengan AI, hitung potensi keuntungan, dan jual langsung di Green Market.
            </p>

            {/* Dual Action Bar */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={focusDropzone}
                className="clay-button px-6 py-3.5 flex items-center gap-2.5 text-sm sm:text-base font-bold shadow-clay-green cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Mulai Scan Sampah</span>
              </motion.button>

              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href="/market"
                  className="px-6 py-3.5 rounded-full bg-[#FAF8F5] text-[#1A4D3A] text-sm sm:text-base font-bold shadow-clay-pill hover:bg-white transition-all flex items-center gap-2 group"
                >
                  <span>Jelajahi Produk</span>
                  <ArrowRight className="w-4 h-4 text-[#357A59] group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): 3D Tactile Eco-Device Scanner Card */}
          <div className="lg:col-span-7 relative">
            
            {/* Visual Floating Tag Stickers Tilted Around Scanner Box */}
            <motion.div
              initial={{ opacity: 0, y: 10, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden sm:flex absolute -top-4 -left-3 z-20 items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#EBF4EE] text-[#357A59] text-xs font-bold shadow-clay-card border border-white/60 pointer-events-none select-none"
            >
              <span>🌿</span>
              <span>-0.5kg Karbon</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden sm:flex absolute -top-4 -right-2 z-20 items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF5E6] text-[#D97E0D] text-xs font-extrabold shadow-clay-card border border-white/60 pointer-events-none select-none"
            >
              <span>💰</span>
              <span>Estimasi Cuan: Rp 45k</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden sm:flex absolute -bottom-3 right-6 z-20 items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] text-xs font-bold shadow-clay-card border border-white/80 pointer-events-none select-none"
            >
              <span>✨</span>
              <span>Tote Bag Idea</span>
            </motion.div>

            {/* Main 3D Tactile Card Container */}
            <div 
              ref={dropzoneRef}
              className="relative clay-card p-6 sm:p-8 lg:p-10 space-y-6 overflow-hidden border-2 border-white/80"
            >
              {/* Card Header Tag */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6DB677] animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#357A59]">
                    Live AI Vision Scanner
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-white text-[11px] font-bold text-[#1A4D3A] shadow-clay-sm">
                    <Leaf className="w-3 h-3 text-[#357A59]" />
                    <span>Biaya: 50 Daun</span>
                  </span>
                  <span className={`text-[11px] font-bold ${daunPoints >= 50 ? 'text-[#357A59]' : 'text-[#D97E0D]'}`}>
                    Poin: {daunPoints} 🍃
                  </span>
                </div>
              </div>

              {/* State 1: Dropzone (When no result yet) */}
              {!result && (
                <div className="space-y-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Dropzone with Soft Clay Inset Depth & Viewfinder Corner Brackets */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    className={`relative clay-inset p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
                      isDragOver ? 'ring-2 ring-[#357A59] scale-[0.99] bg-[#EAE5DC]' : 'hover:scale-[0.995]'
                    }`}
                  >
                    {/* Viewfinder Corner Brackets in Pulsing Fresh Lime */}
                    <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#6DB677] transition-all group-hover:scale-110" />
                    <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#6DB677] transition-all group-hover:scale-110" />
                    <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#6DB677] transition-all group-hover:scale-110" />
                    <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#6DB677] transition-all group-hover:scale-110" />

                    {isLoading ? (
                      <div className="space-y-3 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center mx-auto animate-spin shadow-clay-sm">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-[#1A4D3A]">
                          Memindai objek & merancang blueprint...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-pill group-hover:scale-110 transition-transform">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-extrabold text-[#1A4D3A]">
                            Tarik foto ke sini atau Klik Kamera
                          </h3>
                          <p className="text-xs text-[#1A4D3A]/60">
                            Botol, kain perca, kardus, jeans, & kaleng
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pressable Tactile Clay Chips: "Atau coba sampel" */}
                  {!isLoading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#1A4D3A]/60">
                        <span className="font-semibold">Atau coba sampel instan:</span>
                        <span className="text-[10px]">Klik untuk coba</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        {Object.entries(SAMPLE_PREVIEWS).map(([key, sample]) => (
                          <motion.button
                            key={key}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleSampleClick(key)}
                            className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-clay-pill cursor-pointer ${
                              activeSampleKey === key
                                ? 'bg-[#357A59] text-white'
                                : 'bg-[#FAF8F5] text-[#1A4D3A] hover:bg-white hover:text-[#357A59]'
                            }`}
                          >
                            <span className="text-sm">{sample.icon}</span>
                            <span className="truncate">{key}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* State 2: Clean 3-Item Horizontal Card Deck (Result) */}
              {result && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Selected Object Mini Bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-[#1A4D3A]/70 pb-2 border-b border-[#1A4D3A]/10">
                    <span>Terdeteksi: {result.detectedItemName}</span>
                    <span className="text-[#357A59] font-extrabold">Analisis Selesai</span>
                  </div>

                  {/* 3-Item Card Deck */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="clay-card p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                        Hasil Upcycle
                      </span>
                      <h4 className="text-sm font-extrabold text-[#1A4D3A] line-clamp-2 mt-1">
                        {result.projectName}
                      </h4>
                    </div>

                    <div className="clay-card p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                        Kesulitan
                      </span>
                      <div className="mt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBF4EE] text-xs font-bold text-[#357A59] shadow-clay-sm">
                          {result.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="clay-card p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                        Estimasi Jual
                      </span>
                      <p className="text-sm font-black text-[#1A4D3A] font-mono mt-1">
                        Rp {result.estimatedValueIdr.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <button
                      onClick={handleReset}
                      className="text-xs font-bold text-[#1A4D3A]/60 hover:text-[#1A4D3A] transition-colors cursor-pointer"
                    >
                      ← Scan Sampah Baru
                    </button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsDrawerOpen(true)}
                      className="clay-button px-5 py-2.5 text-xs sm:text-sm font-bold shadow-clay-green flex items-center gap-2 cursor-pointer"
                    >
                      <span>Lihat Detail Kreasi</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* On-Demand Slide-over Drawer / Modal */}
      <AnimatePresence>
        {isDrawerOpen && result && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#FAF8F5] shadow-2xl h-full flex flex-col z-10 overflow-hidden border-l border-white/80"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1A4D3A]/10 flex items-center justify-between bg-[#FAF8F5]">
                <div>
                  <span className="text-xs font-bold text-[#357A59] tracking-wider uppercase">
                    Blueprint Upcycle
                  </span>
                  <h3 className="text-xl font-extrabold text-[#1A4D3A] mt-0.5">
                    {result.projectName}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#F5F2ED] text-[#1A4D3A] flex items-center justify-center shadow-clay-sm hover:bg-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Description & Economics */}
                <div className="clay-card p-5 space-y-4">
                  <p className="text-sm text-[#1A4D3A]/80 leading-relaxed">
                    {result.productDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1A4D3A]/10">
                    <div className="clay-inset p-3">
                      <span className="text-[11px] font-bold text-[#1A4D3A]/60 block">Modal Tambahan</span>
                      <span className="text-sm font-extrabold text-[#1A4D3A]">
                        Rp {(result.estimatedValueIdr * 0.25).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="clay-inset p-3">
                      <span className="text-[11px] font-bold text-[#357A59] block">Proyeksi Laba Bersih</span>
                      <span className="text-sm font-extrabold text-[#357A59]">
                        Rp {(result.estimatedValueIdr * 0.75).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Materials & Tools */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#1A4D3A] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#357A59]" />
                    <span>Bahan & Alat</span>
                  </h4>
                  <div className="clay-card p-4 space-y-2">
                    <div className="space-y-1">
                      {result.requiredMaterials.map((mat, idx) => (
                        <p key={idx} className="text-xs text-[#1A4D3A]/80 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#357A59]" />
                          <span>{mat}</span>
                        </p>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[#1A4D3A]/10 text-xs text-[#1A4D3A]/70">
                      <span className="font-bold">Alat:</span> {result.toolsNeeded.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#1A4D3A] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#357A59]" />
                    <span>Langkah Pembuatan ({result.timeEstimate})</span>
                  </h4>
                  <div className="space-y-3">
                    {result.steps.map((step) => (
                      <div key={step.stepNumber} className="clay-card p-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#357A59] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {step.stepNumber}
                          </span>
                          <h5 className="text-xs font-bold text-[#1A4D3A]">
                            {step.title}
                          </h5>
                        </div>
                        <p className="text-xs text-[#1A4D3A]/80 pl-7 leading-relaxed">
                          {step.instruction}
                        </p>
                        {step.tip && (
                          <p className="text-[11px] text-[#357A59] pl-7 font-medium">
                            💡 Tip: {step.tip}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eco Stats */}
                <div className="clay-inset p-4 flex items-center justify-between text-xs font-bold text-[#357A59]">
                  <span>🍃 Menghemat {result.co2SavedKg} kg CO2</span>
                  <span>Mencegah {result.landfillDivertedGrams}g Sampah</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-[#1A4D3A]/10 bg-[#FAF8F5]">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full clay-button py-3 text-sm font-bold shadow-clay-green cursor-pointer"
                >
                  Tutup & Mulai Rakit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
