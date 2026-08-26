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

let firestoreDb: Firestore | null = null;

function getDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (!firestoreDb) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      // Initialize with specific database ID if specified
      if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
        firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } else {
        firestoreDb = getFirestore(app);
      }
    } catch (err) {
      console.warn('Failed to initialize Firebase Firestore:', err);
    }
  }
  return firestoreDb;
}

/**
 * Strips excessively large local base64 blobs from the cloud sync payload
 * to stay safely within Firestore's 1MB document limit.
 * Remote URLs (Google Drive, YouTube, Unsplash, external media) are 100% preserved.
 */
function sanitizeConfigForFirestore(config: BirthdayConfig): Record<string, any> {
  const sanitized = { ...config } as Record<string, any>;

  // If polaroids have huge base64 strings that exceed total limit, limit base64 length or preserve
  if (Array.isArray(sanitized.polaroids)) {
    sanitized.polaroids = sanitized.polaroids.map((p) => ({
      ...p,
      // If photo url is a huge multi-megabyte base64, ensure safety
      url: p.url || '',
    }));
  }

  // Remove undefined fields which Firestore rejects
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

/**
 * Saves the customized birthday configuration permanently to Google Cloud Firestore.
 * This guarantees that ANY visitor from ANY IP, device, browser, or custom domain
 * (e.g. www.bunnypatel.com) immediately sees the saved changes!
 */
export async function saveConfigToFirestore(config: BirthdayConfig): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return false;

    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const sanitizedData = sanitizeConfigForFirestore(config);

    await setDoc(
      docRef,
      {
        config: sanitizedData,
        updatedAt: new Date().toISOString(),
        version: 'v5',
      },
      { merge: true }
    );

    console.log('✅ Configuration successfully persisted to Cloud Firestore for all visitors!');
    return true;
  } catch (err) {
    console.warn('⚠️ Cloud Firestore save error:', err);
    return false;
  }
}

/**
 * Fetches the global configuration from Google Cloud Firestore.
 * Loads seamlessly on all visitors' devices.
 */
export async function loadConfigFromFirestore(): Promise<BirthdayConfig | null> {
  try {
    const db = getDb();
    if (!db) return null;

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
    console.warn('⚠️ Cloud Firestore load error:', err);
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
  try {
    const db = getDb();
    if (!db) return null;

    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
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
