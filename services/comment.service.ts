import { FeedComment } from "@/types/post";

export async function getComments(postId: string): Promise<FeedComment[]> {
  const response = await fetch(`/api/posts/${postId}/comments`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch comments");
  }
  return result.data;
}

export async function createComment(postId: string, content: string): Promise<FeedComment> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create comment");
  }
  return result.data;
}

export async function createReply(commentId: string, content: string): Promise<FeedComment> {
  const response = await fetch(`/api/comments/${commentId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create reply");
  }
  return result.data;
}
