import { FeedPost, FeedResponse } from "@/types/post";

export interface CreatePostPayload {
  content: string;

  imageUrl?: string;

  imagePublicId?: string;

  visibility: "PUBLIC" | "PRIVATE";
}

export async function createPost(
  payload: CreatePostPayload
): Promise<FeedPost> {
  const response = await fetch("/api/posts", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function getPosts(): Promise<FeedResponse> {
  const response = await fetch("/api/posts", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result.data;
}
