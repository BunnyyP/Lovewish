/**
 * Web Audio API synthesizer for romantic ambient music box melody and sound effects.
 * Works seamlessly in all modern browsers without external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicTimeout: number | null = null;
  private currentNoteIndex = 0;
  private customAudio: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private musicMode: 'synth' | 'youtube' | 'upload' | 'url' | 'none' = 'synth';
  private listeners: Set<(playing: boolean) => void> = new Set();

  public addListener(cb: (playing: boolean) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getIsPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public getMusicMode(): 'synth' | 'youtube' | 'upload' | 'url' | 'none' {
    return this.musicMode;
  }

  public setMusicMode(mode: 'synth' | 'youtube' | 'upload' | 'url' | 'none') {
    if (this.musicMode === mode) return;
    this.musicMode = mode;
    // If music is already playing, switch smoothly
    if (this.isMusicPlaying) {
      if (mode === 'none') {
        this.stopInternalSynth();
        if (this.customAudio) this.customAudio.pause();
        this.isMusicPlaying = false;
        this.notifyListeners();
      } else if (mode === 'youtube') {
        // Stop synth and audio element so only YouTube plays
        this.stopInternalSynth();
        if (this.customAudio) this.customAudio.pause();
      } else if (mode === 'upload' || mode === 'url') {
        this.stopInternalSynth();
        if (this.customAudio) {
          this.customAudio.currentTime = 0;
          this.customAudio.play().catch(() => {});
        }
      } else {
        if (this.customAudio) this.customAudio.pause();
        this.currentNoteIndex = 0;
        this.scheduleNextNote();
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isMusicPlaying));
  }

  public setCustomAudio(url: string | null) {
    this.customAudioUrl = url;
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.src = '';
      this.customAudio = null;
    }
    if (url) {
      try {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.9;
        audio.addEventListener('ended', () => {
          if (this.isMusicPlaying && this.customAudio) {
            this.customAudio.currentTime = 0;
            this.customAudio.play().catch(() => {});
          }
        });
        this.customAudio = audio;
        // If currently playing in upload/url mode, start immediately
        if (this.isMusicPlaying && (this.musicMode === 'upload' || this.musicMode === 'url')) {
          this.customAudio.play().catch(() => {});
        }
      } catch (e) {
        console.warn('Error setting custom audio element:', e);
      }
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a soft romantic chime note (music box / vibraphone tone)
  public playNote(freq: number, duration = 1.2, volume = 0.15) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine + triangle blend for bell/music box warmth
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Gentle Romantic Music Box Melody (Canon in D / Sweet Romantic Lullaby progression)
  // Completely distinct from the 4-sec Happy Birthday intro
  private readonly melodyNotes = [
    // Phrase 1: Canon in D romantic music box bells
    { freq: 587.33, dur: 0.6 }, // D5
    { freq: 440.00, dur: 0.6 }, // A4
    { freq: 493.88, dur: 0.6 }, // B4
    { freq: 369.99, dur: 0.6 }, // F#4
    { freq: 392.00, dur: 0.6 }, // G4
    { freq: 293.66, dur: 0.6 }, // D4
    { freq: 392.00, dur: 0.6 }, // G4
    { freq: 440.00, dur: 1.2 }, // A4

    // Phrase 2: Gentle arpeggiated romantic sparkle
    { freq: 587.33, dur: 0.45 }, // D5
    { freq: 659.25, dur: 0.45 }, // E5
    { freq: 739.99, dur: 0.8 },  // F#5
    { freq: 659.25, dur: 0.45 }, // E5
    { freq: 587.33, dur: 0.45 }, // D5
    { freq: 493.88, dur: 0.8 },  // B4
    { freq: 440.00, dur: 0.45 }, // A4
    { freq: 392.00, dur: 0.45 }, // G4
    { freq: 440.00, dur: 1.4 },  // A4

    // Phrase 3: Soft romantic lullaby descent
    { freq: 523.25, dur: 0.6 },  // C5
    { freq: 659.25, dur: 0.6 },  // E5
    { freq: 783.99, dur: 0.9 },  // G5
    { freq: 659.25, dur: 0.6 },  // E5
    { freq: 587.33, dur: 0.7 },  // D5
    { freq: 523.25, dur: 1.4 },  // C5
  ];

  private stopInternalSynth() {
    if (this.musicTimeout) {
      window.clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  private bgMusicOptions: { startTime?: number; endTime?: number; loop?: boolean } = {};
  private bgMusicEndTimer: number | null = null;

  public setBgMusicConfig(options: { startTime?: number; endTime?: number; loop?: boolean }) {
    this.bgMusicOptions = { ...options };
  }

  public startBackgroundMusic(options?: { startTime?: number; endTime?: number; loop?: boolean }) {
    this.initCtx();
    this.isMusicPlaying = true;
    this.notifyListeners();

    const opts = { ...this.bgMusicOptions, ...options };
    const startTime = Math.max(0, opts.startTime ?? 0);
    const endTime = Math.max(0, opts.endTime ?? 0);
    const loop = opts.loop !== false;

    if (this.bgMusicEndTimer) {
      clearTimeout(this.bgMusicEndTimer);
      this.bgMusicEndTimer = null;
    }

    if (this.musicMode === 'youtube') {
      this.stopInternalSynth();
      if (this.customAudio) this.customAudio.pause();
      return;
    }

    if ((this.musicMode === 'upload' || this.musicMode === 'url') && this.customAudioUrl) {
      this.stopInternalSynth();
      if (!this.customAudio) {
        this.setCustomAudio(this.customAudioUrl);
      }
      if (this.customAudio) {
        try {
          this.customAudio.currentTime = startTime;
          this.customAudio.loop = loop;
          this.customAudio.play().catch((err) => {
            console.warn('Custom audio play prevented by browser policy:', err);
          });

          if (endTime > startTime) {
            const playDurationMs = (endTime - startTime) * 1000;
            this.bgMusicEndTimer = window.setTimeout(() => {
              if (loop) {
                if (this.customAudio) {
                  this.customAudio.currentTime = startTime;
                }
              } else {
                this.stopBackgroundMusic();
              }
            }, playDurationMs);
          }
        } catch (err) {
          console.warn('Audio timing start error:', err);
        }
      }
    } else {
      if (this.customAudio) this.customAudio.pause();
      this.currentNoteIndex = 0;
      this.scheduleNextNote();
    }
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    this.notifyListeners();
    if (this.bgMusicEndTimer) {
      clearTimeout(this.bgMusicEndTimer);
      this.bgMusicEndTimer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.stopInternalSynth();
  }

  public toggleBackgroundMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  private scheduleNextNote() {
    if (!this.isMusicPlaying) return;
    const note = this.melodyNotes[this.currentNoteIndex];
    this.playNote(note.freq, note.dur * 1.5, 0.08);

    // Occasional low bass support
    if (this.currentNoteIndex % 4 === 0) {
      this.playNote(note.freq / 2, note.dur * 2, 0.05);
    }

    const nextDelay = (note.dur * 1000) * 0.9;
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;

    this.musicTimeout = window.setTimeout(() => {
      this.scheduleNextNote();
    }, nextDelay);
  }

  // --- Sound Effects ---

  // Prime audio on first user touch to satisfy mobile browser autoplay requirements
  public primeAudio() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    // Unmute/unlock HTML5 audio element within user gesture
    if (this.customAudio) {
      try {
        this.customAudio.volume = 0;
        const p = this.customAudio.play();
        if (p !== undefined) {
          p.then(() => {
            if (this.customAudio) {
              this.customAudio.pause();
              this.customAudio.currentTime = 0;
              this.customAudio.volume = 0.9;
            }
          }).catch(() => {});
        }
      } catch {}
    }
    if (this.introCustomAudio) {
      try {
        this.introCustomAudio.volume = 0;
        const p = this.introCustomAudio.play();
        if (p !== undefined) {
          p.then(() => {
            if (this.introCustomAudio) {
              this.introCustomAudio.pause();
              this.introCustomAudio.currentTime = 0;
              this.introCustomAudio.volume = 0.9;
            }
          }).catch(() => {});
        }
      } catch {}
    }
  }

  // --- Intro Music Management (Envelope Opening & Auto-Mute Timer) ---
  private introTimeouts: number[] = [];
  private activeIntroOscillators: OscillatorNode[] = [];
  private introGain: GainNode | null = null;
  private introCustomAudio: HTMLAudioElement | null = null;

  public stopIntroMusic() {
    // Clear all pending intro note timeouts
    this.introTimeouts.forEach((t) => clearTimeout(t));
    this.introTimeouts = [];

    // Stop and pause custom intro audio if playing
    if (this.introCustomAudio) {
      try {
        this.introCustomAudio.pause();
        this.introCustomAudio.currentTime = 0;
      } catch {}
    }

    // Instant hard mute on intro master gain
    if (this.introGain && this.ctx) {
      try {
        this.introGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.introGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.introGain.disconnect();
      } catch {}
      this.introGain = null;
    }

    // Stop and disconnect every active oscillator immediately
    this.activeIntroOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeIntroOscillators = [];
  }

  public stopHappyBirthdayIntro() {
    this.stopIntroMusic();
  }

  public playIntroMusic(
    options: {
      type?: 'happy_birthday_chime' | 'upload' | 'youtube' | 'url' | 'none';
      startTime?: number;
      endTime?: number;
      duration?: number;
      audioUrl?: string;
      autoMute?: boolean;
    } = {},
    onComplete?: () => void
  ) {
    this.stopIntroMusic();
    this.stopBackgroundMusic();
    this.initCtx();

    const type = options.type || 'happy_birthday_chime';
    const startTime = Math.max(0, options.startTime ?? 0);
    const endTime = options.endTime && options.endTime > startTime ? options.endTime : 0;
    
    // Calculate total duration: either (endTime - startTime) or explicit duration
    const calculatedDuration = endTime > startTime ? (endTime - startTime) : (options.duration ?? 4);
    const durationSec = Math.max(1, calculatedDuration);
    const autoMute = options.autoMute !== false;

    if (type === 'none') {
      if (onComplete) onComplete();
      return;
    }

    // Handle Custom Upload / Audio URL for Intro
    if ((type === 'upload' || type === 'url') && options.audioUrl) {
      try {
        if (!this.introCustomAudio || this.introCustomAudio.src !== options.audioUrl) {
          this.introCustomAudio = new Audio(options.audioUrl);
        }
        this.introCustomAudio.currentTime = startTime;
        this.introCustomAudio.volume = 0.9;
        this.introCustomAudio.play().catch((err) => {
          console.warn('Intro custom audio play prevented:', err);
        });

        if (autoMute) {
          const tid = window.setTimeout(() => {
            this.stopIntroMusic();
            if (onComplete) onComplete();
          }, durationSec * 1000);
          this.introTimeouts.push(tid);
        }
        return;
      } catch (err) {
        console.warn('Fallback to chime intro due to audio load error', err);
      }
    }

    // Default: Crystal Chime Happy Birthday Sequence
    if (!this.ctx) {
      if (onComplete) onComplete();
      return;
    }

    const introMasterGain = this.ctx.createGain();
    introMasterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    introMasterGain.connect(this.ctx.destination);
    this.introGain = introMasterGain;

    // Gorgeous crystal chime notes for "Happy Birth-day to you"
    const notes = [
      { f: 392.00, d: 0.30, delay: 0 },     // Hap-
      { f: 392.00, d: 0.30, delay: 350 },   // py
      { f: 440.00, d: 0.60, delay: 700 },   // Birth-
      { f: 392.00, d: 0.60, delay: 1350 },  // day
      { f: 523.25, d: 0.65, delay: 2000 },  // to
      { f: 493.88, d: 1.00, delay: 2700 },  // you~~~
    ];

    notes.forEach((n) => {
      // Only schedule notes that fit within the configured duration
      if (n.delay < durationSec * 1000) {
        const tid = window.setTimeout(() => {
          try {
            if (!this.ctx || !this.introGain) return;
            const now = this.ctx.currentTime;

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(n.f, now);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(n.f * 2, now);

            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + n.d);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(introMasterGain);

            this.activeIntroOscillators.push(osc1, osc2);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + n.d);
            osc2.stop(now + n.d);

            osc1.onended = () => {
              this.activeIntroOscillators = this.activeIntroOscillators.filter((o) => o !== osc1 && o !== osc2);
            };
          } catch {}
        }, n.delay);

        this.introTimeouts.push(tid);
      }
    });

    // Auto-mute timer after the configured duration
    if (autoMute) {
      const finishTid = window.setTimeout(() => {
        this.stopIntroMusic();
        if (onComplete) {
          onComplete();
        }
      }, durationSec * 1000);
      this.introTimeouts.push(finishTid);
    }
  }

  public play4SecHappyBirthdayIntro(onComplete?: () => void) {
    this.playIntroMusic({ type: 'happy_birthday_chime', duration: 4, autoMute: true }, onComplete);
  }

  // 1. Envelope Wax Seal Crack & Open
  public playWaxSealCrack() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft paper rustle + snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);

      // Chime sparkle
      setTimeout(() => this.playSparkleChime(), 120);
    } catch {}
  }

  // 2. Candle Blow Out Sound (Whoosh + Soft extinguish)
  public playBlowCandle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Noise buffer for realistic air puff
      const bufferSize = this.ctx.sampleRate * 0.4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.35);
    } catch {}
  }

  // 3. Magical Sparkle Chime / Gift Open
  public playSparkleChime() {
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playNote(f, 0.8, 0.12);
      }, i * 70);
    });
  }

  // Cute Chipmunk Happy Birthday vocal song player
  private birthdaySongTimeouts: number[] = [];

  public stopHappyBirthdaySong() {
    this.birthdaySongTimeouts.forEach((t) => clearTimeout(t));
    this.birthdaySongTimeouts = [];
  }

  public playHappyBirthdaySong() {
    this.stopHappyBirthdaySong();
    this.initCtx();
    if (!this.ctx) return;

    // High pitched, cheerful singing chipmunk/squirrel tone frequencies & durations
    const notes = [
      // "Happy birth-day to you"
      { f: 587.33, d: 0.28, delay: 0 },
      { f: 587.33, d: 0.28, delay: 300 },
      { f: 659.25, d: 0.55, delay: 600 },
      { f: 587.33, d: 0.55, delay: 1180 },
      { f: 783.99, d: 0.55, delay: 1760 },
      { f: 739.99, d: 1.1, delay: 2340 },

      // "Happy birth-day to you"
      { f: 587.33, d: 0.28, delay: 3500 },
      { f: 587.33, d: 0.28, delay: 3800 },
      { f: 659.25, d: 0.55, delay: 4100 },
      { f: 587.33, d: 0.55, delay: 4680 },
      { f: 880.00, d: 0.55, delay: 5260 },
      { f: 783.99, d: 1.1, delay: 5840 },

      // "Happy birth-day to dear [Name]"
      { f: 587.33, d: 0.28, delay: 7000 },
      { f: 587.33, d: 0.28, delay: 7300 },
      { f: 1174.66, d: 0.55, delay: 7600 },
      { f: 987.77, d: 0.55, delay: 8180 },
      { f: 783.99, d: 0.55, delay: 8760 },
      { f: 739.99, d: 0.55, delay: 9340 },
      { f: 659.25, d: 0.9, delay: 9920 },

      // "Happy birth-day to youuuuu!"
      { f: 1046.50, d: 0.32, delay: 10900 },
      { f: 1046.50, d: 0.32, delay: 11250 },
      { f: 987.77, d: 0.55, delay: 11600 },
      { f: 783.99, d: 0.55, delay: 12180 },
      { f: 880.00, d: 0.65, delay: 12760 },
      { f: 783.99, d: 1.4, delay: 13450 },
    ];

    notes.forEach((n) => {
      const tid = window.setTimeout(() => {
        try {
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          // Cute chipmunk vibrato
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + n.d);
        } catch {}
      }, n.delay);

      this.birthdaySongTimeouts.push(tid);
    });
  }

  // 4. Confetti Celebration Pop
  public playCelebrationPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      setTimeout(() => this.playSparkleChime(), 100);
    } catch {}
  }

  // 5. Polaroid Click / Flip Sound
  public playCameraClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // 6. Stamp Redeemed Sound
  public playStampSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // 7. Soft pop / click sound
  public playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }
}

export const sound = new SoundEngine();
