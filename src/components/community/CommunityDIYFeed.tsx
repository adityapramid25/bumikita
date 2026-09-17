'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { INITIAL_WORKSHOPS } from '@/src/data/mockData';
import { Workshop } from '@/src/types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  Leaf, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  GraduationCap, 
  X,
  CheckCircle2
} from 'lucide-react';

export default function CommunityDIYFeed() {
  const { 
    communityPosts, 
    likePost, 
    addCommunityPost, 
    daunPoints, 
    spendDaunPoints, 
    addDaunPoints 
  } = useEco();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTrashItem, setNewTrashItem] = useState('');
  const [newBeforeImg, setNewBeforeImg] = useState('https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80');
  const [newAfterImg, setNewAfterImg] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80');

  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);
  const [workshopSuccessModal, setWorkshopSuccessModal] = useState<Workshop | null>(null);

  const handleRegisterWorkshop = (ws: Workshop) => {
    if (registeredWorkshops.includes(ws.id)) return;
    if (daunPoints < ws.daunPointsCost) {
      alert(`Poin Daun tidak mencukupi. Butuh ${ws.daunPointsCost} Daun, kamu punya ${daunPoints} Daun.`);
      return;
    }

    spendDaunPoints(ws.daunPointsCost);
    setRegisteredWorkshops((prev) => [...prev, ws.id]);
    setWorkshopSuccessModal(ws);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    addCommunityPost({
      author: {
        name: 'Kamu (Gen-Z Maker)',
        handle: '@kamu.diy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        badge: 'Community Creator',
        campus: 'Student Maker',
      },
      title: newTitle,
      description: newDesc,
      beforeImage: newBeforeImg,
      afterImage: newAfterImg,
      originalTrashItem: newTrashItem || 'Sampah Rumah Tangga',
      tags: ['#DIYBumiKita', '#UpcycleGenZ', '#ZeroWasteKampus'],
    });

    setIsShareModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewTrashItem('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header & Share Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
            Komunitas DIY & Workshop Kampus
          </h2>
          <p className="text-sm sm:text-base text-[#1A4D3A]/70 max-w-2xl">
            Lihat transformasi sebelum-sesudah dari kreasi mahasiswa se-Indonesia. Bagikan karyamu untuk klaim <span className="font-bold text-[#357A59]">+75 Daun Points</span> atau ikuti workshop live!
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-earth text-white font-bold text-sm shadow-clay-green hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Bagikan Karya Upcycle (+75 Daun)</span>
        </button>
      </div>

      {/* Upcoming Campus Workshops */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-[#1A4D3A] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#357A59]" />
          <span>Workshop & Kelas Upcycle Terdekat:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_WORKSHOPS.map((ws) => {
            const isRegistered = registeredWorkshops.includes(ws.id);
            return (
              <div
                key={ws.id}
                className="bg-[#FAF8F5] rounded-[28px] p-5 sm:p-6 shadow-clay-card border border-white flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-clay-inset bg-[#EAE5DC]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ws.image} alt={ws.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-[#1A4D3A]/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {ws.mode}
                    </span>
                    <span className="absolute top-3 right-3 bg-[#FFF5E6] text-[#D97E0D] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm border border-[#FF9E20]/30">
                      🎟️ {ws.daunPointsCost} Daun
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-[#1A4D3A] leading-snug">
                    {ws.title}
                  </h4>

                  <p className="text-xs text-[#1A4D3A]/70 font-medium">
                    Oleh: <span className="font-bold text-[#1A4D3A]">{ws.mentor}</span> ({ws.mentorRole})
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-[#1A4D3A]/80 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#357A59]" />
                      <span>{ws.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#357A59]" />
                      <span>{ws.time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 text-[#357A59]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{ws.locationName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterWorkshop(ws)}
                  disabled={isRegistered}
                  className={`w-full py-3 rounded-full font-bold text-xs transition-all shadow-clay-button border border-white flex items-center justify-center gap-2 ${
                    isRegistered
                      ? 'bg-[#357A59] text-white cursor-default'
                      : 'bg-[#FAF8F5] text-[#1A4D3A] hover:bg-gradient-earth hover:text-white cursor-pointer'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tiket Terdaftar • Link Dikirim!</span>
                    </>
                  ) : (
                    <span>Daftar Kursi (Tukar {ws.daunPointsCost} Daun Points)</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Showroom Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-[#1A4D3A] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF9E20]" />
          <span>Karya DIY Terbaru Komunitas:</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#FAF8F5] rounded-[28px] p-5 shadow-clay-card border border-white flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover shadow-sm border border-white"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1A4D3A]">{post.author.name}</p>
                      <p className="text-[10px] text-[#357A59] font-medium">{post.author.campus}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#1A4D3A]/40 font-semibold">{post.createdAt}</span>
                </div>

                {/* Before / After Dual Showcase */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-xl overflow-hidden h-36 bg-[#EAE5DC] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      SEBELUM (Sampah)
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-36 bg-[#EAE5DC] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.afterImage} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#357A59] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      SESUDAH (Karya)
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-[#1A4D3A] leading-snug">
                  {post.title}
                </h4>

                <p className="text-xs text-[#1A4D3A]/75 leading-relaxed">
                  {post.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-[#357A59]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Likes and Comments */}
              <div className="pt-3 border-t border-[#1A4D3A]/10 flex items-center justify-between">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-clay-pill border border-white cursor-pointer ${
                    post.userLiked
                      ? 'bg-[#E8F2ED] text-[#357A59]'
                      : 'bg-[#FAF8F5] text-[#1A4D3A]/70 hover:bg-[#EDE8E0]'
                  }`}
                >
                  <Leaf className={`w-3.5 h-3.5 ${post.userLiked ? 'fill-[#357A59]' : ''}`} />
                  <span>{post.leavesCount} Daun</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-[#1A4D3A]/60 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} Komentar</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-clay-card border border-white space-y-5 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#1A4D3A]/10 pb-3">
              <h3 className="text-lg font-extrabold text-[#1A4D3A]">
                Bagikan Karya Upcycle (+75 Daun)
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4 text-xs font-bold text-[#1A4D3A]">
              <div>
                <label className="block mb-1">Judul Karya Upcycle</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Pouch Kabel & Charger dari Celana Jeans Rusak"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Sampah Asal yang Digunakan</label>
                <input
                  type="text"
                  required
                  value={newTrashItem}
                  onChange={(e) => setNewTrashItem(e.target.value)}
                  placeholder="Contoh: 1 Jeans Ripped Bekas & Kancing Lama"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Cerita & Tips Pembuatan</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ceritakan proses pembuatan dan tips untuk teman-teman lain..."
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs font-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-earth text-white font-extrabold text-sm shadow-clay-green hover:scale-105 transition-transform cursor-pointer"
              >
                Posting Sekarang & Klaim 75 Daun 🍃
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Workshop Registration Success Modal */}
      {workshopSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-clay-card border border-white text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-earth text-white flex items-center justify-center mx-auto text-2xl shadow-clay-green">
              🎉
            </div>
            <h3 className="text-lg font-extrabold text-[#1A4D3A]">
              Kursi Workshop Berhasil Dipesan!
            </h3>
            <p className="text-xs text-[#1A4D3A]/70">
              Kamu terdaftar untuk: <span className="font-bold text-[#1A4D3A]">{workshopSuccessModal.title}</span> pada {workshopSuccessModal.date}. Link dan kit workshop akan dikonfirmasi.
            </p>
            <button
              onClick={() => setWorkshopSuccessModal(null)}
              className="w-full py-3 rounded-full bg-[#1A4D3A] text-white font-bold text-xs shadow-clay-button hover:bg-[#357A59] transition-all cursor-pointer"
            >
              Siap, Mantap!
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
