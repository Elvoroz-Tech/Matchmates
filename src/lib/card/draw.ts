import { FORMATS, type AnimId, type CardData, type DesignId, type Fonts, type RenderOpts } from './types';
import { THEMES, type Theme } from './themes';

type Ctx = CanvasRenderingContext2D;
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const W = 1080;
const TAU = Math.PI * 2;
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rrp(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  c.moveTo(x + rad, y);
  c.arcTo(x + w, y, x + w, y + h, rad);
  c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad);
  c.arcTo(x, y, x + w, y, rad);
  c.closePath();
}
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  rrp(c, x, y, w, h, r);
}

const font = (c: Ctx, weight: number, size: number, fam: string) => {
  c.font = `${weight} ${Math.round(size)}px ${fam}`;
};

function wrap(c: Ctx, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (c.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitLines(c: Ctx, text: string, weight: number, fam: string, maxW: number, maxLines: number, start: number, min: number) {
  let size = start;
  let lines: string[] = [];
  for (; size >= min; size -= 4) {
    font(c, weight, size, fam);
    lines = wrap(c, text, maxW);
    if (lines.length <= maxLines) break;
  }
  size = Math.max(size, min);
  font(c, weight, size, fam);
  return { size, lines: lines.slice(0, maxLines) };
}

/* ------------------------------------------------------------------ */
/* Backgrounds (all loop seamlessly over t = 0..1)                     */
/* ------------------------------------------------------------------ */
function base(c: Ctx, th: Theme, H: number) {
  const g = c.createLinearGradient(0, 0, W * 0.35, H);
  g.addColorStop(0, th.bg[0]);
  g.addColorStop(0.55, th.bg[1]);
  g.addColorStop(1, th.bg[2]);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

function stars(c: Ctx, th: Theme, H: number, t: number, count: number, seed: number) {
  const r = rng(seed);
  c.fillStyle = th.sparkle;
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * H;
    const s = r() * 2.6 + 0.8;
    const ph = r();
    const k = 1 + Math.floor(r() * 3);
    c.globalAlpha = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(TAU * (k * t + ph)))) * 0.9;
    c.beginPath();
    c.arc(x, y, s, 0, TAU);
    c.fill();
  }
  c.globalAlpha = 1;
}

function bgChand(c: Ctx, th: Theme, H: number, t: number) {
  base(c, th, H);
  stars(c, th, H, t, 90, 11);
  const story = H > 1500;
  const mx = W - (story ? 70 : 80);
  const my = story ? 90 : 80;
  const mr = story ? 150 : 100;
  const breathe = 1 + 0.05 * Math.sin(TAU * t);
  let g = c.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.6 * breathe);
  g.addColorStop(0, 'rgba(255,244,199,0.5)');
  g.addColorStop(1, 'rgba(255,244,199,0)');
  c.fillStyle = g;
  c.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
  g = c.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
  g.addColorStop(0, '#fffdf0');
  g.addColorStop(1, '#ffe9a8');
  c.fillStyle = g;
  c.beginPath();
  c.arc(mx, my, mr, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(190,160,90,0.2)';
  for (const [dx, dy, rad] of [
    [-0.35, 0.1, 0.22],
    [0.2, 0.35, 0.26],
    [0.3, -0.3, 0.13],
  ]) {
    c.beginPath();
    c.arc(mx + dx * mr, my + dy * mr, rad * mr, 0, TAU);
    c.fill();
  }
  // chalni (sieve) rings
  const cx = -30;
  const cy = H * 0.9;
  c.fillStyle = th.accent;
  for (let ring = 0; ring < 3; ring++) {
    const rad = 170 + ring * 70;
    const n = 28 + ring * 10;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU;
      c.globalAlpha = 0.14 + 0.34 * (0.5 + 0.5 * Math.sin(TAU * (t + (i / n) * 2 + ring * 0.2)));
      c.beginPath();
      c.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 4, 0, TAU);
      c.fill();
    }
  }
  c.globalAlpha = 1;
}

