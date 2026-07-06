import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, failure } from "@/lib/api-response";
import { z } from "zod";

const ReplySchema = z.object({
  content: z.string().trim().min(1, "Reply content is required").max(1000, "Reply is too long"),
});

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return failure("Unauthorized", 401);
    }

    const { commentId } = await params;

    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!parentComment) {
      return failure("Parent comment not found", 404);
    }

    if (parentComment.post.visibility === "PRIVATE" && parentComment.post.authorId !== user.id) {
      return failure("Parent comment not found", 404);
    }

    const body = await req.json();
    const parsed = ReplySchema.safeParse(body);
    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, 400);
    }

    const reply = await prisma.comment.create({
      data: {
        postId: parentComment.postId,
        parentCommentId: commentId,
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

    const formattedReply = {
      id: reply.id,
      postId: reply.postId,
      parentCommentId: reply.parentCommentId,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      author: reply.author,
      likedByCurrentUser: reply.likes.length > 0,
      likesCount: reply._count.likes,
      replies: [],
    };

    return success(formattedReply, 201);
  } catch (error) {
    console.error("POST reply failed:", error);
    return failure("Internal Server Error", 500);
  }
}
