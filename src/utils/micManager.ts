/**
 * Real-time Microphone Breath & Blow Detection Engine.
 * Optimized for detecting turbulent airflow, wind, and breath puffs (phoonk)
 * hitting the microphone diaphragm to extinguish virtual birthday candles in real-time.
 */

export type MicPermissionStatus = 'prompt' | 'granted' | 'denied' | 'listening' | 'error' | 'unavailable';

type BlowListener = (level: number, isStrongBlow: boolean) => void;
type StatusListener = (status: MicPermissionStatus) => void;

class MicBlowManager {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private status: MicPermissionStatus = 'prompt';
  private currentBlowLevel = 0; // 0 to 100
  private blowListeners: Set<BlowListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private rafId: number | null = null;
  private isProcessing = false;
  private lastBlowTime = 0;
  private sensitivityThreshold = 45; // 0-100 threshold for strong blow

  constructor() {
    this.checkInitialPermission();
  }

  private async checkInitialPermission() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.setStatus('unavailable');
      return;
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'granted') {
          this.setStatus('granted');
          // Auto-start listening if permission was already granted in this session
          this.startListening();
        } else if (permissionStatus.state === 'denied') {
          this.setStatus('denied');
        } else {
          this.setStatus('prompt');
        }

        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            this.setStatus('granted');
            this.startListening();
          } else if (permissionStatus.state === 'denied') {
            this.setStatus('denied');
            this.stopListening();
          }
        };
      }
    } catch {
      // Some browsers don't support permissions.query for microphone
      this.setStatus('prompt');
    }
  }

  public getStatus(): MicPermissionStatus {
    return this.status;
  }

  public getCurrentBlowLevel(): number {
    return this.currentBlowLevel;
  }

  public onBlow(listener: BlowListener): () => void {
    this.blowListeners.add(listener);
    return () => this.blowListeners.delete(listener);
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(newStatus: MicPermissionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => {
      try {
        fn(newStatus);
      } catch (e) {
        console.warn('Status listener error:', e);
      }
    });
  }

  /**
   * Request microphone permission from user and immediately start blow detection analysis.
   * Disables echo cancellation and noise suppression so raw breath/blow turbulences
   * are captured accurately without being filtered out by browser algorithms.
   */
  public async requestMicPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.setStatus('unavailable');
      return false;
    }

    try {
      // Request raw audio without noise filtering for maximum blow sensitivity
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.stream = stream;
      this.setStatus('granted');
      this.initAudioPipeline(stream);
      return true;
    } catch (err: unknown) {
      console.warn('Microphone permission not granted:', err);
      const isDenied = err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      this.setStatus(isDenied ? 'denied' : 'error');
      return false;
    }
  }

  public async startListening(): Promise<boolean> {
    if (this.isProcessing && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return true;
    }

    if (!this.stream) {
      return this.requestMicPermission();
    }

    this.initAudioPipeline(this.stream);
    return true;
  }

  private initAudioPipeline(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        this.setStatus('unavailable');
        return;
      }

      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close().catch(() => {});
      }

      const ctx = new AudioCtx();
      this.audioCtx = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.25; // Fast response to sharp breath puffs
      this.analyser = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      this.setStatus('listening');
      this.isProcessing = true;
      this.startAnalysisLoop();
    } catch (err) {
      console.warn('Error creating audio pipeline for blow detection:', err);
      this.setStatus('error');
    }
  }

  private startAnalysisLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    const analyser = this.analyser;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    const loop = () => {
      if (!this.isProcessing || !this.analyser) return;

      this.analyser.getByteFrequencyData(freqData);
      this.analyser.getByteTimeDomainData(timeData);

      // 1. Calculate Low-Frequency Wind / Turbulence Energy (0Hz - 350Hz: first 8 bins)
      let lowFreqSum = 0;
      const lowBinCount = Math.min(8, bufferLength);
      for (let i = 0; i < lowBinCount; i++) {
        lowFreqSum += freqData[i];
      }
      const lowFreqAvg = lowFreqSum / lowBinCount;

      // 2. Calculate Total Volume / Overall Energy
      let totalFreqSum = 0;
      for (let i = 0; i < bufferLength; i++) {
        totalFreqSum += freqData[i];
      }
      const totalAvg = totalFreqSum / bufferLength;

      // 3. Calculate Time-Domain RMS / Peak Disruption
      let timeDiffSum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const diff = Math.abs(timeData[i] - 128);
        timeDiffSum += diff;
      }
      const timeRms = (timeDiffSum / bufferLength) * 2;

      // Weighted blow score: Blowing creates massive low-frequency air friction
      const combinedScore = (lowFreqAvg * 0.55) + (totalAvg * 0.25) + (timeRms * 0.2);

      // Normalize to 0-100 scale
      const normalizedBlow = Math.min(100, Math.max(0, Math.round((combinedScore / 160) * 100)));
      this.currentBlowLevel = normalizedBlow;

      const now = Date.now();
      const isStrongBlow = normalizedBlow >= this.sensitivityThreshold;

      // Notify listeners
      if (normalizedBlow > 8 || isStrongBlow) {
        if (isStrongBlow && now - this.lastBlowTime > 400) {
          this.lastBlowTime = now;
          this.blowListeners.forEach((fn) => {
            try {
              fn(normalizedBlow, true);
            } catch (e) {
              console.warn('Blow listener error:', e);
            }
          });
        } else {
          this.blowListeners.forEach((fn) => {
            try {
              fn(normalizedBlow, false);
            } catch (e) {
              console.warn('Blow level listener error:', e);
            }
          });
        }
      } else {
        // Zero or ambient level
        this.blowListeners.forEach((fn) => {
          try {
            fn(normalizedBlow, false);
          } catch (e) {}
        });
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  public stopListening() {
    this.isProcessing = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.currentBlowLevel = 0;
    this.setStatus('prompt');
  }

  public setSensitivity(threshold: number) {
    this.sensitivityThreshold = Math.max(20, Math.min(90, threshold));
  }

  public getSensitivity(): number {
    return this.sensitivityThreshold;
  }
}

export const micBlowManager = new MicBlowManager();
