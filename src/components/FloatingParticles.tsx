import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  type: 'heart' | 'sparkle' | 'petal' | 'star';
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const isMobileOrLowEnd = typeof window !== 'undefined' && (window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
    const particleCount = isMobileOrLowEnd ? 16 : 26;
    const items: Particle[] = [];
    const types: ('heart' | 'sparkle' | 'petal' | 'star')[] = ['heart', 'sparkle', 'petal', 'star'];
    for (let i = 0; i < particleCount; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 10,
        duration: Math.random() * 12 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '110vh', x: `${p.x}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            x: `${p.x + (Math.sin(p.id) * 6)}vw`,
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [0, p.id % 2 === 0 ? 180 : -180],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{ width: p.size, height: p.size }}
          className="absolute will-change-transform"
        >
          {p.type === 'heart' && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-rose-400/50 w-full h-full filter drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {p.type === 'petal' && (
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-300/40 to-rose-400/40 rounded-tr-[80%] transform rotate-45 filter blur-[0.5px]" />
          )}
          {p.type === 'sparkle' && (
            <div className="w-full h-full flex items-center justify-center text-amber-300/60 text-xs">
              ✨
            </div>
          )}
          {p.type === 'star' && (
            <div className="w-2 h-2 rounded-full bg-amber-200/50 shadow-[0_0_10px_#fde047]" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
