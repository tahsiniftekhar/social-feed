import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/auth/logout-button";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">

              <h2 className="mb-3">
                Welcome, {user.firstName} 👋
              </h2>

              <p className="mb-1">
                <strong>Name:</strong>{" "}
                {user.firstName} {user.lastName}
              </p>

              <p className="mb-4">
                <strong>Email:</strong>{" "}
                {user.email}
              </p>

              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
