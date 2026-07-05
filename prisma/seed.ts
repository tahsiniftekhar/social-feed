import "dotenv/config";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Visibility } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

faker.seed(42);

const DEFAULT_PASSWORD = "Passw0rd!";

async function main() {
  console.log("Clearing existing data...");

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = await Promise.all(
    Array.from({ length: 8 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return prisma.user.create({
        data: {
          firstName,
          lastName,
          email: faker.internet
            .email({ firstName, lastName })
            .toLowerCase(),
          passwordHash,
        },
      });
    })
  );

  console.log("Creating posts...");

  const posts: any[] = [];

  for (const author of users) {
    const postCount = faker.number.int({ min: 2, max: 4 });

    for (let i = 0; i < postCount; i++) {
      const hasImage = faker.datatype.boolean({ probability: 0.6 });
      const createdAt = faker.date.recent({ days: 30 });

      const post = await prisma.post.create({
        data: {
          authorId: author.id,
          content: faker.lorem.paragraph({ min: 1, max: 3 }),
          imageUrl: hasImage
            ? faker.image.urlPicsumPhotos({ width: 800, height: 600 })
            : null,
          imagePublicId: hasImage ? faker.string.uuid() : null,
          visibility: faker.datatype.boolean({ probability: 0.8 })
            ? Visibility.PUBLIC
            : Visibility.PRIVATE,
          createdAt,
        },
      });

      // synthetic engagement score (viral simulation)
      (post as any)._score =
        faker.number.float({ min: 0, max: 1 }) *
        (Date.now() - createdAt.getTime());

      posts.push(post);
    }
  }

  // Sort by "virality"
  posts.sort((a, b) => (b as any)._score - (a as any)._score);

  console.log("Creating comments...");

  const comments: any[] = [];

  for (const post of posts) {
    const commentCount = faker.number.int({ min: 0, max: 4 });

    for (let i = 0; i < commentCount; i++) {
      const commenter = faker.helpers.arrayElement(users);

      const comment = await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: commenter.id,
          content: faker.lorem.sentence({ min: 4, max: 15 }),
          createdAt: faker.date.recent({ days: 20 }),
        },
      });

      comments.push(comment);

      // replies
      if (faker.datatype.boolean({ probability: 0.4 })) {
        const replyCount = faker.number.int({ min: 1, max: 2 });

        for (let r = 0; r < replyCount; r++) {
          const replier = faker.helpers.arrayElement(users);

          const reply = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: replier.id,
              parentCommentId: comment.id,
              content: faker.lorem.sentence({ min: 3, max: 12 }),
              createdAt: faker.date.recent({ days: 15 }),
            },
          });

          comments.push(reply);
        }
      }
    }
  }

  console.log("Creating likes (realistic engagement)...");

  const likeData: {
    userId: string;
    postId?: string;
    commentId?: string;
  }[] = [];

  const likeSet = new Set<string>();

  const addLike = (userId: string, postId?: string, commentId?: string) => {
    const key = postId
      ? `p:${userId}:${postId}`
      : `c:${userId}:${commentId}`;

    if (likeSet.has(key)) return;

    likeSet.add(key);
    likeData.push({ userId, postId, commentId });
  };

  // Active users (simulate real-world behavior)
  const activeUsers = faker.helpers.arrayElements(users, 3);

  // POST likes (viral bias)
  for (const post of posts) {
    const score = (post as any)._score;

    const likeCount =
      score > 0.7
        ? faker.number.int({ min: 5, max: 12 })
        : score > 0.3
        ? faker.number.int({ min: 2, max: 6 })
        : faker.number.int({ min: 0, max: 3 });

    const eligible =
      post.visibility === Visibility.PUBLIC
        ? users
        : users.filter((u) => u.id === post.authorId);

    const likers = faker.helpers.arrayElements(eligible, likeCount);

    for (const user of likers) {
      addLike(user.id, post.id);
    }

    // active user boost
    for (const user of activeUsers) {
      if (faker.datatype.boolean(0.5)) {
        addLike(user.id, post.id);
      }
    }
  }

  // COMMENT likes
  for (const comment of comments) {
    const activity = faker.number.float({ min: 0, max: 1 });

    const likeCount =
      activity > 0.7
        ? faker.number.int({ min: 2, max: 5 })
        : activity > 0.3
        ? faker.number.int({ min: 1, max: 3 })
        : faker.number.int({ min: 0, max: 1 });

    const likers = faker.helpers.arrayElements(users, likeCount);

    for (const user of likers) {
      addLike(user.id, undefined, comment.id);
    }
  }

  await prisma.like.createMany({
    data: likeData,
  });

  console.log("\n✅ Seed completed successfully");
  console.log(`Users: ${users.length}`);
  console.log(`Posts: ${posts.length}`);
  console.log(`Comments: ${comments.length}`);
  console.log(`Likes: ${likeData.length}`);
  console.log(`Password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
