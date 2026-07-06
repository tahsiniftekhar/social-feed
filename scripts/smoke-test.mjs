// scripts/smoke-test.mjs
// Run: node scripts/smoke-test.mjs
// Set BASE_URL to your deployed URL or http://localhost:3000

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

// Minimal cookie jar per "user" so we can simulate two logged-in sessions
function makeClient() {
  let cookie = "";
  return {
    async request(path, options = {}) {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
          ...options.headers,
        },
      });
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) cookie = setCookie.split(";")[0];
      let body = null;
      try {
        body = await res.json();
      } catch {
        /* no body */
      }
      return { status: res.status, body };
    },
  };
}

function randomEmail() {
  return `smoketest_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

async function main() {
  console.log(`\nRunning smoke tests against ${BASE_URL}\n`);

  const userA = makeClient();
  const userB = makeClient();
  const emailA = randomEmail();
  const emailB = randomEmail();
  const password = "Passw0rd!";

  console.log("Auth");
  const regA = await userA.request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName: "Alice", lastName: "Test", email: emailA, password, confirmPassword: password, terms: true }),
  });
  assert(regA.status === 201 || regA.status === 200, "User A registers successfully");

  const dupA = await userA.request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName: "Alice", lastName: "Test", email: emailA, password, confirmPassword: password, terms: true }),
  });
  assert(dupA.status === 409 || dupA.status === 400, "Duplicate email registration is rejected");

  const regB = await userB.request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName: "Bob", lastName: "Test", email: emailB, password, confirmPassword: password, terms: true }),
  });
  assert(regB.status === 201 || regB.status === 200, "User B registers successfully");

  const loginA = await userA.request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: emailA, password }),
  });
  assert(loginA.status === 200, "User A logs in and receives a session cookie");

  const loginB = await userB.request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: emailB, password }),
  });
  assert(loginB.status === 200, "User B logs in and receives a session cookie");

  console.log("\nProtected routes");
  const anon = makeClient();
  const anonFeed = await anon.request("/api/posts");
  assert(anonFeed.status === 401, "Unauthenticated request to feed is rejected");

  console.log("\nPost visibility");
  const publicPost = await userA.request("/api/posts", {
    method: "POST",
    body: JSON.stringify({ content: "public post from A", visibility: "PUBLIC" }),
  });
  assert(publicPost.status === 201, "User A creates a public post");
  const publicPostId = publicPost.body?.data?.id || publicPost.body?.id;

  const privatePost = await userA.request("/api/posts", {
    method: "POST",
    body: JSON.stringify({ content: "private post from A", visibility: "PRIVATE" }),
  });
  assert(privatePost.status === 201, "User A creates a private post");
  const privatePostId = privatePost.body?.data?.id || privatePost.body?.id;

  const feedFromB = await userB.request("/api/posts");
  const postsList = feedFromB.body?.data?.posts ?? feedFromB.body?.posts ?? feedFromB.body ?? [];
  const feedIds = postsList.map((p) => p.id);
  assert(feedIds.includes(publicPostId), "User B's feed includes A's public post");
  assert(!feedIds.includes(privatePostId), "User B's feed excludes A's private post");

  const directAccess = await userB.request(`/api/posts/${privatePostId}`);
  assert(
    directAccess.status === 404,
    "User B directly requesting A's private post by ID gets 404, not the post"
  );

  console.log("\nLikes");
  const like1 = await userB.request("/api/likes", {
    method: "POST",
    body: JSON.stringify({ postId: publicPostId }),
  });
  assert(like1.status === 200 || like1.status === 201, "User B likes A's public post");

  const like2 = await userB.request("/api/likes", {
    method: "POST",
    body: JSON.stringify({ postId: publicPostId }),
  });
  assert(
    like2.status === 400,
    "Liking the same post again is rejected as a duplicate (400)"
  );

  const unlike = await userB.request("/api/likes", {
    method: "DELETE",
    body: JSON.stringify({ postId: publicPostId }),
  });
  assert(
    unlike.status === 200 && (unlike.body?.data?.liked === false || unlike.body?.liked === false),
    "User B unlikes A's public post successfully (DELETE /api/likes)"
  );

  const relike = await userB.request("/api/likes", {
    method: "POST",
    body: JSON.stringify({ postId: publicPostId }),
  });
  assert(relike.status === 200 || relike.status === 201, "User B re-likes A's public post successfully");

  const likeOnPrivate = await userB.request("/api/likes", {
    method: "POST",
    body: JSON.stringify({ postId: privatePostId }),
  });
  assert(
    likeOnPrivate.status === 404,
    "User B cannot like A's private post (404)"
  );

  console.log("\nComments");
  const comment = await userB.request(`/api/posts/${publicPostId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: "nice post" }),
  });
  assert(comment.status === 201 || comment.status === 200, "User B comments on A's public post");
  const commentId = comment.body?.data?.id || comment.body?.id;

  const reply = await userA.request(`/api/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content: "thanks!" }),
  });
  assert(reply.status === 201 || reply.status === 200, "User A replies to B's comment");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
