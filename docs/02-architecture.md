# Architecture

## Stack
Next.js 16 (App Router, TypeScript), React 19, MongoDB (official driver), zod, gifenc, canvas-confetti. Plain mobile-first CSS (no CSS framework). Fonts: Bricolage Grotesque (display) + Plus Jakarta Sans (body) via `next/font`.

## Why MongoDB at all?
Votes come from many devices and must be hidden until a viewer votes, so a shared store is unavoidable. Everything else is client-side: card rendering, device identity, history, preferences. No Cloudinary (no uploads exist) and no Twilio (no emails/OTPs exist).

## Folder map
```
src/app            pages, API routes, metadata files (icon, manifest, OG images)
src/components     UI (CardStudio, LiveCard, ShareSheet, CreateWizard, QuizClient ...)
src/lib/card       canvas engine: types, themes, draw, export
src/lib/client     browser-only helpers (device token, API client, confetti)
src/lib/server     server-only (mongo, security, http helpers, validation, quiz logic)
scripts            generate-seo.mjs (prebuild), purge-quiz.mjs (admin)
docs               this documentation
```

## Data flow: vote
1. Browser creates a random **device token** (localStorage).
2. `POST /api/quizzes/:id/vote` sends token + chosen candidate id + optional nickname.
3. Server stores `hmac(quizId:token)` (never the token), `hmac(quizId:ip)`, the choice.
4. Unique index on `(quizId, voterHash)` guarantees one vote per device.
5. `GET /results` requires the token header and a stored vote; otherwise 403.

## Single-variable branding
`src/lib/config.ts` is the only reader of brand env vars. Components import constants from it.
