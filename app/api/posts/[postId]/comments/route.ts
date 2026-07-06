import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, failure } from "@/lib/api-response";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content is required").max(1000, "Comment is too long"),
});

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    const { postId } = await params;

    // Fetch post to check visibility rules
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return failure("Post not found", 404);
    }

    if (post.visibility === "PRIVATE" && post.authorId !== user.id) {
      return failure("Access Denied", 403);
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
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
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: "asc",
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
                userId: user.id,
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
      likedByCurrentUser: comment.likes.length > 0,
      likesCount: comment._count.likes,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        postId: reply.postId,
        parentCommentId: reply.parentCommentId,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: reply.author,
        likedByCurrentUser: reply.likes.length > 0,
        likesCount: reply._count.likes,
        replies: [],
      })),
    }));

    return success(formattedComments);
  } catch (error) {
    console.error("GET comments failed:", error);
    return failure("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return failure("Post not found", 404);
    }

    if (post.visibility === "PRIVATE" && post.authorId !== user.id) {
      return failure("Access Denied", 403);
    }

    const body = await req.json();
    const parsed = CommentSchema.safeParse(body);
    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, 400);
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: parsed.data.content,
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
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    const formattedComment = {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
      likedByCurrentUser: comment.likes.length > 0,
      likesCount: comment._count.likes,
      replies: [],
    };

    return success(formattedComment, 201);
  } catch (error) {
    console.error("POST comment failed:", error);
    return failure("Internal Server Error", 500);
  }
}
