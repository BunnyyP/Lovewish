import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, MicOff, RefreshCw, Heart, Check, Flame, Film, Wind, Sliders } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti, fireFireworks } from '../utils/confetti';
import { CelebrationVideoModal } from './CelebrationVideoModal';
import { getThemeStyles } from '../utils/themeStyles';
import { micBlowManager, MicPermissionStatus } from '../utils/micManager';

interface InteractiveCakeProps {
  config: BirthdayConfig;
}

export function InteractiveCake({ config }: InteractiveCakeProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [candles, setCandles] = useState([
    { id: 1, lit: true, color: 'bg-rose-400', height: 48 },
    { id: 2, lit: true, color: 'bg-amber-400', height: 56 },
    { id: 3, lit: true, color: 'bg-pink-400', height: 50 },
    { id: 4, lit: true, color: 'bg-purple-400', height: 54 },
    { id: 5, lit: true, color: 'bg-rose-400', height: 46 },
  ]);

  const [wishText, setWishText] = useState('');
  const [wishSaved, setWishSaved] = useState(false);
  const [allBlownOut, setAllBlownOut] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Real-time Mic Blow States
  const [micStatus, setMicStatus] = useState<MicPermissionStatus>(() => micBlowManager.getStatus());
  const [liveBlowLevel, setLiveBlowLevel] = useState(0);
  const [sensitivityPreset, setSensitivityPreset] = useState<'high' | 'normal' | 'low'>('high');

  // Sync mic permission and status
  useEffect(() => {
    const unsubStatus = micBlowManager.onStatusChange((status) => {
      setMicStatus(status);
    });
    return unsubStatus;
  }, []);

  // Update sensitivity threshold
  useEffect(() => {
    if (sensitivityPreset === 'high') {
      micBlowManager.setSensitivity(35); // Very responsive to gentle air puff
    } else if (sensitivityPreset === 'normal') {
      micBlowManager.setSensitivity(48);
    } else {
      micBlowManager.setSensitivity(65);
    }
  }, [sensitivityPreset]);

  // Hook real-time blow events to extinguish candles
  useEffect(() => {
    const unsubBlow = micBlowManager.onBlow((level, isStrongBlow) => {
      setLiveBlowLevel(level);

      // Only extinguish if candles are currently lit
      if (!allBlownOut && (isStrongBlow || level >= micBlowManager.getSensitivity())) {
        // Sequentially extinguish candles with realistic stagger
        extinguishCandlesSequentially();
      }
    });

    return unsubBlow;
  }, [allBlownOut]);

  // Sequentially extinguish candles for realism
  const extinguishCandlesSequentially = () => {
    sound.playBlowCandle();
    setCandles((prev) => {
      const anyLit = prev.some((c) => c.lit);
      if (!anyLit) return prev;
      return prev.map((c) => ({ ...c, lit: false }));
    });
  };

  // Check if all candles are blown out
  useEffect(() => {
    const unlitCount = candles.filter((c) => !c.lit).length;
    if (unlitCount === candles.length && !allBlownOut) {
      setAllBlownOut(true);
      sound.playCelebrationPop();
      fireHeartConfetti();
      setTimeout(() => fireFireworks(), 400);

      // Trigger Celebration Video Modal when candles are blown out!
      const autoplayVideo = config.celebrationVideoAutoplay !== false;
      if (autoplayVideo) {
        setTimeout(() => {
          setIsVideoModalOpen(true);
        }, 700);
      }
    }
  }, [candles, allBlownOut, config.celebrationVideoAutoplay]);

  // Handle single candle tap
  const toggleCandle = (id: number) => {
    setCandles((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.lit) {
            sound.playBlowCandle();
          } else {
            sound.playSparkleChime();
          }
          return { ...c, lit: !c.lit };
        }
        return c;
      })
    );
  };

  // Blow out all candles at once
  const blowAllCandles = () => {
    sound.playBlowCandle();
    setCandles((prev) => prev.map((c) => ({ ...c, lit: false })));
  };

  // Relight all candles
  const relightCandles = () => {
    sound.playSparkleChime();
    setCandles((prev) => prev.map((c) => ({ ...c, lit: true })));
    setAllBlownOut(false);
  };

  // Save birthday wish
  const handleSaveWish = (e: FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;
    setWishSaved(true);
    sound.playSparkleChime();
    blowAllCandles();
  };

  const handleToggleMic = async () => {
    sound.primeAudio();
    if (micStatus === 'listening') {
      micBlowManager.stopListening();
    } else {
      const granted = await micBlowManager.requestMicPermission();
      if (granted) {
        sound.playSparkleChime();
      }
    }
  };

  const isMicActive = micStatus === 'listening';

  return (
    <section id="birthday-cake" className="py-16 px-4 max-w-4xl mx-auto text-center relative">
      {/* Section Header */}
      <div className="mb-10">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs font-semibold uppercase tracking-wider mb-2`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
          <span>Make A Wish</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.sectionHeaderGradient} drop-shadow-sm`}>
            Blow Out The Candles 🎂
          </span>
        </h2>
        <p className={`text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto font-medium ${themeStyles.sectionSubtitleColor}`}>
          Tap each candle or make your heartfelt wish below to blow them out and start the year with endless blessings.
        </p>
      </div>

      {/* Interactive Birthday Cake Container */}
      <div className={`relative max-w-lg mx-auto ${themeStyles.cardBg} rounded-3xl p-6 sm:p-10 border ${themeStyles.cardBorder} shadow-2xl`}>
        {/* Glow ambient background when candles lit */}
        {!allBlownOut && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-400/25 blur-3xl rounded-full pointer-events-none" />
        )}

        {/* The Candle Row */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 h-28 mb-[-8px] relative z-20">
          {candles.map((candle) => {
            // Dynamic flame tilt and scale based on live air puff / blow level
            const flameTilt = liveBlowLevel > 10 ? (candle.id % 2 === 0 ? 15 : -15) * (liveBlowLevel / 50) : 0;
            const flameScale = liveBlowLevel > 10 ? Math.max(0.3, 1 - (liveBlowLevel / 80)) : 1;

            return (
              <div
                key={candle.id}
                onClick={() => toggleCandle(candle.id)}
                className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none"
                title={candle.lit ? 'Click or blow into mic to extinguish' : 'Click to relight'}
              >
                {/* Flame / Smoke */}
                <div className="h-10 flex items-center justify-center relative">
                  {candle.lit ? (
                    <motion.div
                      animate={{
                        rotate: flameTilt,
                        scaleY: flameScale,
                        scaleX: liveBlowLevel > 20 ? 0.8 : 1,
                      }}
                      transition={{ duration: 0.08 }}
                      className="relative"
                    >
                      {/* Outer Glow */}
                      <div className="absolute -inset-2 bg-amber-400/50 rounded-full blur-md animate-pulse" />
                      {/* Flame shape with wind flicker */}
                      <div className="w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 animate-flame shadow-[0_0_12px_#f59e0b]" />
                    </motion.div>
                  ) : (
                    /* Smoke puff animation */
                    <motion.div
                      initial={{ y: 0, opacity: 0.8, scale: 0.5 }}
                      animate={{ y: -25, opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="text-stone-400 text-xs font-mono select-none"
                    >
                      💨
                    </motion.div>
                  )}
                </div>

                {/* Candle Wick */}
                <div className="w-0.5 h-2 bg-stone-700" />

                {/* Candle Stick */}
                <div
                  style={{ height: `${candle.height}px` }}
                  className={`w-4 sm:w-5 rounded-t-sm rounded-b-xs shadow-md border-x border-t border-white/40 ${candle.color} relative overflow-hidden`}
                >
                  {/* Spiral stripes */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 3px, transparent 3px, transparent 8px)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3D Tiered Cake Illustration */}
        <div className="relative flex flex-col items-center">
          {/* Top Cake Tier */}
          <div className="w-48 sm:w-56 h-18 bg-gradient-to-r from-rose-200 via-rose-100 to-rose-200 rounded-t-2xl shadow-inner border-t-4 border-rose-300 relative flex items-center justify-center">
            {/* Strawberry Cream Frosting Drips */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-2 text-rose-300">
              <span className="text-sm">🍓</span>
              <span className="text-sm">✨</span>
              <span className="text-sm">🍓</span>
              <span className="text-sm">✨</span>
              <span className="text-sm">🍓</span>
            </div>
            <div className="font-handwriting text-rose-900 font-bold text-xl sm:text-2xl mt-4 font-shimmer-sparkle">
              Happy Birthday!
            </div>
          </div>

          {/* Middle Cake Tier */}
          <div className="w-64 sm:w-76 h-22 bg-gradient-to-r from-[#ffe4e6] via-[#fecdd3] to-[#ffe4e6] rounded-t-xl shadow-md border-t-4 border-rose-400 relative flex flex-col items-center justify-center">
            <div className="flex gap-4 text-sm font-serif-romantic text-rose-950 font-bold tracking-wide">
              <span className="font-glow-gold">★ {config.recipientName} ★</span>
            </div>
            {/* White Pearls / Cherries */}
            <div className="absolute bottom-2 flex gap-3 text-rose-500 text-xs">
              <span>💖</span>
              <span>🌸</span>
              <span>💖</span>
              <span>🌸</span>
              <span>💖</span>
            </div>
          </div>

          {/* Bottom Cake Plate / Platter */}
          <div className="w-76 sm:w-92 h-6 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 rounded-full shadow-lg border border-amber-300/80 flex items-center justify-center">
            <div className="w-3/4 h-1 bg-amber-300/60 rounded-full" />
          </div>
        </div>

        {/* Real-time Breath / Blow Intensity Gauge (HUD) */}
        {!allBlownOut && isMicActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-3 rounded-2xl bg-stone-900/80 border border-rose-500/30 backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-1">
              <span className="flex items-center gap-1.5 text-rose-300">
                <Wind className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Realtime Breath Gauge (Phoonk Meter)</span>
              </span>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                liveBlowLevel >= 35 ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-800 text-stone-300'
              }`}>
                {liveBlowLevel > 0 ? `${liveBlowLevel}%` : 'Waiting for breath...'}
              </span>
            </div>

            {/* Live Breath Meter Bar */}
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, liveBlowLevel)}%` }}
              />
              {/* Trigger Threshold Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-glow"
                style={{ left: `${sensitivityPreset === 'high' ? 35 : sensitivityPreset === 'normal' ? 48 : 65}%` }}
                title="Blow Threshold to Extinguish"
              />
            </div>

            <p className="text-[11px] text-stone-400 mt-2 font-sans-clean flex items-center justify-center gap-1">
              <span>💨 Phone / Laptop ke mic par jor se phoonk mariye!</span>
            </p>
          </motion.div>
        )}

        {/* Celebration Announcement Banner */}
        <AnimatePresence>
          {allBlownOut && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className={`mt-8 p-5 bg-gradient-to-r ${themeStyles.accentBtnGradient} rounded-2xl text-white shadow-xl text-center`}
            >
              <div className="flex items-center justify-center gap-1.5 text-amber-200 text-sm font-semibold mb-1">
                <Sparkles className="w-4 h-4 star-sparkle-anim" />
                <span className="tracking-wider">ALL WISHES GRANTED!</span>
                <Sparkles className="w-4 h-4 star-sparkle-anim" />
              </div>
              <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold font-glow-gold">
                May all your birthday dreams come true, my love! 🎉
              </h3>
              <p className="text-white/90 text-xs sm:text-sm mt-1 font-medium">
                Every candle extinguished is another year of happiness, love, and memories together.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls (Blow All, Relight, Mic Blow, Watch Video, Sensitivity) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!allBlownOut ? (
            <button
              id="blow-candles-button"
              onClick={blowAllCandles}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer`}
            >
              <Flame className="w-4 h-4" />
              <span>Blow All (Manual)</span>
            </button>
          ) : (
            <>
              <button
                id="relight-candles-button"
                onClick={relightCandles}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Relight Candles</span>
              </button>

              <button
                id="open-video-modal-button"
                onClick={() => setIsVideoModalOpen(true)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse`}
              >
                <Film className="w-4 h-4 text-amber-200" />
                <span>Watch Birthday Video 🐿️🎬</span>
              </button>
            </>
          )}

          {/* Real-time Mic Blow Button */}
          <button
            id="mic-blow-detect-button"
            onClick={handleToggleMic}
            title={isMicActive ? 'Microphone is active! Blow onto your mic to extinguish candles.' : 'Click to enable real-time mic blow'}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-md ${
              isMicActive
                ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/50 animate-pulse'
                : `${themeStyles.cardHighlightBg} ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-800'} ${themeStyles.cardBorder} hover:scale-105`
            }`}
          >
            {isMicActive ? <Mic className="w-4 h-4 animate-bounce text-amber-200" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicActive ? 'Mic Active • Blow Now! 💨' : 'Enable Mic Blow 🎙️'}</span>
          </button>

          {/* Sensitivity Preset Switcher */}
          {isMicActive && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-800/80 border border-stone-700 text-[11px] text-stone-300">
              <Sliders className="w-3 h-3 text-amber-400" />
              <button
                onClick={() => setSensitivityPreset('high')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  sensitivityPreset === 'high' ? 'bg-rose-500 text-white font-bold' : 'hover:text-white'
                }`}
                title="Halka Phoonk (Very sensitive)"
              >
                Sensitive
              </button>
              <button
                onClick={() => setSensitivityPreset('normal')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  sensitivityPreset === 'normal' ? 'bg-rose-500 text-white font-bold' : 'hover:text-white'
                }`}
                title="Normal Phoonk"
              >
                Normal
              </button>
            </div>
          )}
        </div>

        {/* Secret Birthday Wish Input Form */}
        <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-700/60 text-left">
          <div className={`text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5 ${themeStyles.isDark ? 'text-rose-300' : 'text-rose-800'}`}>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Secret Birthday Wish (Private & Cherished)</span>
          </div>

          {!wishSaved ? (
            <form onSubmit={handleSaveWish} className="flex gap-2">
              <input
                type="text"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder={config.secretWishPrompt || "Type your secret wish here before blowing..."}
                className={`flex-1 px-4 py-2.5 rounded-xl ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 ${themeStyles.isDark ? 'text-stone-100 placeholder-stone-400' : 'text-stone-900 placeholder-stone-500'}`}
              />
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 hover:scale-105 shadow-md`}
              >
                Seal Wish ✨
              </button>
            </form>
          ) : (
            <div className={`p-3.5 rounded-xl ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} flex items-center gap-2.5 text-xs sm:text-sm ${themeStyles.isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your secret wish: <strong className="italic">"{wishText}"</strong> has been safely stored in the universe's stars! 🌟
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Video Modal */}
      <CelebrationVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        config={config}
        onRelightCandles={relightCandles}
      />
    </section>
  );
}
