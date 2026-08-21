import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Gift, ArrowRight } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';
import { getThemeStyles } from '../utils/themeStyles';

interface EnvelopeIntroProps {
  config: BirthdayConfig;
  onOpen: () => void;
  onOpenCustomizer?: () => void;
}

export function EnvelopeIntro({ config, onOpen, onOpenCustomizer }: EnvelopeIntroProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [isOpening, setIsOpening] = useState(false);
  const [hasCrackedSeal, setHasCrackedSeal] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    setHasCrackedSeal(true);
    sound.playWaxSealCrack();
    sound.startBackgroundMusic();
    fireHeartConfetti();

    setTimeout(() => {
      onOpen();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div className="relative max-w-md w-full flex flex-col items-center">
        {/* Soft magical glow behind envelope */}
        <div className="absolute -inset-6 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-amber-500/20 rounded-3xl blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full text-center"
        >
          {/* Top header prompt */}
          <div className="mb-6 space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs font-semibold tracking-wide shadow-sm`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 star-sparkle-anim" />
              <span>CONFIDENTIAL • FOR YOUR EYES ONLY</span>
            </motion.div>
            <h1 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-bold tracking-tight">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.sectionHeaderGradient} drop-shadow-sm`}>
                A Special Delivery ✨
              </span>
            </h1>
            <p className="text-stone-300 text-sm font-sans-clean">
              Tap the wax seal below to unlock your birthday surprise
            </p>
          </div>

          {/* Realistic Envelope Box */}
          <div className="relative w-full max-w-[360px] mx-auto h-[240px] sm:h-[260px] perspective-1000 select-none">
            {/* Envelope Base Body */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8ece6] to-[#edd6cb] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-amber-900/20 overflow-hidden flex flex-col justify-between p-5">
              {/* Postal Stamp Badge */}
              <div className="flex justify-between items-start">
                <div className="text-left space-y-0.5">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-stone-600">Air Mail</div>
                  <div className="text-xs font-serif-romantic italic text-rose-800 font-semibold">Priority Delivery of Love</div>
                </div>
                <div className="w-11 h-14 border-2 border-dashed border-rose-300/80 bg-rose-50 rounded flex flex-col items-center justify-center text-rose-600 shadow-inner">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span className="text-[8px] font-bold mt-0.5 tracking-tighter">LOVE 100¢</span>
                </div>
              </div>

              {/* Recipient Details (Handwritten Style) */}
              <div className="my-auto py-2 text-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold">Deliver to:</div>
                <div className="font-handwriting text-3xl sm:text-4xl text-rose-900 font-bold tracking-wide drop-shadow-sm">
                  {config.recipientName}
                </div>
                <div className="font-casual text-base text-stone-700 font-medium">
                  "{config.recipientNickname}"
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-1 tracking-wider">
                  FROM: {config.senderName.toUpperCase()} WITH ALL MY HEART
                </div>
              </div>

              {/* Envelope Flap crease lines */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <svg className="w-full h-full" viewBox="0 0 360 260" preserveAspectRatio="none">
                  <path d="M0,0 L180,130 L360,0" fill="none" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M0,260 L140,110" fill="none" stroke="#78350f" strokeWidth="1" />
                  <path d="M360,260 L220,110" fill="none" stroke="#78350f" strokeWidth="1" />
                </svg>
              </div>

              {/* Top Flap that lifts */}
              <AnimatePresence>
                {!hasCrackedSeal && (
                  <motion.div
                    exit={{ rotateX: 180, opacity: 0, transition: { duration: 0.6 } }}
                    className="absolute top-0 left-0 right-0 h-[130px] bg-gradient-to-b from-[#f2ded3] to-[#edd4c7] border-b border-amber-900/20 origin-top shadow-md clip-envelope-flap"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Emerging Letter on Open */}
              {isOpening && (
                <motion.div
                  initial={{ y: 80, opacity: 0, scale: 0.8 }}
                  animate={{ y: -60, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-lg shadow-2xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center z-10"
                >
                  <Gift className="w-8 h-8 text-rose-500 animate-bounce mb-2" />
                  <h3 className="font-serif-romantic text-rose-950 font-bold text-lg">Happy Birthday!</h3>
                  <p className="text-xs text-stone-600 font-casual text-base">Opening your birthday wonderland...</p>
                </motion.div>
              )}
            </div>

            {/* Interactive 3D Wax Seal Button */}
            <AnimatePresence>
              {!hasCrackedSeal && (
                <motion.button
                  id="open-envelope-wax-seal"
                  onClick={handleOpenEnvelope}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  exit={{ scale: 0, opacity: 0, rotate: 45 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group focus:outline-none"
                >
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 p-1 shadow-[0_10px_25px_rgba(225,29,72,0.6),0_0_20px_rgba(244,63,94,0.5)] border-2 border-rose-400/40 flex items-center justify-center group-hover:shadow-[0_0_35px_rgba(244,63,94,0.9)] transition-all">
                    {/* Wax Stamp Rim */}
                    <div className="w-full h-full rounded-full border border-rose-400/50 flex flex-col items-center justify-center bg-radial from-rose-600 to-rose-900 shadow-inner">
                      <Heart className="w-7 h-7 text-rose-100 fill-rose-200 drop-shadow-md group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-rose-200 tracking-wider uppercase font-serif-romantic mt-0.5">
                        SEAL
                      </span>
                    </div>

                    {/* Animated Pulsing Ring */}
                    <span className="absolute -inset-1 rounded-full border-2 border-rose-400/60 animate-ping opacity-60 pointer-events-none" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Action Prompt Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="envelope-open-button"
              onClick={handleOpenEnvelope}
              disabled={isOpening}
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} hover:brightness-110 text-white font-semibold text-sm sm:text-base shadow-[0_10px_25px_rgba(244,63,94,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer`}
            >
              <Heart className="w-4 h-4 fill-white animate-pulse" />
              <span>{isOpening ? 'Unfolding Your Surprise...' : 'Open Birthday Surprise ✨'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenCustomizer && (
              <button
                type="button"
                onClick={onOpenCustomizer}
                className="px-4 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-white/10 rounded-full border border-rose-400/30 transition-colors cursor-pointer"
              >
                ⚙️ Customization Studio
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
