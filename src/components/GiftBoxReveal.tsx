import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Sparkles, Award, Share2, Check, Film, Image as ImageIcon, Maximize2, X, Play, Volume2 } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { sound } from '../utils/audio';
import { fireHeartConfetti, fireFireworks } from '../utils/confetti';
import { generateShareUrl } from '../utils/storage';
import { getThemeStyles } from '../utils/themeStyles';
import { dataUrlToBlobUrl, getStreamableMediaUrlAsync, getGoogleDriveEmbedUrl, isGoogleDriveUrl } from '../utils/media';

interface GiftBoxRevealProps {
  config: BirthdayConfig;
  onOpenCustomizer: () => void;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1` : null;
  } catch {
    return null;
  }
}

export function GiftBoxReveal({ config, onOpenCustomizer }: GiftBoxRevealProps) {
  const themeStyles = getThemeStyles(config.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const handleOpenGift = () => {
    if (isOpen) return;
    setIsOpen(true);
    sound.playCelebrationPop();
    fireHeartConfetti();
    setTimeout(() => fireFireworks(), 600);
  };

  const handleShare = () => {
    const url = generateShareUrl(config);
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playSparkleChime();
    setTimeout(() => setCopied(false), 3000);
  };

  const mediaType = config.surpriseBoxMediaType || 'image';
  const hasImage = mediaType === 'image' && Boolean(config.surpriseBoxMediaUrl);
  const hasVideo = mediaType === 'video' && Boolean(config.surpriseBoxMediaUrl);
  const ytEmbedUrl = mediaType === 'youtube' ? getYouTubeEmbedUrl(config.surpriseBoxYoutubeUrl || config.surpriseBoxMediaUrl) : null;
  const hasYouTube = mediaType === 'youtube' && Boolean(ytEmbedUrl);
  const driveEmbedUrl = (mediaType === 'drive' || (mediaType === 'video' && isGoogleDriveUrl(config.surpriseBoxMediaUrl || '')))
    ? getGoogleDriveEmbedUrl(config.surpriseBoxMediaUrl || '')
    : null;
  const hasDrive = Boolean(driveEmbedUrl);
  const hasMedia = hasImage || hasVideo || hasYouTube || hasDrive;

  const [hasSurpriseVideoError, setHasSurpriseVideoError] = useState(false);

  const [resolvedSurpriseVideoUrl, setResolvedSurpriseVideoUrl] = useState<string>(() => {
    return hasVideo && config.surpriseBoxMediaUrl ? dataUrlToBlobUrl(config.surpriseBoxMediaUrl) : '';
  });

  useEffect(() => {
    setHasSurpriseVideoError(false);
    if (!hasVideo || !config.surpriseBoxMediaUrl) {
      setResolvedSurpriseVideoUrl('');
      return;
    }
    const syncUrl = dataUrlToBlobUrl(config.surpriseBoxMediaUrl);
    setResolvedSurpriseVideoUrl(syncUrl);

    if (config.surpriseBoxMediaUrl.startsWith('data:')) {
      getStreamableMediaUrlAsync(config.surpriseBoxMediaUrl).then((url) => {
        if (url && url !== syncUrl) {
          setResolvedSurpriseVideoUrl(url);
        }
      });
    }
  }, [hasVideo, config.surpriseBoxMediaUrl]);

  return (
    <section id="gift-reveal" className="py-20 px-4 max-w-4xl mx-auto text-center relative">
      {/* Header */}
      <div className="mb-12">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${themeStyles.badgeBg} border ${themeStyles.badgeBorder} ${themeStyles.badgeText} text-xs font-semibold uppercase tracking-wider mb-2`}>
          <Gift className="w-3.5 h-3.5" />
          <span>The Grand Finale</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeStyles.sectionHeaderGradient} drop-shadow-sm`}>
            One Last Special Surprise For You 🎁
          </span>
        </h2>
        <p className={`text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto font-medium ${themeStyles.sectionSubtitleColor}`}>
          Tap the gift box below to unwrap your final birthday treasure, surprise photo/video, and lifetime promise.
        </p>
      </div>

      {/* Interactive 3D Gift Box */}
      <div className="relative max-w-2xl mx-auto min-h-[320px] flex flex-col items-center justify-center">
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleOpenGift}
            className="group cursor-pointer flex flex-col items-center select-none"
          >
            {/* Pulsing Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-amber-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all" />

            {/* Gift Lid with Bow */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Ribbon Bow */}
              <div className="flex items-center justify-center -mb-2">
                <div className="w-10 h-7 rounded-full border-4 border-amber-300 bg-amber-400/80 shadow-md transform -rotate-20" />
                <div className="w-5 h-5 rounded-full bg-amber-500 shadow-inner z-10 -mx-1" />
                <div className="w-10 h-7 rounded-full border-4 border-amber-300 bg-amber-400/80 shadow-md transform rotate-20" />
              </div>

              {/* Gift Box Lid */}
              <div className="w-56 sm:w-64 h-12 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 rounded-t-xl shadow-lg border-b-4 border-rose-800 flex items-center justify-center relative">
                {/* Yellow vertical ribbon */}
                <div className="w-10 h-full bg-amber-400 shadow-sm" />
              </div>
            </div>

            {/* Gift Box Base */}
            <div className="w-48 sm:w-56 h-40 bg-gradient-to-b from-rose-700 via-rose-800 to-rose-900 rounded-b-2xl shadow-2xl relative overflow-hidden flex items-center justify-center border-t-2 border-rose-900">
              {/* Vertical yellow ribbon on box */}
              <div className="w-10 h-full bg-amber-400 shadow-md" />
              {/* Horizontal yellow ribbon on box */}
              <div className="absolute inset-x-0 h-8 bg-amber-400 shadow-md" />

              <span className="absolute text-white/90 text-xs font-serif-romantic font-bold tracking-wider z-10 bg-rose-950/60 px-2.5 py-1 rounded-full shadow-md animate-pulse">
                ✨ TAP TO OPEN ✨
              </span>
            </div>

            {/* Button below */}
            <button
              type="button"
              className={`mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all`}
            >
              <Sparkles className="w-4 h-4 text-amber-200 star-sparkle-anim" />
              <span>Unwrap Birthday Gift Box</span>
            </button>
          </motion.div>
        ) : (
          /* Grand Finale Reveal Card with Video / Picture */
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 14 }}
            className={`w-full ${themeStyles.cardBg} rounded-3xl p-6 sm:p-10 border-2 ${themeStyles.cardBorder} shadow-2xl text-left relative overflow-hidden`}
          >
            {/* Top Crown Ribbon */}
            <div className={`flex items-center justify-between border-b ${themeStyles.isDark ? 'border-stone-800' : 'border-rose-100'} pb-4 mb-6`}>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <span className={`text-xs font-mono uppercase tracking-widest font-bold ${themeStyles.badgeText}`}>
                  Official Lifetime Certificate of Love
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif-romantic text-rose-500 font-bold hidden sm:inline">
                  Surprise Unwrapped! ✨
                </span>
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
            </div>

            {/* SURPRISE MEDIA PRESENTATION (PHOTO / VIDEO / YOUTUBE) */}
            {hasMedia && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl overflow-hidden border-2 border-rose-400/40 bg-black/5 dark:bg-stone-900/60 shadow-xl relative group"
              >
                {/* 1. CUSTOM SURPRISE PHOTO */}
                {hasImage && config.surpriseBoxMediaUrl && (
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-full max-h-[420px] overflow-hidden bg-stone-950 flex items-center justify-center">
                      <img
                        src={config.surpriseBoxMediaUrl}
                        alt={config.surpriseBoxMediaName || 'Surprise Birthday Photo'}
                        className="w-full h-auto max-h-[420px] object-contain cursor-pointer hover:scale-102 transition-transform duration-300"
                        onClick={() => setIsPhotoZoomed(true)}
                      />
                      {/* Zoom button badge */}
                      <button
                        type="button"
                        onClick={() => setIsPhotoZoomed(true)}
                        className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Photo</span>
                      </button>
                    </div>

                    {/* Photo Caption */}
                    {config.surpriseBoxMediaCaption && (
                      <div className="w-full p-3 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-pink-500/10 border-t border-rose-300/30 text-center">
                        <p className={`font-serif-romantic text-sm sm:text-base font-semibold ${themeStyles.isDark ? 'text-rose-200' : 'text-rose-900'} italic`}>
                          "{config.surpriseBoxMediaCaption}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CUSTOM UPLOADED VIDEO */}
                {hasVideo && config.surpriseBoxMediaUrl && (
                  <div className="relative flex flex-col items-center bg-black">
                    {!hasSurpriseVideoError ? (
                      <video
                        src={resolvedSurpriseVideoUrl || config.surpriseBoxMediaUrl}
                        controls
                        autoPlay={config.surpriseBoxAutoplayVideo !== false}
                        playsInline
                        loop
                        preload="auto"
                        onError={() => {
                          console.warn('Surprise video playback error');
                          setHasSurpriseVideoError(true);
                        }}
                        onWaiting={(e) => {
                          e.currentTarget.play().catch(() => {});
                        }}
                        onStalled={(e) => {
                          e.currentTarget.play().catch(() => {});
                        }}
                        className="w-full max-h-[420px] rounded-t-2xl object-contain bg-black shadow-inner"
                      />
                    ) : (
                      <div className="w-full py-16 px-6 flex flex-col items-center justify-center bg-stone-900 text-center text-rose-200">
                        <Gift className="w-12 h-12 text-rose-400 mb-3 animate-bounce" />
                        <h4 className="font-serif-romantic text-lg font-bold text-rose-100">Special Surprise Message</h4>
                        <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-sm">
                          To replay this video, please re-upload in Customization settings.
                        </p>
                      </div>
                    )}
                    {config.surpriseBoxMediaCaption && (
                      <div className="w-full p-3 bg-stone-900 border-t border-stone-800 text-center">
                        <p className="font-serif-romantic text-sm sm:text-base text-rose-300 italic">
                          "{config.surpriseBoxMediaCaption}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. YOUTUBE VIDEO EMBED */}
                {hasYouTube && ytEmbedUrl && (
                  <div className="relative flex flex-col items-center bg-black">
                    <div className="w-full aspect-video">
                      <iframe
                        src={ytEmbedUrl}
                        title="Surprise Box Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0 rounded-t-2xl"
                      />
                    </div>
                    {config.surpriseBoxMediaCaption && (
                      <div className="w-full p-3 bg-stone-900 border-t border-stone-800 text-center">
                        <p className="font-serif-romantic text-sm sm:text-base text-rose-300 italic">
                          "{config.surpriseBoxMediaCaption}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. GOOGLE DRIVE VIDEO EMBED (STALL-FREE) */}
                {hasDrive && driveEmbedUrl && (
                  <div className="relative flex flex-col items-center bg-black">
                    <div className="w-full aspect-video">
                      <iframe
                        src={driveEmbedUrl}
                        title="Surprise Box Google Drive Video"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0 rounded-t-2xl"
                      />
                    </div>
                    {config.surpriseBoxMediaCaption && (
                      <div className="w-full p-3 bg-stone-900 border-t border-stone-800 text-center">
                        <p className="font-serif-romantic text-sm sm:text-base text-rose-300 italic">
                          "{config.surpriseBoxMediaCaption}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Finale Title */}
            <h3 className={`font-serif-romantic text-2xl sm:text-3xl font-bold mb-4 ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-900'}`}>
              {config.finaleMessageTitle}
            </h3>

            {/* Body */}
            <p className={`font-casual text-lg sm:text-xl leading-relaxed mb-6 whitespace-pre-line ${themeStyles.isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              {config.finaleMessageBody}
            </p>

            {/* Highlighted Lifetime Promise */}
            <div className={`p-5 rounded-2xl ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} mb-8`}>
              <span className={`text-[11px] uppercase tracking-wider font-bold block mb-1 ${themeStyles.isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                My Birthday Vow To You:
              </span>
              <p className={`font-serif-romantic italic text-lg sm:text-xl font-semibold leading-relaxed font-glow-gold ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                "{config.finalePromise}"
              </p>
            </div>

            {/* Signatures */}
            <div className={`flex items-end justify-between border-t ${themeStyles.isDark ? 'border-stone-800' : 'border-rose-100'} pt-6`}>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Recipient</span>
                <span className={`font-handwriting text-2xl font-bold ${themeStyles.isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  {config.recipientName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">With All My Soul</span>
                <span className="font-handwriting text-3xl font-bold text-rose-500">
                  {config.senderName} ❤️
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className={`mt-8 pt-6 border-t ${themeStyles.isDark ? 'border-stone-800' : 'border-stone-100'} flex flex-wrap items-center justify-center gap-3`}>
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${themeStyles.accentBtnGradient} text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Surprise Link Copied!' : 'Send This Surprise to My Love'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${themeStyles.cardHighlightBg} border ${themeStyles.cardBorder} ${themeStyles.isDark ? 'text-stone-200' : 'text-stone-700'} text-xs sm:text-sm font-medium transition-colors cursor-pointer hover:scale-102`}
              >
                <span>Wrap Box Again 🎁</span>
              </button>

              <button
                onClick={onOpenCustomizer}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-semibold transition-all hover:bg-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize Surprise Video/Pic ⚙️</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {isPhotoZoomed && config.surpriseBoxMediaUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsPhotoZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={config.surpriseBoxMediaUrl}
                alt="Surprise Zoom"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              {config.surpriseBoxMediaCaption && (
                <p className="mt-4 text-center font-serif-romantic text-base text-rose-200 italic px-4">
                  "{config.surpriseBoxMediaCaption}"
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
