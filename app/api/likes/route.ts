import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, failure } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId") || undefined;
    const commentId = searchParams.get("commentId") || undefined;

    if ((!postId && !commentId) || (postId && commentId)) {
      return failure("Provide exactly one of postId or commentId", 400);
    }

    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return failure("Post not found", 404);
      }

      if (post.visibility === "PRIVATE" && post.authorId !== user.id) {
        return failure("Access Denied", 403);
      }

      const likes = await prisma.like.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return success(likes.map((l) => l.user));
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: true },
      });

      if (!comment) {
        return failure("Comment not found", 404);
      }

      if (comment.post.visibility === "PRIVATE" && comment.post.authorId !== user.id) {
        return failure("Access Denied", 403);
      }

      const likes = await prisma.like.findMany({
        where: { commentId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return success(likes.map((l) => l.user));
    }
  } catch (error) {
    console.error("GET likes failed:", error);
    return failure("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    const body = await req.json();
    const postId = body.postId || undefined;
    const commentId = body.commentId || undefined;

    if ((!postId && !commentId) || (postId && commentId)) {
      return failure("Provide exactly one of postId or commentId", 400);
    }

    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return failure("Post not found", 404);
      }

      if (post.visibility === "PRIVATE" && post.authorId !== user.id) {
        return failure("Access Denied", 403);
      }

      const existing = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      });

      if (existing) {
        return failure("Already liked", 400);
      }

      await prisma.like.create({
        data: {
          userId: user.id,
          postId,
        },
      });
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: true },
      });

      if (!comment) {
        return failure("Comment not found", 404);
      }

      if (comment.post.visibility === "PRIVATE" && comment.post.authorId !== user.id) {
        return failure("Access Denied", 403);
      }

      const existing = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId,
          },
        },
      });

      if (existing) {
        return failure("Already liked", 400);
      }

      await prisma.like.create({
        data: {
          userId: user.id,
          commentId,
        },
      });
    }

    return success({ liked: true });
  } catch (error) {
    console.error("POST like failed:", error);
    return failure("Internal Server Error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    let postId: string | undefined = undefined;
    let commentId: string | undefined = undefined;

    try {
      const body = await req.json();
      postId = body.postId || undefined;
      commentId = body.commentId || undefined;
    } catch {
      const { searchParams } = new URL(req.url);
      postId = searchParams.get("postId") || undefined;
      commentId = searchParams.get("commentId") || undefined;
    }

    if ((!postId && !commentId) || (postId && commentId)) {
      return failure("Provide exactly one of postId or commentId", 400);
    }

    if (postId) {
      await prisma.like.deleteMany({
        where: {
          userId: user.id,
          postId,
        },
      });
    } else {
      await prisma.like.deleteMany({
        where: {
          userId: user.id,
          commentId,
        },
      });
    }

    return success({ liked: false });
  } catch (error) {
    console.error("DELETE like failed:", error);
    return failure("Internal Server Error", 500);
  }
}
