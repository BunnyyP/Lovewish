import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  Share2,
  Check,
  Heart,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Ticket,
  FileText,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Music,
  ShieldCheck,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { BirthdayConfig, PolaroidPhoto, LoveReason, LoveCoupon, ThemeType } from '../types';
import { saveConfig, generateShareUrl, DEFAULT_BIRTHDAY_CONFIG } from '../utils/storage';
import { sound } from '../utils/audio';

interface CustomizerModalProps {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: BirthdayConfig) => void;
}

export function CustomizerModal({ config, isOpen, onClose, onSave }: CustomizerModalProps) {
  const [formData, setFormData] = useState<BirthdayConfig>(config);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'photos' | 'letter' | 'reasons' | 'coupons' | 'share'>('profile');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync formData when config changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(config);
      setEnteredPassword('');
      setPasswordError(false);
      setSaveSuccess(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const expectedPassword = config.customizationPassword || 'HoneyBunny';

  // Handle password submission
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (enteredPassword === expectedPassword) {
      setIsAuthenticated(true);
      setPasswordError(false);
      sound.playSparkleChime();
    } else {
      setPasswordError(true);
      sound.playPop();
    }
  };

  const handleSave = () => {
    saveConfig(formData);
    onSave(formData);
    sound.playSparkleChime();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all customizations and themes back to default?')) {
      const resetConfig: BirthdayConfig = {
        ...DEFAULT_BIRTHDAY_CONFIG,
        customizationPassword: 'HoneyBunny',
      };
      setFormData(resetConfig);
      saveConfig(resetConfig);
      onSave(resetConfig);
      sound.playSparkleChime();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const url = generateShareUrl(formData);
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playSparkleChime();
    setTimeout(() => setCopied(false), 3000);
  };

  // Photo Upload Handler (FileReader base64)
  const handlePhotoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const url = e.target.result as string;
        const newPolaroids = [...formData.polaroids];
        newPolaroids[index] = {
          ...newPolaroids[index],
          url,
        };
        setFormData({ ...formData, polaroids: newPolaroids });
        sound.playSparkleChime();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPolaroid = () => {
    const newId = 'p_' + Date.now();
    const newPhoto: PolaroidPhoto = {
      id: newId,
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      caption: 'A moment forever frozen in time ✨',
      date: 'Our Sweet Memory',
      location: 'Together',
      noteOnBack: 'I love you more than words can ever describe.',
    };
    setFormData({ ...formData, polaroids: [...formData.polaroids, newPhoto] });
    sound.playPop();
  };

  const handleRemovePolaroid = (index: number) => {
    const newPolaroids = formData.polaroids.filter((_, i) => i !== index);
    setFormData({ ...formData, polaroids: newPolaroids });
    sound.playPop();
  };

  const handleAddReason = () => {
    const newReason: LoveReason = {
      id: 'r_' + Date.now(),
      title: 'Your Radiant Soul',
      message: 'You make every single day feel lighter, softer, and more beautiful.',
      icon: 'Heart',
    };
    setFormData({ ...formData, reasons: [...formData.reasons, newReason] });
    sound.playPop();
  };

  const handleRemoveReason = (index: number) => {
    const newReasons = formData.reasons.filter((_, i) => i !== index);
    setFormData({ ...formData, reasons: newReasons });
    sound.playPop();
  };

  const handleAddCoupon = () => {
    const newCoupon: LoveCoupon = {
      id: 'c_' + Date.now(),
      title: 'Romantic Candlelight Dinner Date',
      description: 'Your favorite cuisine, mood lighting, and dessert on me.',
      icon: 'Heart',
      redeemed: false,
      code: 'DATE-NIGHT-' + Math.floor(Math.random() * 90 + 10),
    };
    setFormData({ ...formData, coupons: [...formData.coupons, newCoupon] });
    sound.playPop();
  };

  const handleRemoveCoupon = (index: number) => {
    const newCoupons = formData.coupons.filter((_, i) => i !== index);
    setFormData({ ...formData, coupons: newCoupons });
    sound.playPop();
  };

  const THEMES_LIST: Array<{
    id: ThemeType;
    name: string;
    tagline: string;
    badge: string;
    gradient: string;
    colors: string[];
    dark?: boolean;
  }> = [
    {
      id: 'rose',
      name: 'Rose Quartz Romance',
      tagline: 'Delicate blush pink, romantic rose petals & gold',
      badge: 'Classic Love',
      gradient: 'from-[#fff0f3] to-[#ffe4e9]',
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    },
    {
      id: 'midnight',
      name: 'Starlight Galaxy',
      tagline: 'Deep celestial dark velvet, cosmic stardust & neon rose',
      badge: 'Most Popular',
      gradient: 'from-stone-950 via-purple-950 to-stone-950',
      colors: ['#a855f7', '#ec4899', '#38bdf8', '#fbbf24'],
      dark: true,
    },
    {
      id: 'sunset',
      name: 'Golden Hour Sunset',
      tagline: 'Warm amber glow, coral apricot & golden sunshine romance',
      badge: 'Vibrant Warmth',
      gradient: 'from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
      colors: ['#f97316', '#fb923c', '#f59e0b', '#e11d48'],
    },
    {
      id: 'crimson',
      name: 'Ruby Velvet Passion',
      tagline: 'Deep intense scarlet ruby, candlelit wine & romantic fire',
      badge: 'Deep Passion',
      gradient: 'from-[#4a0404] via-[#2b0000] to-[#1a0000]',
      colors: ['#e11d48', '#be123c', '#9f1239', '#fbbf24'],
      dark: true,
    },
    {
      id: 'emerald',
      name: 'Enchanted Fairytale',
      tagline: 'Deep royal forest emerald, warm champagne & fairy lights',
      badge: 'Royal Romance',
      gradient: 'from-[#022c22] via-[#064e3b] to-[#022c22]',
      colors: ['#10b981', '#34d399', '#fbbf24', '#fef08a'],
      dark: true,
    },
    {
      id: 'sakura',
      name: 'Sakura Petal Breeze',
      tagline: 'Japanese cherry blossoms, soft pastel aura & sweet purity',
      badge: 'Gentle & Pure',
      gradient: 'from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]',
      colors: ['#ec4899', '#f472b6', '#fbcfe8', '#ffffff'],
    },
    {
      id: 'candyland',
      name: 'Festive Birthday Carnival',
      tagline: 'Vibrant confetti balloons, celebratory pop & joyful surprise',
      badge: 'Celebration Pop',
      gradient: 'from-[#ecfeff] via-[#fdf4ff] to-[#fff1f2]',
      colors: ['#ec4899', '#06b6d4', '#eab308', '#8b5cf6'],
    },
    {
      id: 'lavender',
      name: 'Lavender Dreams',
      tagline: 'Pastel lilac mist, dreamy violet glow & ethereal stars',
      badge: 'Dreamy',
      gradient: 'from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
      colors: ['#a855f7', '#c084fc', '#e9d5ff', '#38bdf8'],
    },
    {
      id: 'vintage',
      name: 'Vintage Sepia Parchment',
      tagline: 'Warm antique parchment, nostalgic wax seals & memory books',
      badge: 'Timeless',
      gradient: 'from-[#fefcf8] via-[#f8f3e6] to-[#ecdec4]',
      colors: ['#b45309', '#d97706', '#78350f', '#fef3c7'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* 1. PASSWORD PROTECTION LOCK SCREEN */}
      {!isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-sm sm:max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-stone-800 p-6 sm:p-8 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Glowing Lock Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20 mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h3 className="font-serif-romantic text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Customization
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-5 font-sans-clean">
            Please enter the password to access customization settings.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-2.5 sm:py-3 pr-11 rounded-xl border bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none transition-all ${
                    passwordError
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-400 bg-rose-50/40 dark:bg-rose-950/30'
                      : 'border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-rose-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2"
                >
                  Incorrect password. Please try again.
                </motion.p>
              )}
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md cursor-pointer active:scale-95"
              >
                Unlock
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        /* 2. FULL MOBILE-RESPONSIVE CUSTOMIZATION STUDIO (UNLOCKED) */
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative max-w-4xl w-full h-[92vh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-200 dark:border-stone-800 flex flex-col overflow-hidden"
        >
          {/* STICKY TOP HEADER */}
          <div className="p-3.5 sm:p-5 border-b border-rose-100 dark:border-stone-800 flex items-center justify-between bg-rose-50/90 dark:bg-stone-850/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif-romantic text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                    Customization
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-0.5 shrink-0">
                    <ShieldCheck className="w-3 h-3" /> Unlocked
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans-clean hidden sm:block truncate">
                  Personalize names, themes, love letters, couple photos, reasons & coupons
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaults}
                title="Reset all content and theme to defaults"
                className="px-2.5 py-1.5 text-stone-500 hover:text-rose-600 rounded-lg sm:rounded-xl hover:bg-rose-100/70 dark:hover:bg-stone-800 text-[11px] sm:text-xs font-medium flex items-center gap-1 border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                title="Lock Customization"
                className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg sm:rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg sm:rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Saved successfully! Website content updated.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STICKY HORIZONTAL SCROLLABLE TABS BAR (NEVER GETS HIDDEN ON MOBILE) */}
          <div className="flex border-b border-stone-200 dark:border-stone-800 px-2 sm:px-4 overflow-x-auto bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md shrink-0 no-scrollbar gap-1.5 py-1.5">
            {[
              { id: 'profile', label: 'Names & Dates', icon: Heart },
              { id: 'theme', label: 'Themes & Atmosphere', icon: Palette },
              { id: 'photos', label: 'Photos Clothesline', icon: Camera, count: formData.polaroids.length },
              { id: 'letter', label: 'Letter & Vows', icon: FileText },
              { id: 'reasons', label: 'Love Jar Reasons', icon: Sparkles, count: formData.reasons.length },
              { id: 'coupons', label: 'Love Coupons', icon: Ticket, count: formData.coupons.length },
              { id: 'share', label: 'Share Link', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 border border-stone-200/60 dark:border-stone-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-rose-100 dark:bg-stone-700 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SCROLLABLE MODAL BODY */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-left">
            {/* TAB 1: Profile & Password */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" /> Couple Details & Milestone
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    These names and dates appear on the sealed envelope, birthday greeting jhalar, virtual cake, and live milestone counter.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Partner / Recipient's Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      placeholder="e.g. Emily Rose"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Partner's Sweet Nickname (Shows on Jhalar & Seal)
                    </label>
                    <input
                      type="text"
                      value={formData.recipientNickname}
                      onChange={(e) => setFormData({ ...formData, recipientNickname: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      placeholder="e.g. My Cutie Pie ✨"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Your Name (Sender)
                    </label>
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      placeholder="e.g. Alex"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Birthday Date
                    </label>
                    <input
                      type="date"
                      value={formData.birthdayDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, birthdayDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Relationship Start Date (For Loving Timer)
                    </label>
                    <input
                      type="date"
                      value={formData.relationshipStartDate || '2023-01-01'}
                      onChange={(e) => setFormData({ ...formData, relationshipStartDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Customization Password
                    </label>
                    <input
                      type="text"
                      value={formData.customizationPassword || 'HoneyBunny'}
                      onChange={(e) => setFormData({ ...formData, customizationPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Themes & Atmosphere */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                      Choose Your Magical Theme
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Instantly transforms colors, backgrounds, greeting jhalar bunting, and visual aura
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {THEMES_LIST.map((th) => {
                    const isSelected = formData.theme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, theme: th.id });
                          sound.playSparkleChime();
                        }}
                        className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-rose-500 ring-2 ring-rose-400 shadow-md bg-rose-50/60 dark:bg-stone-800'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 bg-white dark:bg-stone-850'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              {th.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold shrink-0">
                              {th.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2 leading-relaxed">
                            {th.tagline}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                          {/* Color Swatch Palette */}
                          <div className="flex items-center -space-x-1">
                            {th.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full border border-white dark:border-stone-900 shadow-xs"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          {isSelected && (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Romantic Music Box Melody
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                          Ambient acoustic lullaby music box plays upon envelope unsealing
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.bgMusicEnabled}
                        onChange={(e) => setFormData({ ...formData, bgMusicEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Photos Clothesline (MOBILE-OPTIMIZED) */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                      Couple Memory Photos ({formData.polaroids.length})
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Upload real photos from your phone gallery or edit handwritten captions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPolaroid}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.polaroids.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-3 shadow-xs"
                    >
                      {/* Photo card top bar */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" /> Memory #{idx + 1}
                        </span>
                        {formData.polaroids.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePolaroid(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Photo thumbnail & upload trigger */}
                      <div className="flex gap-3 items-center">
                        <img
                          src={photo.url}
                          alt="preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-300 dark:border-stone-700 shrink-0 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1.5">
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 cursor-pointer hover:bg-stone-100 shadow-xs active:scale-95 transition-all">
                            <Upload className="w-3.5 h-3.5 text-rose-500" />
                            <span>Upload from Phone</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(idx, file);
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            value={photo.url}
                            onChange={(e) => {
                              const newPolaroids = [...formData.polaroids];
                              newPolaroids[idx] = { ...newPolaroids[idx], url: e.target.value };
                              setFormData({ ...formData, polaroids: newPolaroids });
                            }}
                            placeholder="Or paste image URL"
                            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tag & Location */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                            Date / Tag
                          </label>
                          <input
                            type="text"
                            value={photo.date || ''}
                            onChange={(e) => {
                              const newPolaroids = [...formData.polaroids];
                              newPolaroids[idx] = { ...newPolaroids[idx], date: e.target.value };
                              setFormData({ ...formData, polaroids: newPolaroids });
                            }}
                            placeholder="e.g. Summer Night"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                            Location
                          </label>
                          <input
                            type="text"
                            value={photo.location || ''}
                            onChange={(e) => {
                              const newPolaroids = [...formData.polaroids];
                              newPolaroids[idx] = { ...newPolaroids[idx], location: e.target.value };
                              setFormData({ ...formData, polaroids: newPolaroids });
                            }}
                            placeholder="e.g. Paris Cafe"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Front Caption */}
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                          Front Polaroid Caption
                        </label>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => {
                            const newPolaroids = [...formData.polaroids];
                            newPolaroids[idx] = { ...newPolaroids[idx], caption: e.target.value };
                            setFormData({ ...formData, polaroids: newPolaroids });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Back Note */}
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                          Secret Handwritten Note (Flip Side)
                        </label>
                        <textarea
                          rows={2}
                          value={photo.noteOnBack || ''}
                          onChange={(e) => {
                            const newPolaroids = [...formData.polaroids];
                            newPolaroids[idx] = { ...newPolaroids[idx], noteOnBack: e.target.value };
                            setFormData({ ...formData, polaroids: newPolaroids });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none font-serif-romantic"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Love Letter & Finale */}
            {activeTab === 'letter' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Love Letter Title
                  </label>
                  <input
                    type="text"
                    value={formData.loveLetterTitle}
                    onChange={(e) => setFormData({ ...formData, loveLetterTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-serif-romantic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Love Letter Body Text
                  </label>
                  <textarea
                    rows={6}
                    value={formData.loveLetterBody}
                    onChange={(e) => setFormData({ ...formData, loveLetterBody: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-serif-romantic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Secret Birthday Wish Prompt (For Cake Blow)
                  </label>
                  <input
                    type="text"
                    value={formData.secretWishPrompt}
                    onChange={(e) => setFormData({ ...formData, secretWishPrompt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Grand Finale Card Title
                    </label>
                    <input
                      type="text"
                      value={formData.finaleMessageTitle}
                      onChange={(e) => setFormData({ ...formData, finaleMessageTitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-serif-romantic"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Grand Finale Certificate Message
                    </label>
                    <textarea
                      rows={3}
                      value={formData.finaleMessageBody}
                      onChange={(e) => setFormData({ ...formData, finaleMessageBody: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Grand Finale Lifetime Promise / Vow
                    </label>
                    <input
                      type="text"
                      value={formData.finalePromise}
                      onChange={(e) => setFormData({ ...formData, finalePromise: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-handwriting text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Love Reasons */}
            {activeTab === 'reasons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Reasons in the Fairy Light Jar ({formData.reasons.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddReason}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold border border-rose-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Reason</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.reasons.map((reason, idx) => (
                    <div
                      key={reason.id}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex gap-2.5 items-start"
                    >
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={reason.title}
                          onChange={(e) => {
                            const newReasons = [...formData.reasons];
                            newReasons[idx] = { ...newReasons[idx], title: e.target.value };
                            setFormData({ ...formData, reasons: newReasons });
                          }}
                          placeholder="Reason Title"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={reason.message}
                          onChange={(e) => {
                            const newReasons = [...formData.reasons];
                            newReasons[idx] = { ...newReasons[idx], message: e.target.value };
                            setFormData({ ...formData, reasons: newReasons });
                          }}
                          placeholder="Heartfelt explanation..."
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReason(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: Love Coupons */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Custom Redeemable Vouchers ({formData.coupons.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCoupon}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold border border-rose-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Voucher</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.coupons.map((coupon, idx) => (
                    <div
                      key={coupon.id}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex gap-2.5 items-start"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={coupon.title}
                            onChange={(e) => {
                              const newCoupons = [...formData.coupons];
                              newCoupons[idx] = { ...newCoupons[idx], title: e.target.value };
                              setFormData({ ...formData, coupons: newCoupons });
                            }}
                            placeholder="Coupon Title"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={coupon.code}
                            onChange={(e) => {
                              const newCoupons = [...formData.coupons];
                              newCoupons[idx] = { ...newCoupons[idx], code: e.target.value };
                              setFormData({ ...formData, coupons: newCoupons });
                            }}
                            placeholder="CODE"
                            className="w-28 px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          value={coupon.description}
                          onChange={(e) => {
                            const newCoupons = [...formData.coupons];
                            newCoupons[idx] = { ...newCoupons[idx], description: e.target.value };
                            setFormData({ ...formData, coupons: newCoupons });
                          }}
                          placeholder="Description / Terms"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                        />
                        {coupon.redeemed && (
                          <div className="flex items-center justify-between text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                            <span>Status: Claimed on {coupon.redeemedDate || 'Recently'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newCoupons = [...formData.coupons];
                                newCoupons[idx] = { ...newCoupons[idx], redeemed: false, redeemedDate: undefined };
                                setFormData({ ...formData, coupons: newCoupons });
                              }}
                              className="text-xs font-bold underline text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Reset to Unclaimed
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: Share Link */}
            {activeTab === 'share' && (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600">
                  <Share2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h4 className="font-serif-romantic text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Ready to Surprise Your Partner?
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto mt-1">
                    Copy this link and send it directly via WhatsApp, Instagram DM, or iMessage. Everything—including your custom letter, photos, and chosen theme—will load seamlessly!
                  </p>
                </div>

                <div className="max-w-lg mx-auto p-3 sm:p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generateShareUrl(formData)}
                    className="flex-1 bg-transparent text-[11px] sm:text-xs font-mono text-stone-600 dark:text-stone-300 select-all focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all hover:scale-105"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STICKY FOOTER WITH SAVE & RESET */}
          <div className="p-3 sm:p-4 border-t border-rose-100 dark:border-stone-800 bg-rose-50/90 dark:bg-stone-850/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs sm:text-sm font-medium hover:bg-rose-50 dark:hover:bg-stone-800 hover:text-rose-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
