# Architecture & Decisions Documentation

This document records the architectural details, database models, technical decisions, and interview preparation indices for the **Authentication**, **Feed**, and **Comments/Likes** modules in this codebase.

---

## Feature Area 1: Authentication

### A. Current Implementation

#### User Authentication Lifecycle Tree
```text
User Flow
│
├── Register (/register)
│   │
│   ├── Validation: Zod RegisterSchema
│   │
│   ├── POST /api/auth/register
│   │   │
│   │   ├── Validate payload (Zod)
│   │   ├── Check existing email in Prisma
│   │   ├── Hash password via bcrypt (rounds = 12)
│   │   ├── Insert User record into Postgres
│   │   └── Return created user JSON (excluding passwordHash)
│   │
│   └── Redirect → /login
│
├── Login (/login)
│   │
│   ├── Validation: Zod LoginSchema
│   │
│   ├── POST /api/auth/login
│   │   │
│   │   ├── Validate payload (Zod)
│   │   ├── Find user by email in Prisma
│   │   ├── Verify password via bcrypt.compare
│   │   ├── Sign JWT with HS256 algorithm (expires in 7d)
│   │   ├── Set httpOnly, Secure, SameSite=Lax cookie ("auth_token")
│   │   └── Return authenticated user profile
│   │
│   └── Redirect → /feed
│
├── Every Protected Request
│   │
│   ├── Browser automatically includes "auth_token" cookie
│   │
│   ├── Middleware (middleware.ts)
│   │   │
│   │   ├── Read cookie ("auth_token")
│   │   ├── Verify JWT signature
│   │   ├── Valid session payload?
│   │   │     ├── Yes → Continue to page/API
│   │   │     └── No  → Redirect → /login
│   │   │
│   │   └── If authenticated and visiting /login or /register
│   │           └── Redirect → /feed
│   │
│   └── Route Handler (API Routes)
│       │
│       ├── getCurrentUser()
│       │   │
│       │   ├── getSession()
│       │   │   │
│       │   │   ├── Extract auth_token cookie
│       │   │   ├── Verify JWT signature
│       │   │   └── Return session payload (userId, email)
│       │   │
│       │   └── Query user record from Prisma by userId
│       │
│       └── Execute route logic
│
└── Logout
    │
    ├── POST /api/auth/logout
    │
    ├── Delete "auth_token" cookie via cookie store delete
    │
    └── Redirect → /login
```

- **Registration Flow**: Handles registration requests in `app/api/auth/register/route.ts`. The request body is validated using `RegisterSchema` from `lib/validators.ts`. It executes a unique email lookup check via `prisma.user.findUnique`. If the email is unique, the handler hashes the password using `hashPassword` from `lib/password.ts` (which wraps `bcrypt.hash` with a cost factor of 12) and creates the user record, returning HTTP status 201.
- **Login Flow**: Handled in `app/api/auth/login/route.ts`. Validates incoming email/password using `LoginSchema`. It retrieves the user profile, compares the hashes using `bcrypt.compare` via `verifyPassword` (line 9 of `lib/password.ts`), and signs a JSON Web Token (JWT) with algorithm HS256 via `createToken` in `lib/jwt.ts` (expiring in 7 days). The token is set in the `auth_token` cookie via the Next.js `cookies()` header store, using the configurations defined in `lib/cookies.ts`: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, and `maxAge: 60 * 60 * 24 * 7`.
- **Session Verification & `/api/auth/me`**: Fetches the active profile in `app/api/auth/me/route.ts` by calling `getCurrentUser()` from `lib/auth.ts`. This checks the session cookie using `getSession()` from `lib/session.ts` and validates the JWT payload with `verifyToken` from `lib/jwt.ts`. If verified, it runs a database query to select the user's `id`, `firstName`, `lastName`, and `email`.
- **Logout Flow**: Handled in `app/api/auth/logout/route.ts` which clears the cookie on the browser client by executing `cookieStore.delete("auth_token")` (line 9). It does not trigger any server-side invalidation or blacklist caching.
- **Middleware Guarding**: Guarding logic is defined in `middleware.ts`. The matcher config handles path interceptions for `/feed/:path*`, `/login`, and `/register`. If unauthenticated, it redirects the request to `/login`; if authenticated, it prevents access to the public login and register forms by redirecting requests to `/feed`. API routes (under `/api`) are not matched by the middleware and must be protected manually.
- **JWT Expiration & Tampering**: If a token has expired or is modified, the `jwtVerify` call in `lib/jwt.ts` throws an error, causing `verifyToken` to catch the exception and return `null` (line 50). This propagates to return a `401 Unauthorized` API failure payload.

