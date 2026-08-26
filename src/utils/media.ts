/**
 * Media utilities for extracting YouTube IDs, validating audio/video URLs,
 * and handling file conversions.
 */

const blobUrlCache = new Map<string, string>();

/**
 * Convert a base64 data: URI to a native streamable Blob URL (blob:...)
 * This allows HTML5 <video> and <audio> elements to stream seekable media smoothly
 * without 4-second browser base64 stalls.
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return '';
  }

  // If already an http/https or /api/ relative URL, return directly
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/api/')) {
    return dataUrl;
  }

  // If already a live Blob URL
  if (dataUrl.startsWith('blob:')) {
    return dataUrl;
  }

  // If not a data: URL
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  // Check memory cache first
  if (blobUrlCache.has(dataUrl)) {
    return blobUrlCache.get(dataUrl)!;
  }

  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return dataUrl;

    const meta = dataUrl.substring(0, commaIdx);
    const rawData = dataUrl.substring(commaIdx + 1);

    const mimeMatch = meta.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : (dataUrl.includes('video') ? 'video/mp4' : 'audio/mpeg');

    // Safe chunked conversion (avoids maximum call stack size / string length limits on 10MB+ files)
    const cleanBase64 = rawData.replace(/[\s\r\n]+/g, '');
    const byteCharacters = atob(cleanBase64);
    const byteArrays: Uint8Array[] = [];
    const sliceSize = 512 * 1024; // 512KB slices

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Uint8Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(byteNumbers);
    }

    const blob = new Blob(byteArrays, { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(dataUrl, blobUrl);
    return blobUrl;
  } catch (err) {
    console.warn('Sync atob dataUrlToBlobUrl notice, returning original dataUrl:', err);
    return dataUrl;
  }
}

/**
 * Asynchronously ensure any media URL (especially large video files) is converted
 * to a hardware-accelerated streamable Blob URL.
 */
export async function getStreamableMediaUrlAsync(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/')) {
    return url;
  }
  if (url.startsWith('blob:')) {
    return url;
  }
  if (blobUrlCache.has(url)) {
    return blobUrlCache.get(url)!;
  }
  if (!url.startsWith('data:')) return url;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(url, blobUrl);
    return blobUrl;
  } catch {
    return dataUrlToBlobUrl(url);
  }
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already just an ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex matches:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(urlOrId: string, autoPlay = true, loop = true): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    loop: loop ? '1' : '0',
    playlist: id,
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/**
 * Detect if a URL is from Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

/**
 * Extract the unique file ID from any Google Drive link
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Matches /file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Matches ?id=FILE_ID or &id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Matches /d/FILE_ID/
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  return null;
}

/**
 * Converts any Google Drive link to a 100% stall-free preview iframe embed URL.
 * This plays videos of any length without byte-range stalls!
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  const id = extractGoogleDriveId(url);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}
