import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, failure } from "@/lib/api-response";
import { CreatePostSchema } from "@/lib/validators";
import { getFeedPosts } from "@/lib/posts";
import { FeedPost } from "@/types/post";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return failure("Unauthorized", 401);
    }

    const body = await req.json();

    const parsed = CreatePostSchema.safeParse(body);

    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, 400);
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl,
        imagePublicId: parsed.data.imagePublicId,
        visibility: parsed.data.visibility,
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

    const formattedPost: FeedPost = {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      imagePublicId: post.imagePublicId,
      visibility: post.visibility,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      likedByCurrentUser: false,
      _count: post._count,
    };

    return success(formattedPost, 201);
  } catch (error) {
    console.error(error);

    return failure("Internal Server Error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return failure("Unauthorized", 401);
    }

    const cursor =
      req.nextUrl.searchParams.get("cursor") ?? undefined;

    const feed = await getFeedPosts({
      userId: user.id,
      cursor,
    });

    return success(feed);
  } catch (error) {
    console.error(error);

    return failure("Internal Server Error", 500);
  }
}
