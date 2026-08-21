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
import { Heart, Sparkles, Lock, Settings, Wand2 } from 'lucide-react';
import { getThemeStyles } from './utils/themeStyles';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => loadSavedConfig());
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState('hero-letter');

  const themeStyles = getThemeStyles(config.theme);

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

  const scrollToSection = (id: string) => {
    setActiveChapter(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen relative font-sans-clean overflow-x-hidden transition-colors duration-700 ${themeStyles.canvasBg} ${themeStyles.isDark ? 'dark text-stone-100' : 'text-stone-850'}`}>
      {/* Ambient Floating Stardust & Hearts */}
      <FloatingParticles />

      {/* Sealed Wax Envelope Intro Screen */}
      {!isEnvelopeOpen && (
        <EnvelopeIntro
          config={config}
          onOpen={() => setIsEnvelopeOpen(true)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
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
              <Settings className="w-3.5 h-3.5 text-rose-500" />
              <span>Edit / Customize Birthday Surprise</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Quick Customize Studio Trigger Button (Bottom Left) */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setIsCustomizerOpen(true)}
          title="Open Customizer & Settings Studio"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-[0_8px_25px_rgba(225,29,72,0.5)] hover:shadow-[0_10px_30px_rgba(225,29,72,0.8)] border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Wand2 className="w-4 h-4 animate-spin-slow" />
          <span>Customize Surprise ⚙️</span>
        </button>
      </div>

      {/* Audio Controller (Music Box Melody, YouTube Music, or Uploaded Songs & SFX) */}
      <AudioController config={config} />

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