function bgSindoor(c: Ctx, th: Theme, H: number, t: number) {
  base(c, th, H);
  const cx = W / 2;
  const cy = H * 0.5;
  const g = c.createRadialGradient(cx, cy, 50, cx, cy, 800);
  g.addColorStop(0, 'rgba(255,207,92,0.28)');
  g.addColorStop(1, 'rgba(255,207,92,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // rotating mandala (rotates exactly one petal-step per loop => seamless)
  c.save();
  c.translate(cx, cy);
  for (let ring = 0; ring < 4; ring++) {
    const n = 12 + ring * 4;
    const R = 250 + ring * 140;
    const off = (TAU / n) * t * (ring % 2 ? 1 : -1);
    for (let i = 0; i < n; i++) {
      c.save();
      c.rotate((i * TAU) / n + off);
      c.beginPath();
      c.ellipse(R, 0, 46 + ring * 10, 18 + ring * 4, 0, 0, TAU);
      c.fillStyle = 'rgba(255,207,92,0.05)';
      c.fill();
      c.strokeStyle = 'rgba(255,207,92,0.26)';
      c.lineWidth = 3;
      c.stroke();
      c.restore();
    }
  }
  c.restore();
  stars(c, th, H, t, 46, 21);
  // double gold frame
  c.strokeStyle = 'rgba(255,207,92,0.7)';
  c.lineWidth = 4;
  rr(c, 26, 26, W - 52, H - 52, 44);
  c.stroke();
  c.strokeStyle = 'rgba(255,207,92,0.3)';
  c.lineWidth = 2;
  rr(c, 42, 42, W - 84, H - 84, 34);
  c.stroke();
}

function bgAurora(c: Ctx, th: Theme, H: number, t: number) {
  base(c, th, H);
  const blobs: [string, number, number, number][] = [
    ['#7c3aed', 0.25, 0.2, 0],
    ['#06b6d4', 0.78, 0.45, 0.33],
    ['#ec4899', 0.3, 0.8, 0.66],
  ];
  c.globalCompositeOperation = 'screen';
  for (const [col, bx, by, ph] of blobs) {
    const x = W * (bx + 0.2 * Math.sin(TAU * (t + ph)));
    const y = H * (by + 0.08 * Math.cos(TAU * (t + ph)));
    const g = c.createRadialGradient(x, y, 0, x, y, W * 0.85);
    g.addColorStop(0, `${col}99`);
    g.addColorStop(1, `${col}00`);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = 'rgba(255,255,255,0.045)';
  c.lineWidth = 2;
  c.beginPath();
  for (let x = 0; x <= W; x += 90) {
    c.moveTo(x, 0);
    c.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += 90) {
    c.moveTo(0, y);
    c.lineTo(W, y);
  }
  c.stroke();
  stars(c, th, H, t, 40, 33);
}

function bgPop(c: Ctx, th: Theme, H: number, t: number) {
  base(c, th, H);
  // halftone corner
  for (let gx = 0; gx < 12; gx++) {
    for (let gy = 0; gy < 10; gy++) {
      const rad = 11 - (gx + gy) * 0.62;
      if (rad <= 0.8) continue;
      c.fillStyle = 'rgba(255,61,129,0.55)';
      c.beginPath();
      c.arc(W - 34 - gx * 36, 34 + gy * 36 + (gx % 2) * 18, rad * (1 + 0.1 * Math.sin(TAU * (t + gx * 0.1))), 0, TAU);
      c.fill();
    }
  }
  // starburst, one point-step per loop
  const sx = 70;
  const sy = H * 0.52;
  c.save();
  c.translate(sx, sy);
  c.rotate((TAU / 8) * t);
  c.beginPath();
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 ? 78 : 130;
    const a = (i / 16) * TAU;
    c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = '#ffd23f';
  c.fill();
  c.lineWidth = 6;
  c.strokeStyle = th.ink;
  c.stroke();
  c.restore();
  // squiggle
  c.strokeStyle = th.accent2;
  c.lineWidth = 10;
  c.lineCap = 'round';
  c.beginPath();
  const qy = H - 120;
  for (let x = 60; x <= W - 60; x += 8) {
    const y = qy + Math.sin((x / 60) * Math.PI + TAU * t) * 14;
    if (x === 60) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
  c.lineCap = 'butt';
}

const BACKGROUNDS: Record<DesignId, (c: Ctx, th: Theme, H: number, t: number) => void> = {
  chand: bgChand,
  sindoor: bgSindoor,
  aurora: bgAurora,
  pop: bgPop,
};

/* ------------------------------------------------------------------ */
/* Header, title, footer                                               */
/* ------------------------------------------------------------------ */
function drawHeader(c: Ctx, th: Theme, fam: Fonts, d: CardData, t: number) {
  const a = easeOut(seg(t, 0, 0.1));
  const pop = th.id === 'pop';
  const emoji = d.occasion === 'karwa' ? '🌙' : d.occasion === 'shaadi' ? '💍' : '💘';
  font(c, 800, 34, fam.display);
  const tw = c.measureText(d.appName).width;
  const x = 60;
  const y = 58;
  const h = 78;
  const w = tw + 118;
  c.save();
  c.globalAlpha = a;
  c.translate(0, (1 - a) * -30);
  if (pop) {
    c.fillStyle = th.ink;
    rr(c, x + 7, y + 7, w, h, h / 2);
    c.fill();
  }
  rr(c, x, y, w, h, h / 2);
  c.fillStyle = pop ? '#ffffff' : th.rowFill;
  c.fill();
  c.lineWidth = pop ? 5 : 2.5;
  c.strokeStyle = pop ? th.ink : th.rowStroke;
  c.stroke();
  c.textAlign = 'left';
  c.font = `38px ${EMOJI}`;
  c.fillStyle = th.ink;
  c.fillText(emoji, x + 24, y + h / 2 + 2);
  font(c, 800, 34, fam.display);
  c.fillText(d.appName, x + 82, y + h / 2 + 1);
  c.restore();
}

function texts(d: CardData) {
  const s = d.total === 1 ? '' : 's';
  if (d.kind === 'result')
    return { title: `${d.subjectName}'s squad has spoken 🗳️`, sub: `${d.total} friend${s} voted · ${d.verdictLabel} ${d.verdictEmoji}` };
  if (d.kind === 'pick') return { title: `My pick for ${d.subjectName} 💘`, sub: 'Vote locked in 🔒 No take-backs.' };
  return { title: d.headline, sub: 'Votes stay hidden until you vote. One vote. No take-backs. 🔒' };
}

function drawTitle(c: Ctx, th: Theme, fam: Fonts, d: CardData, story: boolean, t: number): number {
  const { title, sub } = texts(d);
  const x = 70;
  const maxW = W - 140;
  const y0 = story ? 215 : 168;
  const fit = fitLines(c, title, 800, fam.display, maxW, story ? 3 : 2, story ? 104 : 74, story ? 60 : 46);
  const lh = fit.size * 1.08;
  const a = easeOut(seg(t, 0.02, 0.18));
  c.save();
  c.globalAlpha = a;
  c.translate(0, (1 - a) * 40);
  c.textAlign = 'left';
  c.fillStyle = th.ink;
  font(c, 800, fit.size, fam.display);
  fit.lines.forEach((ln, i) => c.fillText(ln, x, y0 + fit.size / 2 + i * lh));
  const yEnd = y0 + fit.lines.length * lh;
  const ss = story ? 38 : 30;
  font(c, 600, ss, fam.body);
  c.fillStyle = th.sub;
  const subLines = wrap(c, sub, maxW).slice(0, 2);
  const sl = ss * 1.35;
  subLines.forEach((ln, i) => c.fillText(ln, x, yEnd + 22 + ss / 2 + i * sl));
  c.restore();
  return yEnd + 22 + subLines.length * sl;
}

function drawFooter(c: Ctx, th: Theme, fam: Fonts, d: CardData, H: number, story: boolean, t: number) {
  const ph = story ? 112 : 96;
  const y = H - (story ? 262 : 200);
  const x = 70;
  const w = W - 140;
  const a = easeOut(seg(t, 0.2, 0.4));
  const pop = th.id === 'pop';
  const pulse = 1 + 0.014 * Math.sin(TAU * 2 * t);
  c.save();
  c.globalAlpha = a;
  c.translate(W / 2, y + ph / 2 + (1 - a) * 40);
  c.scale(pulse, pulse);
  c.translate(-W / 2, -(y + ph / 2));
  if (pop) {
    c.fillStyle = th.ink;
    rr(c, x + 8, y + 8, w, ph, ph / 2);
    c.fill();
  }
  const g = c.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, th.winA);
  g.addColorStop(1, th.winB);
  rr(c, x, y, w, ph, ph / 2);
  c.fillStyle = g;
  c.fill();
  if (pop) {
    c.lineWidth = 6;
    c.strokeStyle = th.ink;
    c.stroke();
  }
  const label = d.kind === 'invite' ? `Vote 👉 ${d.linkText}` : `Make yours 👉 ${d.host}`;
  let size = story ? 42 : 36;
  font(c, 800, size, fam.display);
  while (size > 22 && c.measureText(label).width > w - 70) {
    size -= 2;
    font(c, 800, size, fam.display);
  }
  c.fillStyle = th.onWin;
  c.textAlign = 'center';
  c.fillText(label, W / 2, y + ph / 2 + 2);
  c.restore();
  c.save();
  c.globalAlpha = a * 0.9;
  c.textAlign = 'center';
  c.fillStyle = th.sub;
  font(c, 600, story ? 28 : 24, fam.body);
  c.fillText(`a ${d.company} product · votes stay sealed 🔒`, W / 2, H - (story ? 96 : 68));
  c.restore();
  c.textAlign = 'left';
}

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */
interface Plan {
  label: string;
  sub: string;
  pctText: string;
  pct: number;
  appear: number;
  fill: number;
  flash: number;
  winner: boolean;
  idx: number;
  initial: string;
  shimmer: boolean;
}

function drawRow(c: Ctx, th: Theme, fam: Fonts, rect: Rect, r: Plan, t: number) {
  if (r.appear <= 0.001) return;
  const { x, y, w, h } = rect;
  const e = easeOut(clamp(r.appear));
  const rad = h * 0.34;
  const pop = th.id === 'pop';
  c.save();
  c.globalAlpha = e;
  c.translate(0, (1 - e) * 70);
  if (pop) {
    c.fillStyle = th.ink;
    rr(c, x + 10, y + 10, w, h, rad);
    c.fill();
  }
  rr(c, x, y, w, h, rad);
  c.fillStyle = th.rowFill;
  c.fill();
  c.save();
  rr(c, x, y, w, h, rad);
  c.clip();
  if (r.winner) {
    const g = c.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, th.winA);
    g.addColorStop(1, th.winB);
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
  } else if (r.fill > 0.001 && r.pct > 0) {
    const bw = Math.max(h * 0.95, w * (r.pct / 100)) * easeOut(clamp(r.fill));
    const g = c.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, th.barA);
    g.addColorStop(1, th.barB);
    c.fillStyle = g;
    c.fillRect(x, y, bw, h);
  }
  if (r.shimmer) {
    const p = (t * 2) % 1;
    const sx = x - 260 + (w + 520) * p;
    const g = c.createLinearGradient(sx, 0, sx + 260, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, th.dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(sx, y, 260, h);
  }
  if (r.flash > 0.01) {
    c.fillStyle = `rgba(255,255,255,${(0.7 * r.flash).toFixed(3)})`;
    c.fillRect(x, y, w, h);
  }
  c.restore();
  c.lineWidth = pop ? 6 : 3;
  c.strokeStyle = r.winner ? (pop ? th.ink : th.accent) : th.rowStroke;
  rr(c, x, y, w, h, rad);
  c.stroke();

  // avatar
  const ar = h * 0.31;
  const ax = x + h * 0.52;
  const ay = y + h / 2;
  const [g1, g2] = th.avatars[r.idx % th.avatars.length];
  const ag = c.createLinearGradient(ax - ar, ay - ar, ax + ar, ay + ar);
  ag.addColorStop(0, g1);
  ag.addColorStop(1, g2);
  c.beginPath();
  c.arc(ax, ay, ar, 0, TAU);
  c.fillStyle = ag;
  c.fill();
  if (pop) {
    c.lineWidth = 4;
    c.strokeStyle = th.ink;
    c.stroke();
  }
  c.fillStyle = '#ffffff';
  c.textAlign = 'center';
  font(c, 800, ar * 1.05, fam.display);
  c.fillText(r.initial, ax, ay + 2);

  // texts
  const tx = x + h * 1.12;
  const textColor = r.winner ? th.onWin : th.ink;
  const pctSize = h * 0.36;
  font(c, 800, pctSize, fam.display);
  const pw = c.measureText(r.pctText).width;
  const availW = x + w - 36 - pw - 30 - tx;
  let ns = h * 0.31;
  font(c, 700, ns, fam.display);
  while (ns > 22 && c.measureText(r.label).width > availW) {
    ns -= 2;
    font(c, 700, ns, fam.display);
  }
  c.textAlign = 'left';
  c.fillStyle = textColor;
  c.fillText(r.label, tx, y + (r.sub ? h * 0.38 : h * 0.5));
  if (r.sub) {
    c.globalAlpha = e * 0.75;
    font(c, 600, Math.max(22, h * 0.19), fam.body);
    c.fillText(r.sub, tx, y + h * 0.73);
    c.globalAlpha = e;
  }
  c.textAlign = 'right';
  font(c, 800, pctSize, fam.display);
  c.fillStyle = textColor;
  c.fillText(r.pctText, x + w - 36, y + h / 2 + 2);
  c.restore();
  c.textAlign = 'left';
}

function drawCrown(c: Ctx, rect: Rect, p: number) {
  const s = easeBack(clamp(p));
  const drop = (1 - clamp(p)) * -140;
  c.save();
  c.translate(rect.x + rect.h * 0.52, rect.y - 4 + drop);
  c.rotate(-0.28);
  c.scale(s, s);
  c.font = `84px ${EMOJI}`;
  c.textAlign = 'center';
  c.fillText('👑', 0, 0);
  c.restore();
}

function holeOverlay(c: Ctx, th: Theme, H: number, hx: number, hy: number, hw: number, hh: number, a: number) {
  c.save();
  c.globalAlpha = a;
  c.fillStyle = '#000000';
  c.beginPath();
  c.rect(0, 0, W, H);
  rrp(c, hx, hy, hw, hh, 46);
  c.fill('evenodd');
  c.restore();
  c.save();
  c.globalAlpha = Math.min(1, a * 1.4);
  c.lineWidth = 4;
  c.strokeStyle = th.accent;
  rr(c, hx, hy, hw, hh, 46);
  c.stroke();
  c.restore();
}

function drawRows(c: Ctx, th: Theme, fam: Fonts, d: CardData, o: RenderOpts, top: number, bottom: number, H: number) {
  const t = o.t;
  const story = o.format === 'story';
  const invite = d.kind === 'invite';
  const maxRows = story ? 6 : 4;
  const gap = story ? 22 : 16;
  const n = invite ? Math.min(d.contenders, maxRows) : Math.min(d.rows.length, maxRows);
  if (n <= 0) return;
  const hasWinner = !invite && d.total > 0;
  const mul = hasWinner ? 1.38 : 1;
  const avail = bottom - top;
  const unit = Math.min(story ? 150 : 112, (avail - gap * (n - 1)) / (n - 1 + mul));
  const totalH = unit * (n - 1 + mul) + gap * (n - 1);
  let y = top + Math.max(0, avail - totalH) * 0.35;
  const x = 70;
  const w = W - 140;

  const rects: Rect[] = [];
  for (let i = 0; i < n; i++) {
    const h = i === 0 && hasWinner ? unit * mul : unit;
    rects.push({ x, y, w, h });
    y += h + gap;
  }

  const pool = invite ? ['🔒', '💘', '👀', '✨', '🙈', '😳'] : d.rows.map((r) => r.name);
  const u = seg(t, 0.08, 0.7) * n;
  const lockOf = (i: number) => 0.3 + (invite ? i : n - 1 - i) * 0.07;
  const plans: Plan[] = [];

  for (let i = 0; i < n; i++) {
    const row = invite ? null : d.rows[i];
    const j = invite ? i : n - 1 - i;
    let appear = 1;
    let fill = 1;
    let flash = 0;
    let locked = true;
    if (o.anim === 'rise') {
      appear = seg(t, 0.1 + i * 0.07, 0.3 + i * 0.07);
      fill = seg(t, 0.18 + i * 0.07, 0.55 + i * 0.07);
    } else if (o.anim === 'spotlight') {
      appear = seg(u, j - 0.1, j + 0.35);
      fill = seg(u, j + 0.1, j + 1.2);
    } else {
      appear = seg(t, 0.06 + i * 0.03, 0.18 + i * 0.03);
      const lt = lockOf(i);
      locked = t >= lt;
      fill = seg(t, lt, lt + 0.14);
      flash = locked ? 1 - seg(t, lt, lt + 0.12) : 0;
    }

    let label: string;
    let sub: string;
    let pctText: string;
    let pct: number;
    if (invite) {
      label = `Secret contender ${i + 1}`;
      sub = 'votes sealed';
      pctText = '??%';
      pct = 38 + 48 * (0.5 + 0.5 * Math.sin(TAU * (t + i * 0.23)));
      fill = o.anim === 'shuffle' ? fill : Math.max(fill, appear * 0.9);
      if (o.anim === 'shuffle' && !locked) {
        label = pool[(Math.floor(t * 34) + i * 2) % pool.length];
        sub = '';
        fill = 0;
      }
    } else {
      label = row!.name;
      sub = `${row!.votes} vote${row!.votes === 1 ? '' : 's'}`;
      pctText = `${row!.pct}%`;
      pct = row!.pct;
      if (o.anim === 'shuffle' && !locked) {
        label = pool[(Math.floor(t * 34) + i * 2) % pool.length];
        pctText = `${(Math.floor(t * 70) * 7 + i * 13) % 100}%`;
        sub = '';
        fill = 0;
      }
    }
    const initial = invite ? '?' : (row!.name.trim()[0] || '?').toUpperCase();
    plans.push({
      label,
      sub,
      pctText,
      pct,
      appear,
      fill,
      flash: i === 0 || invite ? flash : flash * 0.6,
      winner: hasWinner && i === 0,
      idx: i,
      initial,
      shimmer: invite && appear > 0.9,
    });
  }

  for (let i = 0; i < n; i++) drawRow(c, th, fam, rects[i], plans[i], t);

  if (hasWinner) {
    const cp =
      o.anim === 'rise'
        ? seg(t, 0.55, 0.72)
        : o.anim === 'spotlight'
          ? seg(t, 0.76, 0.9)
          : seg(t, lockOf(0) + 0.02, lockOf(0) + 0.16);
    if (cp > 0) drawCrown(c, rects[0], cp);
  }

  if (o.anim === 'spotlight') {
    const a = 0.62 * (1 - seg(t, 0.74, 0.9));
    if (a > 0.01) {
      const order = rects.map((_, k) => k);
      if (!invite) order.reverse();
      const fi = Math.min(n - 1, Math.floor(u));
      const fr = u - Math.floor(u);
      const A = rects[order[fi]];
      const B = rects[order[Math.min(n - 1, fi + 1)]];
      const k = smooth(clamp((fr - 0.55) / 0.45));
      holeOverlay(c, th, H, x - 24, lerp(A.y, B.y, k) - 22, w + 48, lerp(A.h, B.h, k) + 44, a);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Pick card                                                           */
/* ------------------------------------------------------------------ */
function drawPick(c: Ctx, th: Theme, fam: Fonts, d: CardData, o: RenderOpts, top: number, bottom: number, H: number) {
  const t = o.t;
  const story = o.format === 'story';
  const x = 70;
  const w = W - 140;
  const h = story ? 700 : 450;
  const y = top + Math.max(0, bottom - top - h) * 0.4;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pop = th.id === 'pop';
  let name = d.pick || '—';
  let sc = 1;
  let alpha = 1;
  let flash = 0;
  let locked = true;
  if (o.anim === 'rise') {
    sc = 0.6 + 0.4 * easeBack(seg(t, 0.1, 0.42));
    alpha = easeOut(seg(t, 0.1, 0.3));
  } else if (o.anim === 'shuffle') {
    alpha = easeOut(seg(t, 0.06, 0.2));
    locked = t >= 0.55;
    flash = locked ? 1 - seg(t, 0.55, 0.67) : 0;
    if (!locked) {
      const pool = d.rows.length ? d.rows.map((r) => r.name) : [name];
      name = pool[Math.floor(t * 30) % pool.length];
    }
  }
  c.save();
  c.globalAlpha = alpha;
  c.translate(cx, cy);
  c.scale(sc, sc);
  c.translate(-cx, -cy);
  if (pop) {
    c.fillStyle = th.ink;
    rr(c, x + 14, y + 14, w, h, 64);
    c.fill();
  }
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, th.winA);
  g.addColorStop(1, th.winB);
  rr(c, x, y, w, h, 64);
  c.fillStyle = g;
  c.fill();
  c.save();
  rr(c, x, y, w, h, 64);
  c.clip();
  const sp = (t * 1.5) % 1;
  const sx = x - 300 + (w + 600) * sp;
  const sg = c.createLinearGradient(sx, 0, sx + 300, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)');
  sg.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sg;
  c.fillRect(sx, y, 300, h);
  if (flash > 0.01) {
    c.fillStyle = `rgba(255,255,255,${(0.7 * flash).toFixed(3)})`;
    c.fillRect(x, y, w, h);
  }
  c.restore();
  c.lineWidth = pop ? 7 : 4;
  c.strokeStyle = pop ? th.ink : th.accent;
  rr(c, x, y, w, h, 64);
  c.stroke();

  c.textAlign = 'center';
  c.fillStyle = th.onWin;
  c.globalAlpha = alpha * 0.8;
  font(c, 700, story ? 40 : 32, fam.body);
  c.fillText(`${d.subjectName}'s person is…`, cx, y + (story ? 88 : 66));
  c.globalAlpha = alpha;
  const fit = fitLines(c, name, 800, fam.display, w - 120, 2, story ? 190 : 130, 56);
  const lh = fit.size * 1.05;
  const blockH = fit.lines.length * lh;
  fit.lines.forEach((ln, i) => c.fillText(ln, cx, y + h / 2 - blockH / 2 + lh / 2 + i * lh - (story ? 10 : 0)));
  const hs = (story ? 110 : 76) * (1 + 0.08 * Math.sin(TAU * 2 * t));
  c.font = `${Math.round(hs)}px ${EMOJI}`;
  c.fillText('💘', cx, y + h - (story ? 120 : 80));
  c.restore();

  // stamp
  const sp2 = seg(t, 0.5, 0.64);
  if (sp2 > 0) {
    c.save();
    c.translate(x + w - 250, y + h - 40);
    c.rotate(-0.14);
    const ss = easeBack(sp2);
    c.scale(ss, ss);
    c.globalAlpha = clamp(sp2 * 2);
    font(c, 800, 36, fam.display);
    const tw = c.measureText('VOTE LOCKED 🔒').width + 56;
    rr(c, -tw / 2, -40, tw, 80, 22);
    c.fillStyle = th.dark ? 'rgba(0,0,0,0.55)' : '#ffffff';
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = th.dark ? th.accent : th.ink;
    c.stroke();
    c.fillStyle = th.dark ? th.accent : th.ink;
    c.textAlign = 'center';
    c.fillText('VOTE LOCKED 🔒', 0, 2);
    c.restore();
  }

  if (o.anim === 'spotlight') {
    const a = 0.72 * (1 - seg(t, 0.7, 0.88));
    if (a > 0.01) {
      const r = lerp(140, 1150, easeOut(seg(t, 0.08, 0.6)));
      const rg = c.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
      rg.addColorStop(0, 'rgba(0,0,0,0)');
      rg.addColorStop(1, `rgba(0,0,0,${a.toFixed(3)})`);
      c.fillStyle = rg;
      c.fillRect(0, 0, W, H);
    }
  }
  c.textAlign = 'left';
}

/* ------------------------------------------------------------------ */
/* Confetti                                                            */
/* ------------------------------------------------------------------ */
function confettiLayer(c: Ctx, th: Theme, H: number, t: number, start: number) {
  const q = seg(t, start, start + 0.34);
  if (q <= 0 || q >= 1) return;
  const r = rng(99);
  const cols = [th.accent, th.accent2, '#ffffff', th.winB, th.winA];
  for (let i = 0; i < 70; i++) {
    const x0 = r() * W;
    const sp = 0.7 + r() * 0.8;
    const rot0 = r() * TAU;
    const rs = (r() - 0.5) * 10;
    const sz = 14 + r() * 16;
    const sway = r() * 60 + 20;
    const ph = r() * TAU;
    const y = -60 + q * (H + 160) * sp;
    if (y > H + 40) continue;
    c.save();
    c.translate(x0 + Math.sin(ph + q * 9) * sway, y);
    c.rotate(rot0 + q * rs * 3);
    c.globalAlpha = 1 - seg(q, 0.8, 1);
    c.fillStyle = cols[i % cols.length];
    c.fillRect(-sz / 2, -sz / 4, sz, sz / 2);
    c.restore();
  }
  c.globalAlpha = 1;
}

const confettiStart = (anim: AnimId, kind: CardData['kind']): number => {
  if (anim === 'rise') return 0.58;
  if (anim === 'spotlight') return 0.78;
  return kind === 'pick' ? 0.6 : 0.8;
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
export function drawCard(c: Ctx, d: CardData, o: RenderOpts, scale = 1) {
  const H = FORMATS[o.format].h;
  const th = THEMES[o.design];
  const story = o.format === 'story';
  c.save();
  c.scale(scale, scale);
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.globalAlpha = 1;
  BACKGROUNDS[o.design](c, th, H, o.t);
  drawHeader(c, th, o.fonts, d, o.t);
  const top = drawTitle(c, th, o.fonts, d, story, o.t) + (story ? 44 : 30);
  const bottom = H - (story ? 300 : 232);
  if (d.kind === 'pick') drawPick(c, th, o.fonts, d, o, top, bottom, H);
  else drawRows(c, th, o.fonts, d, o, top, bottom, H);
  drawFooter(c, th, o.fonts, d, H, story, o.t);
  if (d.kind !== 'invite') confettiLayer(c, th, H, o.t, confettiStart(o.anim, d.kind));
  c.restore();
}
