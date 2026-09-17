'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useEco } from '@/src/context/EcoContext';
import { useAuth } from '@/src/context/AuthContext';
import { 
  Sparkles, 
  ShoppingBag, 
  Leaf, 
  TreePine, 
  MapPin, 
  Users, 
  Gift, 
  Home,
  User
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/market', label: 'Market', icon: ShoppingBag },
  { href: '/scanner', label: 'AI Scanner', icon: Sparkles },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/quests', label: 'Hutan & Quest', icon: TreePine },
  { href: '/dropoff', label: 'Drop-off Map', icon: MapPin },
];

export default function Navbar() {
  const pathname = usePathname();
  const {
    daunPoints,
    dailyMissions,
    setIsMissionsOpen,
    setNotificationToast,
    cart,
    setIsCartOpen,
    setIsRewardModalOpen,
    treesPlanted,
  } = useEco();
  const { user, profile, openAuthModal } = useAuth();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const hasUnclaimedMissions = dailyMissions.some((m) => !m.is_claimed);

  const handleBadgeClick = () => {
    if (!user) {
      setNotificationToast({
        message: 'Silakan masuk terlebih dahulu untuk mengklaim misi harian dan mengumpulkan Daun.',
        icon: '🍃',
      });
      openAuthModal('login', 'Silakan masuk terlebih dahulu untuk mengklaim misi harian dan mengumpulkan Daun.');
      return;
    }
    setIsMissionsOpen(true);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-[100vw] overflow-x-hidden bg-[#F5F2ED] border-b border-[#1A4D3A]/10 px-3 py-2.5 sm:px-6 sm:py-3.5 transition-colors">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left Section (Brand & Logo) */}
        <Link 
          href="/"
          className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          {/* Brand Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF8F5] shadow-clay-card border border-white/80 flex items-center justify-center p-1 transition-transform group-hover:scale-105 group-active:scale-95 shrink-0">
            <Image
              src="/assets/logo-icon.webp"
              alt="BumiKita"
              width={32}
              height={32}
              priority
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-bold text-[#1A4D3A] tracking-tight shrink-0">
            Bumi<span className="text-[#357A59]">Kita</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-full shadow-clay-inset border border-white/60">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all relative ${
                  active
                    ? 'bg-gradient-earth text-white shadow-clay-button scale-[1.02]'
                    : 'text-[#1A4D3A]/80 hover:text-[#1A4D3A] hover:bg-[#EAE5DC]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section (Action Cluster) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Interactive Daun Points Badge (Connected to Daily Missions Modal) */}
          <div className="relative group shrink-0">
            <motion.button
              id="btn-daun-points-rewards"
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={handleBadgeClick}
              className="relative inline-flex items-center gap-1 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#FAF8F5] border border-white/80 shadow-clay-button hover:bg-white text-[#1A4D3A] font-bold text-xs sm:text-sm cursor-pointer transition-all active:scale-95 group select-none shrink-0"
              title="Klik untuk Buka Misi Harian & Tambah Daun"
            >
              {/* Daun Icon & Micro-interaction */}
              <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">🍃</span>

              {/* Reactive Point Balance with Pulse Animation on Change */}
              <motion.span
                key={daunPoints}
                initial={{ scale: 1.25, color: '#357A59' }}
                animate={{ scale: 1, color: '#1A4D3A' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="tracking-tight font-extrabold text-xs sm:text-sm"
              >
                {profile?.daun_points ?? daunPoints}
              </motion.span>

              {/* Gift / Quest Indicator */}
              <span className="text-[10px] sm:text-xs text-amber-500 animate-bounce">🎁</span>

              {/* Unclaimed Quest Indicator Dot (if any active mission not claimed today) */}
              {hasUnclaimedMissions && (
                <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse shadow-sm" />
              )}
            </motion.button>

            {/* Hover Tooltip */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] text-[#1A4D3A] text-[11px] font-bold shadow-clay-card border border-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 flex items-center gap-1.5">
                <span className="text-xs">✨</span>
                <span>Klik untuk Buka Misi Harian & Tambah Daun</span>
              </div>
            </div>
          </div>

          {/* Trees Badge with Smooth Tooltip (Desktop) */}
          <div className="relative group hidden xl:block shrink-0">
            <Link 
              href="/quests"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF4EE] rounded-full text-xs font-bold text-[#1A4D3A] border border-[#6DB677]/30 shadow-clay-sm cursor-pointer hover:bg-[#D8ECD9] hover:scale-105 active:scale-95 transition-all"
            >
              <TreePine className="w-4 h-4 text-[#357A59]" />
              <span>{treesPlanted} Pohon</span>
            </Link>

            {/* Hover Tooltip */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] text-[#1A4D3A] text-[11px] font-bold shadow-clay-card border border-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                🌳 2 Pohon ber-GPS aktif di Hutan Kalimantan
              </div>
            </div>
          </div>

          {/* Shopping Bag Button */}
          <button
            id="btn-cart-drawer"
            onClick={() => setIsCartOpen(true)}
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-[#FAF8F5] shadow-clay-card border border-white/80 text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A4D3A]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-white text-[10px] sm:text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          <Link
            id="btn-nav-auth"
            href={user ? "/profile" : "/auth"}
            className={`flex items-center gap-1.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer shrink-0 border border-white/80 hover:scale-105 active:scale-95 ${
              user
                ? 'p-1 sm:p-1.5 bg-[#FAF8F5] shadow-clay-card'
                : 'p-2 sm:px-4 sm:py-2 bg-[#357A59] text-white shadow-clay-btn'
            }`}
            title={user ? `Profil: @${profile?.nickname || 'saya'}` : 'Masuk ke BumiKita'}
          >
            {user ? (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E8F2ED] flex items-center justify-center overflow-hidden text-[#357A59] font-bold text-xs shadow-clay-inset border border-white">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Avatar'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/avatar-placeholder.webp';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/assets/avatar-placeholder.webp"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left pr-1.5">
                  <span className="text-xs font-black text-[#1A4D3A] leading-tight line-clamp-1 max-w-[90px]">
                    {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-[#357A59] leading-tight">
                    @{profile?.nickname || 'ecowarrior'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 font-extrabold text-xs">
                <User className="w-4 h-4 text-white shrink-0" />
                <span className="hidden sm:inline">Masuk</span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="w-full max-w-full overflow-x-hidden pt-2 pb-0.5">
        <div className="flex lg:hidden overflow-x-auto gap-1.5 no-scrollbar text-xs w-full max-w-full">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
                  active
                    ? 'bg-gradient-earth text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-pill border border-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
