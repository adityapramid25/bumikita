'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { SAMPLE_TRASH_ITEMS } from '@/src/data/mockData';
import { UpcycleProjectResult } from '@/src/types';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Check, 
  Clock, 
  Leaf, 
  Coins, 
  AlertCircle, 
  Wrench, 
  Share2, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  SwitchCamera,
  X,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

export default function WasteToWorthScanner() {
  const { addDaunPoints, addCommunityPost } = useEco();

  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Crafty' | 'Pro Maker'>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpcycleProjectResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [isClaimed, setIsClaimed] = useState(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up media stream when component unmounts or camera closes
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Check available camera devices
  useEffect(() => {
    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((device) => device.kind === 'videoinput');
          if (videoDevices.length > 1) {
            setHasMultipleCameras(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung di browser ini. Silakan gunakan upload foto.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser atau gunakan tombol upload file.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan pada perangkat ini. Silakan gunakan tombol upload file.');
      } else {
        setCameraError('Gagal membuka kamera. Silakan coba lagi atau gunakan upload file.');
      }
      setIsCameraActive(false);
    }
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera, flip horizontally for mirror effect
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_TRASH_ITEMS[0]) => {
    setPrompt(sample.samplePrompt);
    setSelectedImage(null);
    stopCamera();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) {
      setError('Ambil foto sampah dengan kamera, upload gambar, atau pilih salah satu sampel sampah di bawah.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCompletedSteps([]);
    setCheckedMaterials([]);
    setIsClaimed(false);

    try {
      const res = await fetch('/api/gemini/upcycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64: selectedImage,
          skillLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses ide upcycle. Coba lagi!');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses AI. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMaterialCheck = (mat: string) => {
    setCheckedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleClaimPointsAndShare = () => {
    if (!result || isClaimed) return;
    setIsClaimed(true);
    addDaunPoints(result.pointsRewarded || 50, `Menyelesaikan Upcycle: ${result.projectName}`);
    
    // Auto-share to community feed
    addCommunityPost({
      author: {
        name: 'Kamu (Gen-Z Maker)',
        handle: '@kamu.ecocreator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        badge: 'Upcycle Pioneer',
        campus: 'BumiKita Member',
      },
      title: result.projectName,
      description: `${result.tagline} — Dibuat dengan bantuan Gemini AI Upcycle Studio! Menghemat ${result.co2SavedKg}kg CO2e.`,
      beforeImage: selectedImage || 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      afterImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      originalTrashItem: prompt || 'Barang Bekas Rumah Tangga',
      tags: ['#BumiKitaMaker', '#GeminiUpcycle', `#${result.vibe.replace(/\s+/g, '')}`],
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hidden Canvas for Video Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Studio Header */}
      <div className="bg-[#FAF8F5] rounded-[28px] p-6 sm:p-8 shadow-clay-card border border-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#6DB677]/40 text-[#1A4D3A] text-xs font-bold shadow-clay-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9E20] fill-[#FF9E20]" />
              <span>Waste-to-Worth AI Studio Powered by Gemini 3.7</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
              Scan Sampah, Sulap Jadi Produk Keren
            </h2>
            <p className="text-sm sm:text-base text-[#1A4D3A]/70 max-w-2xl">
              Gunakan kamera ponsel/laptop untuk memindai sampah langsung, atau upload foto barang bekas (jeans sobek, botol boba, kardus). AI kami akan merancang resep DIY upcycle langkah-demi-langkah bernilai jual!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#E8F2ED] p-3 rounded-2xl border border-[#357A59]/20 shadow-clay-inset">
            <div className="w-10 h-10 rounded-xl bg-gradient-earth text-white flex items-center justify-center font-black text-sm">
              +75
            </div>
            <div>
              <p className="text-xs font-bold text-[#1A4D3A]">Reward Daun</p>
              <p className="text-[11px] text-[#357A59] font-semibold">Tiap Upcycle DIY yang selesai</p>
            </div>
          </div>
        </div>

        {/* Input Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left Column: Camera Scanner & Upload */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider">
                1. Scan Kamera / Upload Foto Sampah
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-xs font-bold text-[#DC2626] hover:underline"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />

            {/* LIVE CAMERA VIEWFINDER */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden shadow-clay-card border-2 border-[#357A59] bg-black aspect-video flex flex-col justify-between">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Animated Scanner Laser Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                  {/* Corner Guides */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-[#6DB677] rounded-tl-lg" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-[#6DB677] rounded-tr-lg" />
                  </div>

                  {/* Scanning Bar Animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#6DB677] to-transparent shadow-[0_0_8px_#6DB677] animate-pulse my-auto" />

                  <div className="flex justify-between items-end">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-[#6DB677] rounded-bl-lg" />
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Arahkan kamera ke sampah
                    </span>
                    <div className="w-6 h-6 border-b-2 border-r-2 border-[#6DB677] rounded-br-lg" />
                  </div>
                </div>

                {/* Top Camera Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  {hasMultipleCameras && (
                    <button
                      type="button"
                      onClick={flipCamera}
                      title="Ganti Kamera (Depan/Belakang)"
                      className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all cursor-pointer"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopCamera}
                    title="Tutup Kamera"
                    className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Snapshot Button Bar */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    id="btn-capture-camera"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-green hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#FF9E20] animate-ping" />
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto Sampah</span>
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              /* IMAGE PREVIEW AFTER CAPTURE / UPLOAD */
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-clay-card border border-white bg-[#EAE5DC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedImage} 
                    alt="Barang yang diupload / difoto" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FAF8F5]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#357A59] shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#357A59]" />
                    <span>Foto Siap Dianalisis AI</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] border border-white text-xs font-bold text-[#1A4D3A] shadow-clay-button hover:bg-[#EDE8E0] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#357A59]" />
                    <span>Foto Ulang Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] border border-white text-xs font-bold text-[#1A4D3A] shadow-clay-button hover:bg-[#EDE8E0] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#357A59]" />
                    <span>Ganti File</span>
                  </button>
                </div>
              </div>
            ) : (
              /* DEFAULT CHOOSE CAMERA OR UPLOAD PANEL */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Option A: Buka Kamera Langsung */}
                  <button
                    type="button"
                    id="btn-open-camera"
                    onClick={() => startCamera('environment')}
                    className="p-5 rounded-2xl bg-[#EBF4EE] border-2 border-[#6DB677]/40 text-center hover:bg-[#DDF0E2] transition-all group flex flex-col items-center justify-center gap-2 shadow-clay-button cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-earth text-white flex items-center justify-center shadow-clay-green group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1A4D3A]">
                        Buka Kamera
                      </p>
                      <p className="text-[10px] text-[#357A59] font-semibold">
                        Scan Langsung
                      </p>
                    </div>
                  </button>

                  {/* Option B: Upload File Gambar */}
                  <button
                    type="button"
                    id="btn-upload-file"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#1A4D3A]/20 text-center hover:bg-[#EAE5DC] transition-all group flex flex-col items-center justify-center gap-2 shadow-clay-card cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#357A59] flex items-center justify-center shadow-clay-button group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1A4D3A]">
                        Upload Galeri
                      </p>
                      <p className="text-[10px] text-[#1A4D3A]/60 font-semibold">
                        JPG, PNG, WebP
                      </p>
                    </div>
                  </button>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-[#FDE8E8] border border-[#DC2626]/30 text-[#DC2626] text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider">
                Atau Pilih Sampel Sampah Populer:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_TRASH_ITEMS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(item)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-semibold flex items-center justify-between ${
                      prompt === item.samplePrompt
                        ? 'bg-[#E8F2ED] border-[#357A59] text-[#1A4D3A] shadow-clay-sm'
                        : 'bg-[#FAF8F5] border-white/80 text-[#1A4D3A]/80 hover:bg-[#EDE8E0]'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#357A59] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Prompt & Skill Level */}
          <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider mb-2">
                  2. Jelaskan Barang Bekas & Keinginanmu
                </label>
                <textarea
                  id="scanner-prompt-input"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Saya punya celana jeans robek di lutut dan beberapa kancing cadangan. Ingin dijadikan tas selempang kecil atau pouch alat tulis kampus tanpa ribet."
                  className="w-full p-4 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/40 focus:outline-none focus:ring-2 focus:ring-[#357A59]"
                />
              </div>

              {/* Skill Level Selector */}
              <div>
                <label className="block text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider mb-2">
                  3. Pilih Tingkat Kemahiran DIY
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSkillLevel('Beginner')}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      skillLevel === 'Beginner'
                        ? 'bg-[#357A59] text-white shadow-clay-green font-bold'
                        : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border-white font-medium hover:bg-[#EDE8E0]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">🟢 Pemula</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Tanpa jahit, 5-15m</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSkillLevel('Crafty')}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      skillLevel === 'Crafty'
                        ? 'bg-[#357A59] text-white shadow-clay-green font-bold'
                        : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border-white font-medium hover:bg-[#EDE8E0]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">🟡 Kreatif</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Jahit tangan/lem</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSkillLevel('Pro Maker')}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      skillLevel === 'Pro Maker'
                        ? 'bg-[#357A59] text-white shadow-clay-green font-bold'
                        : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border-white font-medium hover:bg-[#EDE8E0]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">🔴 Pro Maker</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Mesin/Alat lengkap</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-[#FDE8E8] border border-[#DC2626]/30 text-[#DC2626] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              id="btn-generate-upcycle"
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-earth text-white font-bold text-base shadow-clay-green hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Gemini AI Sedang Merancang Resep Upcycle...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#FF9E20] fill-[#FF9E20]" />
                  <span>Generate Blueprint Upcycle dengan Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Upcycle Blueprint Output */}
      {result && (
        <div className="bg-[#FAF8F5] rounded-[32px] p-6 sm:p-10 shadow-clay-card border border-white space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Blueprint Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1A4D3A]/10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shadow-clay-sm">
                  ✨ Vibe: {result.vibe}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF5E6] text-[#D97E0D] border border-[#FF9E20]/30 shadow-clay-sm">
                  ⚡ {result.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-pill">
                  ⏱️ {result.timeEstimate}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A]">
                {result.projectName}
              </h3>
              <p className="text-sm sm:text-base text-[#1A4D3A]/80 font-medium italic">
                &ldquo;{result.tagline}&rdquo;
              </p>
            </div>

            {/* Impact & Value Badges Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl shadow-clay-button border border-white text-center">
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Estimasi Nilai Jual</p>
                <p className="text-base sm:text-lg font-black text-[#357A59]">
                  Rp {result.estimatedValueIdr?.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl shadow-clay-button border border-white text-center">
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">CO2 Dicegah</p>
                <p className="text-base sm:text-lg font-black text-[#1A4D3A]">
                  {result.co2SavedKg} kg
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl shadow-clay-button border border-white text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold text-[#1A4D3A]/60 uppercase">Reward Daun</p>
                <p className="text-base sm:text-lg font-black text-[#FF9E20] flex items-center justify-center gap-1">
                  <span>+{result.pointsRewarded}</span> 🍃
                </p>
              </div>
            </div>
          </div>

          {/* Materials & Tools Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Materials Checkable Box */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl shadow-clay-card border border-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#1A4D3A] flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#357A59]" />
                  <span>Bahan Baku & Sampah yang Diperlukan:</span>
                </h4>
                <span className="text-[11px] text-[#357A59] font-bold">
                  {checkedMaterials.length}/{result.requiredMaterials?.length || 0} Siap
                </span>
              </div>

              <div className="space-y-2">
                {result.requiredMaterials?.map((mat, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleMaterialCheck(mat)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all text-xs font-semibold ${
                      checkedMaterials.includes(mat)
                        ? 'bg-[#E8F2ED] text-[#1A4D3A] line-through opacity-80'
                        : 'bg-[#F5F2ED] text-[#1A4D3A] hover:bg-[#EAE5DC]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        checkedMaterials.includes(mat)
                          ? 'bg-[#357A59] border-[#357A59] text-white'
                          : 'border-[#1A4D3A]/30 bg-white'
                      }`}
                    >
                      {checkedMaterials.includes(mat) && <Check className="w-3 h-3" />}
                    </div>
                    <span>{mat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Needed */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl shadow-clay-card border border-white space-y-3">
              <h4 className="text-sm font-extrabold text-[#1A4D3A] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#357A59]" />
                <span>Peralatan Rumah Tangga:</span>
              </h4>

              <div className="flex flex-wrap gap-2 pt-1">
                {result.toolsNeeded?.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-[#EBF4EE] border border-[#6DB677]/30 text-xs font-bold text-[#1A4D3A] shadow-clay-sm"
                  >
                    🔧 {tool}
                  </span>
                ))}
              </div>

              {result.safetyNote && (
                <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9E20]/30 text-[#D97E0D] text-xs font-medium flex items-start gap-2 mt-3">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Safety Tip:</strong> {result.safetyNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step-by-Step Interactive Guide */}
          <div className="space-y-4">
            <h4 className="text-lg font-extrabold text-[#1A4D3A] flex items-center gap-2">
              <span>Langkah Pengerjaan DIY ({result.steps?.length} Langkah):</span>
            </h4>

            <div className="space-y-3.5">
              {result.steps?.map((step) => {
                const isDone = completedSteps.includes(step.stepNumber);
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => toggleStepComplete(step.stepNumber)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-[#E8F2ED] border-[#357A59]/40 shadow-clay-inset'
                        : 'bg-[#FAF8F5] border-white shadow-clay-card hover:bg-[#F7F4EE]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                          isDone
                            ? 'bg-[#357A59] text-white'
                            : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border border-white'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm sm:text-base font-extrabold text-[#1A4D3A] ${isDone ? 'line-through opacity-75' : ''}`}>
                            {step.title}
                          </h5>
                          <span className="text-[11px] font-bold text-[#357A59] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{step.timeMinutes} mnt
                          </span>
                        </div>

                        <p className={`text-xs sm:text-sm text-[#1A4D3A]/80 leading-relaxed ${isDone ? 'opacity-70' : ''}`}>
                          {step.instruction}
                        </p>

                        {step.tip && (
                          <p className="text-[11px] font-semibold text-[#357A59] bg-[#FAF8F5] p-2 rounded-xl border border-[#357A59]/20 mt-2">
                            💡 <strong>Gen-Z Pro Tip:</strong> {step.tip}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Styling Tips & Gen Z Presentation */}
          {result.stylingTips && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#EBF4EE] to-[#FFF5E6] border border-[#6DB677]/30 space-y-1.5 shadow-clay-sm">
              <h5 className="text-xs font-extrabold text-[#1A4D3A] uppercase tracking-wider">
                🎨 Tips Styling & Estetika Gen-Z:
              </h5>
              <p className="text-xs sm:text-sm text-[#1A4D3A]/85 leading-relaxed font-medium">
                {result.stylingTips}
              </p>
            </div>
          )}

          {/* Bottom Claim Action Card */}
          <div className="p-6 rounded-2xl bg-gradient-earth text-white shadow-clay-green flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-black text-white">
                Selesai Membuat Karya Ini?
              </h4>
              <p className="text-xs text-white/80 font-medium">
                Klaim reward +{result.pointsRewarded} Poin Daun dan bagikan ke feed Komunitas BumiKita!
              </p>
            </div>

            <button
              id="btn-claim-upcycle-reward"
              type="button"
              disabled={isClaimed}
              onClick={handleClaimPointsAndShare}
              className={`px-6 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-clay-button border border-white transition-all ${
                isClaimed
                  ? 'bg-[#1A4D3A] text-white opacity-80 cursor-default'
                  : 'bg-[#FAF8F5] text-[#1A4D3A] hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              {isClaimed ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6DB677]" />
                  Tersimpan & Poin Diklaim!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF9E20]" />
                  Tandai Selesai & Klaim Daun
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
