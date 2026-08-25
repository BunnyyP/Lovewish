import { BirthdayConfig } from '../types';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  siteLockEnabled: true,
  siteLockPassword: 'Merijaan',
  recipientName: 'My Sweetheart',
  recipientNickname: 'My Cutie Pie ✨',
  senderName: 'Your Favorite Person',
  birthdayDate: new Date().toISOString().split('T')[0], // Today or custom
  relationshipStartDate: '2022-06-14', // Milestone counter
  customizationPassword: 'HoneyBunny',
  theme: 'rose',
  loveLetterTitle: 'To the one who holds my heart,',
  loveLetterBody: `From the very moment you walked into my life, every day turned into something softer, brighter, and infinitely more magical.

You make ordinary moments feel like poetry—the way your eyes light up when you laugh, the warmth in your gentle hugs after a long day, and the quiet comfort of just existing next to you.

On your birthday, I just want you to know how deeply you are cherished, celebrated, and loved. Not just for who you are when the world is watching, but for all the sweet, quirky, kind, and tender little things that make you uniquely YOU.

Happy Birthday, my love. Today, tomorrow, and every day after, I am so grateful to walk beside you. ❤️`,
  secretWishPrompt: 'Close your eyes, make the sweetest wish in your heart, and blow out the candles...',
  finaleMessageTitle: 'My Forever Promise To You 💍',
  finaleMessageBody: `May this year bring you all the endless happiness, gentle mornings, laughing fits, and dreams come true that your beautiful soul deserves. You are my favorite adventure and my safest haven.`,
  finalePromise: `I promise to always hold your hand, make you laugh on rainy days, steal your hoodies, and love you more with every sunrise. Happy Birthday! 🎂✨`,
  polaroids: [
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      caption: 'Where our story first began ☕💫',
      date: 'Our First Date',
      location: 'Little Corner Cafe',
      noteOnBack: 'I was so nervous my hands were shaking, but the second you smiled, I felt like I was already home.',
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      caption: 'Stargazing & late night talks 🌌',
      date: 'Summer Nights',
      location: 'Under the open sky',
      noteOnBack: 'We talked until 3 AM about everything and nothing. I realized then that I never wanted the night to end.',
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      caption: 'That spontaneous road trip 🚗💨',
      date: 'Golden Hour Memories',
      location: 'Coastline drive',
      noteOnBack: 'Singing out of tune with the windows down, wind in your hair. Pure happiness in one snapshot.',
    },
    {
      id: 'p4',
      url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
      caption: 'Laughing until our stomachs hurt 😂❤️',
      date: 'Lazy Sunday Afternoon',
      location: 'Living room floor',
      noteOnBack: 'Your laugh is honestly my most favorite melody in the entire world.',
    },
  ],
  reasons: [
    {
      id: 'r1',
      title: 'Your Contagious Smile',
      message: 'The effortless way your whole face lights up whenever you get excited about something cute or delicious.',
      icon: 'Heart',
    },
    {
      id: 'r2',
      title: 'How Safe You Make Me Feel',
      message: 'Just hearing your voice or resting my head on your chest melts away all the chaos in the world.',
      icon: 'ShieldHeart',
    },
    {
      id: 'r3',
      title: 'Your Kind & Gentle Heart',
      message: 'The empathy and warmth you show to everyone around you inspires me to be a better person every day.',
      icon: 'Sparkles',
    },
    {
      id: 'r4',
      title: 'Our Silly Inside Jokes',
      message: 'We can just exchange one look across a crowded room and both burst out laughing.',
      icon: 'Smile',
    },
    {
      id: 'r5',
      title: 'Your Warmest Hugs',
      message: 'The kind of hugs where you squeeze a little tighter before letting go. Best feeling ever.',
      icon: 'Flame',
    },
    {
      id: 'r6',
      title: 'The Way You Love Me',
      message: 'Patiently, unconditionally, and with all your heart. I never take it for granted.',
      icon: 'Crown',
    },
  ],
  coupons: [
    {
      id: 'c1',
      title: 'Unlimited Free Cuddle Session',
      description: 'Redeemable anytime for endless warm hugs and snuggles. No expiration date!',
      icon: 'Heart',
      redeemed: false,
      code: 'LOVE-CUDDLE-99',
    },
    {
      id: 'c2',
      title: 'Midnight Sweet Treat / Ice Cream Run',
      description: 'Your choice of dessert or midnight snack, delivered with love and no questions asked.',
      icon: 'IceCream',
      redeemed: false,
      code: 'SWEET-TREAT-01',
    },
    {
      id: 'c3',
      title: 'Movie Night - Your Pick (No Complaining!)',
      description: 'You pick the movie, get the cozy blankets, and I make the popcorn.',
      icon: 'Film',
      redeemed: false,
      code: 'CINEMA-PASS-22',
    },
    {
      id: 'c4',
      title: '1-Hour Relaxation & Shoulder Massage',
      description: 'Full pampering session with gentle music and soothing essential oils.',
      icon: 'Sparkles',
      redeemed: false,
      code: 'MASSAGE-VIP-77',
    },
    {
      id: 'c5',
      title: 'One "You Win The Argument" Pass',
      description: 'Present this card and I instantly surrender with a kiss and apologies! 😉',
      icon: 'Award',
      redeemed: false,
      code: 'WIN-CARD-00',
    },
    {
      id: 'c6',
      title: 'Breakfast in Bed Deluxe',
      description: 'Fluffy pancakes, fresh coffee/tea, and your favorite fruits served in bed.',
      icon: 'Coffee',
      redeemed: false,
      code: 'BREAKFAST-BED-10',
    },
  ],
  bgMusicEnabled: false,
  bgMusicAutoPlay: false,
  musicType: 'none',
  musicYoutubeUrl: '',
  musicAudioUrl: '',
  musicAudioName: '',
  bgMusicStartTime: 0,
  bgMusicEndTime: 0,
  bgMusicDuration: 0,
  bgMusicLoop: true,
  introMusicEnabled: false,
  introMusicType: 'none',
  introMusicStartTime: 0,
  introMusicEndTime: 4,
  introMusicDuration: 4,
  introMusicAutoPlayDelay: 0,
  introMusicAutoMute: true,
  introMusicAudioUrl: '',
  introMusicAudioName: '',
  introMusicYoutubeUrl: '',
  celebrationVideoType: 'default',
  celebrationVideoUrl: '',
  celebrationVideoName: '',
  celebrationVideoAutoplay: true,
  surpriseBoxMediaType: 'image',
  surpriseBoxMediaUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
  surpriseBoxMediaName: 'Romantic Roses & Heart',
  surpriseBoxMediaCaption: 'You are the greatest gift I could ever ask for in this lifetime. Happy Birthday! ❤️✨',
  surpriseBoxYoutubeUrl: '',
  surpriseBoxAutoplayVideo: true,
};

