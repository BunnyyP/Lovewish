import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Calendar, Clock, ChevronDown, ChevronUp, Feather } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

interface BirthdayHeroProps {
  config: BirthdayConfig;
  onScrollToCake: () => void;
}

export function BirthdayHero({ config, onScrollToCake }: BirthdayHeroProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(true);
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
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-950/80 border border-rose-300/60 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-sm mb-4"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        <span className="font-serif-romantic tracking-wide">A Celebration of You & Our Love</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
      </motion.div>

      {/* Main Birthday Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-serif-romantic text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight sm:leading-none mb-3"
      >
        Happy Birthday, <br />
        <span className="font-handwriting text-5xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 font-bold block mt-1">
          {config.recipientName}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-casual text-xl sm:text-2xl text-rose-800/80 dark:text-rose-300 max-w-2xl mx-auto mb-8 font-semibold"
      >
        "{config.recipientNickname} — Today the world is celebrating the most wonderful soul in it."
      </motion.p>

      {/* Love Milestone Counter Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-rose-200/80 dark:border-stone-800 shadow-[0_10px_30px_rgba(244,63,94,0.08)]">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Time Spent Loving You</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50/80 dark:bg-stone-800/60 border border-rose-100 dark:border-stone-700">
              <span className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-900 dark:text-rose-100 block">
                {timeTogether.days}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Days</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50/80 dark:bg-stone-800/60 border border-rose-100 dark:border-stone-700">
              <span className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-900 dark:text-rose-100 block">
                {timeTogether.hours}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Hours</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50/80 dark:bg-stone-800/60 border border-rose-100 dark:border-stone-700">
              <span className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-900 dark:text-rose-100 block">
                {timeTogether.minutes}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Minutes</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50/80 dark:bg-stone-800/60 border border-rose-100 dark:border-stone-700">
              <span className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 block animate-pulse">
                {timeTogether.seconds}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Seconds</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 font-casual text-base">
            ...and falling deeper in love with you with every heartbeat.
          </p>
        </div>
      </motion.div>

      {/* Heartfelt Love Letter (Parchment Styled Card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl mx-auto text-left relative"
      >
        <div className="relative bg-[#fffdfa] dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-amber-200/70 dark:border-stone-800 shadow-[0_20px_50px_rgba(244,63,94,0.1)] overflow-hidden">
          {/* Subtle paper line background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 28px)',
            }}
          />

          {/* Letter Top Controls */}
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                From the Heart
              </span>
            </div>
            <button
              onClick={() => setIsLetterOpen(!isLetterOpen)}
              className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-900 flex items-center gap-1 font-medium cursor-pointer"
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
                <h3 className="font-serif-romantic text-2xl sm:text-3xl text-rose-950 dark:text-rose-100 font-bold">
                  {config.loveLetterTitle}
                </h3>

                <div className="font-casual text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                  {config.loveLetterBody}
                </div>

                {/* Handwritten Signature */}
                <div className="pt-6 text-right">
                  <div className="text-xs text-stone-500 font-sans-clean uppercase tracking-wider">
                    Forever & Always Yours,
                  </div>
                  <div className="font-handwriting text-3xl sm:text-4xl text-rose-800 dark:text-rose-300 font-bold mt-1">
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
            className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm shadow-[0_10px_25px_rgba(244,63,94,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
              className="absolute pointer-events-none -top-2 text-rose-500 z-50"
            >
              💖
            </motion.div>
          ))}
        </div>

        <button
          onClick={onScrollToCake}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 dark:bg-stone-800/80 hover:bg-rose-50 dark:hover:bg-stone-700 text-rose-900 dark:text-rose-100 text-sm font-medium border border-rose-200/80 dark:border-stone-700 transition-all cursor-pointer shadow-xs"
        >
          <span>Go to Birthday Cake</span>
          <ChevronDown className="w-4 h-4 text-rose-500 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