### B. Key Decisions and Why
- **jose Cryptography vs jsonwebtoken**
  - *Chosen*: `jose` signature utility (`lib/jwt.ts`).
  - *Alternative*: `jsonwebtoken`.
  - *Trade-off*: `jsonwebtoken` relies on Node.js core libraries (like `crypto`) which are incompatible with Vercel edge runtimes. `jose` is built with Web Cryptography APIs, allowing signature validation directly at edge routes (inferred).
- **httpOnly Cookies vs LocalStorage**
  - *Chosen*: Storing JWTs inside `httpOnly` cookies (`lib/cookies.ts`).
  - *Alternative*: Browser `localStorage`.
  - *Trade-off*: LocalStorage is readable by any JS executing on the client, exposing sessions to XSS script theft. `httpOnly` blocks script reads, rendering token theft via malicious npm package dependency scripts impossible (inferred).
- **Stateless Verification**
  - *Chosen*: Stateless JWT token validation (`lib/session.ts`).
  - *Alternative*: Querying a session table in PostgreSQL for every request.
  - *Trade-off*: Avoids database read latency on every guarded page navigation or subrequest check.

### C. Known Gaps and Limitations
- **No Token Blacklisting**: Because logout only deletes the client-side cookie, a copy of the JWT token remains valid until its 7-day expiration time. An attacker who steals a token can use it until it naturally expires, even if the user logs out.
- **No Refresh Token Rotation**: The session has a fixed 7-day lifespan. There is no refresh token pipeline; users are forced to log in again after 7 days of inactivity.
- **CSRF Vulnerability**: Although cookies are set to `sameSite: "lax"` (mitigating CSRF on cross-site subrequests), there are no CSRF tokens configured on state-changing API endpoints, exposing the system to CSRF writes under certain cross-origin environments (inferred).
- **API Guarding**: Since the middleware matcher does not cover `/api/:path*`, API endpoints must check authentication manually. If a developer omits the `getCurrentUser` call in a new API route, it becomes public.

### D. Production-Scale Evolution
- **Database Bottleneck during token checks**: In `getCurrentUser()` (`lib/auth.ts`), every authenticated API call queries the `User` database table to select the profile. Under high-traffic loads (thousands of requests per second), this exhausts connection pool limits and hits database read scaling thresholds.
  - *Fix*: Cache authenticated user objects in Redis with a short TTL, or store the user profile directly in the signed JWT payload, removing the need for a database lookup for session profiles.
- **Token Revocation (Active Session Revocation)**: To resolve the inability to revoke tokens immediately on logout, store a hash of revoked tokens in a Redis cluster with an expiration matching the JWT lifespan. Check this blacklist in the auth layer.

### E. Questions I Should Be Able to Answer
1. How does the system prevent browser scripts from accessing the authentication token?
   - Answer index: Defined in the `authCookieOptions` config inside `lib/cookies.ts`.
2. What happens if a user submits a JWT that has been modified by one character?
   - Answer index: Handled in the catch block of `verifyToken` inside `lib/jwt.ts`.
3. Which routes are actively intercepted by Next.js middleware?
   - Answer index: Configured in the `matcher` array inside `middleware.ts`.
4. Is a user's session revoked on the database when they log out?
   - Answer index: Traced inside the POST handler in `app/api/auth/logout/route.ts`.
5. What password hashing algorithm is implemented and with what options?
   - Answer index: Configured via the `hashPassword` function inside `lib/password.ts`.
6. How are API routes protected from unauthenticated access?
   - Answer index: Managed by invoking `getCurrentUser()` inside each handler, e.g. `app/api/posts/route.ts`.
7. Where are incoming registration payload validations defined?
   - Answer index: Defined in `RegisterSchema` inside `lib/validators.ts` and validated in `app/api/auth/register/route.ts`.

---

## Feature Area 2: Feed

### A. Current Implementation

