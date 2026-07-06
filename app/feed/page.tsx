import { redirect } from "next/navigation";

import FeedClientPage from "@/components/feed/feed-client-page";

import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/posts";
import { FeedPost } from "@/types/post";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { posts } = await getFeedPosts({
    userId: user.id,
  });

  const serializedPosts: FeedPost[] = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    imagePublicId: post.imagePublicId,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    _count: post._count,
  }));

  return (
    <FeedClientPage
      user={user}
      initialPosts={serializedPosts}
    />
  );
}

