import type { CSSProperties } from 'react';

const GRADS = [
  ['#ff3d81', '#ff7a45'],
  ['#8b5cff', '#3de0ff'],
  ['#ffc233', '#ff3d81'],
  ['#22d3a5', '#3b82f6'],
  ['#f472b6', '#a855f7'],
  ['#fb923c', '#f43f5e'],
];

export default function Avatar({ name, idx, size = 48 }: { name: string; idx: number; size?: number }) {
  const [a, b] = GRADS[idx % GRADS.length];
  const style = { width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: size * 0.44 } as CSSProperties;
  return (
    <span className="avatar" style={style} aria-hidden="true">
      {(name.trim()[0] || '?').toUpperCase()}
    </span>
  );
}
