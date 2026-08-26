import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';

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

function getFirebaseStorageInstance() {
  if (typeof window === 'undefined') return null;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getStorage(app);
  } catch (err) {
    console.warn('Firebase Storage initialization notice:', err);
    return null;
  }
}

/**
 * Uploads media (audio, video, photo) to Google Cloud Firebase Storage
 * so that it is instantly accessible via high-speed global CDN on ALL mobile phones,
 * computers, and browsers worldwide (including www.bunnypatel.com).
 */
export async function uploadMediaToCloudStorage(
  source: File | Blob | string,
  fileName: string,
  mimeType?: string
): Promise<{ url: string; provider: 'cloud-storage' | 'server' | 'local' }> {
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const cloudPath = `uploads/${timestamp}_${cleanName}`;

  // 1. Try Firebase Cloud Storage (Primary Worldwide CDN)
  const storage = getFirebaseStorageInstance();
  if (storage) {
    try {
      const storageRef = ref(storage, cloudPath);
      if (typeof source === 'string') {
        if (source.startsWith('data:')) {
          await uploadString(storageRef, source, 'data_url');
          const downloadUrl = await getDownloadURL(storageRef);
          console.log(`✅ Uploaded to Google Cloud Firebase Storage: ${downloadUrl}`);
          return { url: downloadUrl, provider: 'cloud-storage' };
        }
      } else {
        await uploadBytes(storageRef, source, {
          contentType: mimeType || source.type || 'application/octet-stream',
        });
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`✅ Uploaded to Google Cloud Firebase Storage: ${downloadUrl}`);
        return { url: downloadUrl, provider: 'cloud-storage' };
      }
    } catch (storageErr) {
      console.warn('Firebase Storage direct upload notice, trying server fallback:', storageErr);
    }
  }

  // 2. Try Express Backend /api/upload-media fallback
  try {
    let base64Payload = '';
    if (typeof source === 'string' && source.startsWith('data:')) {
      base64Payload = source;
    } else if (source instanceof Blob) {
      base64Payload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(source);
      });
    }

    if (base64Payload) {
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          type: mimeType || (source instanceof Blob ? source.type : 'application/octet-stream'),
          data: base64Payload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          console.log(`✅ Uploaded to central media server: ${data.url}`);
          return { url: data.url, provider: 'server' };
        }
      }
    }
  } catch (serverErr) {
    console.warn('Server upload fallback notice:', serverErr);
  }

  // 3. Fallback to local data URL if both cloud services failed
  if (typeof source === 'string') {
    return { url: source, provider: 'local' };
  } else {
    const localUrl = URL.createObjectURL(source);
    return { url: localUrl, provider: 'local' };
  }
}
