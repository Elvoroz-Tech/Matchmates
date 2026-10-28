import type { Gender, Occasion } from './types';

export const OCCASIONS: { id: Occasion; label: string; emoji: string; blurb: string }[] = [
  { id: 'karwa', label: 'Karwa Chauth', emoji: '🌙', blurb: 'Chand, chhalni & squad votes' },
  { id: 'shaadi', label: 'Shaadi vibes', emoji: '💍', blurb: 'Who is the forever person?' },
  { id: 'fun', label: 'Just for fun', emoji: '💘', blurb: 'Pure chaos, zero pressure' },
];

export function occasionMeta(o: Occasion) {
  return OCCASIONS.find((x) => x.id === o) || OCCASIONS[2];
}

export function contenderWord(g: Gender) {
  return g === 'female' ? 'guys' : 'girls';
}

export function headline(name: string, o: Occasion): string {
  switch (o) {
    case 'karwa':
      return `Who's ${name}'s Karwa Chauth partner? 🌙`;
    case 'shaadi':
      return `Shaadi squad poll: who's ${name}'s forever person? 💍`;
    default:
      return `Who should ${name} end up with? 💘`;
  }
}

export function subline(o: Occasion): string {
  switch (o) {
    case 'karwa':
      return 'Chand baad mein, vote pehle 🌙';
    case 'shaadi':
      return 'The squad decides. No appeals. 💍';
    default:
      return 'Squad decides. No appeals. 👀';
  }
}

export function shareText(name: string, o: Occasion): string {
  const base = `${name}'s squad is deciding… who's the one? 👀 Vote in secret — you only see everyone's picks after you vote 🔒`;
  return o === 'karwa' ? `🌙 Karwa Chauth special! ${base}` : base;
}
