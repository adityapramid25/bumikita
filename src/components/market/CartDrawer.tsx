'use client';

import React, { useState } from 'react';
import { useEco } from '@/src/context/EcoContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  CheckCircle2, 
  Leaf, 
  Droplet,
  Download,
  Share2
} from 'lucide-react';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    daunPoints, 
    spendDaunPoints, 
    addDaunPoints 
  } = useEco();

  const [usePointsDiscount, setUsePointsDiscount] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Daun points discount (up to 200 points = Rp 20.000)
  const maxPointsUsable = Math.min(200, daunPoints);
  const pointsDiscountAmount = usePointsDiscount ? maxPointsUsable * 100 : 0;
  
  const shippingFee = subtotal > 150000 ? 0 : 12000;
  const total = Math.max(0, subtotal - pointsDiscountAmount - promoDiscount + shippingFee);

  const totalWaterSaved = cart.reduce((sum, item) => sum + (item.product.impactStats.waterSavedLiters * item.quantity), 0);
  const totalCo2Saved = cart.reduce((sum, item) => sum + (item.product.impactStats.co2SavedKg * item.quantity), 0);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'GENZECO' || promoCode.trim().toUpperCase() === 'BUMIKITA') {
      setPromoDiscount(15000);
      setPromoApplied(true);
    } else {
      alert('Kode promo tidak valid. Coba kode: GENZECO atau BUMIKITA');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);

    if (usePointsDiscount && maxPointsUsable > 0) {
      spendDaunPoints(maxPointsUsable);
    }

    setTimeout(() => {
      const receipt = {
        orderId: `BK-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        items: [...cart],
        subtotal,
        total,
        waterSaved: totalWaterSaved,
        co2Saved: totalCo2Saved,
        earnedPoints: Math.floor(total / 2000),
      };

      setOrderReceipt(receipt);
      setIsCheckingOut(false);
      setOrderSuccess(true);
      clearCart();
      addDaunPoints(receipt.earnedPoints, 'Reward Cashback Belanja di Green Market!');

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6DB677', '#357A59', '#FF9E20', '#1A4D3A'],
        });
      } catch (e) {}
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto relative animate-in slide-in-from-right duration-300 border-l border-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A4D3A]/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#357A59]" />
            <h3 className="text-lg font-extrabold text-[#1A4D3A]">
              Keranjang Green Market
            </h3>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(false);
            }}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] shadow-clay-button border border-white flex items-center justify-center text-[#1A4D3A] hover:scale-105"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderSuccess && orderReceipt ? (
          /* Order Success Certificate & Receipt */
          <div className="py-8 space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-earth text-white flex items-center justify-center mx-auto shadow-clay-green text-3xl">
              🌱
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-[#1A4D3A]">
                Pesanan Eco Berhasil!
              </h4>
              <p className="text-xs text-[#1A4D3A]/70">
                Nomor Pesanan: <span className="font-bold text-[#1A4D3A]">{orderReceipt.orderId}</span>
              </p>
            </div>

            {/* Impact Certificate Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EBF4EE] to-[#FFF5E6] border border-[#6DB677]/40 shadow-clay-card text-left space-y-3">
              <div className="flex items-center justify-between border-b border-[#357A59]/20 pb-2">
                <span className="text-[10px] font-black text-[#357A59] tracking-wider uppercase">
                  Sertifikat Dampak BumiKita
                </span>
                <span className="text-[10px] font-bold text-[#1A4D3A]/60">
                  {orderReceipt.date}
                </span>
              </div>

              <p className="text-xs text-[#1A4D3A] font-semibold">
                Dengan memilih produk sirkular & upcycle ini, kamu telah menghemat:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/80 shadow-sm">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#0284C7]">
                    <Droplet className="w-3 h-3 fill-[#0284C7]" />
                    <span>Air Bersih</span>
                  </div>
                  <p className="text-sm font-black text-[#1A4D3A]">
                    {orderReceipt.waterSaved?.toLocaleString('id-ID')} Liter
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 shadow-sm">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#357A59]">
                    <Leaf className="w-3 h-3" />
                    <span>Emisi Karbon</span>
                  </div>
                  <p className="text-sm font-black text-[#1A4D3A]">
                    {orderReceipt.co2Saved?.toFixed(1)} kg CO2
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] font-bold text-[#FF9E20] bg-[#FAF8F5] px-3 py-1 rounded-full shadow-sm">
                  +{orderReceipt.earnedPoints} Daun Points Didapatkan! 🍃
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderSuccess(false);
                setIsCartOpen(false);
              }}
              className="w-full py-3.5 rounded-full bg-[#1A4D3A] text-white font-bold text-xs shadow-clay-button hover:scale-105 transition-all cursor-pointer"
            >
              Kembali Belanja di Green Market
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF8F5] text-[#1A4D3A]/40 flex items-center justify-center mx-auto shadow-clay-button border border-white text-2xl">
              🛒
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#1A4D3A]">
                Keranjangmu Masih Kosong
              </h4>
              <p className="text-xs text-[#1A4D3A]/60 max-w-xs mx-auto">
                Yuk jelajahi produk upcycled streetwear & zero-waste campus kit dari student makers!
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="px-6 py-2.5 rounded-full bg-gradient-earth text-white font-bold text-xs shadow-clay-green hover:scale-105 transition-transform cursor-pointer"
            >
              Mulai Belanja Hijau
            </button>
          </div>
        ) : (
          /* Cart Items List & Checkout Summary */
          <div className="space-y-6 my-4 flex-1">
            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white flex items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.image || '/assets/product-placeholder.webp'}
                    alt={item.product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/product-placeholder.webp';
                    }}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm bg-[#EAE5DC] flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#1A4D3A] truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] font-extrabold text-[#357A59]">
                      Rp {item.product.price.toLocaleString('id-ID')}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded-full shadow-clay-inset border border-white text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-[#1A4D3A] hover:text-[#357A59]"
                        >
                          -
                        </button>
                        <span className="px-1 text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-[#1A4D3A] hover:text-[#357A59]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[#1A4D3A]/40 hover:text-[#DC2626] p-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Impact Sum Banner */}
            <div className="p-3.5 rounded-2xl bg-[#E8F2ED] border border-[#357A59]/20 shadow-clay-inset flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1A4D3A]">
                <Droplet className="w-3.5 h-3.5 text-[#0284C7] fill-[#0284C7]" />
                <span>Total Hemat: {totalWaterSaved.toLocaleString('id-ID')}L Air</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#357A59]">
                <Leaf className="w-3.5 h-3.5" />
                <span>-{totalCo2Saved.toFixed(1)} kg CO2</span>
              </div>
            </div>

            {/* Daun Points Discount Toggle */}
            {daunPoints >= 50 && (
              <div className="p-3 rounded-2xl bg-[#FAF8F5] shadow-clay-card border border-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF5E6] text-[#FF9E20] flex items-center justify-center text-xs font-bold shadow-clay-sm">
                    🍃
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A4D3A]">
                      Tukar {maxPointsUsable} Daun
                    </p>
                    <p className="text-[10px] text-[#357A59]">
                      Hemat Rp {(maxPointsUsable * 100).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={usePointsDiscount}
                  onChange={(e) => setUsePointsDiscount(e.target.checked)}
                  className="w-4 h-4 accent-[#357A59] rounded cursor-pointer"
                />
              </div>
            )}

            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Kode Promo: GENZECO"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF8F5] shadow-clay-inset border border-white text-xs text-[#1A4D3A] uppercase font-bold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-3.5 py-2 rounded-xl bg-[#1A4D3A] text-white text-xs font-bold shadow-clay-button hover:bg-[#357A59] transition-colors"
              >
                Pakai
              </button>
            </div>
            {promoApplied && (
              <p className="text-[11px] font-bold text-[#357A59] -mt-4">
                ✓ Promo GENZECO aktif! Diskon Rp 15.000
              </p>
            )}

            {/* Summary Lines */}
            <div className="space-y-1.5 pt-2 border-t border-[#1A4D3A]/10 text-xs">
              <div className="flex justify-between text-[#1A4D3A]/70">
                <span>Subtotal Produk</span>
                <span className="font-bold text-[#1A4D3A]">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              {pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-[#357A59] font-bold">
                  <span>Diskon Daun Points</span>
                  <span>-Rp {pointsDiscountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-[#357A59] font-bold">
                  <span>Diskon Voucher</span>
                  <span>-Rp {promoDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#1A4D3A]/70">
                <span>Ongkir Zero-Carbon</span>
                <span className="font-bold text-[#1A4D3A]">
                  {shippingFee === 0 ? 'GRATIS' : `Rp ${shippingFee.toLocaleString('id-ID')}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-[#1A4D3A] pt-2 border-t border-[#1A4D3A]/10">
                <span>Total Pembayaran</span>
                <span className="text-[#1A4D3A] text-base">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {!orderSuccess && cart.length > 0 && (
          <div className="pt-4 border-t border-[#1A4D3A]/10">
            <button
              id="btn-checkout-order"
              disabled={isCheckingOut}
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-full bg-gradient-earth text-white font-bold text-sm shadow-clay-green hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCheckingOut ? (
                <span>Memproses Pesanan Hijau...</span>
              ) : (
                <>
                  <span>Checkout Sekarang • Rp {total.toLocaleString('id-ID')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
