import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsPlaying(sound.getIsPlaying());
  }, []);

  const toggleMusic = () => {
    const newState = sound.toggleBackgroundMusic();
    setIsPlaying(newState);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button
        id="bg-music-toggle-btn"
        onClick={toggleMusic}
        title={isPlaying ? 'Pause romantic melody' : 'Play romantic melody'}
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg border transition-all duration-300 cursor-pointer ${
          isPlaying
            ? 'bg-rose-900/80 text-rose-100 border-rose-400/40 shadow-rose-500/20'
            : 'bg-stone-900/80 text-stone-300 border-stone-700/50 hover:bg-stone-800'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-rose-300 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Music className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">
            {isPlaying ? 'Birthday Melody Playing' : 'Play Birthday Song'}
          </span>
          <span className="sm:hidden">{isPlaying ? 'Music On' : 'Music Off'}</span>
        </div>

        {/* Animated Sound Waves */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3.5 ml-1">
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
