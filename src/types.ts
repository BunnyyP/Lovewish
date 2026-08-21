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
  | 'surprise'
  | 'midnight'
  | 'sunset'
  | 'crimson'
  | 'emerald'
  | 'sakura'
  | 'lavender'
  | 'candyland'
  | 'vintage'
  | 'peach';


export interface BirthdayConfig {
  recipientName: string;
  recipientNickname: string;
  senderName: string;
  birthdayDate: string; // YYYY-MM-DD
  relationshipStartDate?: string; // YYYY-MM-DD
  customizationPassword?: string;
  theme: ThemeType;
  loveLetterTitle: string;
  loveLetterBody: string;
  secretWishPrompt: string;
  finaleMessageTitle: string;
  finaleMessageBody: string;
  finalePromise: string;
  polaroids: PolaroidPhoto[];
  reasons: LoveReason[];
  coupons: LoveCoupon[];
  bgMusicEnabled: boolean;
  musicType?: 'synth' | 'youtube' | 'upload' | 'url';
  musicYoutubeUrl?: string;
  musicAudioUrl?: string; // Base64 audio data or direct link
  musicAudioName?: string;
  celebrationVideoType?: 'default' | 'upload' | 'youtube' | 'url';
  celebrationVideoUrl?: string; // Base64 video data or URL
  celebrationVideoName?: string;
  celebrationVideoAutoplay?: boolean;
}
