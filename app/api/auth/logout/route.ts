import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { success } from "@/lib/api-response";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);

  return success({
    message: "Logged out successfully",
  });
}