#### Feed Timeline & Creation Logic Tree
```text
Feed Page Load (/feed)
│
├── Server Component rendering (app/feed/page.tsx)
│   │
│   ├── getCurrentUser() → Validate caller authentication
│   └── getFeedPosts(userId, limit, cursor)
│       │
│       └── Query PostgreSQL via Prisma (Post.findMany)
│           ├── Filter: Post visibility is PUBLIC OR authorId = userId
│           ├── Sort: createdAt DESC
│           └── Include: author profile, active user likes, count aggregates
│
└── Client Component (components/feed/feed-client-page.tsx)
    └── Hydrate feed client lists & handle feed reactions state

Create Post Flow
│
├── User inputs content and selects file
├── Has image asset?
│     ├── Yes → POST /api/upload
│     │           ├── Validate file type (image/png, image/jpeg, etc.)
│     │           ├── Enforce file size limits (<= 5MB)
│     │           ├── Stream bytes to Cloudinary via upload_stream API
│     │           └── Return Cloudinary URL and public_id
│     └── No  → Skip upload pipeline
│
├── POST /api/posts
│   ├── Validate payload schema (Zod CreatePostSchema)
│   ├── Create Post record in Prisma
│   └── Return created Post details JSON
│
└── Prepend returned Post to Client state list

Cursor-based Pagination
│
├── Scroll trigger hits threshold on page bottom
├── GET /api/posts?cursor=last_loaded_post_id
│   ├── Apply query filters: skip: 1, cursor: { id: last_loaded_post_id }
│   └── Return post items + nextCursor
└── Append post array to Client state list
```

- **Query Structure**: Implemented in `lib/posts.ts` inside `getFeedPosts`. It queries PostgreSQL via:
  ```typescript
  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: {
      OR: [
        { visibility: "PUBLIC" },
        { authorId: userId }
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      likes: { where: { userId }, select: { id: true } },
      _count: { select: { comments: true, likes: true } }
    }
  });
  ```
- **Enforcing Visibility**: Enforced directly at the SQL query level in `lib/posts.ts` inside the `where` block of `prisma.post.findMany`. The application never pulls private posts for filtering in Node memory.
- **Post Creation & Media**: Handled in `app/api/posts/route.ts`. Validates request schemas using `CreatePostSchema` from `lib/validators.ts`. The client first uploads the raw image to `/api/upload` (which validates size/type and streams bytes to Cloudinary via `uploadToCloudinary` in `lib/upload.ts`). It then includes the returned `imageUrl` and `imagePublicId` in the request body sent to `/api/posts`.
- **Upload Failures & DB Sync**: Cloudinary upload occurs first. If the subsequent database call to `prisma.post.create` fails (due to validation or db issues), the image remains in Cloudinary as an orphan with no automated rollback to delete it. If Cloudinary upload fails, the client receives a 500 error from `/api/upload` and stops before sending the `/api/posts` request.
- **Pagination**: Employs cursor-based pagination using the `cursor` key in `getFeedPosts` (`lib/posts.ts`). It requests `limit + 1` posts. If the result count exceeds the limit, it pops the extra post, extracts its ID as `nextCursor`, and returns it to the client.
- **N+1 Queries**: Prevented by utilizing Prisma's `include` and `_count` structures inside the single query in `lib/posts.ts`. It loads the counts of comments and likes, and checks if the current user liked the post (`likes: { where: { userId } }`), inside the single query execution.

### B. Key Decisions and Why
- **Cursor-based Pagination vs Offset Pagination**
  - *Chosen*: Cursor-based pagination (`lib/posts.ts`).
  - *Alternative*: Offset-limit pagination.
  - *Trade-off*: Offset pagination requires scanning and skipping all preceding rows (`OFFSET 100000`), degrading query speeds as page depth increases. Cursor pagination uses index seeks to jump directly to the last-seen row, maintaining performance regardless of depth.
- **Prisma Joined Likes Check vs Loop Queries**
  - *Chosen*: Nested `likes` select filtering by `userId` inside the main query (`lib/posts.ts`).
  - *Alternative*: Fetching the feed posts first, then executing a separate database check for each post to see if the user liked it.
  - *Trade-off*: The loop alternative creates $N+1$ database queries (where $N$ is page size). The joined check runs in a single database operation.

### C. Known Gaps and Limitations
- **Cloudinary Image Orphaning**: If post creation fails after image upload, the uploaded file remains on Cloudinary. The application lacks garbage collection or rollback mechanisms to clean up these orphaned assets.
- **Lack of Feed Customization**: The feed simply shows all public posts and the user's private posts. There is no follower model or algorithmic timeline filtering.
- **No Image Optimization Config**: While `next.config.ts` includes `remotePatterns` for `picsum.photos` and `res.cloudinary.com`, Next.js `<Image />` tags in `PostCard` sometimes use `unoptimized` flags (e.g. in create-post card preview) or standard dimensions that don't crop images dynamically for mobile devices.

