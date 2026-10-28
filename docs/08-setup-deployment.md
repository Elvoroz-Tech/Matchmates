# Setup and deployment

1. Node 20.9+ (22 recommended). `npm install`.
2. `cp .env.example .env`. Set `MONGODB_URI` and `SECURITY_SALT` (`openssl rand -hex 32`).
3. `npm run dev`.
4. Production build: `npm run build` (the `prebuild` hook regenerates `robots.txt` and `sitemap.xml` from `NEXT_PUBLIC_SITE_URL`).

## Vercel
Import the repo, add all `.env.example` variables, deploy. Allow-list Vercel's IPs (or `0.0.0.0/0`) in MongoDB Atlas network access.

## Self-hosting
`npm run build && npm start` behind a reverse proxy that sets `x-forwarded-for`, `x-forwarded-host` and HTTPS.

## Operations
- Remove a poll after an opt-out: `npm run purge -- <pollId or URL>`.
- Review `optouts` documents in MongoDB (`status: "new"`).
- Changing any `NEXT_PUBLIC_*` value requires a rebuild.
