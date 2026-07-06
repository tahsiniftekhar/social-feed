import { LikeUser } from "@/types/post";

export async function likePost(postId: string): Promise<{ liked: boolean }> {
  const response = await fetch("/api/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to like post");
  }
  return result.data;
}

export async function unlikePost(postId: string): Promise<{ liked: boolean }> {
  const response = await fetch("/api/likes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to unlike post");
  }
  return result.data;
}

export async function likeComment(commentId: string): Promise<{ liked: boolean }> {
  const response = await fetch("/api/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to like comment");
  }
  return result.data;
}

export async function unlikeComment(commentId: string): Promise<{ liked: boolean }> {
  const response = await fetch("/api/likes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to unlike comment");
  }
  return result.data;
}

export async function getWhoLiked(params: { postId?: string; commentId?: string }): Promise<LikeUser[]> {
  const query = params.postId ? `postId=${params.postId}` : `commentId=${params.commentId}`;
  const response = await fetch(`/api/likes?${query}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to get likes list");
  }
  return result.data;
}
