# Security and privacy

## Privacy promise (and what is actually true)
- Cards, GIFs and videos are rendered in the browser; no image upload endpoint exists.
- Device token, creator key, history and prefs live only in `localStorage`.
- No accounts, emails, phone numbers or location.
- The server stores only what friends need to participate (names, sealed votes, optional nicknames) plus one-way HMAC hashes. Everything auto-deletes.
- Be precise in marketing: votes and names **do** reach the server (a shared poll cannot work otherwise). The honest claim is "your cards and keys never leave your device; we store the minimum and it expires".

## Sealed results
`GET /results` returns data only if a vote exists for `hmac(quizId:token)`. There is no creator override.

## Layers
1. **Rate limiting**: Mongo-backed fixed windows per HMAC(IP) per route (`lib/server/security.ts`).
2. **Per-poll IP cap**: max 8 votes per hashed IP per poll (shared Wi-Fi friendly) and `MAX_VOTES_PER_QUIZ`.
3. **One vote per device**: unique index.
4. **Origin check** on writes; JSON-only; 8 KB body cap.
5. **Validation** with zod; control characters and `<>` stripped; honeypot field `website`.
6. **Hashing** with `SECURITY_SALT` (required in production).
7. **Headers**: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP (`next.config.ts`).
8. **No indexing** of poll pages (`noindex`, robots disallow `/q/` and `/api/`).
9. **Safety copy**: 18+ confirmation, rules page, opt-out flow.

## Known limits
- Votes are per device/browser; clearing storage or using another browser allows another vote (IP cap limits damage). Real identity would need accounts or OTP, which conflicts with the privacy USP.
- IP hashing relies on the platform's `x-forwarded-for`; behind a proxy you control, make sure it is trusted.
- Have a lawyer review the Privacy/Terms text (India DPDP Act, 2023) before launch.