const STORAGE_KEY = 'romantic_birthday_surprise_config_v5';
const DB_NAME = 'RomanticBirthdaySurpriseDB_v5';
const DB_VERSION = 1;
const STORE_NAME = 'config_store';
const RECORD_KEY = 'saved_config';

// Open / initialize high-capacity IndexedDB for storing large audio/video and all settings
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save directly to IndexedDB
async function saveToIndexedDB(config: BirthdayConfig): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(config, RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
}

// Load directly from IndexedDB
async function loadFromIndexedDB(): Promise<BirthdayConfig | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as BirthdayConfig);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read error:', err);
    return null;
  }
}

/**
 * Initial synchronous configuration loader (URL hash -> localStorage -> DEFAULT).
 * Provides immediate UI render without any flash of unstyled content.
 */
export function loadSavedConfig(): BirthdayConfig {
  // 1. Check if configuration is encoded in URL hash (for shared surprise links)
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#data=')) {
      const encoded = hash.replace('#data=', '');
      const jsonStr = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.recipientName) {
        return { ...DEFAULT_BIRTHDAY_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to parse URL config', e);
  }

  // 2. Otherwise load from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure customization password defaults to HoneyBunny
      const custPass =
        parsed.customizationPassword && parsed.customizationPassword !== 'Merijaan'
          ? parsed.customizationPassword
          : 'HoneyBunny';

      return {
        ...DEFAULT_BIRTHDAY_CONFIG,
        ...parsed,
        siteLockPassword: parsed.siteLockPassword || 'Merijaan',
        customizationPassword: custPass,
      };
    }
  } catch (e) {
    console.error('Failed to parse local storage', e);
  }

  return DEFAULT_BIRTHDAY_CONFIG;
}

