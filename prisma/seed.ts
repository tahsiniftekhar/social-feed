import "dotenv/config";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Visibility, TargetType } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Fixed seed so the dataset is reproducible across runs / teammates
faker.seed(42);

const DEFAULT_PASSWORD = "Passw0rd!"; // same for every seeded user — for demo/login convenience only

async function main() {
  console.log("Clearing existing data...");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = await Promise.all(
    Array.from({ length: 8 }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.user.create({
        data: {
          firstName,
          lastName,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          passwordHash,
        },
      });
    })
  );

  console.log("Creating posts...");
  const posts = [];
  for (const author of users) {
    const postCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          authorId: author.id,
          content: faker.lorem.paragraph({ min: 1, max: 3 }),
          imageUrl: faker.datatype.boolean({ probability: 0.6 })
            ? faker.image.urlPicsumPhotos({ width: 800, height: 600 })
            : null,
          visibility: faker.datatype.boolean({ probability: 0.75 })
            ? Visibility.PUBLIC
            : Visibility.PRIVATE,
          createdAt: faker.date.recent({ days: 30 }),
        },
      });
      posts.push(post);
    }
  }

  console.log("Creating comments and replies...");
  const comments = [];
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

      // ~40% chance a comment gets 1-2 replies
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

  console.log("Creating likes (posts and comments/replies)...");
  const likeKeys = new Set<string>(); // tracks userId:targetType:targetId to avoid unique constraint violations
  const likeData: {
    userId: string;
    targetType: TargetType;
    targetId: string;
  }[] = [];

  function tryAddLike(userId: string, targetType: TargetType, targetId: string) {
    const key = `${userId}:${targetType}:${targetId}`;
    if (likeKeys.has(key)) return;
    likeKeys.add(key);
    likeData.push({ userId, targetType, targetId });
  }

  // Public posts get likes from a random subset of users; private posts only from the author (realistic — others can't see them anyway)
  for (const post of posts) {
    const eligibleLikers =
      post.visibility === Visibility.PUBLIC
        ? users
        : users.filter((u) => u.id === post.authorId);

    const likerCount = faker.number.int({
      min: 0,
      max: Math.min(5, eligibleLikers.length),
    });
    const likers = faker.helpers.arrayElements(eligibleLikers, likerCount);
    for (const liker of likers) {
      tryAddLike(liker.id, TargetType.POST, post.id);
    }
  }

  // Comments/replies get lighter like distribution
  for (const comment of comments) {
    const likerCount = faker.number.int({ min: 0, max: 3 });
    const likers = faker.helpers.arrayElements(users, likerCount);
    for (const liker of likers) {
      tryAddLike(liker.id, TargetType.COMMENT, comment.id);
    }
  }

  await prisma.like.createMany({ data: likeData });

  console.log("Seed complete:");
  console.log(`  Users: ${users.length}`);
  console.log(`  Posts: ${posts.length}`);
  console.log(`  Comments/Replies: ${comments.length}`);
  console.log(`  Likes: ${likeData.length}`);
  console.log(`\nAll seeded users share the password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
