# Social Feed — Full-Stack Assessment

A social feed application built for the AppifyLab Full Stack Developer assessment,
converting the provided Login/Register/Feed templates into a working Next.js app
with authentication, posts, comments, replies, and likes.

**Live:** https://social-feed-chi.vercel.app


## Stack

- **Next.js 16 (App Router)** — frontend + API routes in one deployable unit
- **PostgreSQL (Neon)** via **Prisma ORM** with the driver-adapter client
- **JWT in httpOnly cookies** for auth
- **Cloudinary** for image storage
- **Zod** for request validation

## Running locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, Cloudinary keys
npx prisma migrate dev
npm run seed
npm run dev
```

Seeded accounts all use the password `Passw0rd!` (see `prisma/seed.ts` for emails).

## Testing

Run the integration smoke test suite against the local development server (or set `BASE_URL` to target a custom deployment):
```bash
node scripts/smoke-test.mjs
```

## Architecture

Next.js App Router handles both rendering and the API. The feed page is a Server
Component that queries Postgres directly on first load (no client-side loading
spinner for the initial feed); post creation, likes, and comments are Client
Components using `fetch` against route handlers under `app/api/`.
```bash
Browser → Next.js middleware (JWT cookie check)
→ Route handlers (Zod validation)
→ Prisma
→ PostgreSQL (Neon)
```

## Data model

- `User`, `Post`, `Comment`, `Like` — see `prisma/schema.prisma` for the full schema.
- Replies reuse the `Comment` table via a nullable self-referencing `parentCommentId`,
  rather than a separate `Reply` table — one table, one set of like/author logic.
- `Like` uses two nullable foreign keys (`postId`, `commentId`) rather than a
  polymorphic `targetType/targetId` pair, so Postgres can enforce real foreign-key
  cascades and Prisma can express the relation natively. A `CHECK` constraint
  enforces exactly one of the two is set.
- Indexes: `Post(createdAt DESC)`, `Post(visibility, createdAt DESC)` for the feed
  query, `Comment(postId)`, `Comment(parentCommentId)`.

## Security decisions

- Passwords hashed with bcrypt (cost factor 12).
- JWT stored in an httpOnly, Secure, SameSite=Lax cookie — not localStorage — to
  keep it inaccessible to XSS.
- Private-post visibility is enforced at the query layer (`WHERE visibility =
  'PUBLIC' OR authorId = :userId`), not filtered client-side.
- Requests for a private post/comment the caller can't access return `404`, not
  `403` — this avoids confirming the resource exists to an unauthorized caller.
- All mutation payloads validated with Zod before hitting Prisma.

## Scaling considerations

Built assuming a large, growing table rather than a fixed demo dataset:

- Cursor-based pagination on the feed (`cursor: { id }`) instead of `OFFSET`, so
  query cost doesn't grow with page depth.
- Composite index `(visibility, createdAt DESC)` matches the actual feed query
  shape rather than indexing each column independently.
- Like counts and "did I like this" checks are done via Prisma `_count` / joined
  queries, not N+1 loops per post.

Not implemented, but the next steps at real scale: a Redis cache in front of the
feed query, read replicas, and moving image processing to a background queue.

## API

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/auth/register` | POST | — | |
| `/api/auth/login` | POST | — | |
| `/api/auth/logout` | POST | ✓ | |
| `/api/auth/me` | GET | ✓ | |
| `/api/posts` | GET | ✓ | `?cursor=` |
| `/api/posts` | POST | ✓ | |
| `/api/posts/[postId]/comments` | GET/POST | ✓ | |
| `/api/comments/[commentId]/replies` | POST | ✓ | |
| `/api/likes` | POST/DELETE | ✓ | `{ postId? , commentId? }` |
| `/api/likes` | GET | ✓ | who liked |
| `/api/upload` | POST | ✓ | signed Cloudinary upload |

## Known limitations

- Like toggling isn't wrapped in a transaction, so two near-simultaneous requests
  from the same user could theoretically race. Acceptable for this scope; a
  production version would wrap it in `$transaction` or catch the `P2002` unique
  violation.
- No rate limiting on login/register.
- No automated test suite beyond the integration smoke-test script (see Testing section).

## Tradeoffs

**Next.js route handlers over a separate Express backend** — one deployable,
shared types between client and API, no CORS config. Tradeoff: serverless cold
starts vs. a long-running Express process.

**Self-referencing `Comment` table over a separate `Reply` table** — less
duplicated logic for likes/authorship. Tradeoff: deeper nesting than 2 levels
would need a recursive query, not implemented here since the brief only requires
comments + one level of replies.
