import type { CardData } from './card/types';
import { APP_NAME, COMPANY_NAME, SITE_HOST } from './config';

export const SAMPLE_CARD: CardData = {
  kind: 'result',
  appName: APP_NAME,
  company: COMPANY_NAME,
  host: SITE_HOST,
  linkText: `${SITE_HOST}/q/xxxxxxxxxx`,
  subjectName: 'Aanya',
  gender: 'female',
  occasion: 'karwa',
  rows: [
    { name: 'Kabir', votes: 6, pct: 46 },
    { name: 'Rohan', votes: 4, pct: 31 },
    { name: 'Arjun', votes: 2, pct: 15 },
    { name: 'Dev', votes: 1, pct: 8 },
  ],
  total: 13,
  contenders: 4,
  pick: 'Kabir',
  headline: "Who's Aanya's Karwa Chauth partner? 🌙",
  verdictLabel: 'Clear favourite',
  verdictEmoji: '👑',
};
