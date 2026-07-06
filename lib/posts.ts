import { prisma } from "@/lib/prisma";
import { FeedPost } from "@/types/post";

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

      likes: {
        where: {
          userId,
        },
        select: {
          id: true,
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

  const mappedPosts: FeedPost[] = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    imagePublicId: post.imagePublicId,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likedByCurrentUser: post.likes.length > 0,
    _count: post._count,
  }));

  return {
    posts: mappedPosts,
    nextCursor,
  };
}

