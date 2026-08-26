import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { BirthdayConfig } from '../types';
import { compressBase64Image } from '../utils/imageCompressor';
import { uploadMediaToCloudStorage } from './mediaCloudService';

// Firebase configuration from provisioned environment
const firebaseConfig = {
  projectId: 'valued-gradient-h9v0l',
  appId: '1:427216115384:web:d19ebd01b50de552d5464d',
  apiKey: 'AIzaSyAeUSG3cbXY3zkk_dVDOLHLkE2RVdkxpeQ',
  authDomain: 'valued-gradient-h9v0l.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-lovewish-9e0731ac-1759-4696-b465-3e0f9898c4b7',
  storageBucket: 'valued-gradient-h9v0l.firebasestorage.app',
  messagingSenderId: '427216115384',
};

const CONFIG_COLLECTION = 'app_config';
const CONFIG_DOC_ID = 'global_birthday_config';

let primaryDb: Firestore | null = null;
let defaultDb: Firestore | null = null;

function getFirebaseDatabases(): { named: Firestore | null; defaultDb: Firestore | null } {
  if (typeof window === 'undefined') return { named: null, defaultDb: null };
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (!primaryDb && firebaseConfig.firestoreDatabaseId) {
      try {
        primaryDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } catch (err) {
        console.warn('Could not init named firestore db:', err);
      }
    }
    if (!defaultDb) {
      try {
        defaultDb = getFirestore(app);
      } catch (err) {
        console.warn('Could not init default firestore db:', err);
      }
    }
  } catch (err) {
    console.warn('Failed to initialize Firebase app:', err);
  }
  return { named: primaryDb, defaultDb: defaultDb };
}

/**
 * Helper to automatically convert large base64 media to high-speed global CDN URLs via Firebase Cloud Storage
 */
async function uploadBase64MediaIfNeeded(
  dataUrl: string | undefined,
  defaultName: string,
  type: string
): Promise<string | undefined> {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (!dataUrl.startsWith('data:')) return dataUrl;

  try {
    const result = await uploadMediaToCloudStorage(dataUrl, defaultName, type);
    if (result && result.url) {
      console.log(`🚀 Converted base64 media to global Cloud CDN URL (${result.provider}): ${result.url}`);
      return result.url;
    }
  } catch (err) {
    console.warn('Cloud Storage media upload notice:', err);
  }
  return dataUrl;
}

/**
 * Prepares and compresses the config object so it stays safely under Firestore's 1MB limit.
 */
