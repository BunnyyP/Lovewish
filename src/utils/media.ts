/**
 * Media utilities for extracting YouTube IDs, validating audio/video URLs,
 * and handling file conversions.
 */

/**
 * Convert a base64 data: URI to a native streamable Blob URL (blob:...)
 * This is CRITICAL for HTML5 <video> and <audio> elements in browsers because data: URIs
 * do not support HTTP Byte-Range requests and will freeze/stall after ~4 seconds.
 * Blob URLs support full seekable streaming and continuous playback for full duration!
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';
    const binary = atob(parts[1]);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([buffer], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to convert dataUrl to Blob URL, returning original:', err);
    return dataUrl;
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
