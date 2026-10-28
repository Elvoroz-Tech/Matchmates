# Changelog

All notable changes, with the approach behind them. Newest first.

## 1.0.0 - 2026-10-28 - First complete build

**Plan**: ship a lean, privacy-forward product before Karwa Chauth (29 Oct 2026). Use MongoDB only for what must be shared (polls, sealed votes, rate limits); do everything else in the browser.

**Added**
- Next.js 16 / React 19 / TypeScript app with a mobile-first CSS design system (animated gradient background, glass UI, bottom sheets, spring motion, reduced-motion support).
- Create wizard, sealed voting flow, results with squad verdicts, who-voted-whom list, creator delete.
- Canvas card engine (`src/lib/card`): designs Chand, Sindoor, Aurora, Pop; animations Rise, Spotlight, Shuffle; kinds Invite, Result, Pick; story and square formats. One draw function drives live preview, PNG, GIF (gifenc) and video (MediaRecorder).
- Share: Web Share API with image files, plus link sheet for WhatsApp, Telegram, X, Facebook, Reddit, SMS, Email, Copy.
- API: create, meta, vote, results (sealed), delete, opt-out. Zod validation, honeypots, origin checks.
- Security: Mongo-backed per-IP rate limits, per-poll IP cap, HMAC hashing with `SECURITY_SALT`, strict security headers/CSP, TTL auto-deletion.
- Single-variable branding via `NEXT_PUBLIC_APP_NAME` (`src/lib/config.ts`).
- Public pages: How it works, Rules, Privacy, Terms, Opt out, Contact.
- SEO: `public/robots.txt`, `public/sitemap.xml` (regenerated at build from `NEXT_PUBLIC_SITE_URL`), OG images, manifest, icons. GA4 (consent-gated) and Search Console via env only.
- Admin script `npm run purge` and full `docs/` folder.

**Decisions**
- No Cloudinary/Twilio: nothing is uploaded and there are no emails or OTPs.
- Results sealed on the server (not just hidden in the UI), so tampering with the front end cannot reveal them.
- Cards drawn with canvas instead of DOM screenshots for pixel-identical exports and real animated GIF/video.
- Honest privacy copy: names and votes reach the server (needed for shared polls); keys and cards stay on-device; everything expires.

**Known**
- Authored in an offline sandbox; run `npm install && npm run build` and test on real devices before launch.
