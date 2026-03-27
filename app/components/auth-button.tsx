"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../utils/supabase/browser";

type AuthButtonProps = {
  userEmail?: string | null;
  redirectPath?: string;
};

export default function AuthButton({ userEmail, redirectPath }: AuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleSignIn = async () => {
    setIsLoading(true);
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    if (redirectPath && redirectPath.startsWith("/")) {
      redirectUrl.searchParams.set("next", redirectPath);
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.refresh();
    setIsLoading(false);
  };

  if (userEmail) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, color: "#555" }}>{userEmail}</span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoading}
          style={{
            borderRadius: 999,
            border: "1px solid #222",
            padding: "8px 16px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {isLoading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      style={{
        borderRadius: 999,
        border: "1px solid #222",
        padding: "10px 18px",
        background: "#111",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {isLoading ? "Redirecting..." : "Sign in with Google"}
    </button>
  );
}
