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
  Home
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
    <header className="sticky top-0 z-40 w-full bg-[#F5F2ED]/95 backdrop-blur-md border-b border-[#1A4D3A]/10 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <Link 
          href="/"
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-earth p-0.5 shadow-clay-green flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[14px] flex items-center justify-center text-[#1A4D3A]">
              <Leaf className="w-6 h-6 text-[#357A59] fill-[#6DB677]/40 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A4D3A]">
                Bumi<span className="text-[#357A59]">Kita</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20">
                GEN-Z ECO HUB
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#1A4D3A]/60 -mt-0.5 hidden sm:block">
              Green Market & AI Upcycle Platform
            </p>
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

        {/* Right Action Icons & Daun Points Pill */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Daun Points Pill */}
          <button
            id="btn-daun-points-rewards"
            onClick={() => setIsRewardModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F5] rounded-full shadow-clay-pill border border-white hover:scale-105 active:scale-95 transition-all text-xs font-bold text-[#1A4D3A] cursor-pointer"
            title="Lihat & Tukar Daun Points"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E8F2ED] text-[#357A59]">
              🍃
            </span>
            <span>{daunPoints}</span>
            <span className="text-[10px] text-[#357A59] font-extrabold uppercase hidden sm:inline">
              Daun
            </span>
            <Gift className="w-3.5 h-3.5 text-[#FF9E20] ml-0.5" />
          </button>

          {/* Trees Badge */}
          <Link 
            href="/quests"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF4EE] rounded-full text-xs font-bold text-[#1A4D3A] border border-[#6DB677]/30 shadow-clay-sm cursor-pointer hover:bg-[#D8ECD9] transition-all"
            title="Total Pohon Nyata yang Kamu Tanam"
          >
            <TreePine className="w-4 h-4 text-[#357A59]" />
            <span>{treesPlanted} Pohon</span>
          </Link>

          {/* Cart Trigger */}
          <button
            id="btn-cart-drawer"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#FAF8F5] shadow-clay-button border border-white text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 text-[#1A4D3A]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF9E20] text-white text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pt-2.5 pb-1 no-scrollbar text-xs">
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
