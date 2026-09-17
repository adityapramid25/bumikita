'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { WasteAnalysisResult, UpcycleRecommendation } from '@/src/types';
import { generateUpcyclePDF } from '@/src/lib/pdfGenerator';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
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
  Eye,
  EyeOff,
  SwitchCamera,
  X,
  Zap,
  Download,
  FileText,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  Crop,
  Package
} from 'lucide-react';

const SUGGESTION_CHIPS = [
  '🌿 Pot Tanaman Estetik',
  '💼 Dompet & Pouch',
  '🗄️ Organizer Meja',
  '💡 Lampu Kamar Kost',
  '🎮 Mainan / Miniatur',
  '✨ Rekomendasi Bebas AI'
];

const SAMPLE_DEMO_ITEMS = [
  {
    name: 'Celana Jeans Denim',
    icon: '👖',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
    prompt: 'Upcycle celana jeans bekas jadi tote bag vintage atau organizer dinding bertingkat'
  },
  {
    name: 'Buku / Novel Bekas',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    prompt: 'Upcycle buku novel bekas jadi hiasan dinding estetik, floating shelf, atau secret box organizer'
  },
  {
    name: 'Wadah & Plastik Daur Ulang',
    icon: '🧴',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    prompt: 'Bikin pot tanaman self-watering atau wadah alat tulis estetik untuk meja belajar'
  }
];

// Helper: Resize and optimize image to max 1024x1024 JPEG to preserve sharp edges and optimize vision model transmission
async function preprocessImage(dataUrlOrBlob: string | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for remote http/https URLs, avoid tainting local data: or blob: URLs
    if (typeof dataUrlOrBlob === 'string' && (dataUrlOrBlob.startsWith('http://') || dataUrlOrBlob.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const maxDim = 1024;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof dataUrlOrBlob === 'string' ? dataUrlOrBlob : '');
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.90));
      } catch (canvasErr) {
        console.warn('Canvas export failed, falling back:', canvasErr);
        if (typeof dataUrlOrBlob === 'string') {
          resolve(dataUrlOrBlob);
        } else {
          reject(canvasErr);
        }
      }
    };
    img.onerror = (err) => {
      console.warn('Image load failed, falling back to string:', err);
      if (typeof dataUrlOrBlob === 'string') {
        resolve(dataUrlOrBlob);
      } else {
        reject(err);
      }
    };

    if (typeof dataUrlOrBlob === 'string') {
      img.src = dataUrlOrBlob;
    } else {
      img.src = URL.createObjectURL(dataUrlOrBlob);
    }
  });
}

