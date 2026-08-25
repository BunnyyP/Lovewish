import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mic,
  MicOff,
  RefreshCw,
  Heart,
  Check,
  Flame,
  Film,
  Cake as CakeIcon,
  Crown,
  PartyPopper,
} from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti, fireFireworks } from '../utils/confetti';
import { CelebrationVideoModal } from './CelebrationVideoModal';
import { getThemeStyles } from '../utils/themeStyles';

interface InteractiveCakeProps {
  config: BirthdayConfig;
  onSaveWish?: (wish: string) => void;
}

// 4 Deluxe Cake Flavor Styles
type CakeFlavor = 'strawberry' | 'chocolate' | 'vanilla' | 'rose';

interface CakeFlavorConfig {
  id: CakeFlavor;
  name: string;
  emoji: string;
  topTierBg: string;
  midTierBg: string;
  dripColor: string;
  dripGradient: string;
  frostingBorder: string;
  topperColor: string;
  candleColors: string[];
  description: string;
}

const CAKE_FLAVORS: CakeFlavorConfig[] = [
  {
    id: 'strawberry',
    name: 'Strawberry Velvet & White Chocolate',
    emoji: '🍓',
    topTierBg: 'from-rose-200 via-rose-100 to-rose-200',
    midTierBg: 'from-pink-100 via-rose-100 to-pink-200',
    dripColor: '#f43f5e',
    dripGradient: 'from-rose-500 via-pink-500 to-rose-600',
    frostingBorder: 'border-rose-300',
    topperColor: 'from-amber-300 via-yellow-200 to-amber-400',
    candleColors: [
      'from-rose-400 to-pink-500',
      'from-amber-400 to-yellow-500',
      'from-rose-400 to-red-400',
      'from-purple-400 to-pink-400',
      'from-rose-300 to-rose-500',
    ],
    description: 'Fresh organic strawberries, silky cream & rose gold dust',
  },
  {
    id: 'chocolate',
    name: 'Belgian Chocolate & 24k Gold Leaf',
    emoji: '🍫',
    topTierBg: 'from-amber-950 via-stone-850 to-stone-900',
    midTierBg: 'from-stone-900 via-amber-950 to-stone-900',
    dripColor: '#451a03',
    dripGradient: 'from-amber-900 via-stone-800 to-amber-950',
    frostingBorder: 'border-amber-700/60',
    topperColor: 'from-yellow-300 via-amber-200 to-yellow-400',
    candleColors: [
      'from-amber-400 to-yellow-500',
      'from-stone-300 to-stone-100',
      'from-amber-300 to-yellow-400',
      'from-rose-400 to-amber-400',
      'from-yellow-400 to-amber-500',
    ],
    description: 'Decadent dark truffle ganache, hazelnut glaze & edible gold',
  },
  {
    id: 'vanilla',
    name: 'Royal Vanilla & Buttercream Confetti',
    emoji: '🎂',
    topTierBg: 'from-amber-50 via-yellow-50 to-amber-100',
    midTierBg: 'from-yellow-50 via-orange-50 to-amber-100',
    dripColor: '#fbbf24',
    dripGradient: 'from-amber-300 via-yellow-200 to-amber-400',
    frostingBorder: 'border-amber-300',
    topperColor: 'from-pink-400 via-rose-300 to-purple-400',
    candleColors: [
      'from-sky-400 to-blue-500',
      'from-pink-400 to-rose-500',
      'from-amber-400 to-yellow-500',
      'from-emerald-400 to-teal-500',
      'from-purple-400 to-indigo-500',
    ],
    description: 'Madagascar vanilla buttercream, rainbow sugar crystals & cherries',
  },
  {
    id: 'rose',
    name: 'Champagne Rose & Lavender Silk',
    emoji: '🌹',
    topTierBg: 'from-purple-200 via-pink-100 to-rose-200',
    midTierBg: 'from-purple-100 via-rose-100 to-pink-200',
    dripColor: '#c084fc',
    dripGradient: 'from-purple-400 via-pink-400 to-rose-400',
    frostingBorder: 'border-purple-300',
    topperColor: 'from-amber-200 via-yellow-100 to-amber-300',
    candleColors: [
      'from-purple-400 to-pink-400',
      'from-rose-300 to-pink-400',
      'from-amber-300 to-yellow-400',
      'from-pink-400 to-purple-400',
      'from-purple-300 to-rose-400',
    ],
    description: 'French lavender infusion, spun sugar petals & champagne sparkle',
  },
];

