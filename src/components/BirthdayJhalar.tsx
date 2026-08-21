import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Star } from 'lucide-react';
import { BirthdayConfig, ThemeType } from '../types';
import { sound } from '../utils/audio';

interface BirthdayJhalarProps {
  config: BirthdayConfig;
}

export function BirthdayJhalar({ config }: BirthdayJhalarProps) {
  const [jigglingIndex, setJigglingIndex] = useState<number | null>(null);

  const getThemePalette = (theme?: ThemeType) => {
    switch (theme) {
      case 'midnight':
        return {
          flagBg: ['bg-purple-900', 'bg-indigo-900', 'bg-rose-900', 'bg-violet-950', 'bg-fuchsia-900'],
          flagText: 'text-amber-200',
          stringColor: 'border-purple-400/40',
          bulbColors: ['bg-amber-300 shadow-amber-300/80', 'bg-fuchsia-400 shadow-fuchsia-400/80', 'bg-cyan-300 shadow-cyan-300/80', 'bg-rose-400 shadow-rose-400/80'],
          accentHeart: 'text-rose-400',
        };
      case 'sunset':
        return {
          flagBg: ['bg-rose-600', 'bg-amber-500', 'bg-orange-500', 'bg-pink-600', 'bg-red-500'],
          flagText: 'text-amber-50',
          stringColor: 'border-amber-400/50',
          bulbColors: ['bg-amber-300 shadow-amber-300/80', 'bg-orange-400 shadow-orange-400/80', 'bg-rose-400 shadow-rose-400/80', 'bg-yellow-200 shadow-yellow-200/80'],
          accentHeart: 'text-amber-400',
        };
      case 'crimson':
        return {
          flagBg: ['bg-red-700', 'bg-rose-800', 'bg-red-900', 'bg-rose-900', 'bg-amber-700'],
          flagText: 'text-amber-200',
          stringColor: 'border-rose-400/50',
          bulbColors: ['bg-amber-300 shadow-amber-300/80', 'bg-rose-400 shadow-rose-400/80', 'bg-yellow-300 shadow-yellow-300/80', 'bg-red-400 shadow-red-400/80'],
          accentHeart: 'text-red-400',
        };
      case 'emerald':
        return {
          flagBg: ['bg-emerald-800', 'bg-teal-800', 'bg-emerald-900', 'bg-amber-800', 'bg-green-800'],
          flagText: 'text-amber-200',
          stringColor: 'border-emerald-400/40',
          bulbColors: ['bg-amber-300 shadow-amber-300/80', 'bg-emerald-300 shadow-emerald-300/80', 'bg-lime-200 shadow-lime-200/80', 'bg-yellow-200 shadow-yellow-200/80'],
          accentHeart: 'text-emerald-400',
        };
      case 'sakura':
        return {
          flagBg: ['bg-pink-400', 'bg-rose-300', 'bg-pink-500', 'bg-rose-400', 'bg-fuchsia-300'],
          flagText: 'text-white',
          stringColor: 'border-rose-300/60',
          bulbColors: ['bg-pink-300 shadow-pink-300/80', 'bg-white shadow-white/80', 'bg-rose-300 shadow-rose-300/80', 'bg-amber-200 shadow-amber-200/80'],
          accentHeart: 'text-pink-400',
        };
      case 'candyland':
        return {
          flagBg: ['bg-pink-500', 'bg-cyan-500', 'bg-amber-400', 'bg-purple-500', 'bg-emerald-400', 'bg-orange-400'],
          flagText: 'text-white',
          stringColor: 'border-pink-400/60',
          bulbColors: ['bg-pink-400 shadow-pink-400/80', 'bg-cyan-300 shadow-cyan-300/80', 'bg-yellow-300 shadow-yellow-300/80', 'bg-emerald-300 shadow-emerald-300/80'],
          accentHeart: 'text-pink-500',
        };
      case 'lavender':
        return {
          flagBg: ['bg-purple-400', 'bg-violet-400', 'bg-fuchsia-400', 'bg-indigo-400', 'bg-pink-400'],
          flagText: 'text-white',
          stringColor: 'border-purple-300/50',
          bulbColors: ['bg-purple-300 shadow-purple-300/80', 'bg-pink-200 shadow-pink-200/80', 'bg-amber-200 shadow-amber-200/80', 'bg-white shadow-white/80'],
          accentHeart: 'text-purple-400',
        };
      case 'vintage':
        return {
          flagBg: ['bg-amber-800', 'bg-stone-700', 'bg-amber-900', 'bg-stone-800', 'bg-yellow-900'],
          flagText: 'text-amber-100',
          stringColor: 'border-amber-700/40',
          bulbColors: ['bg-amber-300 shadow-amber-300/80', 'bg-yellow-200 shadow-yellow-200/80', 'bg-orange-300 shadow-orange-300/80'],
          accentHeart: 'text-amber-600',
        };
      case 'peach':
      case 'rose':
      default:
        return {
          flagBg: ['bg-rose-500', 'bg-pink-500', 'bg-rose-600', 'bg-pink-600', 'bg-amber-400'],
          flagText: 'text-white',
          stringColor: 'border-rose-400/50',
          bulbColors: ['bg-rose-300 shadow-rose-300/80', 'bg-amber-300 shadow-amber-300/80', 'bg-pink-300 shadow-pink-300/80', 'bg-yellow-200 shadow-yellow-200/80'],
          accentHeart: 'text-rose-500',
        };
    }
  };

  const palette = getThemePalette(config.theme);
  const nameToUse = (config.recipientNickname || config.recipientName || 'LOVE').toUpperCase();
  const letters = ['H', 'A', 'P', 'P', 'Y', '♥', 'B', 'I', 'R', 'T', 'H', 'D', 'A', 'Y'];

  const handleJiggle = (idx: number) => {
    setJigglingIndex(idx);
    sound.playSparkleChime();
    setTimeout(() => setJigglingIndex(null), 800);
  };

  return (
    <div className="relative w-full overflow-hidden select-none pointer-events-auto z-20 pt-1 pb-2">
      {/* 1. FAIRY LIGHT STRING (JHALAR) */}
      <div className="relative w-full flex items-center justify-between px-2 sm:px-6">
        {/* Curving Garland Wire */}
        <div className={`absolute top-2 left-0 right-0 h-4 border-b-2 border-dashed ${palette.stringColor} -z-10 rounded-[100%]`} />

        {/* Glowing Micro Fairy Lights Along Wire */}
        {Array.from({ length: 18 }).map((_, i) => {
          const bulbColor = palette.bulbColors[i % palette.bulbColors.length];
          return (
            <motion.div
              key={`light-${i}`}
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: (i * 0.12) % 1.5,
                ease: 'easeInOut',
              }}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${bulbColor} shadow-md shrink-0 mx-0.5 sm:mx-1 mt-1`}
            />
          );
        })}
      </div>

      {/* 2. FESTIVE BUNTING PENNANTS (JHALAR FLAGS) */}
      <div className="flex items-start justify-center flex-wrap gap-1 sm:gap-1.5 px-2 mt-1 sm:mt-1.5 max-w-4xl mx-auto">
        {letters.map((char, index) => {
          const bgClass = palette.flagBg[index % palette.flagBg.length];
          const isHeart = char === '♥';
          const isJiggling = jigglingIndex === index;

          return (
            <motion.button
              key={`flag-${index}`}
              type="button"
              onClick={() => handleJiggle(index)}
              whileHover={{ scale: 1.15, y: 3 }}
              animate={
                isJiggling
                  ? { rotate: [0, -15, 15, -8, 8, 0], scale: 1.25 }
                  : {
                      rotate: [index % 2 === 0 ? -2 : 2, index % 2 === 0 ? 2 : -2, index % 2 === 0 ? -2 : 2],
                    }
              }
              transition={
                isJiggling
                  ? { duration: 0.6 }
                  : {
                      duration: 2.5 + (index % 3) * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.08,
                    }
              }
              className={`relative cursor-pointer origin-top focus:outline-none transition-transform ${
                isHeart ? 'mx-0.5 sm:mx-1' : ''
              }`}
            >
              {/* Little string hook */}
              <div className="w-0.5 h-1.5 bg-stone-400/60 dark:bg-stone-500 mx-auto" />

              {/* Triangle / Banner Flag */}
              <div
                className={`relative px-1.5 sm:px-2.5 pt-1 pb-2 rounded-b-md shadow-md text-[11px] sm:text-sm font-black tracking-wider ${bgClass} ${palette.flagText} flex items-center justify-center min-w-[20px] sm:min-w-[26px]`}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
                }}
              >
                {isHeart ? (
                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-white animate-pulse" />
                ) : (
                  <span>{char}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 3. DANGLING MINI TASSELS / STARS / HEARTS */}
      <div className="flex justify-around items-start max-w-2xl mx-auto px-4 mt-0.5">
        {[
          { icon: Star, color: 'text-amber-400 fill-amber-400', len: 'h-4 sm:h-6', delay: 0 },
          { icon: Heart, color: 'text-rose-500 fill-rose-500', len: 'h-6 sm:h-9', delay: 0.3 },
          { icon: Sparkles, color: 'text-yellow-300', len: 'h-3 sm:h-5', delay: 0.6 },
          { icon: Heart, color: 'text-pink-500 fill-pink-500', len: 'h-7 sm:h-10', delay: 0.2 },
          { icon: Star, color: 'text-amber-400 fill-amber-400', len: 'h-4 sm:h-6', delay: 0.5 },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`dangle-${idx}`}
              animate={{
                rotate: [-6, 6, -6],
                y: [0, 2, 0],
              }}
              transition={{
                duration: 3 + idx * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay,
              }}
              className="flex flex-col items-center origin-top cursor-pointer"
              onClick={() => sound.playSparkleChime()}
            >
              <div className={`w-[1px] ${item.len} bg-gradient-to-b from-stone-300 via-rose-300 to-amber-300 dark:from-stone-600 dark:to-amber-400`} />
              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color} drop-shadow-sm`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
