'use client';
import { useEffect, useState } from 'react';

export default function CountUp({ to, delay = 0, suffix = '' }: { to: number; delay?: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay;
    const dur = 1000;
    const tick = (n: number) => {
      const p = Math.min(1, Math.max(0, (n - start) / dur));
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, delay]);
  return (
    <>
      {v}
      {suffix}
    </>
  );
}
