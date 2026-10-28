// Single source of truth for brand + public settings.
// Everything reads from NEXT_PUBLIC_* env vars so the product can be renamed in .env only.
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Matchmates';
export const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE || 'Let your squad pick their person.';
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'ELVOROZ';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@elvoroz.com';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const FESTIVAL_NAME = process.env.NEXT_PUBLIC_FESTIVAL_NAME || 'Karwa Chauth';
export const FESTIVAL_DATETIME = process.env.NEXT_PUBLIC_FESTIVAL_DATETIME || '2026-10-29T20:17:00+05:30';
export const GA_ID = /^G-[A-Z0-9]{4,20}$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '')
  ? (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string)
  : '';
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
export const QUIZ_TTL_DAYS = Math.min(60, Math.max(1, Number(process.env.NEXT_PUBLIC_QUIZ_TTL_DAYS) || 14));
export const LIMITS = { minCandidates: 2, maxCandidates: 8, maxName: 28, maxNick: 20 };
export const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return 'localhost:3000';
  }
})();
