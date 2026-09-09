'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, X, ChevronRight, CheckCircle2, Clock, DollarSign, Layers } from 'lucide-react';

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
  co2SavedKg?: number;
  landfillDivertedGrams?: number;
}

const SAMPLE_PREVIEWS: Record<string, { image: string; fallback: UpcycleResult }> = {
  'Botol Plastik': {
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    fallback: {
      detectedItemName: 'Botol Plastik PET 600ml',
      detectedMaterialType: 'PET #1 Food Grade',
      projectName: 'Self-Watering Desk Planter',
      difficulty: 'Mudah',
      timeEstimate: '15 Menit',
      estimatedValueIdr: 25000,
      productDescription: 'Pot tanaman estetik dengan sumbu kapiler otomatis anti-layu untuk meja belajar & kamar kos.',
      requiredMaterials: ['1 botol plastik bekas 600ml', 'Tali katun atau sumbu kompor 15 cm', 'Tanah humus & tanaman hias'],
      toolsNeeded: ['Gunting tajam atau cutter', 'Paku kecil / solder untuk melubangi tutup'],
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
          instruction: 'Lubangi tutup botol sebesar 4 mm, masukkan tali katun hingga menjuntai ke bagian bawah.',
          tip: 'Basahi sumbu sebelum memasukkan tanah agar daya serap langsung bekerja.',
        },
        {
          stepNumber: 3,
          title: 'Rakit & Tanam',
          instruction: 'Balikkan corong botol ke dalam wadah dasar, isi air di bawah dan tanam bibit di atas.',
          tip: 'Ganti air setiap 10 hari untuk mencegah jentik nyamuk.',
        },
      ],
      co2SavedKg: 1.4,
      landfillDivertedGrams: 45,
    },
  },
  'Jeans Bekas': {
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
    fallback: {
      detectedItemName: 'Celana Jeans Denim Bekas',
      detectedMaterialType: 'Heavy Denim Cotton',
      projectName: 'Tote Bag Saku Vintage',
      difficulty: 'Sedang',
      timeEstimate: '25 Menit',
      estimatedValueIdr: 65000,
      productDescription: 'Tas jinjing bergaya deconstructed streetwear dengan saku asli celana untuk kompartemen HP.',
      requiredMaterials: ['Bagian pipa kaki jeans bekas', 'Waistband celana untuk handle', 'Benang jeans / lem kain'],
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
          title: 'Jahit / Lem Bagian Dasar',
          instruction: 'Balikkan kain dan rekatkan atau jahit bagian bawah tas dengan jahitan ganda.',
          tip: 'Lipat sudut bawah 3 cm untuk membuat volume dasar tas lebih luas.',
        },
        {
          stepNumber: 3,
          title: 'Pasang Tali Pegangan',
          instruction: 'Pasangkan tali pegangan dari ban pinggang celana di kedua sisi atas.',
          tip: 'Jahit silang berbentuk X di ujung tali agar kuat menampung buku.',
        },
      ],
      co2SavedKg: 4.8,
      landfillDivertedGrams: 400,
    },
  },
  'Kardus Sepatu': {
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    fallback: {
      detectedItemName: 'Kotak Kardus Sepatu Kaku',
      detectedMaterialType: 'Corrugated Cardboard',
      projectName: 'Organizer Meja Minimalis',
      difficulty: 'Mudah',
      timeEstimate: '20 Menit',
      estimatedValueIdr: 35000,
      productDescription: 'Wadah kompartemen meja kos multifungsi dengan sekat alat tulis dan charging dock HP.',
      requiredMaterials: ['1 kotak sepatu kardus beserta tutupnya', 'Kertas kado kraft polos / cat akrilik'],
      toolsNeeded: ['Cutter tajam', 'Penggaris besi', 'Lem tembak atau lem kertas kuat'],
      steps: [
        {
          stepNumber: 1,
          title: 'Buat Sekat Kompartemen',
          instruction: 'Potong tutup kardus menjadi 3 bilah sekat berukuran sesuai tinggi kotak.',
          tip: 'Beri celah takik di tengah bilah sekat agar saling mengunci kuat.',
        },
        {
          stepNumber: 2,
          title: 'Lubang Kabel Charger',
          instruction: 'Buat lubang oval di sisi belakang untuk jalur kabel charger HP.',
          tip: 'Lapisi tepi lubang dengan selotip bening agar kardus tidak sobek.',
        },
        {
          stepNumber: 3,
          title: 'Finishing & Pelapisan',
          instruction: 'Lapisi permukaan luar dengan kertas kraft cokelat untuk tampilan Scandinavian clean.',
          tip: 'Semprotkan pernis doff tipis agar tahan cipratan air.',
        },
      ],
      co2SavedKg: 2.1,
      landfillDivertedGrams: 280,
    },
  },
};

