"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="btn btn-danger d-inline-flex align-items-center justify-content-center gap-2"
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />
          <span>Logging out...</span>
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}
