import { useState, useEffect } from 'react';
import { BirthdayConfig, LoveCoupon, ThemeType } from './types';
import { loadSavedConfig, saveConfig } from './utils/storage';
import { FloatingParticles } from './components/FloatingParticles';
import { EnvelopeIntro } from './components/EnvelopeIntro';
import { ShareBar } from './components/ShareBar';
import { BirthdayJhalar } from './components/BirthdayJhalar';
import { BirthdayHero } from './components/BirthdayHero';
import { InteractiveCake } from './components/InteractiveCake';
import { MemoryPolaroids } from './components/MemoryPolaroids';
import { LoveJar } from './components/LoveJar';
import { LoveCoupons } from './components/LoveCoupons';
import { GiftBoxReveal } from './components/GiftBoxReveal';
import { AudioController } from './components/AudioController';
import { CustomizerModal } from './components/CustomizerModal';
import { Heart, Sparkles, Lock } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => loadSavedConfig());
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState('hero-letter');

  // Sync title with recipient
  useEffect(() => {
    document.title = `Happy Birthday ${config.recipientName} ✨ Special Surprise`;
  }, [config.recipientName]);

  const handleUpdateCoupons = (updatedCoupons: LoveCoupon[]) => {
    const updatedConfig = { ...config, coupons: updatedCoupons };
    setConfig(updatedConfig);
    saveConfig(updatedConfig);
  };

  const handleSaveConfig = (newConfig: BirthdayConfig) => {
    const updated = { ...newConfig };
    setConfig(updated);
    saveConfig(updated);
  };

  const getThemeClasses = (theme?: ThemeType) => {
    switch (theme) {
      case 'midnight':
        return 'bg-gradient-to-b from-stone-950 via-purple-950/80 to-stone-950 text-stone-100 selection:bg-purple-800 selection:text-white dark';
      case 'sunset':
        return 'bg-gradient-to-b from-[#fff7ed] via-[#ffedd5] to-[#fed7aa] text-stone-900 selection:bg-amber-300 selection:text-amber-950';
      case 'crimson':
        return 'bg-gradient-to-b from-[#450a0a] via-[#1c0404] to-[#0d0202] text-rose-100 selection:bg-rose-700 selection:text-white dark';
      case 'emerald':
        return 'bg-gradient-to-b from-[#022c22] via-[#064e3b]/80 to-[#022c22] text-emerald-100 selection:bg-emerald-700 selection:text-white dark';
      case 'sakura':
        return 'bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8] text-stone-850 selection:bg-pink-300 selection:text-pink-950';
      case 'candyland':
        return 'bg-gradient-to-b from-[#ecfeff] via-[#fdf4ff] to-[#fff1f2] text-stone-850 selection:bg-pink-300 selection:text-pink-950';
      case 'lavender':
        return 'bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff] text-stone-800 selection:bg-purple-200 selection:text-purple-950';
      case 'vintage':
        return 'bg-gradient-to-b from-[#fefcf8] via-[#f8f3e6] to-[#ecdec4] text-stone-900 selection:bg-amber-300 selection:text-amber-950';
      case 'peach':
        return 'bg-gradient-to-b from-[#fffbf5] via-[#fff4e6] to-[#ffe8d6] text-stone-850 selection:bg-amber-200 selection:text-amber-950';
      case 'rose':
      default:
        return 'bg-gradient-to-b from-[#fff5f5] via-[#fff0f3] to-[#ffe4e9] dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-stone-800 dark:text-stone-100 selection:bg-rose-200 selection:text-rose-900';
    }
  };

  const scrollToSection = (id: string) => {
    setActiveChapter(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen relative font-sans-clean overflow-x-hidden transition-colors duration-700 ${getThemeClasses(config.theme)}`}>
      {/* Ambient Floating Stardust & Hearts */}
      <FloatingParticles />

      {/* Sealed Wax Envelope Intro Screen */}
      {!isEnvelopeOpen && (
        <EnvelopeIntro
          config={config}
          onOpen={() => setIsEnvelopeOpen(true)}
        />
      )}

      {/* Sticky Header Navigation & Share Bar */}
      <ShareBar
        config={config}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onSelectChapter={scrollToSection}
        activeChapter={activeChapter}
      />

      {/* FESTIVE BIRTHDAY GREETING JHALAR & BUNTINGS */}
      <div className="pt-2 sm:pt-4">
        <BirthdayJhalar config={config} />
      </div>

      {/* Main Surprise Flow */}
      <main className="relative z-10 space-y-8">
        {/* Chapter 1: Hero & Romantic Letter */}
        <BirthdayHero
          config={config}
          onScrollToCake={() => scrollToSection('birthday-cake')}
        />

        {/* Chapter 2: Virtual Birthday Cake & Blow Candles */}
        <InteractiveCake config={config} />

        {/* Chapter 3: Memory Clothesline & Polaroid Flip Cards */}
        <MemoryPolaroids
          config={config}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />

        {/* Chapter 4: Fairy Light Love Jar & Scratch Message */}
        <LoveJar
          config={config}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />

        {/* Chapter 5: Birthday Love Coupons */}
        <LoveCoupons
          config={config}
          onUpdateCoupons={handleUpdateCoupons}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />

        {/* Chapter 6: Grand Finale 3D Gift Box */}
        <GiftBoxReveal
          config={config}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      </main>

      {/* Romantic Footer */}
      <footer className="relative z-10 py-12 px-4 text-center border-t border-rose-200/60 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 backdrop-blur-xs mt-16">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="font-handwriting text-2xl font-bold">Made with endless love for {config.recipientName}</span>
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-serif-romantic italic">
            "May your birthday be as unforgettable and magical as you are."
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="text-xs text-rose-700 dark:text-rose-300 hover:underline inline-flex items-center gap-1.5 font-medium cursor-pointer py-1 px-3 rounded-full hover:bg-rose-100/50 dark:hover:bg-stone-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Customization</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Audio Controller (Music Box Melody & SFX) */}
      <AudioController />

      {/* Customizer Modal */}
      <CustomizerModal
        config={config}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

