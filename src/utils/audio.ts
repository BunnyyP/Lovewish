/**
 * Web Audio API synthesizer for romantic ambient music box melody and sound effects.
 * Works seamlessly in all modern browsers without external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicTimeout: number | null = null;
  private currentNoteIndex = 0;
  private gainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
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

  // Romantic Birthday Melody + Chords (C-Major / F-Major music box progression)
  private readonly melodyNotes = [
    // Happy Birthday romantic music-box arpeggio
    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 293.66, dur: 0.8 }, // D4
    { freq: 261.63, dur: 0.8 }, // C4
    { freq: 349.23, dur: 0.8 }, // F4
    { freq: 329.63, dur: 1.6 }, // E4

    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 293.66, dur: 0.8 }, // D4
    { freq: 261.63, dur: 0.8 }, // C4
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 349.23, dur: 1.6 }, // F4

    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 261.63, dur: 0.4 }, // C4
    { freq: 523.25, dur: 0.8 }, // C5
    { freq: 440.00, dur: 0.8 }, // A4
    { freq: 349.23, dur: 0.8 }, // F4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 293.66, dur: 1.6 }, // D4

    { freq: 466.16, dur: 0.4 }, // Bb4
    { freq: 466.16, dur: 0.4 }, // Bb4
    { freq: 440.00, dur: 0.8 }, // A4
    { freq: 349.23, dur: 0.8 }, // F4
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 349.23, dur: 2.2 }, // F4

    // Romantic Interlude chords (Canon in D style romantic arpeggio)
    { freq: 329.63, dur: 0.6 },
    { freq: 392.00, dur: 0.6 },
    { freq: 523.25, dur: 0.8 },
    { freq: 659.25, dur: 1.4 },
    { freq: 587.33, dur: 0.8 },
    { freq: 440.00, dur: 0.8 },
    { freq: 523.25, dur: 1.6 },
  ];

  public startBackgroundMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentNoteIndex = 0;
    this.scheduleNextNote();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      window.clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
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

  public getIsPlaying(): boolean {
    return this.isMusicPlaying;
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
