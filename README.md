# Friend Poll App (working name: Matchmates)

Secret-vote polls for friends, built for Gen Z and Karwa Chauth season. A product of **ELVOROZ** (contact@elvoroz.com).

A close friend creates a poll of potential partners for another friend. Everyone votes in secret; results unlock only after you vote; votes are final. Animated share cards (4 designs x 3 animations) export as image, GIF or video, generated entirely on the user's device.

## Quick start
```bash
npm install
cp .env.example .env     # then fill MONGODB_URI and SECURITY_SALT
npm run dev              # http://localhost:3000
```
Production: `npm run build && npm start` (or deploy on Vercel and set the same env vars).

## Rename the product
Change `NEXT_PUBLIC_APP_NAME` in `.env` and rebuild. Every page, card, SEO tag and legal page reads that single variable.

## Docs
Everything lives in [`docs/`](docs/README.md). Change history: [`changelogs.md`](changelogs.md).
