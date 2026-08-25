import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Heart,
  Music,
  PartyPopper,
  Flame,
  Timer,
} from 'lucide-react';
import { BirthdayConfig } from '../types';
import { getYouTubeEmbedUrl } from '../utils/media';
import { sound } from '../utils/audio';

interface CelebrationVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onRelightCandles?: () => void;
}

export function CelebrationVideoModal({
  isOpen,
  onClose,
  config,
  onRelightCandles,
}: CelebrationVideoModalProps) {
  const totalDuration =
    typeof config.celebrationVideoDuration === 'number' && config.celebrationVideoDuration > 0
      ? config.celebrationVideoDuration
      : 15; // 15 seconds by default

  const [secondsLeft, setSecondsLeft] = useState(totalDuration);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);

  // Animated squirrel song sequence for default video mode
  const songLyrics = [
    { text: 'Happy birthday to you...', duration: 2400, expression: 'singing', scale: 1 },
    { text: 'Happy birthday to youuuu! 💖', duration: 2800, expression: 'excited', scale: 1.1 },
    {
      text: `Happy birthday dear ${config.recipientNickname || config.recipientName || 'Love'}! ✨`,
      duration: 3200,
      expression: 'love',
      scale: 1.2,
    },
    { text: 'Happy birthday to youuuuu! 🎉🥳', duration: 3500, expression: 'finale', scale: 0.9 },
  ];

  // Auto-close 15-second timer management
  useEffect(() => {
    if (!isOpen) {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      return;
    }

    setSecondsLeft(totalDuration);

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoCloseTimerRef.current = null;
          // Auto close after 15 seconds
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoCloseTimerRef.current = interval;

    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [isOpen, totalDuration, onClose]);

  // Handle music and lyrics playback
  useEffect(() => {
    if (!isOpen) {
      setCurrentLyricIndex(0);
      sound.stopHappyBirthdaySong();
      return;
    }

    setIsPlaying(true);
    sound.playCelebrationPop();

    // If default squirrel singing mode or custom video
    if (config.celebrationVideoType === 'default' || !config.celebrationVideoUrl) {
      sound.playHappyBirthdaySong();
    }

    let lyricTimer: number;
    let step = 0;

    const advanceLyrics = () => {
      if (step < songLyrics.length - 1) {
        step += 1;
        setCurrentLyricIndex(step);
        lyricTimer = window.setTimeout(advanceLyrics, songLyrics[step].duration);
      }
    };

    lyricTimer = window.setTimeout(advanceLyrics, songLyrics[0].duration);

    return () => {
      window.clearTimeout(lyricTimer);
      sound.stopHappyBirthdaySong();
    };
  }, [isOpen, config]);

  // Video autoplay helper
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((e) => {
        console.log('Video autoplay handled:', e);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCustomUploadOrUrl =
    (config.celebrationVideoType === 'upload' || config.celebrationVideoType === 'url') &&
    Boolean(config.celebrationVideoUrl);

  const isYouTube =
    config.celebrationVideoType === 'youtube' && Boolean(config.celebrationVideoUrl);

  const youtubeEmbedUrl = isYouTube
    ? getYouTubeEmbedUrl(config.celebrationVideoUrl || '', true, true)
    : null;

  const handleReplay = () => {
    sound.playSparkleChime();
    setCurrentLyricIndex(0);
    setSecondsLeft(totalDuration);

    // Reset interval timer
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current);
    }
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoCloseTimerRef.current = null;
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    autoCloseTimerRef.current = interval;

    if (isCustomUploadOrUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else if (config.celebrationVideoType === 'default' || !config.celebrationVideoUrl) {
      sound.playHappyBirthdaySong();
    }
  };

  const handleMakeAnotherWish = () => {
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    sound.stopHappyBirthdaySong();
    onClose();
    if (onRelightCandles) {
      onRelightCandles();
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / totalDuration) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-lg w-full bg-[#fdfbf7] dark:bg-stone-900 rounded-3xl shadow-2xl border-2 border-rose-300 dark:border-stone-700 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Progress Countdown Bar */}
        <div className="w-full h-1.5 bg-rose-950/40 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500"
            style={{ width: `${progressPercent}%` }}
            transition={{ ease: 'linear', duration: 1 }}
          />
        </div>

        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-200">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-romantic text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>Birthday Surprise Song & Video</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              </h3>
              <p className="text-[11px] text-rose-100 font-sans-clean">
                Dedicated with all my heart to {config.recipientName || 'You'} ✨
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-closing Countdown Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 text-amber-200 text-[11px] font-semibold tracking-wide border border-white/20">
              <Timer className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{secondsLeft}s</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer transition-colors"
              title="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video / Animated Stage */}
        <div className="relative aspect-[9/14] sm:aspect-square w-full bg-[#fffbee] dark:bg-stone-950 flex flex-col items-center justify-center overflow-hidden border-b border-rose-100 dark:border-stone-800">
          {/* CUSTOM UPLOADED OR DIRECT URL VIDEO */}
          {isCustomUploadOrUrl ? (
            <video
              ref={videoRef}
              src={config.celebrationVideoUrl}
              autoPlay
              controls
              playsInline
              loop
              className="w-full h-full object-contain bg-black"
            />
          ) : isYouTube && youtubeEmbedUrl ? (
            /* YOUTUBE EMBED PLAYER */
            <iframe
              src={youtubeEmbedUrl}
              title="Birthday Celebration Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            /* ADORABLE SQUIRREL / CHIPMUNK CELEBRATION ANIMATION (DEFAULT VIDEO) */
            <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#fef8ea] via-[#fffbf3] to-[#fdeedd] dark:from-stone-950 dark:to-stone-900 select-none overflow-hidden">
              {/* Confetti & Floating Hearts */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={`heart-bg-${i}`}
                    animate={{
                      y: ['100%', '-20%'],
                      x: [Math.sin(i) * 30, Math.cos(i) * 30],
                      opacity: [0, 0.7, 0],
                      scale: [0.6, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3.5 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeInOut',
                    }}
                    className="absolute text-rose-400/40 text-lg sm:text-xl"
                    style={{ left: `${(i * 18) % 95}%` }}
                  >
                    {i % 2 === 0 ? '💖' : '✨'}
                  </motion.div>
                ))}
              </div>

              {/* Dynamic Lyric Banner at Top */}
              <motion.div
                key={currentLyricIndex}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="z-10 text-center px-4 py-2 rounded-2xl bg-white/85 dark:bg-stone-800/85 backdrop-blur-md shadow-md border border-rose-200 dark:border-stone-700"
              >
                <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-serif-romantic font-bold text-base sm:text-lg">
                  <Music className="w-4 h-4 animate-bounce text-amber-500" />
                  <span>{songLyrics[currentLyricIndex].text}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </motion.div>

              {/* CUTE ANIMATED SINGING SQUIRREL (Vector Character matching the video) */}
              <div className="relative z-10 my-auto flex items-center justify-center">
                <motion.div
                  animate={{
                    y: [0, -14, 0],
                    rotate: [-3, 3, -3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
                >
                  {/* Fluffy Tail */}
                  <motion.div
                    animate={{ rotate: [-8, 12, -8] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute right-0 top-6 w-24 h-32 bg-stone-100 dark:bg-stone-300 rounded-full border-4 border-stone-800 shadow-sm origin-bottom-left"
                    style={{
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                      boxShadow: 'inset -8px 0px 0px #e5e5e5',
                    }}
                  >
                    {/* Tail Swirl */}
                    <div className="absolute top-4 right-4 w-12 h-16 rounded-full border-r-4 border-t-4 border-stone-700/40" />
                  </motion.div>

                  {/* Character Body & Head (Plump Cute Hamster/Squirrel) */}
                  <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 bg-stone-50 dark:bg-stone-200 rounded-[50%] border-4 border-stone-800 shadow-xl flex flex-col items-center justify-center">
                    {/* Cute Ears */}
                    <div className="absolute -top-3 left-4 w-7 h-7 bg-stone-50 dark:bg-stone-200 border-4 border-stone-800 rounded-full flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-rose-300 rounded-full" />
                    </div>
                    <div className="absolute -top-3 right-4 w-7 h-7 bg-stone-50 dark:bg-stone-200 border-4 border-stone-800 rounded-full flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-rose-300 rounded-full" />
                    </div>

                    {/* Cute Forehead Pink Stripes */}
                    <div className="absolute top-3 flex gap-1 items-center">
                      <span className="w-3 h-1.5 bg-rose-400 rounded-full" />
                      <span className="w-5 h-2 bg-rose-400 rounded-full" />
                      <span className="w-3 h-1.5 bg-rose-400 rounded-full" />
                    </div>

                    {/* Happy Singing Eyes */}
                    <div className="flex items-center gap-9 mt-4">
                      {/* Left Eye: Curved smiling arc ^ */}
                      <div className="w-4 h-2 border-t-3 border-stone-900 rounded-t-full" />
                      {/* Right Eye: Curved smiling arc ^ */}
                      <div className="w-4 h-2 border-t-3 border-stone-900 rounded-t-full" />
                    </div>

                    {/* Rosy Blush Cheeks */}
                    <div className="flex items-center justify-between w-28 -mt-0.5">
                      <div className="w-4 h-2.5 bg-rose-400/80 rounded-full" />
                      <div className="w-4 h-2.5 bg-rose-400/80 rounded-full" />
                    </div>

                    {/* Big Open Singing Mouth (O-shaped animated) */}
                    <motion.div
                      animate={{
                        scaleY: [1, 1.4, 0.9, 1.3, 1],
                        scaleX: [1, 0.9, 1.1, 0.95, 1],
                      }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-rose-600 border-3 border-stone-900 rounded-full flex flex-col items-center justify-end overflow-hidden shadow-inner mt-0.5"
                    >
                      {/* Cute Tongue */}
                      <div className="w-6 h-3 bg-pink-300 rounded-t-full" />
                    </motion.div>

                    {/* Tiny Cute Little Paws Open Wide Singing */}
                    <motion.div
                      animate={{ rotate: [-10, 10, -10] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute -left-4 top-18 w-5 h-5 bg-stone-100 border-3 border-stone-800 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: [10, -10, 10] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute -right-4 top-18 w-5 h-5 bg-stone-100 border-3 border-stone-800 rounded-full"
                    />

                    {/* Little Feet */}
                    <div className="absolute -bottom-2 flex gap-8">
                      <div className="w-6 h-4 bg-stone-100 border-3 border-stone-800 rounded-full" />
                      <div className="w-6 h-4 bg-stone-100 border-3 border-stone-800 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Singing Note Visuals */}
              <div className="z-10 flex items-center justify-center gap-2 text-rose-500">
                <span className="text-xs font-semibold uppercase tracking-wider bg-rose-100 dark:bg-stone-800 px-3 py-1 rounded-full text-rose-700 dark:text-rose-300">
                  Singing with all joy for you 🎂✨
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-stone-900 flex items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReplay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Replay Video</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMakeAnotherWish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Relight & Blow Again</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
