'use client';

import React, { useRef, useState } from 'react';
import { UserCertificate } from '@/src/lib/forestService';
import { 
  Award, 
  Download, 
  Share2, 
  X, 
  Check, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Trees, 
  Sparkles,
  Leaf
} from 'lucide-react';

interface CertificateModalProps {
  certificate: UserCertificate;
  userName: string;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export default function CertificateModal({
  certificate,
  userName,
  onClose,
  onToast,
}: CertificateModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(certificate.issued_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getTierDetails = (tier: number) => {
    switch (tier) {
      case 4:
        return {
          color: 'from-amber-600 via-emerald-700 to-teal-800',
          badge: '🏆 TIER 4: EARTH CHAMPION',
          rankColor: 'text-amber-600',
          borderCol: 'border-amber-500/40',
        };
      case 3:
        return {
          color: 'from-emerald-700 via-teal-700 to-green-800',
          badge: '🌲 TIER 3: FOREST GUARDIAN',
          rankColor: 'text-[#1A4D3A]',
          borderCol: 'border-emerald-600/40',
        };
      case 2:
      default:
        return {
          color: 'from-emerald-600 to-teal-600',
          badge: '🌿 TIER 2: ECO ARTISAN',
          rankColor: 'text-[#357A59]',
          borderCol: 'border-[#357A59]/40',
        };
    }
  };

  const tierInfo = getTierDetails(certificate.level_tier);

  // Download certificate as high-resolution PNG using HTML5 canvas
  const handleSaveImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 800;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
      bgGrad.addColorStop(0, '#FAF8F5');
      bgGrad.addColorStop(0.5, '#F5F0E8');
      bgGrad.addColorStop(1, '#EBF4EE');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // Ornate outer border
      ctx.strokeStyle = '#1A4D3A';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1140, 740);

      ctx.strokeStyle = '#6DB677';
      ctx.lineWidth = 3;
      ctx.strokeRect(45, 45, 1110, 710);

      // Corner ornaments
      ctx.fillStyle = '#357A59';
      ctx.beginPath();
      ctx.arc(45, 45, 12, 0, Math.PI * 2);
      ctx.arc(1155, 45, 12, 0, Math.PI * 2);
      ctx.arc(45, 755, 12, 0, Math.PI * 2);
      ctx.arc(1155, 755, 12, 0, Math.PI * 2);
      ctx.fill();

      // Header Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A4D3A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('BUMIKITA ECO-RESTORATION INDONESIA', 600, 110);

      ctx.font = '600 16px sans-serif';
      ctx.fillStyle = '#6DB677';
      ctx.fillText('OFFICIAL CONSERVATION & REFORESTATION CERTIFICATE', 600, 140);

      // Divider
      ctx.strokeStyle = '#1A4D3A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(350, 160);
      ctx.lineTo(850, 160);
      ctx.stroke();

      // Certificate title
      ctx.font = 'bold 36px serif';
      ctx.fillStyle = '#1A4D3A';
      ctx.fillText('SERTIFIKAT PENGABDIAN LINGKUNGAN', 600, 215);

      ctx.font = 'italic 18px sans-serif';
      ctx.fillStyle = '#4A6256';
      ctx.fillText('Dengan bangga dipersembahkan kepada:', 600, 260);

      // User Name
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#1A4D3A';
      ctx.fillText(userName.toUpperCase(), 600, 320);

      // Level / Title
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#357A59';
      ctx.fillText(`ATAS PENCAPAIAN TINGKAT: ${certificate.level_name.toUpperCase()}`, 600, 375);

      // Impact description
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#2D3E35';
      const descLine1 = `Telah berkontribusi aktif mendanai penanaman ${certificate.trees_funded} pohon Meranti & Ulin`;
      const descLine2 = `serta menyerap estimasi ${certificate.carbon_offset_kg} kg jejak karbon (CO2e) di Hutan Hujan Tropis.`;
      ctx.fillText(descLine1, 600, 425);
      ctx.fillText(descLine2, 600, 455);

      // Metadata Box
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#D1E5DA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(160, 490, 880, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#1A4D3A';
      ctx.fillText('LOKASI RESTORASI:', 190, 525);
      ctx.fillText('KODE VERIFIKASI:', 190, 560);

      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#357A59';
      ctx.fillText('Bukit Soeharto, Kalimantan Timur (0°58\'12.4"S 117°02\'44.1"E)', 370, 525);
      ctx.font = 'bold 15px monospace';
      ctx.fillText(certificate.certificate_code, 370, 560);

      ctx.textAlign = 'right';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#1A4D3A';
      ctx.fillText(`TANGGAL: ${formattedDate}`, 1010, 545);

      // Signatures
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#1A4D3A';
      ctx.fillText('BumiKita Conservation Foundation', 380, 680);
      ctx.fillText('Balai Konservasi Hutan Tropis Mitra', 820, 680);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#6DB677';
      ctx.fillText('Verified Digital Seal', 380, 705);
      ctx.fillText('GPS Verified Planting', 820, 705);

      // Trigger download
      const imageUri = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Sertifikat-BumiKita-${certificate.certificate_code}.png`;
      downloadLink.href = imageUri;
      downloadLink.click();

      onToast?.('Sertifikat berhasil diunduh sebagai gambar!');
    } catch (e) {
      console.error('Error rendering certificate image:', e);
      onToast?.('Gagal mengunduh sertifikat.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Saya resmi menerima Sertifikat Konservasi Hutan "${certificate.level_name}" dari BumiKita! Kode: ${certificate.certificate_code}. Yuk ikut restorasi hutan Kalimantan bersama!`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://bumikita.id/quests';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Sertifikat ${certificate.level_name} - BumiKita`,
          text: shareText,
          url: shareUrl,
        });
        onToast?.('Berhasil dibagikan!');
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      onToast?.('Tautan & kode sertifikat disalin ke clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-[32px] p-6 sm:p-8 shadow-clay-card border-2 border-white space-y-6 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A]/70 hover:text-[#1A4D3A] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#FF9E20]" />
            <span>Selamat! Kamu Telah Mencapai Tingkat Baru</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#1A4D3A] tracking-tight">
            Sertifikat Resmi Restorasi Hutan
          </h3>
          <p className="text-xs sm:text-sm text-[#1A4D3A]/70 max-w-md mx-auto">
            Sertifikat ini tersimpan permanen di basis data BumiKita dan terhubung dengan koordinat konservasi Kalimantan.
          </p>
        </div>

        {/* Visual Certificate Sheet Preview */}
        <div 
          ref={certRef}
          className="relative bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EBF4EE] rounded-3xl p-6 sm:p-8 border-4 border-[#1A4D3A] shadow-clay-card space-y-5 overflow-hidden"
        >
          {/* Watermark Leaf Overlay */}
          <div className="absolute -right-8 -bottom-8 text-[#357A59]/5 pointer-events-none select-none">
            <Trees className="w-72 h-72" />
          </div>

          {/* Certificate Inner Frame */}
          <div className="border border-[#6DB677]/60 rounded-2xl p-5 sm:p-6 space-y-4 bg-white/70 backdrop-blur-xs relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A4D3A]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1A4D3A] text-white flex items-center justify-center font-black text-xl shadow-clay-sm">
                  🍃
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#1A4D3A]">
                    BumiKita Forest Alliance
                  </h4>
                  <p className="text-[10px] text-[#357A59] font-bold">
                    Official Ecological Stewardship Registry
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono font-bold text-[#1A4D3A]/60 block">
                  KODE VERIFIKASI
                </span>
                <span className="text-xs font-mono font-black text-[#357A59] tracking-wider">
                  {certificate.certificate_code}
                </span>
              </div>
            </div>

            {/* Cert Body */}
            <div className="text-center space-y-2 py-2">
              <p className="text-[11px] font-semibold text-[#1A4D3A]/70 uppercase tracking-widest">
                Diberikan kepada Pejuang Hijau
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A4D3A] tracking-tight">
                {userName}
              </h2>
              <div className="inline-block px-3.5 py-1 rounded-full bg-gradient-earth text-white font-extrabold text-xs shadow-clay-sm">
                {tierInfo.badge}
              </div>
              <p className="text-xs text-[#1A4D3A]/80 max-w-md mx-auto pt-1 leading-relaxed">
                Telah berkontribusi aktif mendanai <span className="font-bold text-[#357A59]">{certificate.trees_funded} pohon</span> di kawasan restorasi Bukit Soeharto dengan estimasi penyerapan <span className="font-bold text-[#357A59]">{certificate.carbon_offset_kg} kg CO2e</span>.
              </p>
            </div>

            {/* Provenance Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-[#1A4D3A]/80 border-t border-[#1A4D3A]/10">
              <div className="flex items-start gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-white">
                <MapPin className="w-4 h-4 text-[#357A59] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A4D3A] block">Lokasi Restorasi:</span>
                  <span>Bukit Soeharto, Kalimantan Timur</span>
                  <span className="block text-[10px] font-mono text-[#357A59]">0°58&apos;12.4&quot;S 117°02&apos;44.1&quot;E</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-white">
                <Calendar className="w-4 h-4 text-[#357A59] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A4D3A] block">Tanggal Penerbitan:</span>
                  <span>{formattedDate}</span>
                  <span className="block text-[10px] font-bold text-[#357A59]">Status: Terverifikasi Permanen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isDownloading}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-earth text-white font-black text-xs sm:text-sm shadow-clay-button border border-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Memproses Gambar...' : 'Simpan Gambar (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] font-extrabold text-xs sm:text-sm shadow-clay-button border border-white hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#357A59]" /> : <Share2 className="w-4 h-4 text-[#357A59]" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Bagikan Sertifikat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
