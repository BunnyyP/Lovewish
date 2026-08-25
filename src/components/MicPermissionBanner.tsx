import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Sparkles, Check, Flame, X, Volume2 } from 'lucide-react';
import { micBlowManager, MicPermissionStatus } from '../utils/micManager';
import { BirthdayConfig } from '../types';
import { getThemeStyles } from '../utils/themeStyles';
import { sound } from '../utils/audio';

interface MicPermissionBannerProps {
  config: BirthdayConfig;
}

export function MicPermissionBanner({ config }: MicPermissionBannerProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [status, setStatus] = useState<MicPermissionStatus>(() => micBlowManager.getStatus());
  const [isDismissed, setIsDismissed] = useState(false);
  const [justGranted, setJustGranted] = useState(false);

  useEffect(() => {
    const unsub = micBlowManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'listening' || newStatus === 'granted') {
        setJustGranted(true);
        setTimeout(() => setJustGranted(false), 4000);
      }
    });
    return unsub;
  }, []);

  const handleRequestMic = async () => {
    sound.primeAudio();
    const success = await micBlowManager.requestMicPermission();
    if (success) {
      sound.playSparkleChime();
    }
  };

  // If already granted/listening and not showing justGranted notification, or dismissed
  if ((status === 'listening' || status === 'granted') && !justGranted) {
    return null;
  }

  if (isDismissed && !justGranted) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-auto"
      >
        <div
          className={`max-w-xl w-full p-3 sm:p-4 rounded-2xl ${themeStyles.cardBg} border ${themeStyles.cardBorder} shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-left`}
        >
          {/* Icon indicator */}
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-md">
            {justGranted ? (
              <Check className="w-5 h-5 animate-scale-in" />
            ) : (
              <Mic className="w-5 h-5 animate-pulse" />
            )}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            {justGranted ? (
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>Microphone Activated! 🎙️✨</span>
                </p>
                <p className="text-[11px] sm:text-xs text-stone-300">
                  Realtime breath detection active. Jab cake aayega, phone ke mic par phoonk markar candles bujhayein!
                </p>
              </div>
            ) : (
              <div>
                <p className={`text-xs sm:text-sm font-bold ${themeStyles.isDark ? 'text-rose-200' : 'text-rose-900'} flex items-center gap-1.5`}>
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Realtime Birthday Candle Blow (Phoonk Feature)</span>
                </p>
                <p className={`text-[11px] sm:text-xs ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'} line-clamp-2`}>
                  Cake ki candles mic par sachme phoonk marne se bujh sakein, iske liye microphone allow kijiye.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!justGranted && status !== 'listening' && (
              <button
                id="grant-mic-permission-header-btn"
                onClick={handleRequestMic}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Allow Mic 🎙️</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
