import { redirect } from "next/navigation";

import FeedClientPage from "@/components/feed/feed-client-page";

import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/posts";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { posts } = await getFeedPosts({
    userId: user.id,
  });

  return (
    <FeedClientPage
      user={user}
      initialPosts={posts}
    />
  );
}