export function InteractiveCake({ config, onSaveWish }: InteractiveCakeProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavor>('strawberry');

  const [candles, setCandles] = useState([
    { id: 1, lit: true, height: 50, emberDrift: '-4px' },
    { id: 2, lit: true, height: 60, emberDrift: '6px' },
    { id: 3, lit: true, height: 54, emberDrift: '-2px' },
    { id: 4, lit: true, height: 58, emberDrift: '5px' },
    { id: 5, lit: true, height: 48, emberDrift: '-5px' },
  ]);

  const [wishText, setWishText] = useState(config.sealedWish || '');
  const [wishSaved, setWishSaved] = useState(Boolean(config.sealedWish));
  const [allBlownOut, setAllBlownOut] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [sparklerActive, setSparklerActive] = useState(false);
  const [cakeCutCount, setCakeCutCount] = useState(0);
  const [showCakeSliceModal, setShowCakeSliceModal] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync sealed wish from config
  useEffect(() => {
    if (config.sealedWish) {
      setWishText(config.sealedWish);
      setWishSaved(true);
    }
  }, [config.sealedWish]);

  const flavor = CAKE_FLAVORS.find((f) => f.id === selectedFlavor) || CAKE_FLAVORS[0];

  // Stop mic helper
  const stopMic = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsListeningMic(false);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  // Check if all candles are blown out
  useEffect(() => {
    const unlitCount = candles.filter((c) => !c.lit).length;
    if (unlitCount === candles.length && !allBlownOut) {
      setAllBlownOut(true);
      sound.playCelebrationPop();
      fireHeartConfetti();
      setTimeout(() => fireFireworks(), 400);
      stopMic();

      // Trigger Celebration Video Modal when candles are blown out
      const autoplayVideo = config.celebrationVideoAutoplay !== false;
      if (autoplayVideo) {
        setTimeout(() => {
          setIsVideoModalOpen(true);
        }, 800);
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

  // Cut the Cake action
  const handleCutCake = () => {
    sound.playCelebrationPop();
    sound.playSparkleChime();
    fireHeartConfetti();
    setCakeCutCount((prev) => prev + 1);
    setShowCakeSliceModal(true);
  };

  // Toggle sparkler fireworks
  const toggleSparklers = () => {
    sound.playSparkleChime();
    setSparklerActive((prev) => !prev);
    if (!sparklerActive) {
      fireHeartConfetti();
    }
  };

  // Save birthday wish
  const handleSaveWish = (e: FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;
    setWishSaved(true);
    sound.playSparkleChime();
    if (onSaveWish) {
      onSaveWish(wishText.trim());
    }
    blowAllCandles();
  };

  // Optional manual microphone blow detection toggle
  const toggleMicDetection = async () => {
    sound.primeAudio();
    if (isListeningMic) {
      stopMic();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListeningMic(true);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkBlow = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;

        // Threshold for air puff / breath sound
        if (avg > 45) {
          blowAllCandles();
          stopMic();
          return;
        }

        animFrameRef.current = requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      setIsListeningMic(false);
    }
  };

  const litCandleCount = candles.filter((c) => c.lit).length;

  return (
    <section id="birthday-cake" className="py-16 px-4 max-w-4xl mx-auto text-center relative">
      {/* Section Header */}
      <div className="mb-8">
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
          <span>Birthday Ceremony & Wishes</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold">
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.sectionHeaderGradient} drop-shadow-sm`}
          >
            Blow Out The Candles 🎂
          </span>
        </h2>
        <p
          className={`text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto font-medium ${themeStyles.sectionSubtitleColor}`}
        >
          Tap the glowing candles to make a wish, switch cake flavors, ignite sparklers, and celebrate {config.recipientName}'s birthday!
        </p>

        {/* Cake Flavor Switcher Bar */}
        <div className="mt-5 flex items-center justify-center flex-wrap gap-2">
          {CAKE_FLAVORS.map((f) => {
            const isSelected = selectedFlavor === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFlavor(f.id);
                  sound.playSparkleChime();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white ring-2 ring-amber-300 scale-105 shadow-md'
                    : `${themeStyles.cardHighlightBg} ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'} border ${themeStyles.cardBorder} hover:border-rose-400`
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.name.split('&')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Birthday Cake Container */}
      <div
        className={`relative max-w-lg mx-auto ${themeStyles.cardBg} rounded-3xl p-6 sm:p-10 border-2 ${themeStyles.cardBorder} shadow-2xl overflow-hidden`}
      >
        {/* Glow ambient background when candles lit */}
        {!allBlownOut && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-40 bg-gradient-to-b from-amber-300/35 via-rose-400/20 to-transparent blur-3xl rounded-full pointer-events-none animate-pulse" />
        )}

        {/* Grand 3D Acrylic Cake Topper with Glowing Name */}
        <div className="relative z-30 mb-2 flex flex-col items-center justify-center select-none">
          <motion.div
            initial={{ scale: 0.9, y: 5 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.5 }}
            className="flex flex-col items-center"
          >
            {/* Crown / Tiara topper icon */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-400/20 border border-amber-300/70 shadow-sm backdrop-blur-xs">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 tracking-wider uppercase font-glow-gold">
                Queen of the Day
              </span>
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-300 star-sparkle-anim" />
            </div>

            {/* Glowing Golden Name Ribbon */}
            <div className="mt-1 px-4 py-1 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-400/40 shadow-xs">
              <span className="font-handwriting font-bold text-xl sm:text-2xl text-amber-950 dark:text-amber-100 font-glow-gold">
                ✨ {config.recipientName} ✨
              </span>
            </div>
          </motion.div>
        </div>

        {/* Left & Right Sparkler Fountains (When activated) */}
        {sparklerActive && (
          <>
            {/* Left Sparkler */}
            <div className="absolute left-6 top-24 z-30 flex flex-col items-center pointer-events-none animate-sparkler-fountain">
              <div className="text-xl">✨</div>
              <div className="text-lg">⭐</div>
              <div className="text-sm">🌟</div>
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full shadow-[0_0_12px_#fde047]" />
            </div>
            {/* Right Sparkler */}
            <div className="absolute right-6 top-24 z-30 flex flex-col items-center pointer-events-none animate-sparkler-fountain">
              <div className="text-xl">✨</div>
              <div className="text-lg">⭐</div>
              <div className="text-sm">🌟</div>
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full shadow-[0_0_12px_#fde047]" />
            </div>
          </>
        )}

        {/* The Candle Row (Layered, Realistic Wax & Flickering Multi-Core Flames) */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 h-32 mb-[-10px] relative z-20">
          {candles.map((candle, idx) => {
            const candleGradient = flavor.candleColors[idx % flavor.candleColors.length];
            return (
              <div
                key={candle.id}
                onClick={() => toggleCandle(candle.id)}
                className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none relative"
                title={candle.lit ? 'Tap to blow out candle' : 'Tap to relight candle'}
              >
                {/* Flame & Rising Ember Particles */}
                <div className="h-12 flex items-center justify-center relative">
                  {candle.lit ? (
                    <div className="relative flex flex-col items-center">
                      {/* Ambient Candlelight Radial Halo */}
                      <div className="absolute -inset-3 bg-amber-400/40 rounded-full blur-md animate-pulse pointer-events-none" />

                      {/* Rising Glowing Ember Particle */}
                      <div
                        className="absolute w-1 h-1 rounded-full bg-yellow-200 animate-ember pointer-events-none shadow-[0_0_6px_#fef08a]"
                        style={{ ['--drift' as string]: candle.emberDrift }}
                      />

                      {/* Multi-layered Realistic Flame */}
                      <div className="relative w-4 h-8 animate-flame">
                        {/* Outer warm amber aura */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_15px_#f59e0b]" />
                        {/* Inner luminous white core */}
                        <div className="absolute inset-x-1 bottom-1 top-2 rounded-full bg-gradient-to-t from-yellow-300 via-yellow-100 to-white opacity-95 blur-[0.3px]" />
                        {/* Cyan/blue thermal base */}
                        <div className="absolute inset-x-1.5 bottom-0 h-2 rounded-b-full bg-blue-500/80 blur-[0.5px]" />
                      </div>
                    </div>
                  ) : (
                    /* Romantic curling smoke puff */
                    <motion.div
                      initial={{ y: 0, opacity: 0.9, scale: 0.6 }}
                      animate={{ y: -30, opacity: 0, scale: 1.8 }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      className="text-stone-400 text-xs font-mono select-none flex flex-col items-center"
                    >
                      <span>💨</span>
                      <span className="text-[10px] text-amber-300/70">✨</span>
                    </motion.div>
                  )}
                </div>

                {/* Candle Wick (charred with molten wax rim) */}
                <div className="w-0.5 h-2.5 bg-stone-900 rounded-t-xs" />

                {/* Molten wax pool at top */}
                <div className="w-5 sm:w-6 h-1 bg-gradient-to-r from-white/90 via-amber-100/90 to-white/70 rounded-full shadow-xs -mb-0.5 z-10" />

                {/* Candle Stick with metallic gold/color spiral ribbon */}
                <div
                  style={{ height: `${candle.height}px` }}
                  className={`w-4 sm:w-5 rounded-t-xs rounded-b-xs shadow-lg border-x border-white/50 bg-gradient-to-b ${candleGradient} relative overflow-hidden`}
                >
                  {/* Diagonal Gold/White Ribbon Striping */}
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.85), rgba(255,255,255,0.85) 3px, transparent 3px, transparent 8px)',
                    }}
                  />
                  {/* Subtle 3D Cylinder Shading */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-white/40" />
                  <div className="absolute inset-y-0 right-0 w-1 bg-black/20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3D Tiered Deluxe Birthday Cake Illustration */}
        <div className="relative flex flex-col items-center animate-cake-glow">
          {/* Top Cake Tier */}
          <div
            className={`w-52 sm:w-60 h-20 bg-gradient-to-r ${flavor.topTierBg} rounded-t-2xl shadow-lg border-t-4 ${flavor.frostingBorder} relative flex flex-col items-center justify-between overflow-visible`}
          >
            {/* Scalloped Ganache / Cream Drip SVG */}
            <svg
              className="absolute -top-1 left-0 right-0 w-full h-7 overflow-visible pointer-events-none drop-shadow-md"
              viewBox="0 0 240 28"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 
                   Q 15 16, 30 6 
                   Q 45 24, 60 10 
                   Q 75 22, 90 8 
                   Q 105 26, 120 12 
                   Q 135 24, 150 8 
                   Q 165 26, 180 10 
                   Q 195 22, 210 6 
                   Q 225 18, 240 0 
                   Z"
                fill={flavor.dripColor}
                opacity="0.9"
              />
            </svg>

            {/* Fresh Strawberries, Cherries & Sugar Pearls Topping */}
            <div className="absolute -top-3 left-0 right-0 flex justify-between px-3 z-10">
              <span className="text-base hover:scale-125 transition-transform cursor-pointer drop-shadow-md">
                🍓
              </span>
              <span className="text-xs hover:scale-125 transition-transform cursor-pointer drop-shadow-md">
                ✨
              </span>
              <span className="text-base hover:scale-125 transition-transform cursor-pointer drop-shadow-md">
                🍒
              </span>
              <span className="text-xs hover:scale-125 transition-transform cursor-pointer drop-shadow-md">
                ✨
              </span>
              <span className="text-base hover:scale-125 transition-transform cursor-pointer drop-shadow-md">
                🍓
              </span>
            </div>

            {/* Cake Face: Shimmering "Happy Birthday" Text */}
            <div className="mt-5 font-handwriting text-rose-950 dark:text-rose-100 font-bold text-xl sm:text-2xl font-shimmer-sparkle tracking-wide drop-shadow-xs">
              Happy Birthday!
            </div>

            {/* Tier Separator: Sugar Pearl Garland */}
            <div className="w-full flex items-center justify-around px-2 pb-1 text-[10px] text-amber-400 opacity-90">
              <span>⚪</span>
              <span>💖</span>
              <span>⚪</span>
              <span>💖</span>
              <span>⚪</span>
              <span>💖</span>
              <span>⚪</span>
            </div>
          </div>

          {/* Middle Cake Tier */}
          <div
            className={`w-68 sm:w-80 h-24 bg-gradient-to-r ${flavor.midTierBg} rounded-t-xl shadow-xl border-t-4 ${flavor.frostingBorder} relative flex flex-col items-center justify-between overflow-visible`}
          >
            {/* Scalloped Buttercream Drip Layer */}
            <svg
              className="absolute -top-1 left-0 right-0 w-full h-8 overflow-visible pointer-events-none drop-shadow-sm"
              viewBox="0 0 320 30"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 
                   Q 20 20, 40 8 
                   Q 60 26, 80 12 
                   Q 100 24, 120 10 
                   Q 140 28, 160 14 
                   Q 180 26, 200 10 
                   Q 220 28, 240 12 
                   Q 260 24, 280 8 
                   Q 300 20, 320 0 
                   Z"
                fill={flavor.dripColor}
                opacity="0.75"
              />
            </svg>

            {/* Rosettes and Garnish row */}
            <div className="w-full flex items-center justify-between px-4 pt-1 z-10 text-xs">
              <span>🌸</span>
              <span>💖</span>
              <span>✨</span>
              <span>💖</span>
              <span>🌸</span>
            </div>

            {/* Central Dedicated Name Plaque */}
            <div className="px-4 py-1 rounded-full bg-white/70 dark:bg-stone-900/80 border border-amber-300/80 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span className="text-xs sm:text-sm font-serif-romantic text-stone-900 dark:text-stone-100 font-bold tracking-wider font-glow-gold">
                ★ {config.recipientName} ★
              </span>
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            </div>

            {/* Bottom Scalloped Lace Trim with Pearls */}
            <div className="w-full flex items-center justify-around px-3 pb-1 text-[11px]">
              <span>🍓</span>
              <span className="text-rose-400">💖</span>
              <span>🍒</span>
              <span className="text-rose-400">💖</span>
              <span>🍓</span>
            </div>
          </div>

          {/* Luxury Gold & Crystal Cake Pedestal Platter */}
          <div className="relative w-80 sm:w-96 flex flex-col items-center">
            {/* Platter Rim */}
            <div className="w-full h-7 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 rounded-full shadow-2xl border-2 border-amber-300 flex items-center justify-center relative overflow-hidden">
              <div className="w-4/5 h-1.5 bg-gradient-to-r from-amber-400/80 via-white to-amber-400/80 rounded-full blur-[0.5px]" />
            </div>
            {/* Platter Pedestal Stand */}
            <div className="w-24 sm:w-28 h-4 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 rounded-b-xl shadow-md border-x border-b border-amber-400" />
            {/* Stand Base */}
            <div className="w-44 sm:w-52 h-2.5 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 rounded-full shadow-lg border border-amber-300/90" />
          </div>
        </div>

        {/* Live Candle Status Badge */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/80 shadow-2xs">
            {litCandleCount > 0
              ? `🔥 ${litCandleCount} of 5 Candles Glowing`
              : '✨ All 5 Candles Blown Out! All Wishes Granted!'}
          </span>
        </div>

        {/* Celebration Announcement Banner */}
        <AnimatePresence>
          {allBlownOut && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className={`mt-6 p-5 bg-gradient-to-r ${themeStyles.accentBtnGradient} rounded-2xl text-white shadow-xl text-center`}
            >
              <div className="flex items-center justify-center gap-1.5 text-amber-200 text-sm font-semibold mb-1">
                <Sparkles className="w-4 h-4 star-sparkle-anim" />
                <span className="tracking-wider">ALL WISHES SEALED & GRANTED!</span>
                <Sparkles className="w-4 h-4 star-sparkle-anim" />
              </div>
              <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold font-glow-gold">
                Happy Birthday, My Love! 🎉
              </h3>
              <p className="text-white/90 text-xs sm:text-sm mt-1 font-medium">
                May your every dream ignite with happiness, radiant health, and unforgettable love.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Interactive Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {!allBlownOut ? (
            <button
              id="blow-candles-button"
              onClick={blowAllCandles}
              className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer`}
            >
              <Flame className="w-4 h-4" />
              <span>Blow All Candles</span>
            </button>
          ) : (
            <button
              id="relight-candles-button"
              onClick={relightCandles}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Relight Candles</span>
            </button>
          )}

          {/* Interactive "Cut Birthday Cake" button */}
          <button
            id="cut-cake-button"
            onClick={handleCutCake}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <CakeIcon className="w-4 h-4 text-yellow-200" />
            <span>Cut The Cake 🍰</span>
          </button>

          {/* Sparkler Fountain Toggle */}
          <button
            id="sparkler-toggle-button"
            onClick={toggleSparklers}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-xs ${
              sparklerActive
                ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold animate-pulse'
                : `${themeStyles.cardHighlightBg} ${themeStyles.isDark ? 'text-stone-200' : 'text-stone-800'} ${themeStyles.cardBorder} hover:scale-105`
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{sparklerActive ? 'Sparklers ON ✨' : 'Sparkler Mode ✨'}</span>
          </button>

          {/* Manual Mic Blow Option */}
          <button
            id="mic-blow-detect-button"
            onClick={toggleMicDetection}
            title="Blow into your microphone to extinguish candles!"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isListeningMic
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : `${themeStyles.cardHighlightBg} ${themeStyles.isDark ? 'text-stone-200' : 'text-stone-800'} ${themeStyles.cardBorder} hover:scale-105`
            }`}
          >
            {isListeningMic ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span>{isListeningMic ? 'Listening (Blow!)' : 'Mic Blow'}</span>
          </button>

          {/* Watch Birthday Video Button */}
          {allBlownOut && (
            <button
              id="open-video-modal-button"
              onClick={() => setIsVideoModalOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse`}
            >
              <Film className="w-4 h-4 text-amber-200" />
              <span>Watch Birthday Video 🐿️🎬</span>
            </button>
          )}
        </div>

        {/* Secret Birthday Wish Input Form */}
        <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-700/60 text-left">
          <div
            className={`text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5 ${themeStyles.isDark ? 'text-rose-300' : 'text-rose-800'}`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Secret Birthday Wish (Private & Cherished)</span>
          </div>

          {!wishSaved ? (
            <form onSubmit={handleSaveWish} className="flex gap-2">
              <input
                type="text"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder={config.secretWishPrompt || 'Type your secret wish here before blowing...'}
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
            <div
              className={`p-3.5 rounded-xl ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} flex items-center justify-between gap-2.5 text-xs sm:text-sm ${themeStyles.isDark ? 'text-emerald-300' : 'text-emerald-800'}`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Your secret wish: <strong className="italic">"{wishText}"</strong> is sealed with love! 🌟
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWishSaved(false)}
                className="text-xs font-semibold underline text-rose-600 dark:text-rose-400 hover:text-rose-700 cursor-pointer shrink-0 ml-2"
              >
                Change Wish ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sweet Cake Slice / Sweet Bite Celebration Modal */}
      <AnimatePresence>
        {showCakeSliceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-850 p-6 text-center border-2 border-rose-300 dark:border-rose-800 shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-stone-800 dark:to-rose-950/80 flex items-center justify-center text-4xl shadow-inner border border-rose-200">
                🍰
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
                  <PartyPopper className="w-4 h-4" />
                  <span>First Sweetest Bite</span>
                </div>
                <h3 className="font-serif-romantic text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Happy Cake Cutting! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 font-sans-clean leading-relaxed">
                  Here is the first and sweetest slice of <strong className="text-rose-600 dark:text-rose-400">{flavor.name}</strong> just for you, {config.recipientName}! May your life be as sweet as this moment.
                </p>
                {cakeCutCount > 1 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold mt-1">
                    Cake sliced {cakeCutCount} times with endless love! ❤️
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  sound.playSparkleChime();
                  setShowCakeSliceModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all"
              >
                Enjoy The Sweet Slice 💖
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
