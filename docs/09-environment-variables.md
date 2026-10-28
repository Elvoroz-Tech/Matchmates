# Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | no (default Matchmates) | Product name everywhere |
| `NEXT_PUBLIC_APP_TAGLINE` | no | Tagline/hero text |
| `NEXT_PUBLIC_COMPANY_NAME` | no (ELVOROZ) | Company credit on cards/footer |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no (contact@elvoroz.com) | Contact links |
| `NEXT_PUBLIC_SITE_URL` | yes for prod | Canonical URL, OG, sitemap |
| `NEXT_PUBLIC_FESTIVAL_NAME` / `_DATETIME` | no | Homepage countdown |
| `MONGODB_URI` | **yes** | Connection string |
| `MONGODB_DB` | no (friendpoll) | Database name |
| `SECURITY_SALT` | **yes in prod** | HMAC secret (>= 16 chars) |
| `NEXT_PUBLIC_QUIZ_TTL_DAYS` | no (14) | Poll lifetime |
| `MAX_VOTES_PER_QUIZ` | no (500) | Vote cap per poll |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | Enables GA4 (after consent) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console meta tag |
