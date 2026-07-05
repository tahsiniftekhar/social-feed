import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import FeedClientPage from "@/components/feed/feed-client-page";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <FeedClientPage user={user} />;
}