export default function MinimalScannerWidget() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UpcycleResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (base64Image: string, sampleKey?: string) => {
    setSelectedImage(base64Image);
    setIsLoading(true);

    try {
      // Call Gemini API route
      const response = await fetch('/api/gemini/upcycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Rekomendasikan kreasi upcycling paling estetik, fungsional, dan bernilai tinggi',
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
          difficulty: d.difficulty?.toLowerCase().includes('easy') || d.difficulty?.toLowerCase().includes('mudah') ? 'Mudah' : 'Sedang',
          timeEstimate: d.timeEstimate || '20 Menit',
          estimatedValueIdr: d.estimatedValueIdr || 35000,
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
        // Fallback to rich predefined sample
        const fallback = sampleKey && SAMPLE_PREVIEWS[sampleKey]
          ? SAMPLE_PREVIEWS[sampleKey].fallback
          : SAMPLE_PREVIEWS['Botol Plastik'].fallback;
        setResult(fallback);
      }
    } catch {
      // Graceful offline fallback
      const fallback = sampleKey && SAMPLE_PREVIEWS[sampleKey]
        ? SAMPLE_PREVIEWS[sampleKey].fallback
        : SAMPLE_PREVIEWS['Botol Plastik'].fallback;
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
      const base64 = reader.result as string;
      handleFileProcess(base64);
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
      const base64 = reader.result as string;
      handleFileProcess(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = (key: string) => {
    const sample = SAMPLE_PREVIEWS[key];
    if (sample) {
      handleFileProcess(sample.image, key);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setIsDrawerOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="scanner-widget" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="clay-card p-6 sm:p-10 lg:p-12">
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

            {/* Centralized Large Dropzone with Organic Clay Inset Feel */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`clay-inset p-10 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-[#357A59] scale-[0.99]' : 'hover:scale-[0.995]'
              }`}
            >
              {isLoading ? (
                <div className="space-y-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-[#EBF4EE] text-[#357A59] flex items-center justify-center mx-auto animate-spin shadow-clay-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1A4D3A]">
                    Menganalisis foto dengan AI...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#357A59] flex items-center justify-center mx-auto shadow-clay-pill">
                    <Camera className="w-7 h-7" />
                  </div>
                  {/* Required Dropzone Text */}
                  <h3 className="text-lg font-bold text-[#1A4D3A]">
                    Tarik foto ke sini atau Klik Kamera
                  </h3>
                </div>
              )}
            </div>

            {/* Quick Interactive Samples */}
            {!isLoading && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-[#1A4D3A]/60 mr-1">Atau coba sampel:</span>
                {Object.keys(SAMPLE_PREVIEWS).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSampleClick(key)}
                    className="px-3 py-1.5 rounded-full bg-[#FAF8F5] text-xs font-bold text-[#1A4D3A] shadow-clay-pill hover:bg-white hover:text-[#357A59] transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* State 2: Clean Result State (3-Item Horizontal Card Deck) */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 3-Item Horizontal Card Deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Item 1: Output Title */}
              <div className="clay-card p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                  Hasil Upcycle
                </span>
                <h4 className="text-xl font-extrabold text-[#1A4D3A] tracking-tight mt-2">
                  {result.projectName}
                </h4>
              </div>

              {/* Item 2: Difficulty Pill */}
              <div className="clay-card p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                  Tingkat Kesulitan
                </span>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#EBF4EE] text-sm font-bold text-[#357A59] shadow-clay-sm">
                    {result.difficulty}
                  </span>
                </div>
              </div>

              {/* Item 3: Estimated Selling Price */}
              <div className="clay-card p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-[#1A4D3A]/50 uppercase tracking-wider">
                  Estimasi Nilai Jual
                </span>
                <p className="text-xl font-extrabold text-[#1A4D3A] tracking-tight mt-2">
                  Rp {result.estimatedValueIdr.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Actions Bar: View Details Modal Trigger & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={handleReset}
                className="text-xs font-bold text-[#1A4D3A]/60 hover:text-[#1A4D3A] transition-colors cursor-pointer"
              >
                ← Scan Sampah Baru
              </button>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="clay-button px-6 py-3 text-sm font-bold shadow-clay-green flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>Lihat Detail Kreasi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Demand Slide-over Drawer / Modal for Comprehensive Steps & HPP */}
      {isDrawerOpen && result && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#1A4D3A]/30 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[#FAF8F5] shadow-2xl h-full flex flex-col z-10 overflow-hidden border-l border-white/80">
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

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview & HPP Breakdown */}
              <div className="clay-card p-5 space-y-4">
                <p className="text-sm text-[#1A4D3A]/80 leading-relaxed">
                  {result.productDescription}
                </p>

                {/* HPP & Margin Pill Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1A4D3A]/10">
                  <div className="clay-inset p-3">
                    <span className="text-[11px] font-bold text-[#1A4D3A]/60 block">Modal Alat / Tambahan</span>
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

              {/* Tools & Materials Needed */}
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

              {/* Manufacturing Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1A4D3A] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#357A59]" />
                  <span>Langkah Pengerjaan ({result.timeEstimate})</span>
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

              {/* Eco Diverted Stats */}
              <div className="clay-inset p-4 flex items-center justify-between text-xs font-bold text-[#357A59]">
                <span>🍃 Menghemat {result.co2SavedKg || 2.5} kg CO2</span>
                <span>Mencegah {result.landfillDivertedGrams || 250}g Sampah</span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-[#1A4D3A]/10 bg-[#FAF8F5]">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full clay-button py-3 text-sm font-bold shadow-clay-green cursor-pointer"
              >
                Tutup & Mulai Rakit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
