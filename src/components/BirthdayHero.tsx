import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Calendar, Clock, ChevronDown, ChevronUp, Feather, Star } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';
import { getThemeStyles } from '../utils/themeStyles';

interface BirthdayHeroProps {
  config: BirthdayConfig;
  onScrollToCake: () => void;
}

export function BirthdayHero({ config, onScrollToCake }: BirthdayHeroProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(true);
  const themeStyles = getThemeStyles(config.theme);
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  // Calculate live counter based on relationshipStartDate
  useEffect(() => {
    const calculateTime = () => {
      const start = config.relationshipStartDate
        ? new Date(config.relationshipStartDate).getTime()
        : new Date('2023-01-01').getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.relationshipStartDate]);

  const handleSendHeart = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newId = Date.now();
    setFloatingHearts((prev) => [...prev, { id: newId, x }]);
    sound.playSparkleChime();
    fireHeartConfetti();

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 2000);
  };

  return (
    <section id="hero-letter" className="relative pt-6 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Decorative Top Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs sm:text-sm font-medium shadow-sm mb-4`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
        <span className="font-serif-romantic tracking-wide font-semibold">A Celebration of You & Our Love</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
      </motion.div>

      {/* Main Birthday Title with Glowing & Shimmering Animated Font */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-serif-romantic text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight sm:leading-none mb-3"
      >
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.heroTitleGradient} drop-shadow-sm`}>
          Happy Birthday,
        </span>
        <br />
        <span
          className={`font-handwriting text-5xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r ${themeStyles.nameGradient} ${themeStyles.nameGlowClass} font-shimmer-sparkle font-bold block mt-1 py-1 font-letter-wave`}
        >
          {config.recipientName}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`font-casual text-xl sm:text-2xl ${themeStyles.subtitleColor} max-w-2xl mx-auto mb-8 font-semibold`}
      >
        "{config.recipientNickname} — Today the world is celebrating the most wonderful soul in it."
      </motion.p>

      {/* Love Milestone Counter Cards with Theme-Synchronized Lighting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className={`${themeStyles.cardBg} rounded-2xl p-4 sm:p-5 border ${themeStyles.cardBorder} shadow-lg`}>
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className={themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'}>Time Spent Loving You</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-xl ${themeStyles.counterCardBg} border transition-all hover:scale-105`}>
              <span className={`font-serif-romantic text-2xl sm:text-3xl font-bold ${themeStyles.counterNumberColor} block`}>
                {timeTogether.days}
              </span>
              <span className={`text-[10px] sm:text-xs ${themeStyles.counterLabelColor} font-medium`}>Days</span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${themeStyles.counterCardBg} border transition-all hover:scale-105`}>
              <span className={`font-serif-romantic text-2xl sm:text-3xl font-bold ${themeStyles.counterNumberColor} block`}>
                {timeTogether.hours}
              </span>
              <span className={`text-[10px] sm:text-xs ${themeStyles.counterLabelColor} font-medium`}>Hours</span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${themeStyles.counterCardBg} border transition-all hover:scale-105`}>
              <span className={`font-serif-romantic text-2xl sm:text-3xl font-bold ${themeStyles.counterNumberColor} block`}>
                {timeTogether.minutes}
              </span>
              <span className={`text-[10px] sm:text-xs ${themeStyles.counterLabelColor} font-medium`}>Minutes</span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${themeStyles.counterCardBg} border transition-all hover:scale-105`}>
              <span className={`font-serif-romantic text-2xl sm:text-3xl font-bold ${themeStyles.counterNumberColor} block animate-pulse`}>
                {timeTogether.seconds}
              </span>
              <span className={`text-[10px] sm:text-xs ${themeStyles.counterLabelColor} font-medium`}>Seconds</span>
            </div>
          </div>

          <p className={`text-xs mt-3 font-casual text-lg font-semibold ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'}`}>
            ...and falling deeper in love with you with every heartbeat. ✨
          </p>
        </div>
      </motion.div>

      {/* Heartfelt Love Letter (Parchment Styled Card with High Contrast & Glowing Signature) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl mx-auto text-left relative"
      >
        <div className={`relative ${themeStyles.letterPaperBg} rounded-3xl p-6 sm:p-10 border ${themeStyles.letterPaperBorder} overflow-hidden`}>
          {/* Subtle paper line background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 28px)',
            }}
          />

          {/* Letter Top Controls */}
          <div className="flex items-center justify-between border-b border-stone-300/30 dark:border-stone-700/50 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Feather className={`w-5 h-5 ${themeStyles.isDark ? 'text-purple-300' : 'text-rose-600'}`} />
              <span className={`text-xs font-mono uppercase tracking-widest font-bold ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                From the Heart
              </span>
            </div>
            <button
              onClick={() => setIsLetterOpen(!isLetterOpen)}
              className={`text-xs flex items-center gap-1 font-semibold cursor-pointer ${themeStyles.isDark ? 'text-purple-300 hover:text-purple-200' : 'text-rose-700 hover:text-rose-900'}`}
            >
              <span>{isLetterOpen ? 'Fold Letter' : 'Unfold Letter'}</span>
              {isLetterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Letter Body */}
          <AnimatePresence>
            {isLetterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={`font-serif-romantic text-2xl sm:text-3xl font-bold ${themeStyles.letterTitleColor}`}>
                  {config.loveLetterTitle}
                </h3>

                <div className={`font-casual text-lg sm:text-xl ${themeStyles.letterBodyColor} leading-relaxed whitespace-pre-line font-medium`}>
                  {config.loveLetterBody}
                </div>

                {/* Handwritten Signature with Glowing Lighting Font */}
                <div className="pt-6 text-right">
                  <div className={`text-xs font-sans-clean uppercase tracking-wider font-semibold ${themeStyles.isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    Forever & Always Yours,
                  </div>
                  <div className={`font-handwriting text-3xl sm:text-4xl ${themeStyles.letterSignatureColor} font-bold mt-1 inline-block`}>
                    {config.senderName} ❤️
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Interactive Floating Heart Button */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="relative">
          <button
            id="send-love-heart-btn"
            onClick={handleSendHeart}
            className={`group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white font-semibold text-sm shadow-[0_10px_25px_rgba(244,63,94,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer`}
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
            <span>Send Birthday Kisses & Love</span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </button>

          {/* Floating Hearts Animation */}
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -120, opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ left: `${h.x}px` }}
              className="absolute pointer-events-none -top-2 text-rose-500 z-50 text-xl"
            >
              💖
            </motion.div>
          ))}
        </div>

        <button
          onClick={onScrollToCake}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full ${themeStyles.cardBg} ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-800'} text-sm font-semibold border ${themeStyles.cardBorder} transition-all cursor-pointer shadow-sm hover:scale-105`}
        >
          <span>Go to Birthday Cake</span>
          <ChevronDown className="w-4 h-4 text-rose-500 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
