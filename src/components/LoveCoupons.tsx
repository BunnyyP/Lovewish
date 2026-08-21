import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, CheckCircle2, Heart, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { BirthdayConfig, LoveCoupon } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

interface LoveCouponsProps {
  config: BirthdayConfig;
  onUpdateCoupons: (coupons: LoveCoupon[]) => void;
  onOpenCustomizer: () => void;
}

export function LoveCoupons({ config, onUpdateCoupons, onOpenCustomizer }: LoveCouponsProps) {
  const [coupons, setCoupons] = useState<LoveCoupon[]>(config.coupons);
  const [selectedForRedemption, setSelectedForRedemption] = useState<LoveCoupon | null>(null);

  // Sync with incoming config changes
  useEffect(() => {
    setCoupons(config.coupons);
  }, [config.coupons]);

  const handleRedeem = (coupon: LoveCoupon) => {
    sound.playStampSound();
    fireHeartConfetti();

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = coupons.map((c) => {
      if (c.id === coupon.id) {
        return {
          ...c,
          redeemed: true,
          redeemedDate: todayStr,
        };
      }
      return c;
    });

    setCoupons(updated);
    onUpdateCoupons(updated);
    setSelectedForRedemption(null);
  };

  return (
    <section id="love-coupons" className="py-16 px-4 max-w-6xl mx-auto text-center relative">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Ticket className="w-3.5 h-3.5 text-rose-600" />
          <span>Exclusive Birthday Vouchers</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          Birthday Love Coupons 🎟️
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto">
          These vouchers are 100% genuine, non-transferable, and redeemable anytime with your loved one. Click to claim and stamp your coupon!
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-md flex flex-col justify-between ${
              coupon.redeemed
                ? 'bg-stone-100/90 dark:bg-stone-850/80 border-stone-300 dark:border-stone-700 opacity-90'
                : 'bg-white dark:bg-stone-800 border-rose-200 dark:border-stone-700 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            {/* Top Ticket Header */}
            <div className="p-5 pb-4 border-b border-dashed border-rose-200 dark:border-stone-700 relative">
              {/* Notches on edges for real coupon ticket feel */}
              <div className="absolute -left-3 bottom-[-10px] w-6 h-6 rounded-full bg-rose-50 dark:bg-stone-950 border-r border-rose-200 dark:border-stone-700" />
              <div className="absolute -right-3 bottom-[-10px] w-6 h-6 rounded-full bg-rose-50 dark:bg-stone-950 border-l border-rose-200 dark:border-stone-700" />

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-700 dark:text-rose-400 uppercase bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded">
                  {coupon.code}
                </span>
                <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>No Expiry</span>
                </span>
              </div>

              <h3 className="font-serif-romantic text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {coupon.title}
              </h3>
            </div>

            {/* Ticket Body */}
            <div className="p-5 pt-4 flex-1 flex flex-col justify-between space-y-4">
              <p className="font-casual text-base sm:text-lg text-stone-700 dark:text-stone-300">
                {coupon.description}
              </p>

              {/* Stamp or Action Button */}
              <div className="pt-2">
                {coupon.redeemed ? (
                  <div className="p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 border-2 border-rose-500/80 text-center relative overflow-hidden transform -rotate-1">
                    <div className="text-[10px] font-bold text-rose-800 dark:text-rose-200 uppercase tracking-widest flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>OFFICIALLY CLAIMED & REDEEMED</span>
                    </div>
                    <div className="text-xs font-handwriting text-rose-900 dark:text-rose-100 font-bold mt-0.5">
                      {coupon.redeemedDate || 'Valid in Perpetuity'}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(coupon)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Redeem This Coupon Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Barcode / Details Strip */}
            <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 font-mono">
              <span>ISSUED BY: {config.senderName}</span>
              <span>100% UNCONDITIONAL</span>
            </div>
          </div>
        ))}
      </div>

      {/* Customize Coupons Button */}
      <div className="mt-10">
        <button
          onClick={onOpenCustomizer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-rose-500" />
          <span>Add Custom Coupon Promises</span>
        </button>
      </div>
    </section>
  );
}
