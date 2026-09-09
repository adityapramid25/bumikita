'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEco } from '@/src/context/EcoContext';
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
  { href: '/scanner', label: 'AI Scanner', icon: Sparkles, badge: 'AI' },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/quests', label: 'Hutan & Quest', icon: TreePine },
  { href: '/dropoff', label: 'Drop-off Map', icon: MapPin },
];

export default function Navbar() {
  const pathname = usePathname();
  const {
    daunPoints,
    cart,
    setIsCartOpen,
    setIsRewardModalOpen,
    treesPlanted,
  } = useEco();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#F5F2ED]/95 backdrop-blur-md border-b border-[#1A4D3A]/10 px-4 py-3 sm:px-6 sm:py-4 transition-all">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section (Brand & Logo) */}
        <Link 
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Logo Container */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-earth p-0.5 shadow-clay-green flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shrink-0">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[14px] flex items-center justify-center text-[#1A4D3A]">
              <Leaf className="w-6 h-6 text-[#357A59] fill-[#6DB677]/40 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1A4D3A] shrink-0">
              Bumi<span className="text-[#357A59]">Kita</span>
            </span>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20 shrink-0">
              GEN-Z ECO HUB
            </span>
          </div>
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
                <Icon className={`w-3.5 h-3.5 ${link.badge ? 'text-[#FF9E20] fill-[#FF9E20]' : ''}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${active ? 'bg-[#FF9E20] text-white' : 'bg-[#FF9E20] text-white'}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section (Action Cluster) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Points Pill ("480") */}
          <div className="relative group shrink-0">
            <button
              id="btn-daun-points-rewards"
              onClick={() => setIsRewardModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold rounded-full bg-[#FAF8F5] shadow-clay-card flex items-center gap-1.5 border border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Lihat Reward Daun Points"
            >
              <span className="flex items-center justify-center w-4 h-4 text-sm shrink-0">
                🍃
              </span>
              <span className="text-sm font-bold text-[#1A4D3A]">{daunPoints}</span>
              <Gift className="w-4 h-4 text-[#FF9E20] shrink-0" />
            </button>

            {/* Hover Tooltip */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] text-[#1A4D3A] text-[11px] font-bold shadow-clay-card border border-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                🎁 Tukar 400 Daun = 1 Pohon Nyata & Diskon Market
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
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-[#FAF8F5] shadow-clay-card border border-white/80 text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 text-[#1A4D3A]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] sm:w-5 sm:h-5 bg-amber-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Profile Button */}
          <Link
            id="btn-nav-auth"
            href="/auth"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-[#357A59] text-white shadow-clay-btn shrink-0 border border-white/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Akun Pengguna & Masuk BumiKita"
          >
            <User className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pt-2 pb-0.5 no-scrollbar text-xs w-full">
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
              <Icon className={`w-3.5 h-3.5 ${link.badge && !active ? 'text-[#FF9E20]' : ''}`} />
              <span>{link.label}</span>
              {link.badge && (
                <span className="bg-[#FF9E20] text-white text-[8px] font-black px-1 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
