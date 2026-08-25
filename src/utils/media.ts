/**
 * Media utilities for extracting YouTube IDs, validating audio/video URLs,
 * and handling file conversions.
 */

const blobUrlCache = new Map<string, string>();

/**
 * Convert a base64 data: URI to a native streamable Blob URL (blob:...)
 * This is CRITICAL for HTML5 <video> and <audio> elements in browsers because data: URIs
 * do not support HTTP Byte-Range requests and will freeze/stall after ~4 seconds.
 * Blob URLs support full seekable streaming and continuous playback for full duration!
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return '';
  }

  // If already a streamable blob URL or external http/https URL, return directly
  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  // Check cache first for instant retrieval
  if (blobUrlCache.has(dataUrl)) {
    return blobUrlCache.get(dataUrl)!;
  }

  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return dataUrl;

    const meta = dataUrl.substring(0, commaIdx);
    const rawData = dataUrl.substring(commaIdx + 1);

    const mimeMatch = meta.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';

    // Clean whitespace and normalize base64
    const cleanBase64 = rawData.replace(/[\s\r\n]+/g, '');
    const binary = atob(cleanBase64);
    const len = binary.length;
    const buffer = new Uint8Array(len);

    // Fast block copy
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([buffer], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(dataUrl, blobUrl);
    return blobUrl;
  } catch (err) {
    console.warn('Sync dataUrlToBlobUrl error, attempting fetch fallback:', err);
    // Fallback: asynchronously convert via browser fetch API and cache it
    try {
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          blobUrlCache.set(dataUrl, blobUrl);
        })
        .catch(() => {});
    } catch {}
    return dataUrl;
  }
}

/**
 * Asynchronously ensure any media URL (especially large base64 video) is converted
 * to a full hardware-accelerated streamable Blob URL.
 */
export async function getStreamableMediaUrlAsync(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (!url.startsWith('data:')) return url;

  if (blobUrlCache.has(url)) {
    return blobUrlCache.get(url)!;
  }

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
