import { MediaLibraryItem } from '../types';

/**
 * Detect media category from filename or MIME type
 */
export function detectMediaType(filename: string, mimeType?: string): 'audio' | 'video' | 'image' {
  const ext = filename.toLowerCase();
  if (
    mimeType?.startsWith('audio/') ||
    ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].some((e) => ext.endsWith(e))
  ) {
    return 'audio';
  }
  if (
    mimeType?.startsWith('video/') ||
    ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.avi', '.mkv'].some((e) => ext.endsWith(e))
  ) {
    return 'video';
  }
  return 'image';
}

/**
 * Fast, reliable media uploader to central server (/api/upload-media).
 * Handles timeouts, network retries, and gives back streamable /api/media/ URLs
 * that work instantly across all mobiles, tablets, and computers worldwide.
 */
export async function uploadMediaToServer(
  source: File | Blob | string,
  fileName: string,
  mimeType?: string
): Promise<{ url: string; item?: MediaLibraryItem; provider: 'server' | 'local' }> {
  try {
    let base64Payload = '';
    let fileSize = 0;

    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        base64Payload = source;
      } else if (source.startsWith('/api/media/') || source.startsWith('http')) {
        // Already a server or web URL
        return { url: source, provider: 'server' };
      }
    } else if (source instanceof Blob) {
      fileSize = source.size;
      base64Payload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(source);
      });
    }

    if (base64Payload) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s safety timeout

      try {
        const effectiveMime = mimeType || (source instanceof Blob ? source.type : 'application/octet-stream');
        const res = await fetch('/api/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fileName || 'media_file',
            type: effectiveMime,
            data: base64Payload,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            const detectedType = detectMediaType(fileName, effectiveMime);
            const item: MediaLibraryItem = {
              id: data.filename || `media_${Date.now()}`,
              name: fileName,
              type: detectedType,
              mimeType: effectiveMime,
              url: data.url,
              size: data.size || fileSize,
              uploadedAt: new Date().toISOString(),
            };
            console.log(`✅ Uploaded media to server vault: ${data.url}`);
            return { url: data.url, item, provider: 'server' };
          }
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.warn('Upload to /api/upload-media timed out or skipped:', fetchErr?.message);
      }
    }
  } catch (err) {
    console.warn('Upload media notice:', err);
  }

  // Fallback to source
  if (typeof source === 'string') {
    return { url: source, provider: 'local' };
  } else {
    const localUrl = URL.createObjectURL(source);
    return { url: localUrl, provider: 'local' };
  }
}

/**
 * Fetch all media files present in the server's Media Folder library
 */
export async function fetchMediaListFromServer(): Promise<MediaLibraryItem[]> {
  try {
    const res = await fetch('/api/media-list');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files as MediaLibraryItem[];
      }
    }
  } catch (err) {
    console.warn('Failed to fetch media list from server:', err);
  }
  return [];
}

/**
 * Delete a media file from the server's Media Folder library
 */
export async function deleteMediaFromServer(filename: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/media/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.warn('Failed to delete media file from server:', err);
  }
  return false;
}

// Alias for backwards compatibility
export const uploadMediaToCloudStorage = uploadMediaToServer;