### D. Production-Scale Evolution
- **Cursor Performance under Index Fragmentation**: Although cursor pagination is efficient, index fragmentation on `createdAt` sort paths can slow down queries as write volume grows.
  - *Fix*: Create a composite index on `(visibility, id)` or partition the post table by creation date ranges (e.g. monthly) to keep active feed indexes memory-resident.
- **Media Upload Traffic spikes**: Uploading files through Next.js server endpoints (`/api/upload`) consumes server process buffers, memory, and bandwidth, blocking execution threads.
  - *Fix*: Provide clients with direct Cloudinary signed upload URLs. The browser uploads the asset directly to Cloudinary, sending only the resulting metadata to the Next.js API.

### E. Questions I Should Be Able to Answer
1. Where is post visibility checked?
   - Answer index: Enforced inside the `where` statement of `getFeedPosts` in `lib/posts.ts`.
2. How is pagination implemented?
   - Answer index: Traced in the pagination query config in `lib/posts.ts`.
3. What is the impact if the post creation API fails after the client has uploaded an image?
   - Answer index: Explained under image sync limits (no rollback is triggered after `app/api/upload/route.ts` succeeds).
4. How does the feed query check if the current user liked each post?
   - Answer index: Defined in the `likes` query filter inside `lib/posts.ts`.
5. What image formats are allowed for uploads?
   - Answer index: Listed in the `ALLOWED_TYPES` array inside `app/api/upload/route.ts`.
6. What is the maximum image size supported by the upload endpoint?
   - Answer index: Declared in the `MAX_SIZE` constant inside `app/api/upload/route.ts`.
7. How does the feed query sort posts?
   - Answer index: Enforced via `orderBy: { createdAt: "desc" }` in `lib/posts.ts`.

---

## Feature Area 3: Comments, Replies, Likes

### A. Current Implementation

#### Comments, Replies, and Likes Execution Tree
```text
Comments Flow
│
├── Load Comments Trigger (User clicks comment icon on PostCard)
│   │
│   ├── GET /api/posts/[postId]/comments
│   │   ├── Check parent post visibility (Forbidden 403 if private/unowned)
│   │   ├── Query database for root comments (parentCommentId: null)
│   │   ├── Include: Author, likes count, current user like status, child replies list
│   │   │     └── Reply includes: Author, likes count, current user like status
│   │   └── Return nested comments array JSON
│   │
│   └── Render CommentForm and CommentItem list (supporting 2 levels of nesting)
│
├── Add Comment
│   │
│   ├── POST /api/posts/[postId]/comments
│   │   ├── Validate comment content schema (Zod)
│   │   ├── Create Comment record in Prisma
│   │   └── Return created comment JSON
│   └── Prepend new comment to client list
│
└── Add Reply
    │
    ├── POST /api/comments/[commentId]/replies
    │   ├── Validate reply content schema (Zod)
    │   ├── Create Comment record linking parentCommentId
    │   └── Return created reply JSON
    └── Append new reply to parent comment replies list

Like Interactions Flow
│
├── User clicks Like on Post / Comment / Reply
│   │
│   ├── Optimistic UI Update: immediately toggle active color & increment/decrement count
│   │
│   ├── Trigger Request:
│   │     ├── Like   → POST /api/likes { postId } or { commentId }
│   │     └── Unlike → DELETE /api/likes { postId } or { commentId }
│   │
│   ├── Database checks composite constraints:
│   │     ├── Post Like: Unique user + postId composite index
│   │     └── Comment Like: Unique user + commentId composite index
│   │
│   └── Success?
│         ├── Yes → Action completed
│         └── No  → Catch database error, rollback Client states (revert counts)
│
└── Who Liked Modal
    │
    ├── User clicks reactions count label
    ├── GET /api/likes?postId=... or commentId=...
    │   ├── Query Likes table in Prisma
    │   ├── Select only user profiles: { id, firstName, lastName }
    │   └── Return profiles JSON
    └── Render WhoLikedModal overlay list
```