/**
 * Fetches the global configuration from the central server (/api/config).
 * This ensures that whenever any person visits the site from any device/browser,
 * they immediately see the exact customization saved by the creator.
 */
export async function fetchGlobalConfig(): Promise<BirthdayConfig | null> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config && data.config.recipientName) {
        return data.config as BirthdayConfig;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server global config:', err);
  }
  return null;
}

/**
 * Saves configuration globally to the backend server (/api/config)
 * so that any visitor from any location/device sees this saved version.
 */
export async function saveConfigToServer(config: BirthdayConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.warn('Failed to save config to server:', err);
  }
  return false;
}

/**
 * Asynchronously initialize persistent storage from the central server (/api/config),
 * then falls back to IndexedDB and localStorage.
 * This guarantees that changes saved in Customization are globally visible to ALL visitors!
 */
export async function initPersistentStorage(onLoaded: (config: BirthdayConfig) => void): Promise<void> {
  // If URL hash was provided, hash takes priority for custom direct links
  if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#data=')) {
    return;
  }

  // 1. First priority: Check central server for the global customized surprise configuration
  try {
    const serverConfig = await fetchGlobalConfig();
    if (serverConfig && serverConfig.recipientName) {
      const custPass =
        serverConfig.customizationPassword && serverConfig.customizationPassword !== 'Merijaan'
          ? serverConfig.customizationPassword
          : 'HoneyBunny';

      const merged: BirthdayConfig = {
        ...DEFAULT_BIRTHDAY_CONFIG,
        ...serverConfig,
        siteLockPassword: serverConfig.siteLockPassword || 'Merijaan',
        customizationPassword: custPass,
      };

      // Cache locally as well
      saveToIndexedDB(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {}

      onLoaded(merged);
      return;
    }
  } catch (e) {
    console.warn('Server fetch check skipped:', e);
  }

  // 2. Second priority: Fall back to high-capacity IndexedDB
  const idbConfig = await loadFromIndexedDB();
  if (idbConfig && idbConfig.recipientName) {
    const custPass =
      idbConfig.customizationPassword && idbConfig.customizationPassword !== 'Merijaan'
        ? idbConfig.customizationPassword
        : 'HoneyBunny';

    const merged: BirthdayConfig = {
      ...DEFAULT_BIRTHDAY_CONFIG,
      ...idbConfig,
      siteLockPassword: idbConfig.siteLockPassword || 'Merijaan',
      customizationPassword: custPass,
    };
    onLoaded(merged);
  }
}

/**
 * Saves the configuration permanently:
 * 1. Sends to Server (/api/config) so ALL visitors from ANY device see this configuration
 * 2. Saves to IndexedDB (for full capacity)
 * 3. Saves to localStorage (for fast boot cache)
 */
export function saveConfig(config: BirthdayConfig) {
  // 1. Save globally to central server for all visitors
  saveConfigToServer(config);

  // 2. Save to high-capacity IndexedDB
  saveToIndexedDB(config);

  // 3. Save to localStorage (with fallback if audio/video base64 is too large for 5MB limit)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('localStorage quota exceeded (likely due to large audio/video base64). Saving lightweight copy to localStorage while full file is safe in IndexedDB.');
    try {
      const lightweight = {
        ...config,
        musicAudioUrl: config.musicAudioUrl?.startsWith('data:') ? '' : config.musicAudioUrl,
        introMusicAudioUrl: config.introMusicAudioUrl?.startsWith('data:') ? '' : config.introMusicAudioUrl,
        celebrationVideoUrl: config.celebrationVideoUrl?.startsWith('data:') ? '' : config.celebrationVideoUrl,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {}
  }
}

export function generateShareUrl(config: BirthdayConfig): string {
  try {
    // For shareable URL, omit huge base64 uploads so the link is shareable
    const shareableConfig = {
      ...config,
      musicAudioUrl: config.musicAudioUrl?.startsWith('data:') ? '' : config.musicAudioUrl,
      introMusicAudioUrl: config.introMusicAudioUrl?.startsWith('data:') ? '' : config.introMusicAudioUrl,
      celebrationVideoUrl: config.celebrationVideoUrl?.startsWith('data:') ? '' : config.celebrationVideoUrl,
    };
    const jsonStr = JSON.stringify(shareableConfig);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#data=${encoded}`;
  } catch (e) {
    console.error('Failed to generate share URL', e);
    return window.location.href;
  }
}