async function prepareConfigForFirestore(config: BirthdayConfig): Promise<Record<string, any>> {
  const sanitized = JSON.parse(JSON.stringify(config)) as Record<string, any>;

  // 1. Parallelize media conversion with strict timeouts
  const uploadTasks: Promise<void>[] = [];

  if (sanitized.introMusicAudioUrl && sanitized.introMusicAudioUrl.startsWith('data:')) {
    uploadTasks.push(
      uploadBase64MediaIfNeeded(
        sanitized.introMusicAudioUrl,
        sanitized.introMusicAudioName || 'intro_music.mp3',
        'audio/mpeg'
      ).then((res) => {
        if (res) sanitized.introMusicAudioUrl = res;
      })
    );
  }

  if (sanitized.musicAudioUrl && sanitized.musicAudioUrl.startsWith('data:')) {
    uploadTasks.push(
      uploadBase64MediaIfNeeded(
        sanitized.musicAudioUrl,
        sanitized.musicAudioName || 'background_music.mp3',
        'audio/mpeg'
      ).then((res) => {
        if (res) sanitized.musicAudioUrl = res;
      })
    );
  }

  if (sanitized.celebrationVideoUrl && sanitized.celebrationVideoUrl.startsWith('data:')) {
    uploadTasks.push(
      uploadBase64MediaIfNeeded(
        sanitized.celebrationVideoUrl,
        sanitized.celebrationVideoName || 'celebration_video.mp4',
        'video/mp4'
      ).then((res) => {
        if (res) sanitized.celebrationVideoUrl = res;
      })
    );
  }

  if (sanitized.surpriseBoxMediaUrl && sanitized.surpriseBoxMediaUrl.startsWith('data:')) {
    uploadTasks.push(
      uploadBase64MediaIfNeeded(
        sanitized.surpriseBoxMediaUrl,
        sanitized.surpriseBoxMediaName || 'surprise_media.mp4',
        sanitized.surpriseBoxMediaType === 'video' ? 'video/mp4' : 'image/jpeg'
      ).then((res) => {
        if (res) sanitized.surpriseBoxMediaUrl = res;
      })
    );
  }

  // 2. Compress polaroid images so each photo is ~20KB - 40KB
  if (Array.isArray(sanitized.polaroids)) {
    uploadTasks.push(
      Promise.all(
        sanitized.polaroids.map(async (polaroid: any) => {
          if (polaroid.url && polaroid.url.startsWith('data:image')) {
            const compressed = await compressBase64Image(polaroid.url, 500, 0.6);
            return { ...polaroid, url: compressed };
          }
          return polaroid;
        })
      ).then((compressedList) => {
        sanitized.polaroids = compressedList;
      })
    );
  }

  // Await all conversions with max 6s timeout
  await Promise.race([
    Promise.all(uploadTasks),
    new Promise((resolve) => setTimeout(resolve, 6000)),
  ]);

  // If any video/audio is STILL a huge base64 string (>300KB), replace it with an empty/clean string
  // for Firestore document safety to prevent Firestore 1MB rejection
  const stripHugeBase64 = (val: any) => {
    if (typeof val === 'string' && val.startsWith('data:') && val.length > 300000) {
      return '';
    }
    return val;
  };
  sanitized.celebrationVideoUrl = stripHugeBase64(sanitized.celebrationVideoUrl);
  sanitized.surpriseBoxMediaUrl = stripHugeBase64(sanitized.surpriseBoxMediaUrl);
  sanitized.introMusicAudioUrl = stripHugeBase64(sanitized.introMusicAudioUrl);
  sanitized.musicAudioUrl = stripHugeBase64(sanitized.musicAudioUrl);

  // 3. Remove undefined properties which Firestore rejects
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

export interface CloudSyncResult {
  success: boolean;
  message: string;
}

/**
 * Saves the customized birthday configuration permanently to Google Cloud Firestore.
 * Saves to both named and default Firestore databases in parallel for maximum reliability.
 */
export async function saveConfigToFirestore(config: BirthdayConfig): Promise<CloudSyncResult> {
  const { named, defaultDb } = getFirebaseDatabases();
  const dbsToTry = [named, defaultDb].filter(Boolean) as Firestore[];

  if (dbsToTry.length === 0) {
    return { success: false, message: 'Firebase initialization skipped (offline/unconfigured)' };
  }

  try {
    const sanitizedData = await prepareConfigForFirestore(config);
    const payload = {
      config: sanitizedData,
      updatedAt: new Date().toISOString(),
      version: 'v5.2',
    };

    const savePromises = dbsToTry.map(async (db, index) => {
      const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
      await setDoc(docRef, payload, { merge: true });
      return `db_${index}_saved`;
    });

    const results = await Promise.allSettled(savePromises);
    const hasSuccess = results.some((r) => r.status === 'fulfilled');

    if (hasSuccess) {
      console.log('✅ Configuration successfully persisted to Cloud Firestore for all visitors worldwide!');
      return {
        success: true,
        message: 'Saved to Cloud Firestore! All visitors will see your updated surprise live.',
      };
    }

    const firstRejection = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    const reason = firstRejection?.reason?.message || 'Firestore connection issue';
    console.warn('Firestore save notice:', reason);
    return { success: false, message: `Cloud notice: ${reason}` };
  } catch (err: any) {
    console.warn('⚠️ Cloud Firestore save error:', err);
    return { success: false, message: err?.message || 'Saved locally' };
  }
}

/**
 * Fetches the global configuration from Google Cloud Firestore.
 * Queries databases concurrently with a fast timeout.
 */
export async function loadConfigFromFirestore(): Promise<BirthdayConfig | null> {
  const { named, defaultDb } = getFirebaseDatabases();
  const dbsToTry = [named, defaultDb].filter(Boolean) as Firestore[];

  if (dbsToTry.length === 0) return null;

  try {
    const fetchPromises = dbsToTry.map(async (db) => {
      const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.config && data.config.recipientName) {
          return data.config as BirthdayConfig;
        }
      }
      return null;
    });

    // Race or evaluate results with a max 3s timeout
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const results = await Promise.race([Promise.all(fetchPromises), timeoutPromise]);

    if (Array.isArray(results)) {
      const found = results.find((c) => c !== null);
      if (found) {
        console.log('🌐 Loaded global live config from Cloud Firestore!');
        return found;
      }
    }
  } catch (err) {
    console.warn('Firestore load notice:', err);
  }

  return null;
}

/**
 * Subscribes to real-time changes in Firestore.
 * When the owner edits on one device, all other open visitors immediately receive the updates.
 */
export function subscribeToFirestoreConfig(
  onUpdate: (config: BirthdayConfig) => void
): (() => void) | null {
  const { named, defaultDb } = getFirebaseDatabases();
  const targetDb = named || defaultDb;
  if (!targetDb) return null;

  try {
    const docRef = doc(targetDb, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.config && data.config.recipientName) {
            onUpdate(data.config as BirthdayConfig);
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription notice:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to Firestore config:', err);
    return null;
  }
}
