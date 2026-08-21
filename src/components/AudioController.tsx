import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Sparkles, Youtube, Disc } from 'lucide-react';
import { sound } from '../utils/audio';
import { BirthdayConfig } from '../types';
import { extractYouTubeId } from '../utils/media';

interface AudioControllerProps {
  config?: BirthdayConfig;
}

export function AudioController({ config }: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);
  const youtubePlayerRef = useRef<HTMLIFrameElement | null>(null);

  // Determine current music mode
  const musicType = config?.musicType || 'synth';
  const isYouTube = musicType === 'youtube' && Boolean(config?.musicYoutubeUrl);
  const youtubeId = isYouTube ? extractYouTubeId(config?.musicYoutubeUrl || '') : null;
  const isCustomAudio = (musicType === 'upload' || musicType === 'url') && Boolean(config?.musicAudioUrl);

  // Sync custom audio track source with sound engine
  useEffect(() => {
    if (isCustomAudio && config?.musicAudioUrl) {
      sound.setCustomAudio(config.musicAudioUrl);
    } else {
      sound.setCustomAudio(null);
    }
  }, [isCustomAudio, config?.musicAudioUrl]);

  // Subscribe to sound engine state
  useEffect(() => {
    setIsPlaying(sound.getIsPlaying());
    const unsub = sound.addListener((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const toggleMusic = () => {
    if (isYouTube && youtubeId) {
      const next = !isPlaying;
      setIsPlaying(next);
      // Send postMessage to YouTube iframe to play/pause
      if (youtubePlayerRef.current?.contentWindow) {
        youtubePlayerRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: next ? 'playVideo' : 'pauseVideo',
            args: [],
          }),
          '*'
        );
      }
    } else {
      const newState = sound.toggleBackgroundMusic();
      setIsPlaying(newState);
    }
  };

  const getMusicLabel = () => {
    if (isYouTube) {
      return isPlaying ? 'Playing YouTube Song' : 'Play YouTube Song';
    }
    if (isCustomAudio) {
      return config?.musicAudioName
        ? isPlaying
          ? `Playing: ${config.musicAudioName}`
          : 'Play Custom Song'
        : isPlaying
        ? 'Custom Song Playing'
        : 'Play Custom Song';
    }
    return isPlaying ? 'Birthday Melody Playing' : 'Play Birthday Song';
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {/* Hidden YouTube Audio/Video Stream if YouTube selected */}
      {isYouTube && youtubeId && (
        <div className="sr-only pointer-events-none">
          <iframe
            ref={youtubePlayerRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&loop=1&playlist=${youtubeId}&controls=0`}
            title="Background Music Player"
            allow="autoplay"
            onLoad={() => setYoutubeLoaded(true)}
            className="w-1 h-1"
          />
        </div>
      )}

      {/* Main Music Control Button */}
      <button
        id="bg-music-toggle-btn"
        onClick={toggleMusic}
        title={isPlaying ? 'Pause music' : 'Play music'}
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg border transition-all duration-300 cursor-pointer ${
          isPlaying
            ? 'bg-rose-900/85 text-rose-100 border-rose-400/40 shadow-rose-500/20'
            : 'bg-stone-900/85 text-stone-300 border-stone-700/50 hover:bg-stone-800'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-rose-300 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium max-w-[200px] truncate">
          {isYouTube ? (
            <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : isCustomAudio ? (
            <Disc className={`w-3.5 h-3.5 text-rose-400 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
          ) : (
            <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="hidden sm:inline truncate">{getMusicLabel()}</span>
          <span className="sm:hidden">{isPlaying ? 'Music On' : 'Music Off'}</span>
        </div>

        {/* Animated Sound Waves */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3.5 ml-1 shrink-0">
            <span className="w-0.5 bg-rose-300 rounded-full animate-[flameFlicker_0.8s_infinite]" style={{ height: '70%' }} />
            <span className="w-0.5 bg-rose-400 rounded-full animate-[flameFlicker_1.1s_infinite_0.2s]" style={{ height: '100%' }} />
            <span className="w-0.5 bg-rose-300 rounded-full animate-[flameFlicker_0.9s_infinite_0.4s]" style={{ height: '50%' }} />
          </div>
        )}
      </button>

      {/* Quick Sparkle Button */}
      <button
        id="sparkle-sound-effect-btn"
        onClick={() => sound.playSparkleChime()}
        title="Play Sparkle Chime"
        className="p-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}
