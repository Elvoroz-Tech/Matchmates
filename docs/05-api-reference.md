# API reference

All responses are JSON with `Cache-Control: no-store`. Errors: `{ "error": "message", "code"?: "..." }`.
Write endpoints require a same-origin `Origin` header and are rate-limited per hashed IP.

| Method & path | Body / headers | Success | Limits |
|---|---|---|---|
| `POST /api/quizzes` | `{subjectName, subjectGender, occasion, candidates[2..8], nick, pickIndex, voterToken, website}` | 201 `{id, creatorKey, candidates, pickId}` | 8/hour/IP |
| `GET /api/quizzes/:id` | | 200 poll meta (no votes) | 120/min |
| `DELETE /api/quizzes/:id` | header `x-creator-key` | 200 `{ok}` | 10/hour |
| `POST /api/quizzes/:id/vote` | `{voterToken, candidateId, nick}` | 201 results | 40/10 min; 8 votes/IP/poll |
| `GET /api/quizzes/:id/results` | header `x-voter-token` | 200 `{total, tallies, voters[]}` | 120/min |
| `POST /api/optout` | `{ref, name, contact, reason, website}` | 201 `{ok}` | 5/hour |

Status codes: 400 invalid input, 403 blocked origin / not voted yet / wrong key, 404 missing or expired, 409 already voted or poll full, 429 rate limited (`Retry-After`), 500 server error.
