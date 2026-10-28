'use client';
import { useEffect, useRef, useState } from 'react';
import { drawCard } from '@/lib/card/draw';
import { ensureFonts } from '@/lib/card/export';
import { CLIP_SECONDS, FORMATS, type AnimId, type CardData, type DesignId, type FormatId, type Fonts } from '@/lib/card/types';

interface Props {
  data: CardData;
  design: DesignId;
  anim: AnimId;
  format: FormatId;
  /** when provided, the preview cycles through these designs, one per loop */
  designs?: DesignId[];
  scale?: number;
  className?: string;
}

export default function LiveCard({ data, design, anim, format, designs, scale = 0.6, className = '' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fonts, setFonts] = useState<Fonts | null>(null);
  const latest = useRef({ data, design, anim, designs });
  const startRef = useRef(0);
  latest.current = { data, design, anim, designs };

  useEffect(() => {
    let alive = true;
    ensureFonts().then((f) => alive && setFonts(f));
    return () => {
      alive = false;
    };
  }, []);

  // restart the clip whenever the look changes so the person sees the new animation from the start
  useEffect(() => {
    startRef.current = performance.now();
  }, [design, anim, data.kind, format]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !fonts) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = FORMATS[format];
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    let raf = 0;
    let last = 0;
    let visible = true;
    startRef.current = performance.now();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 32) return;
      last = now;
      const el = (now - startRef.current) / 1000;
      const cycle = Math.floor(el / CLIP_SECONDS);
      const t = (el % CLIP_SECONDS) / CLIP_SECONDS;
      const cur = latest.current;
      const d = cur.designs && cur.designs.length ? cur.designs[cycle % cur.designs.length] : cur.design;
      drawCard(ctx, cur.data, { design: d, anim: cur.anim, format, t, fonts }, scale);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [fonts, format, scale]);

  const { w, h } = FORMATS[format];
  return (
    <canvas
      ref={ref}
      className={`live-card ${className}`}
      width={Math.round(w * scale)}
      height={Math.round(h * scale)}
      style={{ aspectRatio: `${w} / ${h}` }}
      role="img"
      aria-label={`Animated ${data.kind} card for ${data.subjectName}`}
    />
  );
}
