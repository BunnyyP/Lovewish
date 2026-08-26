import { ThemeType } from '../types';

export interface ThemeStyles {
  // Main background and container
  canvasBg: string;
  isDark: boolean;

  // Typography & Animated Lighting effects
  heroTitleGradient: string;
  nameGlowClass: string;
  nameGradient: string;
  subtitleColor: string;
  sectionHeaderGradient: string;
  sectionSubtitleColor: string;
  
  // Card & Container typography contrast
  cardBg: string;
  cardBorder: string;
  cardTitleColor: string;
  cardBodyColor: string;
  cardMutedColor: string;
  cardHighlightBg: string;

  // Parchment / Love Letter Styling
  letterPaperBg: string;
  letterPaperBorder: string;
  letterTitleColor: string;
  letterBodyColor: string;
  letterSignatureColor: string;

  // Counter & Badges
  counterNumberColor: string;
  counterLabelColor: string;
  counterCardBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;

  // Accent button & glow
  glowColor: string;
  sparkleColor: string;
  accentBtnGradient: string;
}

export function getThemeStyles(theme?: ThemeType): ThemeStyles {
  switch (theme) {
    case 'celestial-stardust':
      return {
        canvasBg: 'bg-gradient-to-b from-[#0a0518] via-[#0f0a26] via-[#1a0b2e] to-[#060210]',
        isDark: true,
        heroTitleGradient: 'from-amber-100 via-rose-200 to-indigo-200',
        nameGlowClass: 'font-glow-midnight',
        nameGradient: 'from-amber-200 via-rose-300 via-purple-200 to-cyan-200',
        subtitleColor: 'text-rose-200 font-semibold drop-shadow-md',
        sectionHeaderGradient: 'from-amber-100 via-rose-200 to-indigo-200',
        sectionSubtitleColor: 'text-indigo-200/90 font-medium',
        cardBg: 'bg-indigo-950/70 backdrop-blur-xl',
        cardBorder: 'border-indigo-500/40 hover:border-rose-400/70 shadow-[0_8px_35px_rgba(99,102,241,0.25)]',
        cardTitleColor: 'text-amber-100 font-bold',
        cardBodyColor: 'text-stone-100',
        cardMutedColor: 'text-indigo-200/80',
        cardHighlightBg: 'bg-indigo-900/60 border-indigo-700/60',
        letterPaperBg: 'bg-[#120824]',
        letterPaperBorder: 'border-indigo-400/50 shadow-[0_0_50px_rgba(168,85,247,0.35)]',
        letterTitleColor: 'text-amber-200',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-rose-300 font-glow-rose',
        counterNumberColor: 'text-amber-300 font-glow-gold',
        counterLabelColor: 'text-indigo-200 font-medium',
        counterCardBg: 'bg-indigo-950/80 border-indigo-800/70 shadow-inner',
        badgeBg: 'bg-indigo-950/90',
        badgeText: 'text-amber-200 font-semibold',
        badgeBorder: 'border-amber-300/50 shadow-[0_0_15px_rgba(251,191,36,0.45)]',
        glowColor: 'rgba(168, 85, 247, 0.65)',
        sparkleColor: '#fde047',
        accentBtnGradient: 'from-indigo-600 via-rose-600 to-amber-500',
      };

    case 'couple-love':
      return {
        canvasBg: 'bg-gradient-to-b from-[#2a0813] via-[#1a040b] to-[#0d0206]',
        isDark: true,
        heroTitleGradient: 'from-rose-100 via-pink-200 to-amber-200',
        nameGlowClass: 'font-glow-rose',
        nameGradient: 'from-rose-400 via-pink-300 to-amber-300',
        subtitleColor: 'text-pink-200 font-semibold drop-shadow-md',
        sectionHeaderGradient: 'from-rose-100 via-pink-200 to-amber-200',
        sectionSubtitleColor: 'text-pink-200/90 font-medium',
        cardBg: 'bg-stone-900/90 backdrop-blur-md',
        cardBorder: 'border-rose-700/50 hover:border-pink-500/70 shadow-[0_8px_32px_rgba(244,63,94,0.25)]',
        cardTitleColor: 'text-rose-100 font-bold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-pink-300/80',
        cardHighlightBg: 'bg-rose-950/80 border-rose-800/70',
        letterPaperBg: 'bg-[#1e070f]',
        letterPaperBorder: 'border-rose-600/50 shadow-[0_0_45px_rgba(244,63,94,0.35)]',
        letterTitleColor: 'text-rose-100',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-amber-300 font-glow-gold',
        counterNumberColor: 'text-pink-400 font-glow-rose',
        counterLabelColor: 'text-rose-200 font-medium',
        counterCardBg: 'bg-rose-950/80 border-rose-800/70 shadow-inner',
        badgeBg: 'bg-rose-950/90',
        badgeText: 'text-rose-200 font-semibold',
        badgeBorder: 'border-pink-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
        glowColor: 'rgba(244, 63, 94, 0.65)',
        sparkleColor: '#f43f5e',
        accentBtnGradient: 'from-rose-600 via-pink-600 to-red-600',
      };

    case 'surprise':
      return {
        canvasBg: 'bg-gradient-to-b from-[#180828] via-[#0d0418] to-[#040108]',
        isDark: true,
        heroTitleGradient: 'from-amber-200 via-fuchsia-200 to-cyan-200',
        nameGlowClass: 'font-glow-midnight',
        nameGradient: 'from-amber-300 via-fuchsia-400 to-cyan-300',
        subtitleColor: 'text-purple-200 font-semibold drop-shadow-md',
        sectionHeaderGradient: 'from-amber-200 via-fuchsia-200 to-cyan-200',
        sectionSubtitleColor: 'text-purple-200/90 font-medium',
        cardBg: 'bg-stone-900/90 backdrop-blur-md',
        cardBorder: 'border-fuchsia-600/40 hover:border-amber-400/60 shadow-[0_8px_32px_rgba(192,38,211,0.25)]',
        cardTitleColor: 'text-purple-100 font-bold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-purple-300/80',
        cardHighlightBg: 'bg-purple-950/80 border-fuchsia-800/60',
        letterPaperBg: 'bg-[#150722]',
        letterPaperBorder: 'border-fuchsia-500/50 shadow-[0_0_45px_rgba(217,70,239,0.35)]',
        letterTitleColor: 'text-amber-200',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-cyan-300 font-glow-candyland',
        counterNumberColor: 'text-amber-300 font-glow-gold',
        counterLabelColor: 'text-purple-200 font-medium',
        counterCardBg: 'bg-purple-950/80 border-purple-800/60 shadow-inner',
        badgeBg: 'bg-purple-950/90',
        badgeText: 'text-amber-200 font-semibold',
        badgeBorder: 'border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
        glowColor: 'rgba(217, 70, 239, 0.65)',
        sparkleColor: '#fbbf24',
        accentBtnGradient: 'from-amber-500 via-fuchsia-600 to-cyan-500',
      };

    case 'midnight':
      return {
        canvasBg: 'bg-gradient-to-b from-stone-950 via-purple-950/90 to-stone-950',
        isDark: true,
        heroTitleGradient: 'from-purple-200 via-pink-100 to-amber-200',
        nameGlowClass: 'font-glow-midnight',
        nameGradient: 'from-amber-300 via-fuchsia-300 to-pink-300',
        subtitleColor: 'text-purple-200 drop-shadow-sm',
        sectionHeaderGradient: 'from-purple-200 via-pink-200 to-amber-200',
        sectionSubtitleColor: 'text-purple-300/90',
        cardBg: 'bg-stone-900/85 backdrop-blur-md',
        cardBorder: 'border-purple-500/30 hover:border-purple-400/60 shadow-[0_8px_32px_rgba(168,85,247,0.18)]',
        cardTitleColor: 'text-purple-100 font-semibold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-purple-300/70',
        cardHighlightBg: 'bg-purple-950/70 border-purple-800/60',
        letterPaperBg: 'bg-stone-900/95',
        letterPaperBorder: 'border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)]',
        letterTitleColor: 'text-purple-200',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-amber-300 font-glow-gold',
        counterNumberColor: 'text-amber-300 font-glow-gold',
        counterLabelColor: 'text-purple-300',
        counterCardBg: 'bg-purple-950/60 border-purple-800/50 shadow-inner',
        badgeBg: 'bg-purple-950/80',
        badgeText: 'text-purple-200',
        badgeBorder: 'border-purple-400/40 shadow-[0_0_15px_rgba(192,132,252,0.3)]',
        glowColor: 'rgba(192, 132, 252, 0.6)',
        sparkleColor: '#fde047',
        accentBtnGradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
      };

    case 'sensual-passion':
      return {
        canvasBg: 'bg-gradient-to-b from-[#13010b] via-[#210214] to-[#0a0006]',
        isDark: true,
        heroTitleGradient: 'from-rose-100 via-pink-100 to-amber-200',
        nameGlowClass: 'font-glow-sensual',
        nameGradient: 'from-rose-500 via-pink-400 to-amber-300',
        subtitleColor: 'text-rose-200/95 drop-shadow-md font-semibold tracking-wide',
        sectionHeaderGradient: 'from-rose-100 via-pink-200 to-amber-200',
        sectionSubtitleColor: 'text-pink-300/90 font-medium',
        cardBg: 'bg-[#18030e]/90 backdrop-blur-xl',
        cardBorder: 'border-pink-500/35 hover:border-rose-400/80 shadow-[0_12px_45px_rgba(244,63,94,0.25)] hover:shadow-[0_15px_55px_rgba(244,63,94,0.45)]',
        cardTitleColor: 'text-rose-100 font-bold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-pink-300/80',
        cardHighlightBg: 'bg-pink-950/75 border-pink-700/50 shadow-inner',
        letterPaperBg: 'bg-[#1a0410]/95',
        letterPaperBorder: 'border-rose-500/50 shadow-[0_0_55px_rgba(244,63,94,0.38)]',
        letterTitleColor: 'text-rose-100 font-bold',
        letterBodyColor: 'text-stone-100 leading-relaxed',
        letterSignatureColor: 'text-rose-400 font-glow-sensual',
        counterNumberColor: 'text-rose-400 font-glow-sensual',
        counterLabelColor: 'text-pink-200 font-semibold',
        counterCardBg: 'bg-[#290417]/85 border-pink-700/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]',
        badgeBg: 'bg-gradient-to-r from-rose-950/95 via-pink-950/95 to-purple-950/95',
        badgeText: 'text-rose-200 font-bold tracking-wide',
        badgeBorder: 'border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.5)]',
        glowColor: 'rgba(244, 63, 94, 0.75)',
        sparkleColor: '#fb7185',
        accentBtnGradient: 'from-rose-600 via-pink-600 to-amber-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]',
      };

    case 'sunset':
      return {
        canvasBg: 'bg-gradient-to-b from-[#fffaf0] via-[#ffedd5] to-[#fed7aa]',
        isDark: false,
        heroTitleGradient: 'from-amber-950 via-rose-900 to-orange-950',
        nameGlowClass: 'font-glow-sunset',
        nameGradient: 'from-orange-600 via-rose-600 to-amber-600',
        subtitleColor: 'text-orange-900 font-semibold',
        sectionHeaderGradient: 'from-amber-950 via-orange-900 to-rose-900',
        sectionSubtitleColor: 'text-orange-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-orange-200 hover:border-orange-400 shadow-[0_8px_30px_rgba(249,115,22,0.12)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-orange-900/70',
        cardHighlightBg: 'bg-orange-50 border-orange-200',
        letterPaperBg: 'bg-[#fffaf0]',
        letterPaperBorder: 'border-orange-300 shadow-[0_15px_40px_rgba(249,115,22,0.15)]',
        letterTitleColor: 'text-amber-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-rose-700 font-glow-sunset',
        counterNumberColor: 'text-orange-700 font-glow-sunset',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-orange-50/90 border-orange-200',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-900 font-semibold',
        badgeBorder: 'border-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.3)]',
        glowColor: 'rgba(249, 115, 22, 0.5)',
        sparkleColor: '#ea580c',
        accentBtnGradient: 'from-orange-500 via-rose-500 to-amber-500',
      };

    case 'crimson':
      return {
        canvasBg: 'bg-gradient-to-b from-[#3a0606] via-[#1f0303] to-[#0d0101]',
        isDark: true,
        heroTitleGradient: 'from-rose-100 via-red-200 to-amber-200',
        nameGlowClass: 'font-glow-crimson',
        nameGradient: 'from-red-400 via-rose-300 to-amber-300',
        subtitleColor: 'text-rose-200 font-semibold drop-shadow-sm',
        sectionHeaderGradient: 'from-rose-100 via-red-200 to-amber-200',
        sectionSubtitleColor: 'text-rose-300/90',
        cardBg: 'bg-stone-900/90 backdrop-blur-md',
        cardBorder: 'border-red-900/60 hover:border-red-600/60 shadow-[0_8px_32px_rgba(220,38,38,0.2)]',
        cardTitleColor: 'text-rose-100 font-semibold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-rose-300/70',
        cardHighlightBg: 'bg-red-950/70 border-red-900/60',
        letterPaperBg: 'bg-stone-900/95',
        letterPaperBorder: 'border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]',
        letterTitleColor: 'text-rose-100',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-rose-300 font-glow-crimson',
        counterNumberColor: 'text-rose-400 font-glow-crimson',
        counterLabelColor: 'text-rose-300 font-medium',
        counterCardBg: 'bg-red-950/80 border-red-900/60 shadow-inner',
        badgeBg: 'bg-red-950/90',
        badgeText: 'text-rose-200 font-medium',
        badgeBorder: 'border-red-600/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        sparkleColor: '#fca5a5',
        accentBtnGradient: 'from-red-600 via-rose-600 to-red-700',
      };

    case 'emerald':
      return {
        canvasBg: 'bg-gradient-to-b from-[#022c22] via-[#064e3b]/90 to-[#022018]',
        isDark: true,
        heroTitleGradient: 'from-emerald-100 via-teal-100 to-amber-200',
        nameGlowClass: 'font-glow-emerald',
        nameGradient: 'from-emerald-300 via-teal-200 to-amber-300',
        subtitleColor: 'text-emerald-200 font-semibold drop-shadow-sm',
        sectionHeaderGradient: 'from-emerald-100 via-teal-200 to-amber-200',
        sectionSubtitleColor: 'text-emerald-300/90',
        cardBg: 'bg-stone-900/90 backdrop-blur-md',
        cardBorder: 'border-emerald-800/60 hover:border-emerald-500/60 shadow-[0_8px_32px_rgba(16,185,129,0.18)]',
        cardTitleColor: 'text-emerald-100 font-semibold',
        cardBodyColor: 'text-stone-200',
        cardMutedColor: 'text-emerald-300/70',
        cardHighlightBg: 'bg-emerald-950/70 border-emerald-800/60',
        letterPaperBg: 'bg-stone-900/95',
        letterPaperBorder: 'border-emerald-700/50 shadow-[0_0_40px_rgba(16,185,129,0.25)]',
        letterTitleColor: 'text-emerald-100',
        letterBodyColor: 'text-stone-100',
        letterSignatureColor: 'text-amber-300 font-glow-gold',
        counterNumberColor: 'text-emerald-300 font-glow-emerald',
        counterLabelColor: 'text-emerald-300 font-medium',
        counterCardBg: 'bg-emerald-950/80 border-emerald-800/60 shadow-inner',
        badgeBg: 'bg-emerald-950/90',
        badgeText: 'text-emerald-200',
        badgeBorder: 'border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.35)]',
        glowColor: 'rgba(52, 211, 153, 0.6)',
        sparkleColor: '#6ee7b7',
        accentBtnGradient: 'from-emerald-600 via-teal-600 to-emerald-700',
      };

    case 'sakura':
      return {
        canvasBg: 'bg-gradient-to-b from-[#fff1f5] via-[#fce7f3] to-[#fbcfe8]',
        isDark: false,
        heroTitleGradient: 'from-pink-950 via-rose-900 to-fuchsia-950',
        nameGlowClass: 'font-glow-sakura',
        nameGradient: 'from-pink-600 via-rose-500 to-fuchsia-600',
        subtitleColor: 'text-pink-900 font-semibold',
        sectionHeaderGradient: 'from-pink-950 via-rose-900 to-fuchsia-950',
        sectionSubtitleColor: 'text-pink-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-pink-200 hover:border-pink-400 shadow-[0_8px_30px_rgba(244,114,182,0.15)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-pink-900/70',
        cardHighlightBg: 'bg-pink-50 border-pink-200',
        letterPaperBg: 'bg-[#fff5f8]',
        letterPaperBorder: 'border-pink-300 shadow-[0_15px_40px_rgba(244,114,182,0.15)]',
        letterTitleColor: 'text-pink-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-pink-700 font-glow-sakura',
        counterNumberColor: 'text-pink-600 font-glow-sakura',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-pink-50/90 border-pink-200',
        badgeBg: 'bg-pink-100',
        badgeText: 'text-pink-900 font-semibold',
        badgeBorder: 'border-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.35)]',
        glowColor: 'rgba(244, 114, 182, 0.55)',
        sparkleColor: '#f43f5e',
        accentBtnGradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
      };

    case 'candyland':
      return {
        canvasBg: 'bg-gradient-to-b from-[#e0f7fa] via-[#fdf4ff] to-[#fff1f2]',
        isDark: false,
        heroTitleGradient: 'from-purple-950 via-pink-900 to-cyan-950',
        nameGlowClass: 'font-glow-candyland',
        nameGradient: 'from-pink-500 via-purple-500 to-cyan-500',
        subtitleColor: 'text-purple-950 font-semibold',
        sectionHeaderGradient: 'from-pink-950 via-purple-900 to-cyan-950',
        sectionSubtitleColor: 'text-purple-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-pink-200 hover:border-cyan-300 shadow-[0_8px_30px_rgba(236,72,153,0.12)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-purple-900/70',
        cardHighlightBg: 'bg-cyan-50/70 border-pink-200',
        letterPaperBg: 'bg-[#fffafd]',
        letterPaperBorder: 'border-pink-300 shadow-[0_15px_40px_rgba(236,72,153,0.15)]',
        letterTitleColor: 'text-purple-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-pink-600 font-glow-candyland',
        counterNumberColor: 'text-purple-600 font-glow-candyland',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-pink-50/90 border-pink-200',
        badgeBg: 'bg-gradient-to-r from-pink-100 to-cyan-100',
        badgeText: 'text-purple-900 font-semibold',
        badgeBorder: 'border-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]',
        glowColor: 'rgba(236, 72, 153, 0.55)',
        sparkleColor: '#06b6d4',
        accentBtnGradient: 'from-pink-500 via-purple-500 to-cyan-500',
      };

    case 'lavender':
      return {
        canvasBg: 'bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
        isDark: false,
        heroTitleGradient: 'from-purple-950 via-violet-900 to-indigo-950',
        nameGlowClass: 'font-glow-lavender',
        nameGradient: 'from-purple-600 via-violet-600 to-pink-600',
        subtitleColor: 'text-purple-900 font-semibold',
        sectionHeaderGradient: 'from-purple-950 via-violet-900 to-indigo-950',
        sectionSubtitleColor: 'text-purple-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-purple-200 hover:border-purple-400 shadow-[0_8px_30px_rgba(168,85,247,0.12)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-purple-900/70',
        cardHighlightBg: 'bg-purple-50 border-purple-200',
        letterPaperBg: 'bg-[#faf5ff]',
        letterPaperBorder: 'border-purple-300 shadow-[0_15px_40px_rgba(168,85,247,0.15)]',
        letterTitleColor: 'text-purple-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-purple-700 font-glow-lavender',
        counterNumberColor: 'text-purple-700 font-glow-lavender',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-purple-50/90 border-purple-200',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-900 font-semibold',
        badgeBorder: 'border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
        glowColor: 'rgba(168, 85, 247, 0.55)',
        sparkleColor: '#9333ea',
        accentBtnGradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
      };

    case 'vintage':
      return {
        canvasBg: 'bg-gradient-to-b from-[#fefcf8] via-[#f8f3e6] to-[#ecdec4]',
        isDark: false,
        heroTitleGradient: 'from-amber-950 via-stone-900 to-yellow-950',
        nameGlowClass: 'font-glow-vintage',
        nameGradient: 'from-amber-800 via-amber-700 to-yellow-800',
        subtitleColor: 'text-amber-950 font-semibold',
        sectionHeaderGradient: 'from-amber-950 via-stone-900 to-yellow-950',
        sectionSubtitleColor: 'text-amber-900/90',
        cardBg: 'bg-[#fffdf9]/95 backdrop-blur-md',
        cardBorder: 'border-amber-300/80 hover:border-amber-500 shadow-[0_8px_30px_rgba(180,83,9,0.12)]',
        cardTitleColor: 'text-stone-950 font-bold',
        cardBodyColor: 'text-stone-900',
        cardMutedColor: 'text-amber-950/70',
        cardHighlightBg: 'bg-amber-50 border-amber-300',
        letterPaperBg: 'bg-[#faf5ea]',
        letterPaperBorder: 'border-amber-400/70 shadow-[0_15px_40px_rgba(180,83,9,0.18)]',
        letterTitleColor: 'text-amber-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-amber-900 font-glow-vintage',
        counterNumberColor: 'text-amber-800 font-glow-vintage',
        counterLabelColor: 'text-stone-800 font-semibold',
        counterCardBg: 'bg-amber-100/70 border-amber-300',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-950 font-semibold',
        badgeBorder: 'border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.3)]',
        glowColor: 'rgba(180, 83, 9, 0.45)',
        sparkleColor: '#d97706',
        accentBtnGradient: 'from-amber-700 via-yellow-700 to-amber-800',
      };

    case 'peach':
      return {
        canvasBg: 'bg-gradient-to-b from-[#fffbf5] via-[#fff3e6] to-[#ffe5cf]',
        isDark: false,
        heroTitleGradient: 'from-orange-950 via-rose-900 to-amber-950',
        nameGlowClass: 'font-glow-peach',
        nameGradient: 'from-rose-500 via-orange-500 to-amber-500',
        subtitleColor: 'text-orange-950 font-semibold',
        sectionHeaderGradient: 'from-orange-950 via-rose-900 to-amber-950',
        sectionSubtitleColor: 'text-orange-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-orange-200 hover:border-orange-400 shadow-[0_8px_30px_rgba(251,146,60,0.12)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-orange-900/70',
        cardHighlightBg: 'bg-orange-50 border-orange-200',
        letterPaperBg: 'bg-[#fffaf5]',
        letterPaperBorder: 'border-orange-300 shadow-[0_15px_40px_rgba(251,146,60,0.15)]',
        letterTitleColor: 'text-orange-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-rose-600 font-glow-peach',
        counterNumberColor: 'text-orange-600 font-glow-peach',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-orange-50/90 border-orange-200',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-950 font-semibold',
        badgeBorder: 'border-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.3)]',
        glowColor: 'rgba(251, 146, 60, 0.55)',
        sparkleColor: '#f97316',
        accentBtnGradient: 'from-orange-500 via-rose-500 to-amber-500',
      };

    case 'rose':
    default:
      return {
        canvasBg: 'bg-gradient-to-b from-[#fff5f5] via-[#fff0f3] to-[#ffe4e9]',
        isDark: false,
        heroTitleGradient: 'from-stone-950 via-rose-950 to-stone-900',
        nameGlowClass: 'font-glow-rose',
        nameGradient: 'from-rose-600 via-pink-600 to-rose-500',
        subtitleColor: 'text-rose-900 font-semibold',
        sectionHeaderGradient: 'from-stone-950 via-rose-950 to-stone-900',
        sectionSubtitleColor: 'text-rose-900/90',
        cardBg: 'bg-white/90 backdrop-blur-md',
        cardBorder: 'border-rose-200 hover:border-rose-400 shadow-[0_8px_30px_rgba(244,63,94,0.12)]',
        cardTitleColor: 'text-stone-900 font-bold',
        cardBodyColor: 'text-stone-800',
        cardMutedColor: 'text-rose-900/70',
        cardHighlightBg: 'bg-rose-50 border-rose-200',
        letterPaperBg: 'bg-[#fffdfa]',
        letterPaperBorder: 'border-rose-300 shadow-[0_15px_40px_rgba(244,63,94,0.15)]',
        letterTitleColor: 'text-rose-950 font-bold',
        letterBodyColor: 'text-stone-900 font-medium',
        letterSignatureColor: 'text-rose-700 font-glow-rose',
        counterNumberColor: 'text-rose-600 font-glow-rose',
        counterLabelColor: 'text-stone-700 font-semibold',
        counterCardBg: 'bg-rose-50/90 border-rose-100',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-900 font-semibold',
        badgeBorder: 'border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
        glowColor: 'rgba(244, 63, 94, 0.55)',
        sparkleColor: '#e11d48',
        accentBtnGradient: 'from-rose-600 via-pink-600 to-rose-600',
      };
  }
}
