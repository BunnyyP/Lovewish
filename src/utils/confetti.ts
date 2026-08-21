import confetti from 'canvas-confetti';

export function fireHeartConfetti() {
  // Fire romantic hearts and rose petal colors
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 30,
    startVelocity: 55,
    colors: ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'],
    shapes: ['circle'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#ffe4e6', '#f43f5e', '#fbbf24', '#fbcfe8'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.2,
    colors: ['#f43f5e', '#ec4899', '#d946ef', '#f59e0b'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#fb7185', '#f43f5e', '#fff1f2'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#e11d48', '#fda4af', '#fef08a'],
  });
}

export function fireFireworks() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#38bdf8'],
    });
  }, 250);
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
