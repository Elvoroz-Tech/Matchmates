import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { drawCard } from './draw';
import { CLIP_SECONDS, FORMATS, type AnimId, type CardData, type DesignId, type FormatId, type Fonts } from './types';

export interface Look {
  design: DesignId;
  anim: AnimId;
  format: FormatId;
}

export function getFonts(): Fonts {
  const cs = getComputedStyle(document.documentElement);
  const d = cs.getPropertyValue('--font-display').trim();
  const b = cs.getPropertyValue('--font-body').trim();
  return {
    display: `${d ? `${d}, ` : ''}system-ui, sans-serif`,
    body: `${b ? `${b}, ` : ''}system-ui, sans-serif`,
  };
}

export async function ensureFonts(): Promise<Fonts> {
  const f = getFonts();
  try {
    await Promise.all([
      document.fonts.load(`800 60px ${f.display}`),
      document.fonts.load(`700 40px ${f.display}`),
      document.fonts.load(`600 30px ${f.body}`),
    ]);
  } catch {
    /* fall back to system fonts */
  }
  return f;
}

function canvasFor(format: FormatId, scale: number) {
  const { w, h } = FORMATS[format];
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * scale);
  cv.height = Math.round(h * scale);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  return { cv, ctx };
}

export async function renderPng(data: CardData, look: Look): Promise<Blob> {
  const fonts = await ensureFonts();
  const { cv, ctx } = canvasFor(look.format, 1);
  drawCard(ctx, data, { ...look, t: 0.9, fonts }, 1);
  return new Promise<Blob>((resolve, reject) =>
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), 'image/png'),
  );
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function renderGif(data: CardData, look: Look, onProgress?: (p: number) => void): Promise<Blob> {
  const fonts = await ensureFonts();
  const scale = 0.5;
  const { cv, ctx } = canvasFor(look.format, scale);
  const frames = 50;
  const delay = Math.round((CLIP_SECONDS * 1000) / frames);
  const gif = GIFEncoder();
  for (let i = 0; i < frames; i++) {
    drawCard(ctx, data, { ...look, t: i / frames, fonts }, scale);
    const { data: px } = ctx.getImageData(0, 0, cv.width, cv.height);
    const palette = quantize(px, 256, { format: 'rgb444' });
    const index = applyPalette(px, palette, 'rgb444');
    gif.writeFrame(index, cv.width, cv.height, { palette, delay, repeat: 0 });
    onProgress?.((i + 1) / frames);
    await tick();
  }
  gif.finish();
  return new Blob([new Uint8Array(gif.bytes())], { type: 'image/gif' });
}

function pickVideoMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const options: [string, string][] = [
    ['video/mp4;codecs=avc1', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm;codecs=vp8', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (const [mime, ext] of options) if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  return null;
}

export async function renderVideo(
  data: CardData,
  look: Look,
  onProgress?: (p: number) => void,
): Promise<{ blob: Blob; ext: string }> {
  const picked = pickVideoMime();
  if (!picked) throw new Error('Video export is not supported in this browser. Try the GIF instead.');
  const fonts = await ensureFonts();
  const scale = 0.667;
  const { cv, ctx } = canvasFor(look.format, scale);
  const stream = cv.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: picked.mime.split(';')[0] }));
  });
  drawCard(ctx, data, { ...look, t: 0, fonts }, scale);
  rec.start();
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const loop = (now: number) => {
      const el = (now - start) / 1000;
      const t = Math.min(0.999, el / CLIP_SECONDS);
      drawCard(ctx, data, { ...look, t, fonts }, scale);
      onProgress?.(Math.min(1, el / CLIP_SECONDS));
      if (el < CLIP_SECONDS + 0.2) requestAnimationFrame(loop);
      else resolve();
    };
    requestAnimationFrame(loop);
  });
  rec.stop();
  const blob = await done;
  return { blob, ext: picked.ext };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
