# Database (MongoDB)

Database name: `MONGODB_DB` (default `friendpoll`). Indexes are created automatically on first connection (`lib/server/mongo.ts`).

| Collection | Document | Indexes |
|---|---|---|
| `quizzes` | `_id` (10-char id), `creatorKeyHash`, `subjectName`, `subjectGender`, `occasion`, `candidates[{id,name}]`, `createdAt`, `expiresAt` | TTL on `expiresAt` |
| `votes` | `quizId`, `voterHash`, `ipHash`, `candidateId`, `nick|null`, `createdAt`, `expiresAt` | unique `(quizId, voterHash)`; `(quizId, ipHash)`; TTL on `expiresAt` |
| `ratelimits` | `_id` = `bucket:ipHash:window`, `count`, `expiresAt` | TTL on `expiresAt` |
| `optouts` | `ref`, `quizId`, `nameAsListed`, `contact`, `reason`, `status`, `createdAt` | TTL 180 days |

Votes inherit the poll's `expiresAt`, so the whole poll disappears together (default 14 days via `NEXT_PUBLIC_QUIZ_TTL_DAYS`).
MongoDB's TTL monitor runs about once a minute, so expiry can lag briefly; the API also checks `expiresAt` on read.
