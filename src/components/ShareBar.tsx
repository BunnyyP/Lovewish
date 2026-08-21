import { useState } from 'react';
import { Settings, Share2, Check, Sparkles, Heart, Lock } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { generateShareUrl } from '../utils/storage';
import { sound } from '../utils/audio';

interface ShareBarProps {
  config: BirthdayConfig;
  onOpenCustomizer: () => void;
  onSelectChapter: (id: string) => void;
  activeChapter: string;
}

export function ShareBar({
  config,
  onOpenCustomizer,
  onSelectChapter,
  activeChapter,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    const url = generateShareUrl(config);
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playSparkleChime();
    setTimeout(() => setCopied(false), 3000);
  };

  const navItems = [
    { id: 'hero-letter', label: 'Love Letter', icon: '💌' },
    { id: 'birthday-cake', label: 'Birthday Cake', icon: '🎂' },
    { id: 'photo-memories', label: 'Our Memories', icon: '📸' },
    { id: 'love-jar', label: 'Love Jar', icon: '✨' },
    { id: 'love-coupons', label: 'Gift Coupons', icon: '🎟️' },
    { id: 'gift-reveal', label: 'Grand Surprise', icon: '🎁' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-rose-200/50 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Romantic Monogram / Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-serif-romantic font-bold text-rose-900 dark:text-rose-100 flex items-center gap-1">
              <span>Happy Birthday, {config.recipientName}</span>
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-[10px] text-stone-500 font-sans-clean">Special Surprise Website</div>
          </div>
        </div>

        {/* Center: Chapter Jump Navigation Pills */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectChapter(item.id)}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                activeChapter === item.id
                  ? 'bg-rose-500 text-white shadow-sm scale-105'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-rose-100/70 dark:hover:bg-stone-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: Actions (Customization + Share Link) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="share-surprise-link-btn"
            onClick={handleCopyShareLink}
            title="Copy Shareable Link for your partner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-200 text-xs font-medium border border-rose-300/60 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Share Surprise</span>
              </>
            )}
          </button>

          <button
            id="open-customizer-btn"
            onClick={onOpenCustomizer}
            title="Customization (Protected)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-medium shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Customization</span>
          </button>
        </div>
      </div>
    </header>
  );
}
