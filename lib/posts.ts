import { prisma } from "@/lib/prisma";

interface GetFeedPostsOptions {
  userId: string;
  cursor?: string;
  limit?: number;
}

export async function getFeedPosts({
  userId,
  cursor,
  limit = 10,
}: GetFeedPostsOptions) {
  const posts = await prisma.post.findMany({
    take: limit + 1,

    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),

    where: {
      OR: [
        {
          visibility: "PUBLIC",
        },
        {
          authorId: userId,
        },
      ],
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },

      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (posts.length > limit) {
    nextCursor = posts[limit].id;
    posts.pop();
  }

  return {
    posts,
    nextCursor,
  };
}
