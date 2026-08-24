'use client';

import React, { useState, useMemo } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { INITIAL_PRODUCTS } from '@/src/data/mockData';
import { CategoryType, EcoTag, Product } from '@/src/types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  Droplet, 
  Leaf, 
  Star, 
  Plus, 
  Check,
  Flame,
  Award,
  GraduationCap
} from 'lucide-react';

const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Produk', icon: '✨' },
  { id: 'upcycled-fashion', label: 'Rework Streetwear', icon: '👖' },
  { id: 'campus-zero-waste', label: 'Campus Zero-Waste Kit', icon: '🥤' },
  { id: 'solid-toiletries', label: 'Solid Bar Toiletries', icon: '🧼' },
  { id: 'recycled-tech', label: 'Recycled Tech Case', icon: '💻' },
  { id: 'vintage-thrift', label: 'Curated 90s Thrift', icon: '🧥' },
];

const ECO_TAG_FILTERS: EcoTag[] = [
  '100% Upcycled',
  'Plastic-Free',
  'Campus Made',
  'Zero-Carbon',
  'Locally Sourced',
];

export default function GreenMarket() {
  const { 
    addToCart, 
    setSelectedProductModal, 
    activeFilterCategory, 
    setActiveFilterCategory,
    searchQuery,
    setSearchQuery 
  } = useEco();

  const [selectedEcoTag, setSelectedEcoTag] = useState<EcoTag | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      // Category filter
      if (activeFilterCategory !== 'all' && prod.category !== activeFilterCategory) {
        return false;
      }
      // Eco tag filter
      if (selectedEcoTag && !prod.ecoTags.includes(selectedEcoTag)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesSeller = prod.seller.name.toLowerCase().includes(q) || prod.seller.campusOrCity.toLowerCase().includes(q);
        const matchesTag = prod.ecoTags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesSeller && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [activeFilterCategory, selectedEcoTag, searchQuery]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Market Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#6DB677]/40 text-[#1A4D3A] text-xs font-bold shadow-clay-sm">
            <ShoppingBag className="w-3.5 h-3.5 text-[#357A59]" />
            <span>Curated Circular Marketplace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A4D3A] tracking-tight">
            Green Market Gen-Z
          </h2>
          <p className="text-sm sm:text-base text-[#1A4D3A]/70 max-w-2xl">
            Produk upcycled estetik karya mahasiswa & artisan lokal Indonesia. Transparan jejak air, emisi CO2, dan tanpa plastik sekali pakai.
          </p>
        </div>

        {/* Search Input Clay Pill */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#1A4D3A]/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="market-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari denim rework, tumbler, kampus..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-[#FAF8F5] shadow-clay-inset border border-white text-xs sm:text-sm text-[#1A4D3A] placeholder-[#1A4D3A]/40 focus:outline-none focus:ring-2 focus:ring-[#357A59]"
          />
        </div>
      </div>

      {/* Category Tabs (Clay Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilterCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
              activeFilterCategory === cat.id
                ? 'bg-[#1A4D3A] text-white shadow-clay-button scale-[1.02]'
                : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-pill border border-white hover:bg-[#EDE8E0]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Eco-Tag Chips Filter */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-bold text-[#1A4D3A]/60 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter Eco:
        </span>
        {ECO_TAG_FILTERS.map((tag) => {
          const isSelected = selectedEcoTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedEcoTag(isSelected ? null : tag)}
              className={`px-3 py-1 rounded-full font-bold transition-all text-[11px] cursor-pointer ${
                isSelected
                  ? 'bg-[#357A59] text-white shadow-clay-sm'
                  : 'bg-[#FAF8F5] text-[#1A4D3A]/80 shadow-clay-pill border border-white/80 hover:bg-[#EDE8E0]'
              }`}
            >
              {tag}
            </button>
          );
        })}
        {selectedEcoTag && (
          <button
            onClick={() => setSelectedEcoTag(null)}
            className="text-[11px] font-bold text-[#DC2626] ml-2 hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-[32px] p-12 text-center shadow-clay-card border border-white space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF4EE] text-[#357A59] flex items-center justify-center mx-auto text-2xl shadow-clay-sm">
            🌿
          </div>
          <h3 className="text-lg font-bold text-[#1A4D3A]">
            Tidak ada produk yang cocok dengan pencarian
          </h3>
          <p className="text-xs text-[#1A4D3A]/60 max-w-sm mx-auto">
            Coba gunakan kata kunci lain atau pilih kategori & filter eco yang berbeda.
          </p>
          <button
            onClick={() => {
              setActiveFilterCategory('all');
              setSelectedEcoTag(null);
              setSearchQuery('');
            }}
            className="px-5 py-2 rounded-full bg-[#1A4D3A] text-white text-xs font-bold shadow-clay-button hover:scale-105 transition-transform cursor-pointer mt-2"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isAdded = addedIds.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductModal(product)}
                className="bg-[#FAF8F5] rounded-[28px] p-4 sm:p-5 shadow-clay-card border border-white hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                {/* Product Image Container */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-[#EAE5DC] mb-4 shadow-clay-inset">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Impact Floating Badge */}
                  <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#1A4D3A] shadow-sm flex items-center gap-1 border border-white/80">
                    <Droplet className="w-3 h-3 text-[#0284C7] fill-[#0284C7]" />
                    <span>Hemat {product.impactStats.waterSavedLiters?.toLocaleString('id-ID')}L Air</span>
                  </div>

                  {/* Student Verified Campus Badge */}
                  {product.seller.isVerifiedStudent && (
                    <div className="absolute top-3 right-3 bg-[#1A4D3A]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#6DB677]" />
                      <span>{product.seller.campusOrCity}</span>
                    </div>
                  )}

                  {product.featured && (
                    <div className="absolute bottom-3 left-3 bg-[#FF9E20] text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      Staff Pick
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Eco Tags list */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {product.ecoTags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4EE] text-[#357A59] border border-[#357A59]/20"
                        >
                          {t}
                        </span>
                      ))}
                      {product.ecoTags.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#1A4D3A]/60 shadow-clay-sm">
                          +{product.ecoTags.length - 2}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-[#1A4D3A] leading-snug group-hover:text-[#357A59] transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#1A4D3A]/70 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Bottom Price & Quick Add Button */}
                  <div className="pt-3 border-t border-[#1A4D3A]/10 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#1A4D3A]/50 font-medium">Harga Karya</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-[#1A4D3A]">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-[#1A4D3A]/40 line-through font-semibold">
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add to Cart Button */}
                    <button
                      id={`btn-quick-add-${product.id}`}
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-[#357A59] text-white shadow-clay-green scale-110'
                          : 'bg-[#FAF8F5] text-[#1A4D3A] shadow-clay-button border border-white hover:bg-gradient-earth hover:text-white hover:scale-105 active:scale-95'
                      }`}
                      title="Tambah ke Keranjang"
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
