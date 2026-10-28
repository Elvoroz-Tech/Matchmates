import type { DesignId } from './types';

export interface Theme {
  id: DesignId;
  dark: boolean;
  bg: [string, string, string];
  ink: string;
  sub: string;
  accent: string;
  accent2: string;
  rowFill: string;
  rowStroke: string;
  barA: string;
  barB: string;
  winA: string;
  winB: string;
  onWin: string;
  sparkle: string;
  avatars: [string, string][];
}

const AV: [string, string][] = [
  ['#ff3d81', '#ff7a45'],
  ['#8b5cff', '#3de0ff'],
  ['#ffc233', '#ff3d81'],
  ['#22d3a5', '#3b82f6'],
  ['#f472b6', '#a855f7'],
  ['#fb923c', '#f43f5e'],
];

export const THEMES: Record<DesignId, Theme> = {
  chand: {
    id: 'chand',
    dark: true,
    bg: ['#0a0b2e', '#1a1050', '#3a0f55'],
    ink: '#fff8e1',
    sub: 'rgba(255,248,225,0.72)',
    accent: '#ffd966',
    accent2: '#ff9ecd',
    rowFill: 'rgba(255,255,255,0.08)',
    rowStroke: 'rgba(255,217,102,0.38)',
    barA: 'rgba(255,217,102,0.38)',
    barB: 'rgba(255,158,205,0.38)',
    winA: '#ffe08a',
    winB: '#ff9a3c',
    onWin: '#2a1200',
    sparkle: '#fff4c7',
    avatars: AV,
  },
  sindoor: {
    id: 'sindoor',
    dark: true,
    bg: ['#2a0309', '#7a0c20', '#c1203a'],
    ink: '#fff3e0',
    sub: 'rgba(255,243,224,0.74)',
    accent: '#ffcf5c',
    accent2: '#ff8fa3',
    rowFill: 'rgba(0,0,0,0.26)',
    rowStroke: 'rgba(255,207,92,0.55)',
    barA: 'rgba(255,207,92,0.34)',
    barB: 'rgba(255,143,163,0.34)',
    winA: '#ffe29a',
    winB: '#ffb347',
    onWin: '#3a0610',
    sparkle: '#ffe9a8',
    avatars: AV,
  },
  aurora: {
    id: 'aurora',
    dark: true,
    bg: ['#07030f', '#0d0a2a', '#08122a'],
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.7)',
    accent: '#7cf5ff',
    accent2: '#c084fc',
    rowFill: 'rgba(255,255,255,0.07)',
    rowStroke: 'rgba(255,255,255,0.2)',
    barA: 'rgba(124,245,255,0.38)',
    barB: 'rgba(192,132,252,0.38)',
    winA: '#7cf5ff',
    winB: '#c084fc',
    onWin: '#06101f',
    sparkle: '#ffffff',
    avatars: AV,
  },
  pop: {
    id: 'pop',
    dark: false,
    bg: ['#fff1c9', '#ffd6e8', '#cfe8ff'],
    ink: '#14081f',
    sub: 'rgba(20,8,31,0.66)',
    accent: '#ff3d81',
    accent2: '#5b5bff',
    rowFill: '#ffffff',
    rowStroke: '#14081f',
    barA: '#ffd23f',
    barB: '#ff9ecd',
    winA: '#ff6aa2',
    winB: '#ff9a45',
    onWin: '#14081f',
    sparkle: '#ffffff',
    avatars: AV,
  },
};
