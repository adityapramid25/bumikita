'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import { 
  X, 
  Droplet, 
  Leaf, 
  ShieldCheck, 
  GraduationCap, 
  ShoppingBag, 
  Check, 
  Heart,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function ProductModal() {
  const { selectedProductModal, setSelectedProductModal, addToCart } = useEco();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const images = product.galleryImages || [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setSelectedProductModal(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-clay-card border border-white p-6 sm:p-8 relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A] hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Gallery Column */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-clay-card border border-white bg-[#EAE5DC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#1A4D3A] shadow-sm flex items-center gap-1.5 border border-white">
                <Leaf className="w-3.5 h-3.5 text-[#357A59]" />
                <span>100% Upcycled Waste</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#357A59] scale-105 shadow-clay-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A4D3A] leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1A4D3A]">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#1A4D3A]/40 line-through font-semibold">
                  Rp {product.originalPrice.toLocaleString('id-ID')}
                </span>
              )}
            </div>

            {/* Eco Tags */}
            <div className="flex flex-wrap gap-1.5">
              {product.ecoTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F2ED] text-[#357A59] border border-[#357A59]/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-[#1A4D3A]/75 leading-relaxed">
              {product.description}
            </p>

            {/* Verified Maker Affiliation */}
            <div className="p-3 rounded-2xl bg-[#FAF8F5] shadow-clay-inset border border-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-9 h-9 rounded-full object-cover shadow-sm border border-white"
                />
                <div>
                  <p className="text-xs font-bold text-[#1A4D3A]">{product.seller.name}</p>
                  <p className="text-[11px] text-[#357A59] font-medium flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{product.seller.campusOrCity}</span>
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#EBF4EE] text-[#1A4D3A] border border-[#357A59]/20">
                Verified Maker
              </span>
            </div>

            {/* Impact Metric Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] shadow-clay-button border border-white text-center">
                <div className="flex items-center justify-center gap-1 text-[#0284C7] font-bold text-xs">
                  <Droplet className="w-3.5 h-3.5 fill-[#0284C7]" />
                  <span>Air Hemat</span>
                </div>
                <p className="text-sm font-black text-[#1A4D3A] mt-0.5">
                  {product.impactStats.waterSavedLiters?.toLocaleString('id-ID')} L
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF8F5] shadow-clay-button border border-white text-center">
                <div className="flex items-center justify-center gap-1 text-[#357A59] font-bold text-xs">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Emisi CO2</span>
                </div>
                <p className="text-sm font-black text-[#1A4D3A] mt-0.5">
                  -{product.impactStats.co2SavedKg} kg
                </p>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#1A4D3A]">Jumlah:</span>
                <div className="flex items-center gap-2 bg-[#FAF8F5] p-1 rounded-full shadow-clay-inset border border-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center hover:scale-105"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-7 h-7 rounded-full bg-white text-[#1A4D3A] font-bold text-sm shadow-sm flex items-center justify-center hover:scale-105"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-[#1A4D3A]/60 font-semibold">
                  Sisa stok: {product.stock} pcs
                </span>
              </div>

              <button
                id="modal-btn-add-cart"
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-clay-button border border-white flex items-center justify-center gap-2 cursor-pointer ${
                  isAdded
                    ? 'bg-[#357A59] text-white shadow-clay-green'
                    : 'bg-gradient-earth text-white shadow-clay-green hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ditambahkan ke Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tambah ke Keranjang • Rp {(product.price * quantity).toLocaleString('id-ID')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
