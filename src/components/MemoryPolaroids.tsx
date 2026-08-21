import { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RotateCw, MapPin, Calendar, Heart, ZoomIn, X } from 'lucide-react';
import { BirthdayConfig, PolaroidPhoto } from '../types';
import { sound } from '../utils/audio';

interface MemoryPolaroidsProps {
  config: BirthdayConfig;
  onOpenCustomizer: () => void;
}

export function MemoryPolaroids({ config, onOpenCustomizer }: MemoryPolaroidsProps) {
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<PolaroidPhoto | null>(null);

  const toggleFlip = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playCameraClick();
    setFlippedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenPhoto = (photo: PolaroidPhoto) => {
    sound.playCameraClick();
    setSelectedPhoto(photo);
  };

  // Rotations for the realistic messy hung polaroid look
  const rotations = [-3, 2, -2, 3, -1, 2.5];

  return (
    <section id="photo-memories" className="py-16 px-4 max-w-6xl mx-auto text-center relative">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Memory Clothesline</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          Our Favorite Moments Together 📸
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base font-sans-clean mt-2 max-w-xl mx-auto">
          Every picture holds a thousand memories. Click a polaroid to zoom in, or tap the <span className="font-semibold text-rose-600">Flip button</span> to read the secret handwritten note on the back!
        </p>
      </div>

      {/* Decorative Clothesline Wire */}
      <div className="relative mb-6 hidden md:block">
        <div className="h-1 w-full bg-gradient-to-r from-stone-400 via-stone-500 to-stone-400 rounded-full shadow-xs opacity-70" />
      </div>

      {/* Polaroids Grid / Clothesline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 pt-4">
        {config.polaroids.map((photo, index) => {
          const isFlipped = !!flippedIds[photo.id];
          const rotation = rotations[index % rotations.length];

          return (
            <div
              key={photo.id}
              className="relative flex flex-col items-center group perspective-1000"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Wooden Pin at the top */}
              <div className="w-4 h-7 bg-amber-700 rounded-t-xs shadow-md border-t border-amber-500 -mb-3 z-20 relative flex items-center justify-center">
                <div className="w-2 h-1 bg-stone-300 rounded-full" />
              </div>

              {/* Polaroid Container with 3D Flip */}
              <div
                onClick={() => handleOpenPhoto(photo)}
                className="w-full max-w-[280px] h-[360px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                }}
              >
                {/* FRONT OF POLAROID */}
                <div
                  className="absolute inset-0 bg-white dark:bg-stone-800 p-4 pb-6 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-stone-200 dark:border-stone-700 flex flex-col justify-between select-none"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Photo Frame */}
                  <div className="relative w-full h-[220px] bg-stone-100 dark:bg-stone-900 rounded-xs overflow-hidden shadow-inner border border-stone-200/50">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {/* Zoom Icon Badge on Hover */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Handwritten Caption Area */}
                  <div className="pt-3 text-left flex flex-col justify-between flex-1">
                    <p className="font-casual text-lg sm:text-xl text-stone-800 dark:text-stone-100 font-bold leading-tight line-clamp-2">
                      {photo.caption}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                      <div className="flex items-center gap-1 font-mono">
                        {photo.date && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3 text-rose-500" />
                            {photo.date}
                          </span>
                        )}
                      </div>

                      {/* Flip Note Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFlip(photo.id, e)}
                        title="Read note on back"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Flip Note</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK OF POLAROID (Secret Handwritten Note) */}
                <div
                  className="absolute inset-0 bg-[#fffbf2] dark:bg-stone-850 p-5 rounded-lg shadow-xl border border-amber-200/80 dark:border-stone-700 flex flex-col justify-between text-left select-none"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-700 pb-2">
                    <div className="flex items-center gap-1 text-rose-600 text-xs font-bold font-serif-romantic">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>Secret Memory Note</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleFlip(photo.id, e)}
                      className="text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Flip Back</span>
                    </button>
                  </div>

                  {/* Back Note Message */}
                  <div className="my-auto py-2">
                    <p className="font-casual text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed italic">
                      "{photo.noteOnBack || 'Every second with you is a treasure I hold close to my heart.'}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-500">
                    {photo.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {photo.location}
                      </span>
                    )}
                    <span className="font-handwriting text-rose-700 dark:text-rose-400 text-sm">
                      Forever with you ❤️
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Photos Callout */}
      <div className="mt-12">
        <button
          onClick={onOpenCustomizer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-medium shadow-xs transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 text-rose-500" />
          <span>Add More Memories or Change Photos</span>
        </button>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full max-h-[60vh] bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="max-h-[60vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 text-left space-y-3">
                <h3 className="font-serif-romantic text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {selectedPhoto.caption}
                </h3>
                {selectedPhoto.noteOnBack && (
                  <p className="font-casual text-lg text-stone-600 dark:text-stone-300 italic">
                    "{selectedPhoto.noteOnBack}"
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-200 dark:border-stone-800">
                  {selectedPhoto.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      {selectedPhoto.date}
                    </span>
                  )}
                  {selectedPhoto.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {selectedPhoto.location}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