export default function WasteToWorthScanner() {
  const { daunPoints, deductScanPoints, setIsInsufficientModalOpen, addCommunityPost } = useEco();

  // Workflow Stages: 'capture' | 'analyzing' | 'results'
  const [stage, setStage] = useState<'capture' | 'analyzing' | 'results'>('capture');

  // Input States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraConnecting, setIsCameraConnecting] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '4:3'>('1:1');

  // Analysis Result States
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [isSmartOverlayVisible, setIsSmartOverlayVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loading animation state
  const [analyzingStepText, setAnalyzingStepText] = useState('Mengisolasi objek sampah foreground...');
  const [analyzingProgress, setAnalyzingProgress] = useState(15);

  // Community Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareStory, setShareStory] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Refs & Viewfinder Sync
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewfinderContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraConnecting(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Check multiple cameras
  useEffect(() => {
    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          if (videoDevices.length > 1) {
            setHasMultipleCameras(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Callback ref to connect stream to video
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.onloadedmetadata = () => {
        node.play().catch((e) => console.warn('Autoplay error:', e));
      };
      node.play().catch(() => {});
    }
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setIsCameraConnecting(true);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsCameraActive(true);
      setIsCameraConnecting(false);
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setIsCameraConnecting(false);
      setCameraError(
        'Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan atau gunakan tombol unggah foto di bawah.'
      );
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const handleCapturePhoto = (autoAnalyze: boolean = false) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger brief visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 180);

    const videoWidth = video.videoWidth || video.clientWidth || 640;
    const videoHeight = video.videoHeight || video.clientHeight || 480;

    // Calculate crop rectangle matching the exact visible on-screen aspect ratio
    let containerRatio = 1.0;
    if (viewfinderContainerRef.current) {
      const rect = viewfinderContainerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        containerRatio = rect.width / rect.height;
      }
    } else if (aspectRatio === '9:16') {
      containerRatio = 9 / 16;
    } else if (aspectRatio === '4:3') {
      containerRatio = 4 / 3;
    }

    const videoRatio = videoWidth / videoHeight;
    let startX = 0;
    let startY = 0;
    let cropWidth = videoWidth;
    let cropHeight = videoHeight;

    if (aspectRatio === '1:1') {
      // Strict 1:1 Square crop: center-cropped to the minimum dimension
      const targetSize = Math.min(videoWidth, videoHeight);
      startX = Math.round((videoWidth - targetSize) / 2);
      startY = Math.round((videoHeight - targetSize) / 2);
      cropWidth = targetSize;
      cropHeight = targetSize;
    } else if (videoRatio > containerRatio) {
      // Video is wider than viewfinder (e.g. landscape webcam): crop sides symmetrically
      cropWidth = Math.round(videoHeight * containerRatio);
      cropHeight = videoHeight;
      startX = Math.round((videoWidth - cropWidth) / 2);
      startY = 0;
    } else {
      // Video is taller than viewfinder (e.g. 9:16 phone sensor on 4:3 or square): crop top/bottom symmetrically
      cropWidth = videoWidth;
      cropHeight = Math.round(videoWidth / containerRatio);
      startX = 0;
      startY = Math.round((videoHeight - cropHeight) / 2);
    }

    // Scale canvas to max 1024px to preserve high-res detail while keeping payload optimal
    const maxDim = 1024;
    let destWidth = cropWidth;
    let destHeight = cropHeight;
    if (destWidth > maxDim || destHeight > maxDim) {
      if (destWidth > destHeight) {
        destHeight = Math.round((destHeight * maxDim) / destWidth);
        destWidth = maxDim;
      } else {
        destWidth = Math.round((destWidth * maxDim) / destHeight);
        destHeight = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = destWidth;
    canvas.height = destHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw ONLY the exact cropped area visible to the user inside the viewfinder
    ctx.drawImage(
      video,
      startX, startY, cropWidth, cropHeight,
      0, 0, destWidth, destHeight
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.85);

    // Stop camera and immediately set the cropped image
    stopCamera();
    setSelectedImage(base64Image);

    if (autoAnalyze) {
      if (daunPoints < 50) {
        setIsInsufficientModalOpen(true);
        return;
      }
      handleAnalyzeWaste(base64Image);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await preprocessImage(file);
      setSelectedImage(optimized);
      stopCamera();
    } catch (err) {
      console.error('File optimization error:', err);
    }
  };

  const handleSelectDemoItem = async (item: typeof SAMPLE_DEMO_ITEMS[0]) => {
    stopCamera();
    try {
      const optimized = await preprocessImage(item.image);
      setSelectedImage(optimized);
      setUserPrompt(item.prompt);
    } catch (e) {
      setSelectedImage(item.image);
      setUserPrompt(item.prompt);
    }
  };

  // Perform AI Waste Analysis (Costs 50 Daun Points per scan)
  const handleAnalyzeWaste = async (imageOverride?: string | React.MouseEvent) => {
    const activeImage = typeof imageOverride === 'string' ? imageOverride : selectedImage;
    if (!activeImage) {
      setErrorMessage('Silakan ambil foto atau unggah gambar sampah terlebih dahulu.');
      return;
    }

    // Zero-Point Protection: AI Scanner strictly requires at least 50 Daun
    if (daunPoints < 50) {
      setIsInsufficientModalOpen(true);
      return;
    }

    // Atomic Supabase RPC / State point deduction
    const deductRes = await deductScanPoints(50);
    if (!deductRes.success) {
      setIsInsufficientModalOpen(true);
      return;
    }

    setStage('analyzing');
    setErrorMessage(null);
    setAnalyzingProgress(20);
    setAnalyzingStepText('Mengisolasi objek sampah foreground...');

    const timer1 = setTimeout(() => {
      setAnalyzingProgress(50);
      setAnalyzingStepText('Memeriksa audit material & komposisi polimer...');
    }, 900);

    const timer2 = setTimeout(() => {
      setAnalyzingProgress(80);
      setAnalyzingStepText('Membuat 3 rekomendasi upcycling & blueprint...');
    }, 1800);

    try {
      // Pass active image directly - backend seamlessly handles both base64 and remote URLs with zero CORS
      const response = await fetch('/api/gemini/upcycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          imageBase64: activeImage,
          mimeType: activeImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        }),
      });

      const json = await response.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!response.ok || json.error || !json.data) {
        throw new Error(json.error || 'Gagal memproses analisis gambar sampah');
      }

      const resData: WasteAnalysisResult = json.data;
      setAnalysisResult(resData);
      if (resData.recommendations && resData.recommendations.length > 0) {
        setSelectedRecId(resData.recommendations[0].id);
      }
      setCompletedSteps([]);
      setCheckedMaterials([]);
      setAnalyzingProgress(100);

      // Short delay for smooth transition
      setTimeout(() => {
        setStage('results');
      }, 300);

    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memindai sampah. Silakan coba lagi.');
      setStage('capture');
    }
  };

  const handleResetScanner = () => {
    stopCamera();
    setSelectedImage(null);
    setUserPrompt('');
    setAnalysisResult(null);
    setSelectedRecId(null);
    setCompletedSteps([]);
    setCheckedMaterials([]);
    setStage('capture');
  };

  // Active Recommendation
  const activeRec: UpcycleRecommendation | null = 
    analysisResult?.recommendations.find((r) => r.id === selectedRecId) || 
    analysisResult?.recommendations[0] || 
    null;

  // Toggle step completion
  const handleToggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Toggle material check
  const handleToggleMaterial = (mat: string) => {
    setCheckedMaterials((prev) => {
      if (prev.includes(mat)) {
        return prev.filter((m) => m !== mat);
      } else {
        return [...prev, mat];
      }
    });
  };

  // Download PDF Blueprint
  const handleDownloadPdf = () => {
    if (!analysisResult || !activeRec) return;
    setIsDownloadingPdf(true);

    try {
      // Map to UpcycleProjectResult format for pdf generator
      generateUpcyclePDF({
        detectedItemName: analysisResult.detectedObject.label,
        detectedMaterialType: analysisResult.detectedObject.material,
        detectedCondition: analysisResult.detectedObject.condition,
        projectName: activeRec.title,
        tagline: activeRec.summary,
        vibe: 'Eco-Minimalist Craft',
        productDescription: activeRec.summary,
        difficulty: activeRec.difficulty,
        timeEstimate: activeRec.estimatedTime,
        estimatedValueIdr: parseInt(activeRec.benchmarkPrice.replace(/\D/g, '')) || 35000,
        co2SavedKg: 1.8,
        landfillDivertedGrams: 120,
        pointsRewarded: 60,
        requiredMaterials: activeRec.materialsNeeded,
        toolsNeeded: ['Cutter / gunting serbaguna', 'Penggaris & spidol', 'Lem serbaguna'],
        steps: activeRec.steps.map((s, idx) => ({
          stepNumber: idx + 1,
          title: `Langkah ${idx + 1}`,
          instruction: s,
          timeMinutes: 5,
        })),
        stylingTips: activeRec.finishingTips || 'Gunakan cat matte dan rapikan tepi potongan untuk estetika modern.',
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Submit Community Post
  const handleShareToCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRec || !selectedImage) return;

    addCommunityPost({
      author: {
        name: 'Kamu (Maker Gen-Z)',
        handle: '@kamu_ecowarrior',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        badge: 'Eco Maker Novice',
        campus: 'BumiKita Hub',
      },
      title: shareTitle || activeRec.title,
      description: shareStory || activeRec.summary,
      beforeImage: selectedImage,
      afterImage: selectedImage,
      originalTrashItem: analysisResult?.detectedObject.label || 'Sampah Terpilih',
      userLiked: true,
      tags: ['#BumiKitaUpcycle', '#ZeroWasteKampus', '#DIYProject'],
    });

    setShareSuccess(true);
    setTimeout(() => {
      setIsShareModalOpen(false);
      setShareSuccess(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Banner */}
      <div className="bg-gradient-clay p-5 sm:p-7 rounded-3xl shadow-clay-card border border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A4D3A]">
            Waste-to-Worth <span className="text-[#357A59]">AI Scanner</span>
          </h1>
          <p className="text-sm text-[#1A4D3A]/70 max-w-2xl mt-1.5">
            Isolasi objek sampah secara otomatis, audit jenis material polimer, dan dapatkan 3 rekomendasi kreasi bernilai jual tinggi dengan blueprint pembuatan instan.
          </p>
        </div>

        {stage === 'results' && (
          <button
            onClick={handleResetScanner}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF8F5] rounded-2xl shadow-clay-card border border-white hover:scale-105 active:scale-95 transition-all text-sm font-bold text-[#1A4D3A] cursor-pointer self-start md:self-auto shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-[#357A59]" />
            <span>Pindai Sampah Lain</span>
          </button>
        )}
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            {errorMessage}
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-amber-700 hover:text-amber-900 font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          STAGE 1 & 2: CAMERA CAPTURE, INGESTION & OPTIONAL CREATIVE PROMPT
      ========================================================================= */}
      {stage === 'capture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top Viewfinder Area (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Tactile Clay Aspect Ratio Switcher */}
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold text-[#1A4D3A]/70 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-[#357A59]" />
                Rasio Bidik Kamera:
              </span>
              <div className="inline-flex items-center p-1 rounded-2xl bg-[#FAF8F5] border border-white shadow-clay-sm gap-1">
                {(['1:1', '9:16', '4:3'] as const).map((ratio) => {
                  const isActive = aspectRatio === ratio;
                  const label = ratio === '1:1' ? '1:1 Persegi' : ratio === '9:16' ? '9:16 Portrait' : '4:3 Lanskap';
                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#357A59] text-white shadow-sm'
                          : 'text-[#1A4D3A]/70 hover:text-[#1A4D3A] hover:bg-[#EAE5DC]/50'
                      }`}
                      title={`Ubah rasio ke ${label}`}
                    >
                      {ratio}
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              ref={viewfinderContainerRef}
              className={`relative w-full ${
                aspectRatio === '1:1' ? 'aspect-square' :
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[520px] mx-auto' :
                'aspect-[4/3]'
              } bg-[#EAE5DC] rounded-3xl overflow-hidden shadow-clay-card border-2 border-white/80 flex items-center justify-center transition-all duration-300`}
            >
              {/* Shutter Flash Animation */}
              {isShutterFlashing && (
                <div className="absolute inset-0 bg-white/90 z-30 pointer-events-none transition-opacity duration-150 animate-pulse" />
              )}

              {/* State A: Live Camera Active */}
              {isCameraActive && (
                <div className="relative w-full h-full">
                  <video 
                    ref={handleVideoRef}
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {/* Scanner Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20 rounded-3xl flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-white/70 rounded-2xl animate-pulse flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        Posisikan Sampah di Sini
                      </span>
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4 z-10">
                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="w-11 h-11 rounded-2xl bg-black/40 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Putar Kamera"
                      >
                        <SwitchCamera className="w-5 h-5" />
                      </button>
                    )}

                    {/* Shutter Capture Button */}
                    <button
                      type="button"
                      onClick={() => handleCapturePhoto(false)}
                      className="w-16 h-16 rounded-full bg-white text-[#1A4D3A] shadow-xl border-4 border-[#357A59] flex items-center justify-center hover:scale-105 active:scale-90 transition-transform cursor-pointer"
                      title="Ambil Foto"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#357A59] flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-11 h-11 rounded-2xl bg-black/40 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Tutup Kamera"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* State B: Photo Selected / Captured Preview (Uncropped Intrinsic Ratio) */}
              {!isCameraActive && selectedImage && (
                <div className="relative w-full h-full group flex items-center justify-center p-2">
                  <img 
                    src={selectedImage} 
                    alt="Preview Sampah" 
                    className="w-full h-auto max-h-full object-contain rounded-2xl"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-2 rounded-xl bg-black/50 text-white backdrop-blur-md hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#1A4D3A] shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#357A59]" />
                    <span>Foto Siap Dianalisis</span>
                  </div>
                </div>
              )}

              {/* State C: Empty Placeholder Viewfinder */}
              {!isCameraActive && !selectedImage && (
                <div className="p-6 text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF8F5] shadow-clay-card flex items-center justify-center text-[#357A59]">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A4D3A]">
                      Buka Kamera atau Unggah Foto
                    </h3>
                    <p className="text-xs text-[#1A4D3A]/70 mt-1">
                      Arahkan lensa ke botol, kardus, jeans, atau kemasan sampah yang ingin kamu upcycle.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera('environment')}
                      disabled={isCameraConnecting}
                      className="px-4 py-2.5 rounded-2xl bg-[#357A59] text-white shadow-clay-btn font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isCameraConnecting ? 'Menghubungkan...' : 'Buka Kamera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-card font-bold text-xs flex items-center gap-2 border border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#357A59]" />
                      <span>Pilih File Foto</span>
                    </button>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 mt-2">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Sample Image Picker */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl shadow-clay-card border border-white space-y-2">
              <span className="text-[11px] font-bold text-[#1A4D3A]/70 flex items-center gap-1.5 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 text-[#FF9E20]" />
                Coba Contoh Foto Sampah Instan:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_DEMO_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDemoItem(item)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#1A4D3A]/10 hover:border-[#357A59] hover:bg-[#E8F2ED]/50 transition-all text-left cursor-pointer group"
                  >
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold text-[#1A4D3A] line-clamp-1">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Area: Creative Intent & Analysis Trigger (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#FAF8F5] p-5 sm:p-6 rounded-3xl shadow-clay-card border border-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#357A59] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#FF9E20]" />
                  Langkah 2: Niat Kreatif (Opsional)
                </span>
                <span className="text-[11px] text-[#1A4D3A]/50 font-medium">Bisa Dikosongkan</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A4D3A] mb-1.5">
                  Mau dibikin apa?
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Contoh: Pot tanaman gantung self-watering, dompet kartu, rak organizer meja belajar..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-[#F5F2ED]/80 shadow-clay-inset border border-[#1A4D3A]/10 text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/40 focus:outline-none focus:ring-2 focus:ring-[#357A59]/40 resize-none font-medium"
                />
              </div>

              {/* Quick suggestion chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#1A4D3A]/60">
                  Ide Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserPrompt(chip.replace(/^[^\s]+\s/, ''))}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-[#1A4D3A]/10 hover:border-[#357A59] hover:bg-[#E8F2ED] text-[#1A4D3A] transition-all cursor-pointer active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-4 border-t border-[#1A4D3A]/10 space-y-2">
              <button
                type="button"
                onClick={() => handleAnalyzeWaste()}
                disabled={!selectedImage}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-earth text-white shadow-clay-button font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <Sparkles className="w-5 h-5 text-[#FF9E20]" />
                <span>Analisis Sampah Sekarang (Biaya 50 Daun 🍃)</span>
              </button>
              <div className="flex items-center justify-between text-xs px-1 font-semibold">
                <span className="text-[#1A4D3A]/70">
                  Biaya: <strong>50 Daun</strong> per scan
                </span>
                <span className={`flex items-center gap-1 ${daunPoints >= 50 ? 'text-[#357A59]' : 'text-[#D97E0D]'}`}>
                  <span>Sisa Daun Kamu:</span>
                  <strong>{daunPoints} 🍃</strong>
                  {daunPoints < 50 && <span className="text-[11px] underline cursor-pointer ml-1" onClick={() => setIsInsufficientModalOpen(true)}>(Isi Daun)</span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: AI SCANNING & SEGMENTATION SIMULATION
      ========================================================================= */}
      {stage === 'analyzing' && (
        <div className="bg-[#FAF8F5] p-8 sm:p-12 rounded-3xl shadow-clay-card border border-white text-center space-y-6 max-w-xl mx-auto my-8">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Animated Radar Pulse */}
            <div className="absolute inset-0 rounded-full bg-[#6DB677]/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-[#357A59]/30 animate-pulse" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-earth p-0.5 shadow-clay-green flex items-center justify-center relative z-10">
              <div className="w-full h-full bg-[#FAF8F5] rounded-[22px] flex items-center justify-center text-[#1A4D3A]">
                <Sparkles className="w-9 h-9 text-[#357A59] animate-bounce" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-[#1A4D3A]">
              Bumikita AI Sedang Memindai...
            </h3>
            <p className="text-sm font-semibold text-[#357A59] min-h-[24px]">
              {analyzingStepText}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EAE5DC] h-3 rounded-full overflow-hidden shadow-clay-inset p-0.5">
            <motion.div 
              className="bg-gradient-earth h-full rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${analyzingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <p className="text-xs text-[#1A4D3A]/60 font-medium">
            Menganalisis objek untuk menghasilkan produk dan detail akurat.
          </p>
        </div>
      )}

      {/* =========================================================================
          STAGE 3, 4, 5 & 6: RESULTS, VISUAL VERIFICATION, RECOMMENDATIONS & BLUEPRINT
      ========================================================================= */}
      {stage === 'results' && analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ================= SECTION 3: SMART OBJECT IDENTIFIER & MATERIAL AUDIT ================= */}
          <div className="bg-[#FAF8F5] p-5 sm:p-7 rounded-3xl shadow-clay-card border border-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A4D3A]/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
                  Identifikasi Cerdas & Spesifikasi Material
                </h2>
              </div>

              {/* Interactive Smart Overlay Visibility Toggle */}
              <button
                type="button"
                onClick={() => setIsSmartOverlayVisible(!isSmartOverlayVisible)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F5F2ED] hover:bg-[#EAE5DC] rounded-xl text-xs font-bold text-[#1A4D3A] transition-all cursor-pointer self-start sm:self-auto border border-[#1A4D3A]/10"
              >
                {isSmartOverlayVisible ? <Eye className="w-4 h-4 text-[#357A59]" /> : <EyeOff className="w-4 h-4 text-[#1A4D3A]/60" />}
                <span>{isSmartOverlayVisible ? 'Sembunyikan Smart Indicator' : 'Tampilkan Smart Indicator'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Image with Smart Object Identifier & Material Indicator (5 Cols) */}
              <div className="lg:col-span-5 flex justify-center items-start">
                <div className="w-full rounded-2xl overflow-hidden bg-[#1D2128] shadow-clay-card border-2 border-white p-2 sm:p-3 relative group">
                  {selectedImage && (
                    <div className="relative w-full rounded-xl overflow-hidden select-none leading-none flex items-center justify-center min-h-[260px] bg-black/40">
                      <img 
                        src={selectedImage} 
                        alt={analysisResult.detectedObject.label || 'Identified Object'} 
                        className="w-full h-auto max-h-[520px] object-contain block mx-auto rounded-xl shadow-md transition-transform duration-500 group-hover:scale-[1.01]"
                      />

                      {/* Tactile Smart Object Identifier & Material Indicator Overlay */}
                      <AnimatePresence>
                        {isSmartOverlayVisible && (
                          <>
                            {/* 1. Floating "Objek Terverifikasi" Pill Badge at Top-Left */}
                            <motion.div 
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.25 }}
                              className="absolute top-3 left-3 z-20 flex items-center gap-2"
                            >
                              <div className="flex items-center gap-2 bg-[#1D2128]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg text-white">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6DB677] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6DB677]"></span>
                                </span>
                                <span className="text-[11px] sm:text-xs font-bold tracking-wide">
                                  Objek Terverifikasi
                                </span>
                              </div>

                              <div className="hidden xs:flex items-center gap-1.5 bg-[#215E61]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#6DB677]/30 text-[10px] sm:text-[11px] font-semibold text-[#E8F2ED] shadow-sm">
                                <CheckCircle2 className="w-3 h-3 text-[#6DB677]" />
                                <span>AI Vision</span>
                              </div>
                            </motion.div>

                            {/* 2. Floating Info Card at Bottom */}
                            <motion.div 
                              initial={{ opacity: 0, y: 15, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.98 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20"
                            >
                              <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-white/15 shadow-xl text-white">
                                {/* 1. Header Row: Brand Badge & Scrap Value */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                    <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                                      BumiKita AI
                                    </span>
                                  </div>

                                  {/* Nilai Rongsok Pill */}
                                  {analysisResult?.detectedObject?.estimatedScrapValue && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-300 shrink-0">
                                      <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span className="text-[10px] sm:text-xs font-semibold">
                                        {analysisResult.detectedObject.estimatedScrapValue}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 2. Main Title & Material Grade */}
                                <div className="pt-2.5 pb-2">
                                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug break-words">
                                    {analysisResult?.detectedObject?.label}
                                  </h4>
                                  <p className="text-xs font-medium text-emerald-300/90 mt-0.5">
                                    {analysisResult?.detectedObject?.material}
                                  </p>
                                </div>

                                {/* 3. Detailed Meta: Dimensi & Kondisi (Clean Stacked Wrap) */}
                                <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] sm:text-xs text-white/80">
                                  {/* Baris Dimensi */}
                                  {analysisResult?.detectedObject?.dimension && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-white/40 shrink-0 font-medium">Ukuran:</span>
                                      <span className="text-white/90 break-words flex-1">
                                        {analysisResult.detectedObject.dimension}
                                      </span>
                                    </div>
                                  )}

                                  {/* Baris Kondisi (Berada di Bawah Ukuran, Otomatis Enter/Wrap jika Panjang) */}
                                  {analysisResult?.detectedObject?.condition && (
                                    <div className="flex items-start gap-2 pt-0.5">
                                      <span className="text-amber-400/80 shrink-0 font-medium">Kondisi:</span>
                                      <span className="text-amber-200/90 leading-relaxed break-words whitespace-normal flex-1">
                                        {analysisResult.detectedObject.condition}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Material Audit Pills & Technical Breakdown (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pill 1: Jenis & Bahan */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-white shadow-clay-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#1A4D3A]/60 uppercase tracking-wide">
                      Jenis & Bahan
                    </span>
                    <p className="text-sm font-bold text-[#1A4D3A]">
                      {analysisResult.detectedObject.material}
                    </p>
                  </div>

                  {/* Pill 2: Kondisi Fisik */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-white shadow-clay-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#1A4D3A]/60 uppercase tracking-wide">
                      Kondisi Fisik
                    </span>
                    <p className="text-sm font-bold text-[#1A4D3A]">
                      {analysisResult.detectedObject.condition}
                    </p>
                  </div>

                  {/* Pill 3: Estimasi Ukuran */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-white shadow-clay-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#1A4D3A]/60 uppercase tracking-wide">
                      Estimasi Dimensi
                    </span>
                    <p className="text-sm font-bold text-[#1A4D3A]">
                      {analysisResult.detectedObject.dimension || 'Ukuran standar rumah tangga'}
                    </p>
                  </div>

                  {/* Pill 4: Nilai Rongsok Asal */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-white shadow-clay-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#1A4D3A]/60 uppercase tracking-wide">
                      Nilai Rongsok Asal
                    </span>
                    <p className="text-sm font-bold text-[#FF9E20]">
                      {analysisResult.detectedObject.estimatedScrapValue || 'Rp 200 - Rp 500'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#E8F2ED] p-3.5 rounded-2xl border border-[#357A59]/20 flex items-center justify-between text-xs text-[#1A4D3A]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌿</span>
                    <div>
                      <span className="font-bold">Potensi Upcycling Ekologis:</span>
                      <p className="text-[#1A4D3A]/70 text-[11px]">
                        Limbah ini berpotensi dinaikkan nilainya hingga <strong className="text-[#357A59]">50x lipat</strong> menjadi produk fungsional siap jual.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 4 & 5: 3 CURATED UPCYCLE RECOMMENDATIONS ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
                  Katalog Ide Produk Upcycle
                </h2>
              </div>
              <span className="text-xs text-[#1A4D3A]/60 hidden sm:inline font-medium">
                Pilih kartu untuk melihat panduan langkah demi langkah
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.recommendations.map((rec, index) => {
                const isSelected = rec.id === selectedRecId;

                const difficultyColor = 
                  rec.difficulty.toLowerCase().includes('mudah') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  rec.difficulty.toLowerCase().includes('sedang') ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-orange-100 text-orange-800 border-orange-300';

                return (
                  <motion.div
                    key={rec.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRecId(rec.id);
                      setCompletedSteps([]);
                    }}
                    className={`relative p-5 rounded-3xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FAF8F5] border-[#357A59] shadow-clay-card ring-2 ring-[#357A59]/20'
                        : 'bg-[#FAF8F5]/80 border-white hover:border-[#357A59]/40 shadow-clay-sm hover:scale-[1.01]'
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#357A59] text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Badge Cluster */}
                      <div className="flex items-center gap-2 pr-8">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${difficultyColor}`}>
                          {rec.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1A4D3A]/70">
                          <Clock className="w-3 h-3 text-[#357A59]" />
                          {rec.estimatedTime}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#1A4D3A] tracking-tight leading-snug">
                        {rec.title}
                      </h3>

                      <p className="text-xs text-[#1A4D3A]/70 line-clamp-3 leading-relaxed">
                        {rec.summary}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1A4D3A]/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#1A4D3A]/60 uppercase font-bold block">
                          Harga Jual Pasar:
                        </span>
                        <span className="text-sm font-black text-[#357A59]">
                          {rec.benchmarkPrice}
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        isSelected 
                          ? 'bg-[#357A59] text-white' 
                          : 'bg-[#EAE5DC] text-[#1A4D3A] group-hover:bg-[#357A59] group-hover:text-white'
                      }`}>
                        {isSelected ? 'Terpilih ✓' : 'Pilih Ini'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION 6: INSTANT DETAILED BLUEPRINT GENERATION ================= */}
          {activeRec && (
            <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl shadow-clay-card border border-white space-y-7 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A4D3A]/10 pb-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
                    {activeRec.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#1A4D3A]/70 mt-1">
                    Tingkat: {activeRec.difficulty} • Waktu: {activeRec.estimatedTime}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {/* Download PDF button */}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white shadow-clay-button border border-white text-xs font-bold text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Unduh Panduan PDF"
                  >
                    <Download className="w-4 h-4 text-[#357A59]" />
                    <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShareTitle(activeRec.title);
                      setShareStory(`Saya baru saja merancang "${activeRec.title}" dari limbah ${analysisResult.detectedObject.label} menggunakan AI Scanner BumiKita!`);
                      setIsShareModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white shadow-clay-button border border-white text-xs font-bold text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Bagikan ke Komunitas"
                  >
                    <Share2 className="w-4 h-4 text-[#FF9E20]" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>

              {/* 1. Auxiliary Cost & Materials Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 bg-gradient-clay p-5 rounded-2xl border border-white shadow-clay-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#1A4D3A] flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-[#357A59]" />
                      Alat & Bahan Tambahan
                    </h4>
                    {activeRec.auxiliaryCost && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Biaya: {activeRec.auxiliaryCost}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#1A4D3A]/70">
                    Centang bahan yang sudah kamu miliki di rumah untuk memastikan kesiapan:
                  </p>

                  <div className="space-y-2">
                    {activeRec.materialsNeeded.map((mat, idx) => {
                      const isChecked = checkedMaterials.includes(mat);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleMaterial(mat)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#E8F2ED] text-[#1A4D3A] line-through opacity-80'
                              : 'bg-white/80 text-[#1A4D3A] hover:bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked ? 'bg-[#357A59] border-[#357A59] text-white' : 'border-[#1A4D3A]/30 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="leading-tight">{mat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Step-by-Step Execution Guide */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#1A4D3A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#357A59]" />
                      Langkah Pembuatan ({completedSteps.length}/{activeRec.steps.length} Selesai)
                    </h4>
                    <span className="text-xs font-bold text-[#357A59]">
                      {Math.round((completedSteps.length / activeRec.steps.length) * 100)}% Progres
                    </span>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden shadow-clay-inset">
                    <div 
                      className="bg-gradient-earth h-full transition-all duration-300"
                      style={{ width: `${(completedSteps.length / activeRec.steps.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {activeRec.steps.map((stepInstruction, sIdx) => {
                      const isDone = completedSteps.includes(sIdx);
                      return (
                        <div 
                          key={sIdx}
                          onClick={() => handleToggleStep(sIdx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            isDone 
                              ? 'bg-[#E8F2ED]/60 border-[#357A59]/30 text-[#1A4D3A]/70' 
                              : 'bg-white border-[#1A4D3A]/10 hover:border-[#357A59]/40 shadow-clay-sm'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isDone ? 'bg-[#357A59] text-white' : 'bg-[#EAE5DC] text-[#1A4D3A]'
                          }`}>
                            {isDone ? <Check className="w-4 h-4" /> : sIdx + 1}
                          </div>

                          <div className="flex-1 space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#357A59] block">
                              Langkah {sIdx + 1}
                            </span>
                            <p className={`text-sm leading-relaxed ${isDone ? 'line-through' : 'font-medium text-[#1A4D3A]'}`}>
                              {stepInstruction}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Finishing & Green Market Advice */}
              {activeRec.finishingTips && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-xs text-[#1A4D3A]">
                  <Lightbulb className="w-5 h-5 text-[#FF9E20] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="font-bold text-amber-950 block text-sm">
                      Tips Finishing & Daya Tarik Pasar (Green Market BumiKita):
                    </strong>
                    <p className="leading-relaxed text-amber-900/90 font-medium">
                      {activeRec.finishingTips}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. Bottom Action & Project Completion Strip */}
              <div className="pt-5 border-t border-[#1A4D3A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F2ED] text-[#357A59] flex items-center justify-center text-xl shrink-0">
                    ✨
                  </div>
                  <div>
                    <span className="font-bold text-[#1A4D3A] block">
                      Blueprint Siap Dieksekusi
                    </span>
                    <span className="text-xs text-[#1A4D3A]/60">
                      Selesaikan misi harian untuk mengumpulkan lebih banyak Daun Points!
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#1A4D3A]/10 text-[#1A4D3A] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E8F2ED] hover:border-[#357A59] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#357A59]" />
                    <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-earth text-white shadow-clay-button hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan Karya</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: SHARE TO COMMUNITY ================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#1A4D3A]/10 pb-3">
              <h3 className="text-base font-extrabold text-[#1A4D3A] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#357A59]" />
                Bagikan Karya ke Komunitas BumiKita
              </h3>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-xl text-[#1A4D3A]/60 hover:text-[#1A4D3A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#357A59] mx-auto" />
                <h4 className="text-base font-bold text-[#1A4D3A]">Berhasil Diposting!</h4>
                <p className="text-xs text-[#1A4D3A]/70">Karyamu sudah tayang di tab Community feed.</p>
              </div>
            ) : (
              <form onSubmit={handleShareToCommunity} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A4D3A] mb-1">
                    Judul Postingan
                  </label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-white border border-[#1A4D3A]/20 text-xs text-[#1A4D3A] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A4D3A] mb-1">
                    Cerita / Tips Pembuatan
                  </label>
                  <textarea
                    value={shareStory}
                    onChange={(e) => setShareStory(e.target.value)}
                    rows={3}
                    required
                    className="w-full p-2.5 rounded-xl bg-white border border-[#1A4D3A]/20 text-xs text-[#1A4D3A] font-medium resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#1A4D3A]/70 hover:bg-[#EAE5DC]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#357A59] text-white shadow-clay-btn text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                  >
                    Publikasikan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