- **Comment/Reply Data Model**: Comments and replies are stored in the `Comment` model (`prisma/schema.prisma`). Replies are self-referencing rows linked via `parentCommentId`. Nesting depth is handled in `app/api/posts/[postId]/comments/route.ts` via a single query that selects parent comments (`parentCommentId: null`) and includes `replies` directly, capping the UI at two levels (comment and reply).
- **The Like Model**: Contains nullable fields `postId` and `commentId` to link to either posts or comments (`prisma/schema.prisma`). Unique constraints `userId_postId` and `userId_commentId` block duplicate likes. Note: There is **no** database-level `CHECK` constraint in the migration file to enforce that exactly one of `postId` or `commentId` is set; this condition is handled in the API layer.
- **Like Toggle Logic**: Handled in `app/api/likes/route.ts` using separate `findUnique` and `create`/`deleteMany` statements. It checks if a like exists; if it doesn't, it creates it; otherwise it deletes it. It is **not** wrapped in a transaction, leading to potential race conditions on fast concurrent requests.
- **Who Liked Query**: Handled in `GET /api/likes` in `app/api/likes/route.ts`. It takes a `postId` or `commentId` query parameter, checks permissions, and queries `prisma.like.findMany`, returning only the users' `id`, `firstName`, and `lastName`.
- **Cascade Delete**: Defined with `onDelete: Cascade` in `prisma/schema.prisma`. Deleting a post cascades to delete all comments and likes. Deleting a comment cascades to delete all child replies and associated likes.

### B. Key Decisions and Why
- **Nullable Foreign Keys for Likes**
  - *Chosen*: Storing likes in a single `Like` table using nullable `postId` and `commentId` columns (`prisma/schema.prisma`).
  - *Alternative*: Polymorphic fields like `targetType` and `targetId`.
  - *Trade-off*: Polymorphic target fields prevent database-level foreign key constraints. Nullable foreign keys allow relational database integrity, enabling `ON DELETE CASCADE` triggers (inferred).
- **Self-referencing Comment Schema**
  - *Chosen*: Reusing the `Comment` table for replies via `parentCommentId` (`prisma/schema.prisma`).
  - *Alternative*: Creating a separate `Reply` table.
  - *Trade-off*: Avoids duplicate code for likes, counts, and author relationships.

### C. Known Gaps and Limitations
- **Like Toggle Race Conditions**: Because `POST /api/likes` checks if a like exists before creating it without wrapping the queries in a database transaction, rapid concurrent clicks can bypass the application check. The second query will fail with a database unique violation error (`P2002`), returning a generic `500 Internal Server Error` to the client.
- **Missing DB-level CHECK Constraint**: The database schema does not have a `CHECK` constraint to guarantee exactly one of `postId` or `commentId` is set. An application bug or raw SQL query could insert a like pointing to both a post and a comment.
- **Comments Fetch Scaling**: `GET /api/posts/[postId]/comments` returns all parent comments and their replies in one response without pagination. If a post gets thousands of comments, this endpoint will slow down and consume significant memory.

### D. Production-Scale Evolution
- **Comment Fetch Latency**: Fetching all comments and replies for popular posts in a single unpaginated query will lead to timeout errors and DB memory issues.
  - *Fix*: Paginate comments using cursor-based pagination, and load replies dynamically only when the user clicks "View replies."
- **Like Counter write lock contention**: Real-time writes to the `Like` table for viral posts cause write locks on database rows, blocking other database queries.
  - *Fix*: Offload likes count updates to an in-memory database like Redis, and batch sync counts to PostgreSQL using background cron jobs.

### E. Questions I Should Be Able to Answer
1. How does the Comment schema support replies?
   - Answer index: Traced via the self-referencing relationship definition in `prisma/schema.prisma`.
2. Are comments paginated in the current API?
   - Answer index: Implemented without page bounds inside `app/api/posts/[postId]/comments/route.ts`.
3. What database fields are exposed in the "Who Liked" API response?
   - Answer index: Controlled via user select objects inside `app/api/likes/route.ts`.
4. What happens to comments when a post is deleted?
   - Answer index: Cascaded automatically via relational deletion triggers in `prisma/schema.prisma`.
5. Is the Like toggle logic wrapped in a transaction?
   - Answer index: Checked inside the POST handler in `app/api/likes/route.ts`.
6. How does the Like model prevent a user from liking a post multiple times?
   - Answer index: Managed by the `@@unique([userId, postId])` composite key inside `prisma/schema.prisma`.
7. How is exactly one of `postId` or `commentId` enforced in the Like API?
   - Answer index: Validated on parameter count checks in `app/api/likes/route.ts`.
