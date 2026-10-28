// Runs automatically before `npm run build` (prebuild).
// Writes public/robots.txt and public/sitemap.xml using NEXT_PUBLIC_SITE_URL.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadEnv } from './_env.mjs';

const env = loadEnv();
const site = (env.NEXT_PUBLIC_SITE_URL || 'https://YOUR-DOMAIN.com').replace(/\/+$/, '');
const today = new Date().toISOString().slice(0, 10);
const pages = [
  ['/', '1.0', 'daily'],
  ['/create', '0.9', 'weekly'],
  ['/how-it-works', '0.7', 'monthly'],
  ['/rules', '0.5', 'monthly'],
  ['/privacy', '0.4', 'yearly'],
  ['/terms', '0.4', 'yearly'],
  ['/opt-out', '0.3', 'yearly'],
  ['/contact', '0.4', 'yearly'],
];

mkdirSync('public', { recursive: true });
writeFileSync(
  'public/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /q/\n\nSitemap: ${site}/sitemap.xml\n`,
);
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map(([p, pr, cf]) => `  <url>\n    <loc>${site}${p === '/' ? '' : p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`[seo] robots.txt + sitemap.xml generated for ${site}`);
