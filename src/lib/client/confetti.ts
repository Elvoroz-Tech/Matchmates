export async function burst() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const confetti = (await import('canvas-confetti')).default;
  const colors = ['#ff3d81', '#ff7a45', '#ffc233', '#8b5cff', '#3de0ff', '#fff1b8'];
  confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 }, colors, scalar: 1.05 });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors }), 180);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors }), 260);
}
