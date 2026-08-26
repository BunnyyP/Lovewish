export interface PolaroidPhoto {
  id: string;
  url: string;
  caption: string;
  date?: string;
  location?: string;
  noteOnBack?: string;
}

export interface LoveReason {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
  redeemed: boolean;
  redeemedDate?: string;
  code: string;
}

export type ThemeType =
  | 'rose'
  | 'couple-love'
  | 'celestial-stardust'
  | 'surprise'
  | 'midnight'
  | 'sensual-passion'
  | 'sunset'
  | 'crimson'
  | 'emerald'
  | 'sakura'
  | 'lavender'
  | 'candyland'
  | 'vintage'
  | 'peach';


export interface BirthdayConfig {
  siteLockEnabled?: boolean;
  siteLockPassword?: string;
  recipientName: string;
  recipientNickname: string;
  senderName: string;
  birthdayDate: string; // YYYY-MM-DD
  relationshipStartDate?: string; // YYYY-MM-DD
  customizationPassword?: string;
  theme: ThemeType;
  viewMode?: 'storybook' | 'scroll'; // Storybook Paginated Journey vs Single Page Scroll
  loveLetterTitle: string;
  loveLetterBody: string;
  secretWishPrompt: string;
  finaleMessageTitle: string;
  finaleMessageBody: string;
  finalePromise: string;
  polaroids: PolaroidPhoto[];
  reasons: LoveReason[];
  coupons: LoveCoupon[];
  
  // Background Music Configuration (Main Website)
  bgMusicEnabled: boolean;
  bgMusicAutoPlay?: boolean; // Automatically play after envelope / intro
  musicType?: 'synth' | 'youtube' | 'upload' | 'url' | 'none';
  musicYoutubeUrl?: string;
  musicAudioUrl?: string; // Base64 audio data or direct link
  musicAudioName?: string;
  bgMusicStartTime?: number; // Start offset in seconds (e.g. start at 15s)
  bgMusicEndTime?: number; // Optional stop offset in seconds (0 = full song)
  bgMusicDuration?: number; // Duration limit in seconds (0 = unlimited / full song)
  bgMusicLoop?: boolean; // Loop background song

  // Intro Music Configuration (Envelope Opening)
  introMusicEnabled?: boolean;
  introMusicType?: 'happy_birthday_chime' | 'upload' | 'youtube' | 'url' | 'none';
  introMusicStartTime?: number; // Start from X seconds (default 0)
  introMusicEndTime?: number; // Cutoff/Auto-mute at Y seconds (default 4)
  introMusicDuration?: number; // Calculated/explicit duration in seconds (e.g. 4s)
  introMusicAutoPlayDelay?: number; // Delay in seconds before playing intro (default 0)
  introMusicAutoMute?: boolean; // Auto mute after end time
  introMusicAudioUrl?: string; // Base64 audio data or URL for intro
  introMusicAudioName?: string;
  introMusicYoutubeUrl?: string; // YouTube audio for intro

  // Candle Celebration Video
  celebrationVideoType?: 'default' | 'upload' | 'youtube' | 'drive' | 'url';
  celebrationVideoUrl?: string; // Base64 video data, Google Drive URL, YouTube URL, or direct MP4 URL
  celebrationVideoName?: string;
  celebrationVideoAutoplay?: boolean;
  celebrationVideoDuration?: number; // Auto close play time in seconds (default: 15s)

  // Surprise Gift Box Media (Photo or Video on Opening Gift Box)
  surpriseBoxMediaType?: 'none' | 'image' | 'video' | 'youtube' | 'drive';
  surpriseBoxMediaUrl?: string; // Image base64 / Image URL / Video base64 / Video URL / Google Drive URL
  surpriseBoxMediaName?: string;
  surpriseBoxMediaCaption?: string;
  surpriseBoxYoutubeUrl?: string;
  surpriseBoxAutoplayVideo?: boolean;

  // User Sealed Wish & Activity Tracking
  sealedWish?: string;
  sealedWishDate?: string;
  sealedWishesHistory?: Array<{ id: string; wish: string; date: string }>;
}
