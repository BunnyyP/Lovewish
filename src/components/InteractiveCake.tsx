import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, MicOff, RefreshCw, Heart, Check, Flame } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti, fireFireworks } from '../utils/confetti';

interface InteractiveCakeProps {
  config: BirthdayConfig;
}

export function InteractiveCake({ config }: InteractiveCakeProps) {
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
  const [isListeningMic, setIsListeningMic] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if all candles are blown out
  useEffect(() => {
    const unlitCount = candles.filter((c) => !c.lit).length;
    if (unlitCount === candles.length && !allBlownOut) {
      setAllBlownOut(true);
      sound.playCelebrationPop();
      fireHeartConfetti();
      setTimeout(() => fireFireworks(), 400);
    }
  }, [candles, allBlownOut]);

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

  // Microphone Blow Detection
  const toggleMicBlowDetection = async () => {
    if (isListeningMic) {
      stopMic();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListeningMic(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let blowDetectionTimer: number;

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Blow detection: microphone volume spike (puff of air)
        if (average > 55) {
          blowAllCandles();
          stopMic();
          return;
        }

        blowDetectionTimer = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (err) {
      console.warn('Mic permission not granted or unavailable', err);
      setIsListeningMic(false);
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListeningMic(false);
  };

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <section id="birthday-cake" className="py-16 px-4 max-w-4xl mx-auto text-center relative">
      {/* Section Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Make A Wish</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          Blow Out The Candles 🎂
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto">
          Tap each candle or make your heartfelt wish below to blow them out and start the year with endless blessings.
        </p>
      </div>

      {/* Interactive Birthday Cake Container */}
      <div className="relative max-w-lg mx-auto bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-amber-50/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 rounded-3xl p-6 sm:p-10 border border-rose-200/80 dark:border-stone-800 shadow-[0_20px_60px_rgba(244,63,94,0.12)]">
        {/* Glow ambient background when candles lit */}
        {!allBlownOut && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-400/25 blur-3xl rounded-full pointer-events-none" />
        )}

        {/* The Candle Row */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 h-28 mb-[-8px] relative z-20">
          {candles.map((candle) => (
            <div
              key={candle.id}
              onClick={() => toggleCandle(candle.id)}
              className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none"
              title={candle.lit ? 'Click to blow out candle' : 'Click to relight'}
            >
              {/* Flame / Smoke */}
              <div className="h-10 flex items-center justify-center relative">
                {candle.lit ? (
                  <div className="relative">
                    {/* Outer Glow */}
                    <div className="absolute -inset-2 bg-amber-400/50 rounded-full blur-md animate-pulse" />
                    {/* Flame shape */}
                    <div className="w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 animate-flame shadow-[0_0_12px_#f59e0b]" />
                  </div>
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
          ))}
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
            <div className="font-handwriting text-rose-800 font-bold text-xl sm:text-2xl mt-4">
              Happy Birthday!
            </div>
          </div>

          {/* Middle Cake Tier */}
          <div className="w-64 sm:w-76 h-22 bg-gradient-to-r from-[#ffe4e6] via-[#fecdd3] to-[#ffe4e6] rounded-t-xl shadow-md border-t-4 border-rose-400 relative flex flex-col items-center justify-center">
            <div className="flex gap-4 text-xs font-serif-romantic text-rose-900 font-bold">
              <span>★ {config.recipientName} ★</span>
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

        {/* Celebration Announcement Banner */}
        <AnimatePresence>
          {allBlownOut && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mt-8 p-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-2xl text-white shadow-xl text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-amber-200 text-sm font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>ALL WISHES GRANTED!</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold">
                May all your birthday dreams come true, my love! 🎉
              </h3>
              <p className="text-rose-100 text-xs sm:text-sm mt-1">
                Every candle extinguished is another year of happiness, love, and memories together.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls (Blow All, Relight, Mic Blow) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!allBlownOut ? (
            <button
              id="blow-candles-button"
              onClick={blowAllCandles}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-medium shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Blow All Candles</span>
            </button>
          ) : (
            <button
              id="relight-candles-button"
              onClick={relightCandles}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-medium shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Relight Candles</span>
            </button>
          )}

          <button
            id="mic-blow-detect-button"
            onClick={toggleMicBlowDetection}
            title="Blow into your microphone to extinguish candles!"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
              isListeningMic
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-rose-50'
            }`}
          >
            {isListeningMic ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span>{isListeningMic ? 'Listening... (Blow into mic!)' : 'Use Mic to Blow'}</span>
          </button>
        </div>

        {/* Secret Birthday Wish Input Form */}
        <div className="mt-8 pt-6 border-t border-rose-200/60 dark:border-stone-800 text-left">
          <div className="text-xs uppercase tracking-wider font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-rose-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-800 dark:text-stone-100 placeholder-stone-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
              >
                Seal Wish ✨
              </button>
            </form>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your secret wish: <strong className="italic">"{wishText}"</strong> has been safely stored in the universe's stars! 🌟
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
