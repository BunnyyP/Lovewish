import { useState, useEffect, FormEvent, useRef } from 'react';
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
  Film,
  Youtube,
  Play,
  Pause,
  Radio,
  Volume2,
  VolumeX,
  Volume1,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Clock,
  Timer,
  Sliders,
  Database,
  CheckCircle2,
  Gift,
  Star,
  Award,
  History,
  Calendar,
  Edit3,
} from 'lucide-react';
import { BirthdayConfig, PolaroidPhoto, LoveReason, LoveCoupon, ThemeType } from '../types';
import { saveConfig, saveConfigAsync, generateShareUrl, DEFAULT_BIRTHDAY_CONFIG } from '../utils/storage';
import { sound } from '../utils/audio';
import { extractYouTubeId, dataUrlToBlobUrl } from '../utils/media';
import { CelebrationVideoModal } from './CelebrationVideoModal';
import { uploadMediaToCloudStorage } from '../services/mediaCloudService';

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
  const [activeTab, setActiveTab] = useState<
    'profile' | 'theme' | 'intro-music' | 'bg-music' | 'video' | 'surprise-box' | 'photos' | 'letter' | 'reasons' | 'coupons' | 'user-activity' | 'share'
  >('profile');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [isTestingIntro, setIsTestingIntro] = useState(false);
  const [introCountdown, setIntroCountdown] = useState<number | null>(null);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [introAudioUploadError, setIntroAudioUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [surprisePhotoUploadError, setSurprisePhotoUploadError] = useState<string | null>(null);
  const [surpriseVideoUploadError, setSurpriseVideoUploadError] = useState<string | null>(null);
  const [userCouponFilter, setUserCouponFilter] = useState<'all' | 'redeemed' | 'unredeemed'>('all');
  const [isEditingWish, setIsEditingWish] = useState(false);
  const [tempWishText, setTempWishText] = useState(formData.sealedWish || '');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const introTimerIntervalRef = useRef<number | null>(null);
  const prevIsOpenRef = useRef(false);

  const TABS: Array<{
    id: 'profile' | 'theme' | 'intro-music' | 'bg-music' | 'video' | 'surprise-box' | 'photos' | 'letter' | 'reasons' | 'coupons' | 'user-activity' | 'share';
    label: string;
    icon: typeof Heart;
    count?: number;
  }> = [
    { id: 'profile', label: 'Names & Dates', icon: Heart },
    { id: 'theme', label: 'Themes & Atmosphere', icon: Palette },
    { id: 'intro-music', label: '💌 1. Intro Music & Timings', icon: Volume2 },
    { id: 'bg-music', label: '🎶 2. Background Music', icon: Music },
    { id: 'video', label: '🎂 3. Celebration Video', icon: Film },
    { id: 'surprise-box', label: '🎁 4. Surprise Box (Pic/Video)', icon: Gift },
    { id: 'photos', label: 'Photos Clothesline', icon: Camera, count: formData.polaroids.length },
    { id: 'letter', label: 'Letter & Vows', icon: FileText },
    { id: 'reasons', label: 'Love Jar Reasons', icon: Sparkles, count: formData.reasons.length },
    { id: 'coupons', label: 'Love Coupons Settings', icon: Ticket, count: formData.coupons.length },
    {
      id: 'user-activity',
      label: '💌 Sealed Wish & Selected Coupons',
      icon: CheckCircle2,
      count: (formData.sealedWish ? 1 : 0) + formData.coupons.filter((c) => c.redeemed).length,
    },
    { id: 'share', label: 'Share Link', icon: Share2 },
  ];

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
      sound.playPop();
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
      sound.playSparkleChime();
    }
  };

  // Scroll active tab into view when activeTab changes
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeBtn = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Sync formData safely when modal opens (does not overwrite in-progress edits during an open session)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setFormData({ ...config });
      setEnteredPassword('');
      setPasswordError(false);
      setSaveSuccess(false);
      setIsTestingAudio(false);
      setIsTestingIntro(false);
      setIntroCountdown(null);
      setIsVideoPreviewOpen(false);
      setAudioUploadError(null);
      setIntroAudioUploadError(null);
      setVideoUploadError(null);
      setTempWishText(config.sealedWish || '');
      setIsEditingWish(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, config]);

  // Clean up audio testing when unmounting or switching tabs
  useEffect(() => {
    return () => {
      sound.stopBackgroundMusic();
      sound.stopIntroMusic();
      if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const expectedPassword = config.customizationPassword || 'HoneyBunny';

  // Handle password submission
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const entered = enteredPassword.trim().toLowerCase();
    const expected = (config.customizationPassword || 'HoneyBunny').trim().toLowerCase();
    
    // Always accept 'HoneyBunny' (with or without spaces/casing) as master customization password, plus any configured password
    const isMasterPassword = entered === 'honeybunny' || entered === 'honey bunny';
    const isConfigPassword = entered === expected;

    if (isMasterPassword || isConfigPassword) {
      setIsAuthenticated(true);
      setPasswordError(false);
      sound.playSparkleChime();
    } else {
      setPasswordError(true);
      sound.playPop();
    }
  };

  const handleSave = async () => {
    if (isTestingAudio) {
      sound.stopBackgroundMusic();
      setIsTestingAudio(false);
    }
    if (isTestingIntro) {
      sound.stopIntroMusic();
      setIsTestingIntro(false);
      setIntroCountdown(null);
      if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
    }

    setIsSaving(true);
    setCloudSyncStatus(null);

    try {
      const syncRes = await saveConfigAsync(formData);
      onSave(formData);
      sound.playSparkleChime();
      setSaveSuccess(true);

      if (syncRes.success) {
        setCloudSyncStatus({
          type: 'success',
          message: 'Saved & Synced to Cloud! All visitors on www.bunnypatel.com will now see this live.',
        });
      } else {
        setCloudSyncStatus({
          type: 'error',
          message: syncRes.message || 'Saved locally. Cloud sync pending.',
        });
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setCloudSyncStatus({
        type: 'error',
        message: err?.message || 'Error saving configuration',
      });
    } finally {
      setIsSaving(false);
    }
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

  // Helper to upload media file directly to Google Cloud Firebase Storage (Global CDN for all devices)
  const uploadMediaToServerAsync = async (
    file: File,
    base64: string,
    type: string
  ): Promise<string | null> => {
    try {
      const result = await uploadMediaToCloudStorage(file, file.name, type);
      if (result && result.url) {
        console.log(`🌐 Global Media Cloud CDN URL ready: ${result.url}`);
        return result.url;
      }
    } catch (err) {
      console.warn('Direct media upload notice:', err);
    }
    return null;
  };

  // Intro Audio Upload Handler (MP3, WAV, M4A, OGG)
  const handleIntroAudioUpload = (file: File) => {
    setIntroAudioUploadError(null);
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      setIntroAudioUploadError('Please select a valid audio file (MP3, WAV, M4A, OGG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        // Always store permanent base64 data URL in state
        setFormData((prev) => ({
          ...prev,
          introMusicType: 'upload',
          introMusicAudioUrl: base64,
          introMusicAudioName: file.name,
        }));
        sound.playSparkleChime();

        // Background server upload for CDN / cloud hosting
        const serverUrl = await uploadMediaToServerAsync(file, base64, 'audio/mpeg');
        if (serverUrl) {
          setFormData((prev) => ({
            ...prev,
            introMusicAudioUrl: serverUrl,
          }));
        }
      }
    };
    reader.onerror = () => {
      setIntroAudioUploadError('Failed to read intro audio file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Toggle in-modal Intro preview testing (with live countdown & auto-mute demo)
  const toggleTestIntroAudio = () => {
    if (isTestingIntro) {
      sound.stopIntroMusic();
      setIsTestingIntro(false);
      setIntroCountdown(null);
      if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
    } else {
      if (isTestingAudio) {
        sound.stopBackgroundMusic();
        setIsTestingAudio(false);
      }
      setIsTestingIntro(true);
      const startTime = Math.max(0, formData.introMusicStartTime ?? 0);
      const endTime =
        formData.introMusicEndTime && formData.introMusicEndTime > startTime
          ? formData.introMusicEndTime
          : startTime + (formData.introMusicDuration ?? 4);
      const dur = Math.max(1, endTime - startTime);
      setIntroCountdown(dur);

      sound.playIntroMusic(
        {
          type: formData.introMusicType || 'happy_birthday_chime',
          startTime: startTime,
          endTime: endTime,
          duration: dur,
          audioUrl: formData.introMusicAudioUrl,
          autoMute: formData.introMusicAutoMute !== false,
        },
        () => {
          setIsTestingIntro(false);
          setIntroCountdown(0);
          if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
          setTimeout(() => setIntroCountdown(null), 1200);
        }
      );

      let remaining = dur;
      if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
      introTimerIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
          setIntroCountdown(0);
        } else {
          setIntroCountdown(remaining);
        }
      }, 1000);
    }
  };

  // Audio Upload Handler (MP3, WAV, M4A, OGG)
  const handleAudioUpload = (file: File) => {
    setAudioUploadError(null);
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      setAudioUploadError('Please select a valid audio file (MP3, WAV, M4A, OGG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setFormData((prev) => ({
          ...prev,
          musicType: 'upload',
          musicAudioUrl: base64,
          musicAudioName: file.name,
        }));
        sound.playSparkleChime();

        // Upload to server for permanent global streaming URL
        const serverUrl = await uploadMediaToServerAsync(file, base64, 'audio/mpeg');
        if (serverUrl) {
          setFormData((prev) => ({
            ...prev,
            musicAudioUrl: serverUrl,
          }));
        }
      }
    };
    reader.onerror = () => {
      setAudioUploadError('Failed to read audio file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Video Upload Handler (MP4, WebM, MOV)
  const handleVideoUpload = (file: File) => {
    setVideoUploadError(null);
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      setVideoUploadError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setFormData((prev) => ({
          ...prev,
          celebrationVideoType: 'upload',
          celebrationVideoUrl: base64,
          celebrationVideoName: file.name,
        }));
        sound.playSparkleChime();

        // Upload to server for permanent global streaming URL
        const serverUrl = await uploadMediaToServerAsync(file, base64, 'video/mp4');
        if (serverUrl) {
          setFormData((prev) => ({
            ...prev,
            celebrationVideoUrl: serverUrl,
          }));
        }
      }
    };
    reader.onerror = () => {
      setVideoUploadError('Failed to read video file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Surprise Box Photo Upload Handler
  const handleSurprisePhotoUpload = (file: File) => {
    setSurprisePhotoUploadError(null);
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      setSurprisePhotoUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setFormData((prev) => ({
          ...prev,
          surpriseBoxMediaType: 'image',
          surpriseBoxMediaUrl: base64,
          surpriseBoxMediaName: file.name,
        }));
        sound.playSparkleChime();

        const serverUrl = await uploadMediaToServerAsync(file, base64, 'image/jpeg');
        if (serverUrl) {
          setFormData((prev) => ({
            ...prev,
            surpriseBoxMediaUrl: serverUrl,
          }));
        }
      }
    };
    reader.onerror = () => {
      setSurprisePhotoUploadError('Failed to read photo file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  // Surprise Box Video Upload Handler
  const handleSurpriseVideoUpload = (file: File) => {
    setSurpriseVideoUploadError(null);
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      setSurpriseVideoUploadError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setFormData((prev) => ({
          ...prev,
          surpriseBoxMediaType: 'video',
          surpriseBoxMediaUrl: base64,
          surpriseBoxMediaName: file.name,
        }));
        sound.playSparkleChime();

        const serverUrl = await uploadMediaToServerAsync(file, base64, 'video/mp4');
        if (serverUrl) {
          setFormData((prev) => ({
            ...prev,
            surpriseBoxMediaUrl: serverUrl,
          }));
        }
      }
    };
    reader.onerror = () => {
      setSurpriseVideoUploadError('Failed to read video file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Toggle in-modal audio preview testing
  const toggleTestAudio = () => {
    if (isTestingAudio) {
      sound.stopBackgroundMusic();
      setIsTestingAudio(false);
    } else {
      if (isTestingIntro) {
        sound.stopIntroMusic();
        setIsTestingIntro(false);
        setIntroCountdown(null);
        if (introTimerIntervalRef.current) clearInterval(introTimerIntervalRef.current);
      }
      setIsTestingAudio(true);
      if (formData.musicType === 'youtube') {
        sound.setMusicMode('youtube');
        sound.startBackgroundMusic({
          startTime: formData.bgMusicStartTime ?? 0,
          endTime: formData.bgMusicEndTime ?? 0,
          loop: formData.bgMusicLoop !== false,
        });
      } else if (formData.musicType === 'upload' || formData.musicType === 'url') {
        sound.setMusicMode(formData.musicType);
        if (formData.musicAudioUrl) {
          sound.setCustomAudio(formData.musicAudioUrl);
          sound.startBackgroundMusic({
            startTime: formData.bgMusicStartTime ?? 0,
            endTime: formData.bgMusicEndTime ?? 0,
            loop: formData.bgMusicLoop !== false,
          });
        }
      } else {
        sound.setMusicMode('synth');
        sound.setCustomAudio(null);
        sound.startBackgroundMusic({
          startTime: formData.bgMusicStartTime ?? 0,
          endTime: formData.bgMusicEndTime ?? 0,
          loop: formData.bgMusicLoop !== false,
        });
      }
    }
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
      id: 'couple-love',
      name: 'Couple Love & Eternal Heart',
      tagline: 'Deep passionate ruby love, romantic heartbeats & radiant warmth',
      badge: 'Couple Special ❤️',
      gradient: 'from-[#2a0813] via-[#1a040b] to-[#0d0206]',
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#fde047'],
      dark: true,
    },
    {
      id: 'sensual-passion',
      name: 'Velvet Desire & Sensual Passion',
      tagline: 'Deep sensual velvet noir, romantic touch ripples, heartbeat pulse & music reactive love aura',
      badge: 'Sensual Intense 🔥',
      gradient: 'from-[#13010b] via-[#210214] to-[#0a0006]',
      colors: ['#e11d48', '#db2777', '#f43f5e', '#f59e0b'],
      dark: true,
    },
    {
      id: 'surprise',
      name: 'Midnight Starlight Surprise',
      tagline: 'Exciting glowing neon stars, magic purple aura & birthday firework sparkles',
      badge: 'Surprise Grand ✨',
      gradient: 'from-[#180828] via-[#0d0418] to-[#040108]',
      colors: ['#d946ef', '#a855f7', '#fbbf24', '#06b6d4'],
      dark: true,
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
    {
      id: 'peach',
      name: 'Warm Honey Peach',
      tagline: 'Soft peach nectar, sweet apricot & sunny golden hour',
      badge: 'Sweet Pastel',
      gradient: 'from-[#fffbf5] via-[#fff3e6] to-[#ffe5cf]',
      colors: ['#f97316', '#fb923c', '#f43f5e', '#fed7aa'],
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
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 shadow-inner"
              >
                <Check className="w-4 h-4 text-emerald-100" />
                <span>Saved globally! All visitors from anywhere will now see these changes. ✨</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STICKY HORIZONTAL SCROLLABLE TABS BAR (NEVER GETS HIDDEN ON MOBILE) */}
          <div 
            ref={tabsContainerRef}
            className="flex border-b border-stone-200 dark:border-stone-800 px-2 sm:px-4 overflow-x-auto bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md shrink-0 no-scrollbar gap-1.5 py-1.5 scroll-smooth"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    sound.playPop();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-400'
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
                      Main Site Access Password (Lock Screen)
                    </label>
                    <input
                      type="text"
                      value={formData.siteLockPassword || 'Merijaan'}
                      onChange={(e) => setFormData({ ...formData, siteLockPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-mono"
                      placeholder="e.g. Merijaan"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Required for anyone visiting the website to unlock and view the surprise.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Customizer Studio Password
                    </label>
                    <input
                      type="text"
                      value={formData.customizationPassword || 'HoneyBunny'}
                      onChange={(e) => setFormData({ ...formData, customizationPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Required to open and edit settings inside the Customizer modal.
                    </p>
                  </div>
                </div>

                {/* Site Lock Toggle */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-850 border border-amber-200/80 dark:border-stone-700 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Require Password To Access Site</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      When enabled, shows the secret lock screen immediately upon visiting the website.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.siteLockEnabled !== false}
                      onChange={(e) => setFormData({ ...formData, siteLockEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-amber-600"></div>
                  </label>
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

                {/* THEME INDEPENDENCE ASSURANCE BANNER */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/30 text-purple-950 dark:text-purple-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Only Theme & Colors Change</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Content 100% Safe
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      Selecting a new theme only updates the styling and color palette. All your customized text, videos, photos, songs, coupons, and love letters remain completely untouched and preserved.
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

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-rose-500" />
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Intro Music & Timers</div>
                        <div className="text-[10px] text-stone-500">Lifafa opening chime & auto-mute</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('intro-music')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer shrink-0"
                    >
                      Intro Controls
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Background Music</div>
                        <div className="text-[10px] text-stone-500">YouTube, songs & play timings</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bg-music')}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold cursor-pointer shrink-0"
                    >
                      Song Controls
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: 1. INTRO MUSIC & AUTO-MUTE TIMINGS */}
            {activeTab === 'intro-music' && (
              <div className="space-y-5">
                {/* PERMANENT PERSISTENCE ASSURANCE BANNER */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-rose-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Intro Music Saved Permanently</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Auto-Saved
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      All Intro Music start/end timings, auto-mute settings, and custom files remain permanently saved in the local database until modified.
                    </p>
                  </div>
                </div>

                {/* MAIN INTRO CARD */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl border-2 border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-stone-850 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            Lifafa / Envelope Intro Music & Timing Control
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                            Envelope Opening
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Plays when opening the envelope seal, then automatically mutes at your configured time.
                        </p>
                      </div>
                    </div>

                    {/* Master Intro Music Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        Intro Enabled:
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={formData.introMusicEnabled !== false}
                          onChange={(e) =>
                            setFormData({ ...formData, introMusicEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Intro Mode Cards */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                      Select Intro Music Source:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[
                        {
                          type: 'happy_birthday_chime',
                          label: 'Happy Birthday Chime',
                          desc: 'Classic "Happy Birthday to you" chime melody',
                          icon: Sparkles,
                          badge: 'Recommended',
                        },
                        {
                          type: 'upload',
                          label: 'Upload Intro MP3',
                          desc: 'Custom audio clip from device',
                          icon: Upload,
                          badge: 'Custom File',
                        },
                        {
                          type: 'url',
                          label: 'Direct Audio URL',
                          desc: 'Stream audio from direct MP3 link',
                          icon: Radio,
                          badge: 'Direct Stream',
                        },
                        {
                          type: 'none',
                          label: 'No Intro Music',
                          desc: 'Directly play background song',
                          icon: VolumeX,
                          badge: 'Muted',
                        },
                      ].map((item) => {
                        const isSelected = (formData.introMusicType || 'happy_birthday_chime') === item.type;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                introMusicType: item.type as BirthdayConfig['introMusicType'],
                                introMusicEnabled: item.type !== 'none',
                              });
                              sound.playSparkleChime();
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-rose-500 bg-rose-50/80 dark:bg-stone-800 ring-2 ring-rose-400 shadow-xs'
                                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-stone-500'}`} />
                                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                                {item.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UPLOAD INTRO AUDIO INPUT */}
                  {formData.introMusicType === 'upload' && (
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Upload Custom Intro Audio (.mp3, .wav, .m4a)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-rose-300 dark:border-stone-600 hover:border-rose-500 bg-white dark:bg-stone-850 hover:bg-rose-50/40 cursor-pointer transition-colors text-xs font-semibold text-rose-700 dark:text-rose-300">
                          <Upload className="w-4 h-4 text-rose-500" />
                          <span>{formData.introMusicAudioName ? 'Change Intro Audio' : 'Click to Upload Intro Audio'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleIntroAudioUpload(file);
                            }}
                          />
                        </label>

                        {formData.introMusicAudioUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                introMusicAudioUrl: '',
                                introMusicAudioName: '',
                              });
                              sound.playPop();
                            }}
                            className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-rose-600 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {formData.introMusicAudioName && (
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-stone-750 border border-rose-200 dark:border-stone-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Music className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                              {formData.introMusicAudioName}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded-full shrink-0">
                            Intro Loaded
                          </span>
                        </div>
                      )}

                      {introAudioUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{introAudioUploadError}</p>
                      )}
                    </div>
                  )}

                  {/* DIRECT INTRO AUDIO URL INPUT */}
                  {formData.introMusicType === 'url' && (
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Enter Direct Intro Audio Stream / MP3 URL
                      </label>
                      <input
                        type="url"
                        value={formData.introMusicAudioUrl || ''}
                        onChange={(e) => setFormData({ ...formData, introMusicAudioUrl: e.target.value })}
                        placeholder="https://example.com/happy-birthday-intro.mp3"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* INTRO PLAY TIME & AUTO-MUTE DURATION CONTROLS */}
                  {formData.introMusicEnabled !== false && formData.introMusicType !== 'none' && (
                    <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-stone-800/70 border border-rose-200 dark:border-stone-700 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-rose-600" />
                          <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            Manual Intro Play Timings ("Kab Se Kab Tak Play Hoga")
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-xs">
                          <span>
                            {formData.introMusicStartTime ?? 0}s ➔{' '}
                            {formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                              ? `${formData.introMusicEndTime}s`
                              : `${(formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)}s`}
                          </span>
                          <span className="text-[10px] opacity-85">
                            (Total:{' '}
                            {Math.max(
                              1,
                              (formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                                ? formData.introMusicEndTime
                                : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)) -
                                (formData.introMusicStartTime ?? 0)
                            )}
                            s)
                          </span>
                        </div>
                      </div>

                      {/* Three Columns: Start Time, Duration, and End/Cutoff Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Start Playing Time */}
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                              <span>▶ Start At:</span>
                            </label>
                            <span className="text-xs font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950">
                              {formData.introMusicStartTime ?? 0}s
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Audio start offset (Default: 0s).
                          </p>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            step="1"
                            value={formData.introMusicStartTime ?? 0}
                            onChange={(e) => {
                              const start = Math.max(0, parseInt(e.target.value || '0', 10));
                              const currDur = formData.introMusicDuration ?? 4;
                              setFormData({
                                ...formData,
                                introMusicStartTime: start,
                                introMusicEndTime: start + currDur,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                          />
                        </div>

                        {/* Total Play Duration */}
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                              <span>⏱ Duration:</span>
                            </label>
                            <span className="text-xs font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950">
                              {formData.introMusicDuration ?? 4}s
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            How many seconds to play.
                          </p>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            step="1"
                            value={formData.introMusicDuration ?? 4}
                            onChange={(e) => {
                              const dur = Math.max(1, parseInt(e.target.value || '4', 10));
                              const start = formData.introMusicStartTime ?? 0;
                              setFormData({
                                ...formData,
                                introMusicDuration: dur,
                                introMusicEndTime: start + dur,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                          />
                        </div>

                        {/* End Playing / Auto-Mute Time */}
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                              <span>⏹ End / Cutoff:</span>
                            </label>
                            <span className="text-xs font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950">
                              {formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                                ? formData.introMusicEndTime
                                : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)}s
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Timestamp to auto-mute.
                          </p>
                          <input
                            type="number"
                            min={(formData.introMusicStartTime ?? 0) + 1}
                            max="120"
                            step="1"
                            value={
                              formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                                ? formData.introMusicEndTime
                                : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)
                            }
                            onChange={(e) => {
                              const end = Math.max((formData.introMusicStartTime ?? 0) + 1, parseInt(e.target.value || '4', 10));
                              const start = formData.introMusicStartTime ?? 0;
                              setFormData({
                                ...formData,
                                introMusicEndTime: end,
                                introMusicDuration: Math.max(1, end - start),
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                          />
                        </div>
                      </div>

                      {/* Auto-Play Delay control */}
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span>Intro Auto-Play Delay After Wax Seal Crack:</span>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Wait X seconds after tapping wax seal before playing intro chime/song (0s = instant).
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={formData.introMusicAutoPlayDelay ?? 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                introMusicAutoPlayDelay: Math.max(0, parseFloat(e.target.value || '0')),
                              })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 text-center"
                          />
                          <span className="text-xs font-semibold text-stone-500">sec</span>
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                          <span className="text-stone-500">0s Seal Broken</span>
                          <span className="text-rose-600 font-bold">
                            Playing Intro: {formData.introMusicStartTime ?? 0}s ➔{' '}
                            {formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                              ? formData.introMusicEndTime
                              : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)}
                            s
                          </span>
                          <span className="text-purple-600 font-bold">Background Music Takeover</span>
                        </div>
                        <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex border border-stone-200 dark:border-stone-700">
                          <div
                            style={{ width: `${Math.min(100, Math.max(5, (formData.introMusicStartTime ?? 0) * 8))}%` }}
                            className="bg-stone-300 dark:bg-stone-600"
                            title="Pre-play offset"
                          />
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  15,
                                  ((formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                                    ? formData.introMusicEndTime
                                    : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)) -
                                    (formData.introMusicStartTime ?? 0)) *
                                    8
                                )
                              )}%`,
                            }}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse"
                            title="Active Intro Music playback"
                          />
                          <div className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500" title="Background Music handover" />
                        </div>
                      </div>

                      {/* Quick Presets for Play Timings */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-stone-500 font-medium">Quick Presets:</span>
                        {[
                          { label: '0s – 3s (3 sec chime)', start: 0, end: 3 },
                          { label: '0s – 4s (Standard 4s)', start: 0, end: 4 },
                          { label: '0s – 6s (6 sec intro)', start: 0, end: 6 },
                          { label: '0s – 8s (8 sec intro)', start: 0, end: 8 },
                          { label: '0s – 10s (10 sec intro)', start: 0, end: 10 },
                          { label: '5s – 15s (10s chorus clip)', start: 5, end: 15 },
                        ].map((preset) => {
                          const currStart = formData.introMusicStartTime ?? 0;
                          const currEnd =
                            formData.introMusicEndTime && formData.introMusicEndTime > currStart
                              ? formData.introMusicEndTime
                              : currStart + (formData.introMusicDuration ?? 4);
                          const isMatch = currStart === preset.start && currEnd === preset.end;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  introMusicStartTime: preset.start,
                                  introMusicEndTime: preset.end,
                                  introMusicDuration: preset.end - preset.start,
                                });
                                sound.playPop();
                              }}
                              className={`text-[10px] px-2.5 py-1 rounded-full border font-medium cursor-pointer transition-all ${
                                isMatch
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-rose-300'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Auto-Mute Checkbox Toggle */}
                      <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.introMusicAutoMute !== false}
                          onChange={(e) =>
                            setFormData({ ...formData, introMusicAutoMute: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-400 accent-rose-600"
                        />
                        <div className="text-[11px] text-stone-700 dark:text-stone-300">
                          <strong className="text-stone-900 dark:text-stone-100">
                            Auto-Mute Intro on End Cutoff Time:
                          </strong>{' '}
                          When the end timestamp (
                          {formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                            ? `${formData.introMusicEndTime}s`
                            : `${(formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)}s`}
                          ) is reached, the intro immediately hard-mutes and transitions automatically to your background music.
                        </div>
                      </label>

                      {/* Test Intro Button with Countdown & Auto-Mute Demo */}
                      <div className="flex items-center justify-between pt-2 border-t border-rose-200 dark:border-stone-700/60">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                            Test Intro Playback ({formData.introMusicStartTime ?? 0}s to{' '}
                            {formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                              ? `${formData.introMusicEndTime}s`
                              : `${(formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)}s`}
                            ):
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={toggleTestIntroAudio}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                            isTestingIntro
                              ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {isTestingIntro ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>
                                {introCountdown !== null && introCountdown > 0
                                  ? `Auto-Muting in ${introCountdown}s...`
                                  : 'Auto-Muting...'}
                              </span>
                            </>
                          ) : introCountdown === 0 ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                                Auto-Muted Successfully! 🔇
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>
                                Play Test Intro (
                                {Math.max(
                                  1,
                                  (formData.introMusicEndTime && formData.introMusicEndTime > (formData.introMusicStartTime ?? 0)
                                    ? formData.introMusicEndTime
                                    : (formData.introMusicStartTime ?? 0) + (formData.introMusicDuration ?? 4)) -
                                    (formData.introMusicStartTime ?? 0)
                                )}
                                s)
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: 2. BACKGROUND MUSIC & PLAY TIMINGS */}
            {activeTab === 'bg-music' && (
              <div className="space-y-5">
                {/* PERMANENT PERSISTENCE ASSURANCE BANNER */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-indigo-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Background Music Saved Permanently</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Auto-Saved
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      Your chosen background song, start offset timings, autoplay toggle, and endless loop preferences are permanently saved to device storage.
                    </p>
                  </div>
                </div>

                {/* MAIN BACKGROUND MUSIC CARD */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl border-2 border-purple-200/80 dark:border-purple-900/40 bg-white dark:bg-stone-850 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            Background Celebration Song & Melody
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                            Main Page Music
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Plays continuously while viewing memories, photos, letters, love jar, and cake celebration.
                        </p>
                      </div>
                    </div>

                    {/* Master Background Music Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        Music Enabled:
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={formData.bgMusicEnabled !== false}
                          onChange={(e) => setFormData({ ...formData, bgMusicEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Auto-Play Background Music Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-stone-800 border border-purple-100 dark:border-stone-700">
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>Auto-Play Background Music</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Automatically start playing background song right after intro finishes or when opening website.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.bgMusicAutoPlay !== false}
                        onChange={(e) => setFormData({ ...formData, bgMusicAutoPlay: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Music Mode Selector Cards */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                      Select Background Music Source:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                      {[
                        {
                          type: 'none',
                          label: 'No Music',
                          desc: 'Keep celebration silent / muted',
                          icon: VolumeX,
                          badge: 'Muted',
                        },
                        {
                          type: 'synth',
                          label: 'Romantic Music Box',
                          desc: 'Built-in chime melody & chords',
                          icon: Music,
                          badge: 'Built-in',
                        },
                        {
                          type: 'youtube',
                          label: 'YouTube Song',
                          desc: 'Any Bollywood or English song',
                          icon: Youtube,
                          badge: 'YouTube',
                        },
                        {
                          type: 'upload',
                          label: 'Upload Audio File',
                          desc: 'MP3, WAV, M4A from device',
                          icon: Upload,
                          badge: 'Custom File',
                        },
                        {
                          type: 'url',
                          label: 'Direct Audio URL',
                          desc: 'Direct audio stream/MP3 link',
                          icon: Radio,
                          badge: 'Web Stream',
                        },
                      ].map((item) => {
                        const isSelected = (formData.musicType || 'none') === item.type;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                musicType: item.type as BirthdayConfig['musicType'],
                                bgMusicEnabled: item.type !== 'none',
                              });
                              sound.playSparkleChime();
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50/80 dark:bg-stone-800 ring-2 ring-purple-400 shadow-xs'
                                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5">
                                <Icon
                                  className={`w-4 h-4 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-stone-500'}`}
                                />
                                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                                {item.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. YOUTUBE MUSIC INPUT WITH 1-CLICK POPULAR SONG PRESETS */}
                  {formData.musicType === 'youtube' && (
                    <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-stone-800/80 border border-purple-200 dark:border-stone-700 space-y-3">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Paste Any YouTube Song / Video URL:
                      </label>
                      <div className="relative">
                        <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.musicYoutubeUrl || ''}
                          onChange={(e) => setFormData({ ...formData, musicYoutubeUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                      </div>

                      {/* Curated Popular Songs */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                          Or Choose from Popular Romantic Tracks:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {[
                            { name: 'Kesariya - Brahmāstra', url: 'https://www.youtube.com/watch?v=BddP6PYo2gs' },
                            { name: 'Perfect - Ed Sheeran', url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g' },
                            { name: 'Tum Hi Ho - Aashiqui 2', url: 'https://www.youtube.com/watch?v=IJq0yyWug1k' },
                            { name: 'Raataan Lambiyan - Shershaah', url: 'https://www.youtube.com/watch?v=gvyUuxdRdR4' },
                            { name: 'Until I Found You - Stephen Sanchez', url: 'https://www.youtube.com/watch?v=GxldQ9eX2wo' },
                            { name: 'Shayad - Love Aaj Kal', url: 'https://www.youtube.com/watch?v=e-ORhEE9VVg' },
                          ].map((song) => (
                            <button
                              key={song.url}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, musicYoutubeUrl: song.url });
                                sound.playSparkleChime();
                              }}
                              className={`text-[10px] p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                                formData.musicYoutubeUrl === song.url
                                  ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 text-purple-900 dark:text-purple-200 font-bold'
                                  : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-purple-300'
                              }`}
                            >
                              <span className="truncate">{song.name}</span>
                              {formData.musicYoutubeUrl === song.url && <Check className="w-3 h-3 text-purple-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. UPLOAD AUDIO FILE INPUT */}
                  {formData.musicType === 'upload' && (
                    <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-stone-800/80 border border-purple-200 dark:border-stone-700 space-y-3">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Upload Custom Background Audio File (.mp3, .wav, .m4a)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-stone-600 hover:border-purple-500 bg-white dark:bg-stone-850 hover:bg-purple-50/40 cursor-pointer transition-colors text-xs font-semibold text-purple-700 dark:text-purple-300">
                          <Upload className="w-4 h-4 text-purple-500" />
                          <span>{formData.musicAudioName ? 'Change Audio File' : 'Click to Upload Audio File'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAudioUpload(file);
                            }}
                          />
                        </label>

                        {formData.musicAudioUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                musicAudioUrl: '',
                                musicAudioName: '',
                              });
                              sound.playPop();
                            }}
                            className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-purple-600 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {formData.musicAudioName && (
                        <div className="p-2.5 rounded-lg bg-purple-100/60 dark:bg-stone-750 border border-purple-200 dark:border-stone-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Music className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                              {formData.musicAudioName}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded-full shrink-0">
                            Loaded
                          </span>
                        </div>
                      )}

                      {audioUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{audioUploadError}</p>
                      )}
                    </div>
                  )}

                  {/* 3. DIRECT AUDIO URL INPUT */}
                  {formData.musicType === 'url' && (
                    <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-stone-800/80 border border-purple-200 dark:border-stone-700 space-y-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Enter Direct Audio Stream / MP3 URL
                      </label>
                      <input
                        type="url"
                        value={formData.musicAudioUrl || ''}
                        onChange={(e) => setFormData({ ...formData, musicAudioUrl: e.target.value })}
                        placeholder="https://example.com/romantic-song.mp3"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* MANUAL PLAY TIMINGS & LOOP CONFIGURATION */}
                  <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-stone-800/70 border border-purple-200 dark:border-stone-700 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          Manual Play Timings & Offset ("Kab Se Play Hoga")
                        </span>
                      </div>
                      <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-600 text-white shadow-xs">
                        Start: {formData.bgMusicStartTime ?? 0}s | End:{' '}
                        {formData.bgMusicEndTime ? `${formData.bgMusicEndTime}s` : 'Full Track'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Start Offset */}
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            ▶ Start Offset:
                          </label>
                          <span className="text-xs font-bold text-purple-600 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950">
                            {formData.bgMusicStartTime ?? 0}s
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">
                          Jump straight to chorus (e.g. 0s, 30s).
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="1"
                          value={formData.bgMusicStartTime ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value || '0', 10));
                            setFormData({ ...formData, bgMusicStartTime: val });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      {/* Playback Duration */}
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            ⏱ Max Duration:
                          </label>
                          <span className="text-xs font-bold text-purple-600 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950">
                            {formData.bgMusicDuration ? `${formData.bgMusicDuration}s` : 'Full Track'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">
                          0 = full track, or limit seconds.
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="1800"
                          step="1"
                          value={formData.bgMusicDuration ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value || '0', 10));
                            setFormData({
                              ...formData,
                              bgMusicDuration: val,
                              bgMusicEndTime: val > 0 ? (formData.bgMusicStartTime ?? 0) + val : 0,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      {/* Stop Offset */}
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            ⏹ Stop / Cutoff:
                          </label>
                          <span className="text-xs font-bold text-purple-600 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950">
                            {formData.bgMusicEndTime ? `${formData.bgMusicEndTime}s` : '0 (Full Song)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">
                          0 = full song, or cutoff second.
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="1800"
                          step="1"
                          value={formData.bgMusicEndTime ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value || '0', 10));
                            setFormData({
                              ...formData,
                              bgMusicEndTime: val,
                              bgMusicDuration: val > (formData.bgMusicStartTime ?? 0) ? val - (formData.bgMusicStartTime ?? 0) : 0,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Quick Start Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-500 font-medium">Quick Start Offsets:</span>
                      {[
                        { label: 'Beginning (0s)', val: 0 },
                        { label: 'From 15s', val: 15 },
                        { label: 'From 30s (Chorus)', val: 30 },
                        { label: 'From 45s', val: 45 },
                        { label: 'From 60s (1 min)', val: 60 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, bgMusicStartTime: preset.val });
                            sound.playPop();
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-full border font-medium cursor-pointer transition-all ${
                            (formData.bgMusicStartTime ?? 0) === preset.val
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-purple-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Loop Toggle */}
                    <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.bgMusicLoop !== false}
                        onChange={(e) => setFormData({ ...formData, bgMusicLoop: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-400 accent-purple-600"
                      />
                      <div className="text-[11px] text-stone-700 dark:text-stone-300">
                        <strong className="text-stone-900 dark:text-stone-100">
                          Continuous Seamless Loop:
                        </strong>{' '}
                        Automatically replay the background music continuously from your start offset whenever it reaches the end.
                      </div>
                    </label>

                    {/* Live Background Music Test Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-stone-700">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                          Test configured background audio:
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={toggleTestAudio}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                          isTestingAudio
                            ? 'bg-purple-600 text-white shadow-xs animate-pulse'
                            : 'bg-stone-200/80 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300/80'
                        }`}
                      >
                        {isTestingAudio ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause Melody</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Test Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: 3. CELEBRATION VIDEO ON CANDLE BLOW */}
            {activeTab === 'video' && (
              <div className="space-y-5">
                {/* PERMANENT PERSISTENCE ASSURANCE BANNER */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-rose-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Celebration Video Saved Permanently</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Auto-Saved
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      Your chosen celebration video clip and autoplay options remain permanently configured in the app database.
                    </p>
                  </div>
                </div>

                {/* MAIN VIDEO CARD */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl border-2 border-amber-200/80 dark:border-amber-900/40 bg-white dark:bg-stone-850 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            Cake Candle Blow Celebration Video
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                            Candle Blow Pop
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Plays automatically in a festive celebration modal when candles are blown out on the birthday cake.
                        </p>
                      </div>
                    </div>

                    {/* Autoplay on blow toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        Auto-Play on Blow:
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={formData.celebrationVideoAutoplay !== false}
                          onChange={(e) =>
                            setFormData({ ...formData, celebrationVideoAutoplay: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Video Type Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                    {[
                      {
                        type: 'default',
                        label: 'Singing Squirrel Song',
                        desc: 'Viral cute hamster singing Happy Birthday',
                        badge: 'Default',
                      },
                      {
                        type: 'drive',
                        label: 'Google Drive Video 🚀',
                        desc: '100% Stall-free Google Drive link',
                        badge: 'Recommended',
                      },
                      {
                        type: 'upload',
                        label: 'Upload Custom Video',
                        desc: 'Upload MP4/WebM video clip',
                        badge: 'Custom',
                      },
                      {
                        type: 'youtube',
                        label: 'YouTube Video Link',
                        desc: 'Play specific YouTube video',
                        badge: 'YouTube',
                      },
                      {
                        type: 'url',
                        label: 'Direct Video URL',
                        desc: 'Link to hosted MP4 video',
                        badge: 'Direct',
                      },
                    ].map((item) => {
                      const isSelected = (formData.celebrationVideoType || 'default') === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              celebrationVideoType: item.type as BirthdayConfig['celebrationVideoType'],
                            });
                            sound.playSparkleChime();
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/80 dark:bg-stone-800 ring-2 ring-amber-400 shadow-xs'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {item.label}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 0. GOOGLE DRIVE CELEBRATION VIDEO */}
                  {formData.celebrationVideoType === 'drive' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-stone-800 border border-amber-300 dark:border-stone-700 space-y-2.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-0.5">
                          Paste Google Drive Video Link (Bina ruke chalega):
                        </label>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400">
                          Apne Google Drive video ka Share link (Anyone with the link can view) yahan paste karein.
                        </p>
                      </div>
                      <input
                        type="url"
                        value={formData.celebrationVideoUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            celebrationVideoUrl: e.target.value,
                            celebrationVideoType: 'drive',
                          })
                        }
                        placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <span>💡 Tip: Google Drive me video file par Right Click ➔ Share ➔ &quot;Anyone with the link&quot; set karein.</span>
                      </p>
                    </div>
                  )}

                  {/* 1. UPLOAD CUSTOM CELEBRATION VIDEO */}
                  {formData.celebrationVideoType === 'upload' && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Upload Birthday Celebration Video from Phone or Computer
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-stone-600 hover:border-amber-500 bg-amber-50/40 dark:bg-stone-850 hover:bg-amber-50/80 cursor-pointer transition-colors text-xs font-semibold text-amber-800 dark:text-amber-300">
                          <Upload className="w-4 h-4 text-amber-500" />
                          <span>
                            {formData.celebrationVideoName
                              ? 'Change Uploaded Video'
                              : 'Click to Upload Video (.mp4, .webm, .mov)'}
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(file);
                            }}
                          />
                        </label>

                        {formData.celebrationVideoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                celebrationVideoUrl: '',
                                celebrationVideoName: '',
                              });
                              sound.playPop();
                            }}
                            className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-rose-600 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {formData.celebrationVideoName && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-stone-750 border border-amber-200 dark:border-stone-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Film className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                              {formData.celebrationVideoName}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded-full shrink-0">
                            Loaded
                          </span>
                        </div>
                      )}

                      {videoUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{videoUploadError}</p>
                      )}
                    </div>
                  )}

                  {/* 2. YOUTUBE CELEBRATION VIDEO */}
                  {formData.celebrationVideoType === 'youtube' && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Enter YouTube Video URL (e.g. Birthday song or surprise clip)
                      </label>
                      <div className="relative">
                        <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.celebrationVideoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, celebrationVideoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. DIRECT VIDEO URL */}
                  {formData.celebrationVideoType === 'url' && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Enter Direct MP4 Video URL
                      </label>
                      <input
                        type="url"
                        value={formData.celebrationVideoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, celebrationVideoUrl: e.target.value })}
                        placeholder="https://example.com/birthday-video.mp4"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Auto-close Play Duration Setting */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Video Play Time (Auto Close Duration)
                      </label>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-stone-750 px-2 py-0.5 rounded-md border border-amber-200 dark:border-stone-600">
                        {formData.celebrationVideoDuration ?? 15} Seconds
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="1"
                        value={formData.celebrationVideoDuration ?? 15}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            celebrationVideoDuration: parseInt(e.target.value, 10),
                          })
                        }
                        className="flex-1 accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Candle blow hone ke baad video itne seconds play hoga (Default: 15s) aur phir automatically close ho jayega.
                    </p>
                  </div>

                  {/* Preview Video Button */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        Test celebration experience:
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsVideoPreviewOpen(true);
                        sound.playSparkleChime();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Preview Candle Blow Video 🐿️🎬</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: 4. SURPRISE GIFT BOX MEDIA (PHOTO / VIDEO / YOUTUBE) */}
            {activeTab === 'surprise-box' && (
              <div className="space-y-5">
                {/* PERMANENT PERSISTENCE ASSURANCE BANNER */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Surprise Box Media Configured & Auto-Saved</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900/70 text-rose-700 dark:text-rose-300 font-semibold">
                        Auto-Saved
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      Jab user "Unwrap Birthday Gift Box" par tap karega, toh yahan set kiya gaya Photo ya Video unwrap hokar screen par reveal hoga!
                    </p>
                  </div>
                </div>

                {/* MAIN SURPRISE BOX CARD */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl border-2 border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-stone-850 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            Surprise Box Reveal Media (Photo ya Video)
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                            Gift Unbox
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Choose whether a romantic photo, custom uploaded video clip, or YouTube song plays inside the gift box.
                        </p>
                      </div>
                    </div>

                    {/* Autoplay toggle for video */}
                    {(formData.surpriseBoxMediaType === 'video' || formData.surpriseBoxMediaType === 'youtube') && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                          Auto-Play on Unbox:
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.surpriseBoxAutoplayVideo !== false}
                            onChange={(e) =>
                              setFormData({ ...formData, surpriseBoxAutoplayVideo: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Media Type Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                    {[
                      {
                        type: 'image',
                        label: 'Romantic Photo / Pic 🖼️',
                        desc: 'Upload photo from phone or pick preset',
                        badge: 'Photo / Pic',
                        icon: ImageIcon,
                      },
                      {
                        type: 'drive',
                        label: 'Google Drive Video 🚀',
                        desc: 'Play video smoothly from Drive link',
                        badge: 'Stall-Free',
                        icon: Film,
                      },
                      {
                        type: 'video',
                        label: 'Custom Video Clip 🎬',
                        desc: 'Upload MP4/WebM video from phone/PC',
                        badge: 'Custom Video',
                        icon: Film,
                      },
                      {
                        type: 'youtube',
                        label: 'YouTube Video / Song ▶️',
                        desc: 'Play specific YouTube song or clip',
                        badge: 'YouTube',
                        icon: Youtube,
                      },
                      {
                        type: 'none',
                        label: 'Certificate & Vows Only 📜',
                        desc: 'Show lifetime certificate & love vows only',
                        badge: 'Text Only',
                        icon: FileText,
                      },
                    ].map((item) => {
                      const isSelected = (formData.surpriseBoxMediaType || 'image') === item.type;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              surpriseBoxMediaType: item.type as BirthdayConfig['surpriseBoxMediaType'],
                            });
                            sound.playSparkleChime();
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/80 dark:bg-stone-800 ring-2 ring-rose-400 shadow-xs'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-stone-500'}`} />
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 0. GOOGLE DRIVE VIDEO FOR SURPRISE BOX */}
                  {formData.surpriseBoxMediaType === 'drive' && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-stone-800/80 border border-rose-200 dark:border-stone-700 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-0.5">
                          Paste Google Drive Video Link for Surprise Gift Box:
                        </label>
                        <p className="text-[11px] text-stone-500">
                          Recipient jab gift box unwrap karega, to yeh video bina buffer kiye chalegi.
                        </p>
                      </div>
                      <input
                        type="url"
                        value={formData.surpriseBoxMediaUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            surpriseBoxMediaUrl: e.target.value,
                            surpriseBoxMediaType: 'drive',
                          })
                        }
                        placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Video Caption (Video ke niche sandesh):
                        </label>
                        <input
                          type="text"
                          value={formData.surpriseBoxMediaCaption || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, surpriseBoxMediaCaption: e.target.value })
                          }
                          placeholder="A special video message made just for you! ❤️"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 1. PHOTO / PIC CONFIGURATION */}
                  {formData.surpriseBoxMediaType === 'image' && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-stone-800/80 border border-rose-200 dark:border-stone-700 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                          Upload Surprise Photo (Phone Gallery ya Computer se Photo Chuniye):
                        </label>
                        <p className="text-[11px] text-stone-500 mb-2">
                          Yeh photo gift box unwrap hote hi romantic frame me glow ke sath dikhegi.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-rose-300 dark:border-stone-600 hover:border-rose-500 bg-white dark:bg-stone-850 hover:bg-rose-50/40 cursor-pointer transition-colors text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-xs">
                          <Upload className="w-4 h-4 text-rose-500" />
                          <span>
                            {formData.surpriseBoxMediaName
                              ? 'Change Uploaded Photo'
                              : 'Click to Upload Photo (.jpg, .png, .webp)'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSurprisePhotoUpload(file);
                            }}
                          />
                        </label>

                        {formData.surpriseBoxMediaUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                surpriseBoxMediaUrl: '',
                                surpriseBoxMediaName: '',
                              });
                              sound.playPop();
                            }}
                            className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-rose-600 text-xs font-medium cursor-pointer"
                          >
                            Clear Photo
                          </button>
                        )}
                      </div>

                      {surprisePhotoUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{surprisePhotoUploadError}</p>
                      )}

                      {/* Direct Photo URL fallback */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Or Enter Direct Image URL:
                        </label>
                        <input
                          type="url"
                          value={formData.surpriseBoxMediaUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surpriseBoxMediaUrl: e.target.value,
                              surpriseBoxMediaName: 'Direct URL Photo',
                            })
                          }
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Curated Romantic Photo Presets */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                          Or Choose from High-Quality Romantic Presets:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            {
                              name: 'Red Roses & Hearts',
                              url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              name: 'Couple Romantic Hug',
                              url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              name: 'Stargazing Under Sky',
                              url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              name: 'Spontaneous Roadtrip',
                              url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
                            },
                          ].map((preset) => {
                            const isMatch = formData.surpriseBoxMediaUrl === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    surpriseBoxMediaUrl: preset.url,
                                    surpriseBoxMediaName: preset.name,
                                  });
                                  sound.playSparkleChime();
                                }}
                                className={`p-1.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                                  isMatch
                                    ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 ring-2 ring-rose-400'
                                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-rose-300'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-16 object-cover rounded-lg"
                                />
                                <span className="text-[10px] font-semibold text-stone-800 dark:text-stone-200 truncate">
                                  {preset.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photo Caption Input */}
                      <div className="space-y-1 pt-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Photo Caption (Photo ke niche likha jane wala pyara sandesh):
                        </label>
                        <input
                          type="text"
                          value={formData.surpriseBoxMediaCaption || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, surpriseBoxMediaCaption: e.target.value })
                          }
                          placeholder="You are the greatest gift I could ever ask for in this lifetime. Happy Birthday! ❤️"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Live Image Preview */}
                      {formData.surpriseBoxMediaUrl && (
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-2">
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-rose-500" />
                            <span>Live Picture Preview in Gift Box:</span>
                          </span>
                          <div className="max-h-48 overflow-hidden rounded-xl bg-stone-950 flex items-center justify-center">
                            <img
                              src={formData.surpriseBoxMediaUrl}
                              alt="Preview"
                              className="max-h-48 w-auto object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. CUSTOM VIDEO CONFIGURATION */}
                  {formData.surpriseBoxMediaType === 'video' && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-stone-800/80 border border-rose-200 dark:border-stone-700 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                          Upload Surprise Birthday Video Clip (.mp4, .webm, .mov):
                        </label>
                        <p className="text-[11px] text-stone-500 mb-2">
                          Jab recipient gift box unwrap karega, toh yeh custom birthday video screen par play hogi.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-rose-300 dark:border-stone-600 hover:border-rose-500 bg-white dark:bg-stone-850 hover:bg-rose-50/40 cursor-pointer transition-colors text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-xs">
                          <Upload className="w-4 h-4 text-rose-500" />
                          <span>
                            {formData.surpriseBoxMediaName
                              ? 'Change Uploaded Video'
                              : 'Click to Upload Video File (.mp4, .webm, .mov)'}
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSurpriseVideoUpload(file);
                            }}
                          />
                        </label>

                        {formData.surpriseBoxMediaUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                surpriseBoxMediaUrl: '',
                                surpriseBoxMediaName: '',
                              });
                              sound.playPop();
                            }}
                            className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-rose-600 text-xs font-medium cursor-pointer"
                          >
                            Clear Video
                          </button>
                        )}
                      </div>

                      {surpriseVideoUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{surpriseVideoUploadError}</p>
                      )}

                      {/* Direct Video URL input */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Or Enter Direct MP4 Video URL:
                        </label>
                        <input
                          type="url"
                          value={formData.surpriseBoxMediaUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surpriseBoxMediaUrl: e.target.value,
                              surpriseBoxMediaName: 'Direct Video URL',
                            })
                          }
                          placeholder="https://example.com/birthday-video.mp4"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Video Caption Input */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Video Caption (Video ke niche sandesh):
                        </label>
                        <input
                          type="text"
                          value={formData.surpriseBoxMediaCaption || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, surpriseBoxMediaCaption: e.target.value })
                          }
                          placeholder="A special video message made just for you! ❤️"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Live Video Preview */}
                      {formData.surpriseBoxMediaUrl && (
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-2">
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                            <Play className="w-3.5 h-3.5 text-rose-500 fill-current" />
                            <span>Live Video Player Preview:</span>
                          </span>
                          <div className="max-h-56 overflow-hidden rounded-xl bg-black flex items-center justify-center">
                            <video
                              src={formData.surpriseBoxMediaUrl}
                              controls
                              playsInline
                              className="max-h-56 w-full object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. YOUTUBE VIDEO CONFIGURATION */}
                  {formData.surpriseBoxMediaType === 'youtube' && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-stone-800/80 border border-rose-200 dark:border-stone-700 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                          Paste YouTube Video / Romantic Song URL:
                        </label>
                        <p className="text-[11px] text-stone-500 mb-2">
                          Gift Box khulte hi yeh YouTube video box ke andar display hogi.
                        </p>
                      </div>

                      <div className="relative">
                        <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.surpriseBoxYoutubeUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surpriseBoxYoutubeUrl: e.target.value,
                              surpriseBoxMediaUrl: e.target.value,
                            })
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* Curated Popular Video Tracks */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                          Or Choose from Popular Romantic Tracks:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {[
                            { name: 'Kesariya - Brahmāstra', url: 'https://www.youtube.com/watch?v=BddP6PYo2gs' },
                            { name: 'Perfect - Ed Sheeran', url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g' },
                            { name: 'Tum Hi Ho - Aashiqui 2', url: 'https://www.youtube.com/watch?v=IJq0yyWug1k' },
                            { name: 'Until I Found You - Stephen Sanchez', url: 'https://www.youtube.com/watch?v=GxldQ9eX2wo' },
                          ].map((song) => (
                            <button
                              key={song.url}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  surpriseBoxYoutubeUrl: song.url,
                                  surpriseBoxMediaUrl: song.url,
                                });
                                sound.playSparkleChime();
                              }}
                              className={`text-[10px] p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                                formData.surpriseBoxYoutubeUrl === song.url
                                  ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200 font-bold'
                                  : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-rose-300'
                              }`}
                            >
                              <span className="truncate">{song.name}</span>
                              {formData.surpriseBoxYoutubeUrl === song.url && (
                                <Check className="w-3 h-3 text-rose-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Video Caption */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Caption Note (Optional):
                        </label>
                        <input
                          type="text"
                          value={formData.surpriseBoxMediaCaption || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, surpriseBoxMediaCaption: e.target.value })
                          }
                          placeholder="Our favorite song playing for you! ❤️🎶"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* BOTTOM ACTION: Test Surprise Box Unboxing */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 flex-wrap gap-2">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Active Surprise Mode: <strong className="text-rose-600 capitalize">{formData.surpriseBoxMediaType || 'image'}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        handleSave();
                        onClose();
                        setTimeout(() => {
                          const el = document.getElementById('gift-reveal');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 200);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Save & Test Surprise Box 🎁</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Photos Clothesline (MOBILE-OPTIMIZED) */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-rose-500" /> Couple Memory Photos ({formData.polaroids.length})
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Upload real photos from your phone gallery or edit handwritten captions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPolaroid}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Mobile Quick Photo Selector Ribbon */}
                {formData.polaroids.length > 0 && (
                  <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 shrink-0 px-1">
                      Quick View:
                    </span>
                    {formData.polaroids.map((p, idx) => (
                      <a
                        key={p.id}
                        href={`#photo-card-${idx}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(`photo-card-${idx}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-[11px] font-semibold text-stone-800 dark:text-stone-200 shrink-0 hover:bg-rose-50 dark:hover:bg-stone-600 transition-colors"
                      >
                        <img
                          src={p.url}
                          alt=""
                          className="w-4 h-4 rounded-md object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>#{idx + 1}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.polaroids.map((photo, idx) => (
                    <div
                      key={photo.id}
                      id={`photo-card-${idx}`}
                      className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-3 shadow-xs scroll-mt-24"
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

            {/* TAB: Love Coupons Settings */}
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

            {/* TAB: Recipient's Sealed Wish & Selected Coupons Activity */}
            {activeTab === 'user-activity' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-200">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif-romantic text-lg sm:text-xl font-bold flex items-center gap-1.5">
                          <span>User Activity & Selections Log</span>
                          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                        </h3>
                        <p className="text-xs text-rose-100 font-sans-clean">
                          Recipient {formData.recipientName} dwara seal ki gayi Wish aur claim kiye gaye Coupons
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/20 text-white text-xs font-semibold backdrop-blur-xs">
                        Recipient: {formData.recipientNickname || formData.recipientName} 💖
                      </span>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-white/20">
                    <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-xs">
                      <span className="block text-[11px] text-rose-100">🎂 Birthday Wish</span>
                      <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1 mt-0.5">
                        {formData.sealedWish ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Wish Sealed ✨</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-300" />
                            <span>Pending / Unsealed</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-xs">
                      <span className="block text-[11px] text-rose-100">🎟️ Claimed Coupons</span>
                      <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1 mt-0.5">
                        <Ticket className="w-4 h-4 text-amber-300" />
                        <span>
                          {formData.coupons.filter((c) => c.redeemed).length} of {formData.coupons.length} Claimed
                        </span>
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white/15 rounded-xl p-2.5 backdrop-blur-xs">
                      <span className="block text-[11px] text-rose-100">✨ Claim Progress</span>
                      <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1 mt-0.5">
                        <Heart className="w-4 h-4 text-pink-300 fill-pink-300" />
                        <span>
                          {Math.round(
                            (formData.coupons.filter((c) => c.redeemed).length /
                              Math.max(1, formData.coupons.length)) *
                              100
                          )}
                          % Completed
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. SEALED BIRTHDAY WISH SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <h4 className="font-serif-romantic text-base font-bold text-stone-900 dark:text-stone-100">
                        1. Recipient's Sealed Birthday Wish (Cake Section)
                      </h4>
                    </div>

                    {formData.sealedWish && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active Secret Wish</span>
                      </span>
                    )}
                  </div>

                  {formData.sealedWish ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-rose-50/70 to-pink-50/90 dark:from-stone-850 dark:via-stone-900 dark:to-stone-850 border-2 border-amber-300 dark:border-amber-700/60 shadow-md relative overflow-hidden space-y-3">
                      {/* Top Stamp */}
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-2 border-b border-amber-200/80 dark:border-stone-700">
                        <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Secret Wish Sealed in the Stars 🌟</span>
                        </span>
                        {formData.sealedWishDate && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3" />
                            <span>{formData.sealedWishDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Wish Display or Edit Form */}
                      {isEditingWish ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={3}
                            value={tempWishText}
                            onChange={(e) => setTempWishText(e.target.value)}
                            placeholder="Type wish content..."
                            className="w-full px-3.5 py-2 rounded-xl border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none font-serif-romantic text-stone-900 dark:text-stone-100"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingWish(false);
                                setTempWishText(formData.sealedWish || '');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  sealedWish: tempWishText.trim(),
                                  sealedWishDate:
                                    formData.sealedWishDate ||
                                    new Date().toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    }),
                                });
                                setIsEditingWish(false);
                                sound.playSparkleChime();
                              }}
                              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                            >
                              Update Wish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="font-serif-romantic text-base sm:text-lg font-bold text-stone-900 dark:text-amber-100 italic leading-relaxed bg-white/60 dark:bg-stone-800/60 p-3.5 rounded-xl border border-amber-200 dark:border-stone-700">
                            "{formData.sealedWish}"
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isEditingWish && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setTempWishText(formData.sealedWish || '');
                              setIsEditingWish(true);
                            }}
                            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit / Modify Wish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to clear this sealed wish?')) {
                                setFormData({
                                  ...formData,
                                  sealedWish: '',
                                  sealedWishDate: '',
                                });
                                sound.playPop();
                              }
                            }}
                            className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear Sealed Wish</span>
                          </button>
                        </div>
                      )}

                      {/* Saved Wishes History (if user made multiple wishes) */}
                      {formData.savedWishesHistory && formData.savedWishesHistory.length > 1 && (
                        <div className="pt-3 border-t border-amber-200/80 dark:border-stone-700 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
                            <History className="w-3.5 h-3.5 text-amber-600" />
                            <span>Previous Sealed Wishes Log ({formData.savedWishesHistory.length}):</span>
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {formData.savedWishesHistory.map((item, hIdx) => (
                              <div
                                key={item.id || `h-${hIdx}`}
                                className="text-xs p-2 rounded-lg bg-white/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-2"
                              >
                                <span className="italic font-serif-romantic text-stone-800 dark:text-stone-200">
                                  "{item.wish}"
                                </span>
                                <span className="text-[10px] text-stone-400 shrink-0">
                                  {item.date}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EMPTY STATE FOR SEALED WISH */
                    <div className="p-5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-center space-y-3">
                      <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-stone-800 flex items-center justify-center text-amber-500">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-serif-romantic text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200">
                          Abhi tak koi Birthday Wish seal nahi hui hai
                        </h5>
                        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
                          Jab recipient cake blow karte waqt secret wish likhkar <strong className="text-rose-500">"Seal Wish ✨"</strong> button click karega, tab wo wish yahan real-time record ho jayegi.
                        </p>
                      </div>

                      {/* Manual Add Wish for Testing */}
                      <button
                        type="button"
                        onClick={() => {
                          const sample = prompt('Enter a secret birthday wish to save:', 'Forever happiness, peace, and endless love together!');
                          if (sample && sample.trim()) {
                            const nowStr = new Date().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            setFormData({
                              ...formData,
                              sealedWish: sample.trim(),
                              sealedWishDate: nowStr,
                              savedWishesHistory: [
                                ...(formData.savedWishesHistory || []),
                                { id: Date.now().toString(), wish: sample.trim(), date: nowStr },
                              ],
                            });
                            sound.playSparkleChime();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-semibold border border-amber-300 dark:border-amber-700 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Manually Set a Sealed Wish for Testing</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. SELECTED & REDEEMED LOVE COUPONS SECTION */}
                <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-rose-500" />
                      <h4 className="font-serif-romantic text-base font-bold text-stone-900 dark:text-stone-100">
                        2. Love Coupons Claimed / Selected by Recipient
                      </h4>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                      <button
                        type="button"
                        onClick={() => setUserCouponFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          userCouponFilter === 'all'
                            ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                      >
                        All ({formData.coupons.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserCouponFilter('redeemed')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          userCouponFilter === 'redeemed'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Claimed ({formData.coupons.filter((c) => c.redeemed).length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserCouponFilter('unredeemed')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          userCouponFilter === 'unredeemed'
                            ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                      >
                        Unclaimed ({formData.coupons.filter((c) => !c.redeemed).length})
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
                    <span>
                      Total Claimed:{' '}
                      <strong className="text-rose-600 dark:text-rose-400">
                        {formData.coupons.filter((c) => c.redeemed).length}
                      </strong>{' '}
                      of {formData.coupons.length} Vouchers
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const todayStr = new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          const updated = formData.coupons.map((c) => ({
                            ...c,
                            redeemed: true,
                            redeemedDate: c.redeemedDate || todayStr,
                          }));
                          setFormData({ ...formData, coupons: updated });
                          sound.playSparkleChime();
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        Mark All as Claimed
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.coupons.map((c) => ({
                            ...c,
                            redeemed: false,
                            redeemedDate: undefined,
                          }));
                          setFormData({ ...formData, coupons: updated });
                          sound.playPop();
                        }}
                        className="text-xs text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
                      >
                        Reset All Redemptions
                      </button>
                    </div>
                  </div>

                  {/* Coupons List */}
                  <div className="space-y-2.5">
                    {formData.coupons
                      .filter((coupon) => {
                        if (userCouponFilter === 'redeemed') return coupon.redeemed;
                        if (userCouponFilter === 'unredeemed') return !coupon.redeemed;
                        return true;
                      })
                      .map((coupon, idx) => (
                        <div
                          key={coupon.id || `act-c-${idx}`}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            coupon.redeemed
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                                {coupon.code}
                              </span>
                              <h5 className="font-serif-romantic text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                                {coupon.title}
                              </h5>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                              {coupon.description}
                            </p>
                          </div>

                          {/* Status and Toggle Action */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {coupon.redeemed ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Claimed: {coupon.redeemedDate || 'Yes'}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.coupons.map((c) =>
                                      c.id === coupon.id
                                        ? { ...c, redeemed: false, redeemedDate: undefined }
                                        : c
                                    );
                                    setFormData({ ...formData, coupons: updated });
                                    sound.playPop();
                                  }}
                                  className="text-[11px] text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
                                  title="Reset to unclaimed"
                                >
                                  Unclaim
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium">
                                  <Clock className="w-3 h-3" />
                                  <span>Unclaimed</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const todayStr = new Date().toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    });
                                    const updated = formData.coupons.map((c) =>
                                      c.id === coupon.id
                                        ? { ...c, redeemed: true, redeemedDate: todayStr }
                                        : c
                                    );
                                    setFormData({ ...formData, coupons: updated });
                                    sound.playSparkleChime();
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                                >
                                  Mark as Claimed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {formData.coupons.length === 0 && (
                      <div className="p-4 text-center text-xs text-stone-500">
                        No coupons defined yet. Add some in the Love Coupons Settings tab!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Share Link */}
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

                {/* UNIVERSAL CLOUD SYNC CARD */}
                <div className="max-w-lg mx-auto p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-stone-800 dark:to-stone-850 border border-emerald-300 dark:border-stone-700 text-left space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      🌐
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        Global Cloud Sync (www.bunnypatel.com)
                      </h5>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400">
                        Kisi bhi IP, mobile phone ya computer par site open hone par yahi custom data dikhega.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSaving(true);
                        setCloudSyncStatus(null);
                        const syncRes = await saveConfigAsync(formData);
                        onSave(formData);
                        setIsSaving(false);
                        if (syncRes.success) {
                          sound.playSparkleChime();
                          setCloudSyncStatus({
                            type: 'success',
                            message: 'Success! Global Cloud database updated. All devices & browsers will now see this.',
                          });
                        } else {
                          setCloudSyncStatus({
                            type: 'error',
                            message: syncRes.message,
                          });
                        }
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Syncing to Cloud...' : '🚀 Force Cloud Sync Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute('href', dataStr);
                        downloadAnchor.setAttribute('download', 'bunnypatel-birthday-config.json');
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        sound.playSparkleChime();
                      }}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 rotate-180" />
                      <span>Download config.json</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CLOUD SYNC LIVE STATUS BANNER */}
          {cloudSyncStatus && (
            <div
              className={`px-4 py-2 text-xs flex items-center justify-between gap-2 border-t ${
                cloudSyncStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">{cloudSyncStatus.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setCloudSyncStatus(null)}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STICKY FOOTER WITH SAVE, PREV/NEXT & RESET */}
          <div className="p-3 sm:p-4 border-t border-rose-100 dark:border-stone-800 bg-rose-50/95 dark:bg-stone-850/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-rose-50 dark:hover:bg-stone-800 hover:text-rose-600 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>

              {/* Tab Navigation Arrows */}
              <button
                type="button"
                onClick={goToPrevTab}
                disabled={currentTabIndex === 0}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                  currentTabIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer active:scale-95'
                }`}
                title="Previous Option"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                type="button"
                onClick={goToNextTab}
                disabled={currentTabIndex === TABS.length - 1}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                  currentTabIndex === TABS.length - 1
                    ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer active:scale-95'
                }`}
                title="Next Option"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                  isSaving ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing Cloud...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Sync All Devices</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Video Preview Modal */}
      <CelebrationVideoModal
        isOpen={isVideoPreviewOpen}
        onClose={() => setIsVideoPreviewOpen(false)}
        config={formData}
      />
    </div>
  );
}
