import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Sparkles, Award, ArrowUp, Share2, Check } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti, fireFireworks } from '../utils/confetti';
import { generateShareUrl } from '../utils/storage';

interface GiftBoxRevealProps {
  config: BirthdayConfig;
  onOpenCustomizer: () => void;
}

export function GiftBoxReveal({ config, onOpenCustomizer }: GiftBoxRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenGift = () => {
    if (isOpen) return;
    setIsOpen(true);
    sound.playCelebrationPop();
    fireHeartConfetti();
    setTimeout(() => fireFireworks(), 600);
  };

  const handleShare = () => {
    const url = generateShareUrl(config);
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playSparkleChime();
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="gift-reveal" className="py-20 px-4 max-w-4xl mx-auto text-center relative">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Gift className="w-3.5 h-3.5 text-rose-600" />
          <span>The Grand Finale</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          One Last Special Surprise For You 🎁
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto">
          Tap the gift box below to unwrap your final birthday treasure and lifetime promise.
        </p>
      </div>

      {/* Interactive 3D Gift Box */}
      <div className="relative max-w-md mx-auto min-h-[320px] flex flex-col items-center justify-center">
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleOpenGift}
            className="group cursor-pointer flex flex-col items-center select-none"
          >
            {/* Pulsing Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-amber-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all" />

            {/* Gift Lid with Bow */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Ribbon Bow */}
              <div className="flex items-center justify-center -mb-2">
                <div className="w-10 h-7 rounded-full border-4 border-amber-300 bg-amber-400/80 shadow-md transform -rotate-20" />
                <div className="w-5 h-5 rounded-full bg-amber-500 shadow-inner z-10 -mx-1" />
                <div className="w-10 h-7 rounded-full border-4 border-amber-300 bg-amber-400/80 shadow-md transform rotate-20" />
              </div>

              {/* Gift Box Lid */}
              <div className="w-56 sm:w-64 h-12 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 rounded-t-xl shadow-lg border-b-4 border-rose-800 flex items-center justify-center relative">
                {/* Yellow vertical ribbon */}
                <div className="w-10 h-full bg-amber-400 shadow-sm" />
              </div>
            </div>

            {/* Gift Box Base */}
            <div className="w-48 sm:w-56 h-40 bg-gradient-to-b from-rose-700 via-rose-800 to-rose-900 rounded-b-2xl shadow-2xl relative overflow-hidden flex items-center justify-center border-t-2 border-rose-900">
              {/* Vertical yellow ribbon on box */}
              <div className="w-10 h-full bg-amber-400 shadow-md" />
              {/* Horizontal yellow ribbon on box */}
              <div className="absolute inset-x-0 h-8 bg-amber-400 shadow-md" />

              <span className="absolute text-white/90 text-xs font-serif-romantic font-bold tracking-wider z-10 bg-rose-950/60 px-2 py-1 rounded">
                TAP TO OPEN
              </span>
            </div>

            {/* Button below */}
            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Unwrap Birthday Gift</span>
            </button>
          </motion.div>
        ) : (
          /* Grand Finale Reveal Card */
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 14 }}
            className="w-full bg-[#fffefc] dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border-2 border-amber-300/80 dark:border-stone-700 shadow-[0_25px_60px_rgba(244,63,94,0.15)] text-left relative overflow-hidden"
          >
            {/* Top Crown Ribbon */}
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-mono uppercase tracking-widest text-rose-800 dark:text-rose-300 font-bold">
                  Official Lifetime Certificate of Love
                </span>
              </div>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            </div>

            {/* Finale Title */}
            <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {config.finaleMessageTitle}
            </h3>

            {/* Body */}
            <p className="font-casual text-lg sm:text-xl text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
              {config.finaleMessageBody}
            </p>

            {/* Highlighted Lifetime Promise */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-stone-800/80 dark:to-stone-800/40 border border-rose-200/80 dark:border-stone-700 mb-8">
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400 block mb-1">
                My Birthday Vow To You:
              </span>
              <p className="font-serif-romantic italic text-lg sm:text-xl text-rose-950 dark:text-rose-100 font-semibold leading-relaxed">
                "{config.finalePromise}"
              </p>
            </div>

            {/* Signatures */}
            <div className="flex items-end justify-between border-t border-rose-100 dark:border-stone-800 pt-6">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Recipient</span>
                <span className="font-handwriting text-2xl text-stone-800 dark:text-stone-200 font-bold">
                  {config.recipientName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">With All My Soul</span>
                <span className="font-handwriting text-3xl text-rose-700 dark:text-rose-400 font-bold">
                  {config.senderName} ❤️
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Surprise Link Copied!' : 'Send This Surprise to My Love'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Wrap Box Again</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
