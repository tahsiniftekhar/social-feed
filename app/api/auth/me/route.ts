import { failure, success } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return failure("Unauthorized", 401);
  }

  return success(user);
}
