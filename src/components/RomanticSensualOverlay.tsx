import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Flame, Music, Volume2, Activity } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';

interface RomanticSensualOverlayProps {
  config: BirthdayConfig;
}

interface TouchParticle {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'kiss' | 'spark' | 'flame' | 'petal';
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
}

const ROMANTIC_WHISPERS = [
  '“In your eyes, I found my eternity and my home...”',
  '“Every beat of my heart quietly whispers your name...”',
  '“You are my deepest love, my sweetest craving, and my forever...”',
  '“With every touch, the rest of the world fades into nothingness...”',
  '“Two souls entwined, breathing the same synchronized love...”',
  '“You make ordinary moments feel like pure, intoxicating magic...”',
  '“Forever wouldn’t be long enough to love you the way you deserve...”',
];

export function RomanticSensualOverlay({ config }: RomanticSensualOverlayProps) {
  const isSensualTheme = config.theme === 'sensual-passion' || config.theme === 'couple-love';
  const [touchParticles, setTouchParticles] = useState<TouchParticle[]>([]);
  const [touchRipples, setTouchRipples] = useState<TouchRipple[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const [holdPosition, setHoldPosition] = useState<{ x: number; y: number } | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [isMusicActive, setIsMusicActive] = useState(() => sound.getIsPlaying());
  const [bpmCounter, setBpmCounter] = useState(68);
  const holdTimerRef = useRef<number | null>(null);

  // Subscribe to sound playback for reactive beat animations
  useEffect(() => {
    setIsMusicActive(sound.getIsPlaying());
    const unsub = sound.addListener((playing) => {
      setIsMusicActive(playing);
    });
    return unsub;
  }, []);

  // Romantic Whispers Rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setWhisperIndex((prev) => (prev + 1) % ROMANTIC_WHISPERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Subtle couple heartbeat BPM fluctuations for natural realism
  useEffect(() => {
    const interval = setInterval(() => {
      setBpmCounter(68 + Math.floor(Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Spawn Touch Particles
  const spawnParticlesAt = useCallback((x: number, y: number, count = 4) => {
    const particleTypes: ('heart' | 'kiss' | 'spark' | 'flame' | 'petal')[] = [
      'heart',
      'kiss',
      'spark',
      'flame',
      'petal',
    ];
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fde047', '#e11d48', '#db2777'];

    const newParticles: TouchParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      newParticles.push({
        id: Date.now() + Math.random() * 1000 + i,
        x,
        y,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        size: Math.random() * 16 + 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rotation: (Math.random() - 0.5) * 60,
      });
    }

    setTouchParticles((prev) => [...prev.slice(-30), ...newParticles]);

    // Spawn expanding ripple ring
    const rippleId = Date.now() + Math.random();
    setTouchRipples((prev) => [...prev.slice(-8), { id: rippleId, x, y }]);
    setTimeout(() => {
      setTouchRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 1200);
  }, []);

  // Global Touch & Pointer Listeners
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Don't intercept interactive buttons/inputs aggressively
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      spawnParticlesAt(e.clientX, e.clientY, 5);
      setHoldPosition({ x: e.clientX, y: e.clientY });
      setIsHolding(true);

      // Trigger subtle romantic chime occasionally
      if (Math.random() > 0.6) {
        sound.playSparkleChime();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isHolding) {
        setHoldPosition({ x: e.clientX, y: e.clientY });
        if (Math.random() > 0.7) {
          spawnParticlesAt(e.clientX, e.clientY, 1);
        }
      }
    };

    const handlePointerUp = () => {
      setIsHolding(false);
      setHoldPosition(null);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [spawnParticlesAt, isHolding]);

  // Clean up old particles
  useEffect(() => {
    if (touchParticles.length === 0) return;
    const timer = setTimeout(() => {
      setTouchParticles((prev) => prev.slice(4));
    }, 1400);
    return () => clearTimeout(timer);
  }, [touchParticles]);

  if (!isSensualTheme) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* 1. Ambient Candlelit Screen Edge Vignette & Heartbeat Beat Pulse */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isMusicActive ? 'opacity-90' : 'opacity-60'
        }`}
      >
        {/* Deep romantic corner glows */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-rose-950/40 to-transparent animate-sensual-breathe" />
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-rose-950/60 via-pink-950/20 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-rose-950/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-rose-950/30 to-transparent" />
      </div>

      {/* 2. Rhythmic Couple Heartbeat Glowing Rings (Centered or Dynamic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{
            scale: isMusicActive ? [1, 1.25, 1.08, 1.35, 1] : [1, 1.15, 1.05, 1.2, 1],
            opacity: isMusicActive ? [0.15, 0.45, 0.25, 0.55, 0.15] : [0.1, 0.3, 0.18, 0.35, 0.1],
          }}
          transition={{
            duration: isMusicActive ? 1.2 : 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-tr from-rose-600/25 via-pink-600/15 to-amber-500/15 blur-3xl"
        />
      </div>

      {/* 3. Drifting Translucent Romantic Silk Ribbons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[300px] h-[600px] rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-400/10 to-transparent blur-2xl"
            style={{
              left: `${15 + i * 25}%`,
              animation: `silkRibbonFlow ${14 + i * 4}s linear infinite`,
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 4. Touch Reactive Ripples */}
      {touchRipples.map((r) => (
        <motion.div
          key={r.id}
          initial={{ scale: 0.1, opacity: 0.9, x: r.x, y: r.y }}
          animate={{
            scale: 2.8,
            opacity: 0,
            transition: { duration: 1.1, ease: 'easeOut' },
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full border-2 border-rose-400/70 shadow-[0_0_25px_rgba(244,63,94,0.8)] w-24 h-24"
        />
      ))}

      {/* 5. Touch Reactive Floating Particles (Hearts, Kisses, Embers, Petals) */}
      <AnimatePresence>
        {touchParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 0.2,
              opacity: 1,
              rotate: p.rotation,
            }}
            animate={{
              x: p.x + p.vx * 18,
              y: p.y + p.vy * 18,
              scale: 1,
              opacity: 0,
              rotate: p.rotation + 45,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            style={{ width: p.size, height: p.size }}
          >
            {p.type === 'heart' && (
              <Heart
                className="w-full h-full fill-rose-500 text-rose-300 animate-pulse"
                style={{ color: p.color }}
              />
            )}
            {p.type === 'kiss' && (
              <span className="text-base select-none leading-none">💋</span>
            )}
            {p.type === 'flame' && (
              <Flame className="w-full h-full text-amber-400 fill-amber-300 animate-bounce" />
            )}
            {p.type === 'spark' && (
              <Sparkles className="w-full h-full text-yellow-300 fill-yellow-200 star-sparkle-anim" />
            )}
            {p.type === 'petal' && (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 to-pink-300 rounded-tr-[90%] transform rotate-45" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 6. Hold & Touch "Couple Soulmate Heartbeat" Concentric Aura */}
      {isHolding && holdPosition && (
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
          style={{ left: holdPosition.x, top: holdPosition.y }}
        >
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-600/40 via-pink-600/30 to-amber-500/40 blur-xl animate-ping" />
            <div className="absolute inset-2 rounded-full border border-rose-400/80 animate-spin-slow" />
            <div className="relative w-14 h-14 rounded-full bg-rose-950/90 border border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.9)] flex items-center justify-center animate-couple-heartbeat">
              <Heart className="w-7 h-7 text-rose-300 fill-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,1)]" />
            </div>
          </div>
        </motion.div>
      )}

      {/* 7. Floating Animated Couple Romantic Whisper Banner (Top Center) */}
      <div className="fixed top-4 inset-x-0 flex justify-center z-20 pointer-events-none px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={whisperIndex}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e0312]/85 border border-pink-500/40 backdrop-blur-md shadow-[0_4px_25px_rgba(244,63,94,0.35)] max-w-lg text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 star-sparkle-anim" />
            <span className="font-serif-romantic italic text-xs sm:text-sm text-pink-100 tracking-wide font-medium">
              {ROMANTIC_WHISPERS[whisperIndex]}
            </span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500 shrink-0 animate-pulse" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 8. Live Couple Heartbeat & Beat Reactive Audio Monitor (Bottom Right Float) */}
      <div className="fixed bottom-5 right-5 z-40 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18030e]/90 border border-rose-500/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-rose-200">
          <div className="relative flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500 animate-couple-heartbeat" />
            <span className="absolute -inset-1 rounded-full border border-rose-400/50 animate-ping opacity-70 pointer-events-none" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 leading-tight">
              Synchronized Pulse
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 leading-tight">
              {bpmCounter} BPM <span className="text-[10px] text-pink-300 font-normal">♥ Love Beat</span>
            </span>
          </div>

          {/* Equalizer audio bar reactive to music */}
          <div className="flex items-end gap-0.5 h-4 ml-1 pl-2 border-l border-rose-800/60">
            {[0.4, 0.8, 0.6, 1, 0.5].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isMusicActive ? [`${h * 20}%`, `${h * 100}%`, `${h * 40}%`] : ['25%', '45%', '25%'],
                }}
                transition={{
                  duration: 0.6 + i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
