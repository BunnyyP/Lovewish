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
 * Prepares and compresses the config object so it stays safely under Firestore's 1MB limit.
 */
async function prepareConfigForFirestore(config: BirthdayConfig): Promise<Record<string, any>> {
  const sanitized = JSON.parse(JSON.stringify(config)) as Record<string, any>;

  // 1. Compress polaroid images so each photo is ~20KB - 40KB
  if (Array.isArray(sanitized.polaroids)) {
    sanitized.polaroids = await Promise.all(
      sanitized.polaroids.map(async (polaroid: any) => {
        if (polaroid.url && polaroid.url.startsWith('data:image')) {
          const compressed = await compressBase64Image(polaroid.url, 500, 0.6);
          return { ...polaroid, url: compressed };
        }
        return polaroid;
      })
    );
  }

  // 2. Handle heavy audio/video base64 files
  // If base64 audio/video exceeds 250KB, strip large base64 from cloud doc to prevent exceeding 1MB
  if (sanitized.introMusicAudioUrl && sanitized.introMusicAudioUrl.startsWith('data:') && sanitized.introMusicAudioUrl.length > 250000) {
    sanitized.introMusicAudioUrl = '';
  }
  if (sanitized.musicAudioUrl && sanitized.musicAudioUrl.startsWith('data:') && sanitized.musicAudioUrl.length > 250000) {
    sanitized.musicAudioUrl = '';
  }
  if (sanitized.celebrationVideoUrl && sanitized.celebrationVideoUrl.startsWith('data:') && sanitized.celebrationVideoUrl.length > 300000) {
    sanitized.celebrationVideoUrl = '';
  }
  if (sanitized.surpriseBoxMediaUrl && sanitized.surpriseBoxMediaUrl.startsWith('data:') && sanitized.surpriseBoxMediaUrl.length > 300000) {
    sanitized.surpriseBoxMediaUrl = '';
  }

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
 * Tries the named database first, then falls back to default database.
 */
export async function saveConfigToFirestore(config: BirthdayConfig): Promise<CloudSyncResult> {
  const { named, defaultDb } = getFirebaseDatabases();
  const dbsToTry = [named, defaultDb].filter(Boolean) as Firestore[];

  if (dbsToTry.length === 0) {
    return { success: false, message: 'Firebase initialization failed' };
  }

  try {
    const sanitizedData = await prepareConfigForFirestore(config);
    const payload = {
      config: sanitizedData,
      updatedAt: new Date().toISOString(),
      version: 'v5.1',
    };

    let lastError: any = null;
    for (const db of dbsToTry) {
      try {
        const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
        await setDoc(docRef, payload, { merge: true });
        console.log('✅ Configuration successfully persisted to Cloud Firestore for all visitors!');
        return {
          success: true,
          message: 'Saved to Cloud Firestore! All visitors on www.bunnypatel.com will see this live.',
        };
      } catch (err) {
        lastError = err;
        console.warn('Attempt to save to DB failed, trying fallback if available...', err);
      }
    }

    const errStr = lastError ? (lastError.message || String(lastError)) : 'Unknown error';
    return { success: false, message: `Cloud save error: ${errStr}` };
  } catch (err: any) {
    console.warn('⚠️ Cloud Firestore save error:', err);
    return { success: false, message: err?.message || 'Failed to save to cloud' };
  }
}

/**
 * Fetches the global configuration from Google Cloud Firestore.
 * Loads seamlessly on all visitors' devices and browsers.
 */
export async function loadConfigFromFirestore(): Promise<BirthdayConfig | null> {
  const { named, defaultDb } = getFirebaseDatabases();
  const dbsToTry = [named, defaultDb].filter(Boolean) as Firestore[];

  for (const db of dbsToTry) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.config && data.config.recipientName) {
          console.log('🌐 Loaded global live config from Cloud Firestore!');
          return data.config as BirthdayConfig;
        }
      }
    } catch (err) {
      console.warn('DB load attempt failed, trying fallback...', err);
    }
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
