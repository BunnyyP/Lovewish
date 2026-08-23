import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, Sparkles, Heart, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';
import { BirthdayConfig } from '../types';

interface SiteLockScreenProps {
  config: BirthdayConfig;
  onUnlock: () => void;
}

export function SiteLockScreen({ config, onUnlock }: SiteLockScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const expectedPassword = (config.siteLockPassword || 'Merijaan').trim();

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    sound.primeAudio();
    setIsSubmitting(true);

    const entered = password.trim();
    // Match exact or case-insensitive for smooth user experience while expecting 'Merijaan'
    const isMatch =
      entered === expectedPassword ||
      entered.toLowerCase() === expectedPassword.toLowerCase();

    if (isMatch) {
      setError(false);
      sound.playSparkleChime();
      fireHeartConfetti();
      try {
        sessionStorage.setItem('romantic_site_unlocked', 'true');
      } catch {}
      setTimeout(() => {
        setIsSubmitting(false);
        onUnlock();
      }, 300);
    } else {
      setIsSubmitting(false);
      setError(true);
      setShakeKey((prev) => prev + 1);
    }
  };

  return (
    <div
      id="site-lock-screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-rose-950 via-stone-900 to-purple-950 text-stone-100 overflow-hidden select-none"
    >
      {/* Ambient background glowing circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-3xl" />
      </div>

      {/* Floating background sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.6 + 0.4,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: ['-10%', '110%'],
              opacity: [0.2, 0.7, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.7,
            }}
            className="absolute text-rose-300/40"
          >
            {i % 2 === 0 ? <Sparkles className="w-4 h-4" /> : <Heart className="w-3.5 h-3.5 fill-current" />}
          </motion.div>
        ))}
      </div>

      {/* Main Lock Card */}
      <motion.div
        key={shakeKey}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={
          error
            ? {
                opacity: 1,
                scale: 1,
                x: [0, -12, 12, -10, 10, -6, 6, -2, 2, 0],
                transition: { duration: 0.5 },
              }
            : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
        }
        className="relative w-full max-w-md rounded-3xl bg-stone-900/90 border border-rose-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center space-y-6"
      >
        {/* Glowing Lock Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 blur-md opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 p-1.5 rounded-full shadow-md"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </motion.div>
        </div>

        {/* Title & Description (Strictly NO password hint) */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Private Birthday Surprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-romantic font-bold text-white tracking-wide">
            Enter Secret Password
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">
            This birthday celebration is locked with love. Please enter the password to access the site.
          </p>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label
              htmlFor="site-lock-password-input"
              className="block text-xs font-semibold text-stone-300 ml-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="site-lock-password-input"
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter password..."
                className={`w-full px-4 py-3 pr-11 rounded-2xl bg-stone-950/80 border ${
                  error
                    ? 'border-rose-500 focus:border-rose-400 ring-2 ring-rose-500/40 text-rose-200'
                    : 'border-stone-700 focus:border-rose-500 text-white'
                } placeholder-stone-500 text-sm focus:outline-none transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-stone-400" />}
              </button>
            </div>

            {/* Error Message (Clean, NO hint) */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-1 px-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Incorrect password. Please try again.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:via-pink-500 hover:to-amber-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_25px_rgba(225,29,72,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Unlock Birthday Surprise</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Romantic Footer Note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
          <Heart className="w-3 h-3 fill-rose-500/60 text-rose-500/60" />
          <span>Made exclusively for {config.recipientName}</span>
        </div>
      </motion.div>
    </div>
  );
}
