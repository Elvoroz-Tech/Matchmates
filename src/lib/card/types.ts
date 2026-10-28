import type { Gender, Occasion } from '../types';

export type CardKind = 'invite' | 'result' | 'pick';
export type DesignId = 'chand' | 'sindoor' | 'aurora' | 'pop';
export type AnimId = 'rise' | 'spotlight' | 'shuffle';
export type FormatId = 'story' | 'square';

export interface CardRow {
  name: string;
  votes: number;
  pct: number;
}

export interface CardData {
  kind: CardKind;
  appName: string;
  company: string;
  host: string;
  linkText: string;
  subjectName: string;
  gender: Gender;
  occasion: Occasion;
  rows: CardRow[];
  total: number;
  contenders: number;
  pick?: string;
  headline: string;
  verdictLabel: string;
  verdictEmoji: string;
}

export interface Fonts {
  display: string;
  body: string;
}

export interface RenderOpts {
  design: DesignId;
  anim: AnimId;
  format: FormatId;
  /** 0..1 position inside the looping clip */
  t: number;
  fonts: Fonts;
}

export const CLIP_SECONDS = 4.5;
export const FORMATS: Record<FormatId, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Story 9:16' },
  square: { w: 1080, h: 1080, label: 'Post 1:1' },
};

export const DESIGN_LIST: { id: DesignId; name: string; emoji: string; swatch: string }[] = [
  { id: 'chand', name: 'Chand', emoji: '🌙', swatch: 'linear-gradient(135deg,#0a0b2e,#3a0f55 60%,#ffd966)' },
  { id: 'sindoor', name: 'Sindoor', emoji: '🪔', swatch: 'linear-gradient(135deg,#2a0309,#c1203a 60%,#ffcf5c)' },
  { id: 'aurora', name: 'Aurora', emoji: '🌌', swatch: 'linear-gradient(135deg,#7c3aed,#06b6d4 60%,#ec4899)' },
  { id: 'pop', name: 'Pop', emoji: '🍬', swatch: 'linear-gradient(135deg,#fff1c9,#ffd6e8 50%,#ff3d81)' },
];

export const ANIM_LIST: { id: AnimId; name: string; emoji: string }[] = [
  { id: 'rise', name: 'Rise', emoji: '🚀' },
  { id: 'spotlight', name: 'Spotlight', emoji: '🔦' },
  { id: 'shuffle', name: 'Shuffle', emoji: '🎰' },
];
