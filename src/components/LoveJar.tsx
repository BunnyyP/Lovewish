import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, X, ChevronRight, Shuffle } from 'lucide-react';
import { BirthdayConfig, LoveReason } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';
import { getThemeStyles } from '../utils/themeStyles';

interface LoveJarProps {
  config: BirthdayConfig;
  onOpenCustomizer: () => void;
}

export function LoveJar({ config, onOpenCustomizer }: LoveJarProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [selectedReason, setSelectedReason] = useState<LoveReason | null>(null);
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());
  const [isScratchRevealed, setIsScratchRevealed] = useState(false);

  const handleOpenReason = (reason: LoveReason) => {
    sound.playSparkleChime();
    setSelectedReason(reason);
    setOpenedIds((prev) => new Set(prev).add(reason.id));
  };

  const handleDrawRandom = () => {
    const unread = config.reasons.filter((r) => !openedIds.has(r.id));
    const pool = unread.length > 0 ? unread : config.reasons;
    const random = pool[Math.floor(Math.random() * pool.length)];
    handleOpenReason(random);
  };

  const handleScratch = () => {
    if (!isScratchRevealed) {
      setIsScratchRevealed(true);
      sound.playCelebrationPop();
      fireHeartConfetti();
    }
  };

  return (
    <section id="love-jar" className="py-16 px-4 max-w-5xl mx-auto text-center relative">
      {/* Header */}
      <div className="mb-12">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs font-semibold uppercase tracking-wider mb-2`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 star-sparkle-anim" />
          <span>Fairy Light Love Jar</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.sectionHeaderGradient} drop-shadow-sm`}>
            Reasons Why I Love You ✨
          </span>
        </h2>
        <p className={`text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto font-medium ${themeStyles.sectionSubtitleColor}`}>
          Every note in this glowing jar holds one of the endless reasons my heart belongs to you. Pick an origami heart to open!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Glowing Glass Jar Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className={`relative w-64 sm:w-72 h-84 ${themeStyles.cardBg} rounded-3xl rounded-t-xl border-4 ${themeStyles.cardBorder} shadow-2xl backdrop-blur-md p-4 flex flex-col justify-between overflow-hidden`}>
            {/* Jar Lid / Cork */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-amber-800 rounded-b-md shadow-md border-b-2 border-amber-950 flex items-center justify-center">
              <span className="text-[9px] uppercase font-bold text-amber-200 tracking-widest">Love Notes Jar</span>
            </div>

            {/* Twinkle Fairy Lights in Jar */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-12 left-8 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_12px_#fde047] animate-pulse" />
              <div className="absolute top-24 right-10 w-2.5 h-2.5 rounded-full bg-pink-300 shadow-[0_0_10px_#f472b6] animate-pulse" style={{ animationDelay: '0.6s' }} />
              <div className="absolute bottom-16 left-12 w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_14px_#fef08a] animate-pulse" style={{ animationDelay: '1.2s' }} />
              <div className="absolute bottom-24 right-8 w-2 h-2 rounded-full bg-rose-300 shadow-[0_0_8px_#fb7185] animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>

            {/* Floating Origami Hearts Inside Jar */}
            <div className="relative flex-1 flex flex-wrap items-center justify-center gap-3 pt-10 pb-4">
              {config.reasons.map((reason, idx) => {
                const isOpened = openedIds.has(reason.id);
                return (
                  <motion.button
                    key={reason.id}
                    onClick={() => handleOpenReason(reason)}
                    whileHover={{ scale: 1.18, rotate: idx % 2 === 0 ? 10 : -10 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all shadow-md flex items-center justify-center ${
                      isOpened
                        ? `${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} text-rose-400`
                        : `bg-gradient-to-tr ${themeStyles.accentBtnGradient} text-white shadow-rose-500/30 animate-pulse-glow`
                    }`}
                    title={reason.title}
                  >
                    <Heart className={`w-5 h-5 ${isOpened ? 'fill-rose-400' : 'fill-white'}`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Jar Base label */}
            <div className={`text-center pt-2 border-t ${themeStyles.isDark ? 'border-stone-800 text-stone-300' : 'border-rose-200/50 text-stone-800'} text-xs font-serif-romantic font-semibold`}>
              <span className="font-glow-gold">{openedIds.size} of {config.reasons.length} Notes Unwrapped ❤️</span>
            </div>
          </div>

          {/* Random Draw Button */}
          <button
            id="draw-random-love-note-btn"
            onClick={handleDrawRandom}
            className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Draw a Surprise Love Note</span>
          </button>
        </div>

        {/* Right Column: Reasons List Cards + Scratch Card */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {config.reasons.map((reason, index) => {
              const isOpened = openedIds.has(reason.id);
              return (
                <div
                  key={reason.id}
                  onClick={() => handleOpenReason(reason)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isOpened
                      ? `${themeStyles.cardBg} ${themeStyles.cardBorder} shadow-sm`
                      : `${themeStyles.cardHighlightBg} border-dashed ${themeStyles.cardBorder} hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isOpened
                          ? `${themeStyles.badgeBg} ${themeStyles.badgeText}`
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-serif-romantic font-bold text-sm sm:text-base ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {reason.title}
                      </h4>
                      {isOpened ? (
                        <p className={`font-casual text-base mt-1 line-clamp-2 ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                          {reason.message}
                        </p>
                      ) : (
                        <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <span>Tap to reveal reason</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Scratch-off Love Ticket */}
          <div className={`mt-6 p-5 rounded-3xl ${themeStyles.cardHighlightBg} border-2 border-dashed ${themeStyles.cardBorder} text-center relative overflow-hidden`}>
            <div className={`text-xs uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1.5 ${themeStyles.isDark ? 'text-rose-300' : 'text-rose-800'}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 star-sparkle-anim" />
              <span>Secret Scratch-Off Bonus Message</span>
            </div>

            {!isScratchRevealed ? (
              <button
                id="scratch-love-card-btn"
                onClick={handleScratch}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 dark:from-stone-700 dark:to-stone-800 text-stone-900 dark:text-stone-100 font-serif-romantic text-sm font-bold shadow-inner border border-amber-300/60 hover:brightness-105 active:scale-98 transition-transform cursor-pointer"
              >
                ✨ Click to Scratch & Reveal Golden Message ✨
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`mt-2 p-4 ${themeStyles.cardBg} rounded-2xl border ${themeStyles.cardBorder} shadow-md`}
              >
                <p className="font-casual text-xl sm:text-2xl font-bold font-glow-gold">
                  "If I had a flower for every time I thought of you, I could walk through my garden forever." 🌹
                </p>
                <span className={`text-xs mt-1 block font-sans-clean ${themeStyles.isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  You are my favorite thought today and every day.
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Unfolded Origami Note Dialog Modal */}
      <AnimatePresence>
        {selectedReason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReason(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, rotate: -3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-md w-full ${themeStyles.cardBg} rounded-3xl p-6 sm:p-8 shadow-2xl border ${themeStyles.cardBorder} text-center`}
            >
              <button
                onClick={() => setSelectedReason(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mb-4 shadow-inner">
                <Heart className="w-7 h-7 fill-rose-500 text-rose-500 animate-bounce" />
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-bold">
                Reason Why I Love You
              </span>

              <h3 className={`font-serif-romantic text-2xl sm:text-3xl font-bold mt-1 mb-4 ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                {selectedReason.title}
              </h3>

              <div className={`p-4 rounded-2xl ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                <p className="font-casual text-xl sm:text-2xl leading-relaxed">
                  "{selectedReason.message}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setSelectedReason(null)}
                  className={`px-6 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md`}
                >
                  Keep in My Heart ❤️
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
