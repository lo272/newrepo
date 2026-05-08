"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitCaptionVote } from "../actions/caption-vote";
import { createSupabaseBrowserClient } from "../utils/supabase/browser";

const initialCaptionVoteState = {
  error: null as string | null,
  success: false,
};

type CaptionVoteFormProps = {
  captionId: string;
  isLoggedIn: boolean;
  initialVoteCount: number;
};

function SubmitButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { pending } = useFormStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}
      onMouseEnter={() => !isLoggedIn && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && !isLoggedIn && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#222",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: "nowrap",
          zIndex: 100,
          pointerEvents: "none",
        }}>
          Log in to vote
        </div>
      )}
      <button
        type="submit"
        name="vote"
        value="1"
        disabled={pending}
        style={{
          borderRadius: 999,
          border: "1px solid #2b2b2b",
          padding: "6px 14px",
          background: pending ? "#eee" : "#fff",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: !isLoggedIn ? 0.6 : 1,
        }}
      >
        Upvote
      </button>
      <button
        type="submit"
        name="vote"
        value="-1"
        disabled={pending}
        style={{
          borderRadius: 999,
          border: "1px solid #2b2b2b",
          padding: "6px 14px",
          background: pending ? "#eee" : "#fff",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: !isLoggedIn ? 0.6 : 1,
        }}
      >
        Downvote
      </button>
      {pending && <span style={{ fontSize: 12, color: "#666" }}>Submitting...</span>}
    </div>
  );
}

export default function CaptionVoteForm({ captionId, isLoggedIn, initialVoteCount }: CaptionVoteFormProps) {
  const [state, formAction] = useActionState(submitCaptionVote, initialCaptionVoteState);
  const [toast, setToast] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(initialVoteCount);

  useEffect(() => {
    if (state.success) {
      setToast("Vote submitted! ✓");
      setVoteCount((c) => c + 1);
    } else if (state.error) {
      setToast(state.error.includes("signed in") ? "Please log in to vote" : state.error);
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleNotLoggedIn() {
    setToast("Please log in to vote");
    const supabase = createSupabaseBrowserClient();
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", "/posts");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl.toString() },
    });
  }

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "#222",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 1000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}>
          {toast}
        </div>
      )}

      <form
        action={isLoggedIn ? formAction : handleNotLoggedIn}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <input type="hidden" name="captionId" value={captionId} />
        <SubmitButtons isLoggedIn={isLoggedIn} />
        <span style={{
          fontSize: 12,
          color: "#999",
          background: "#f0f0f0",
          borderRadius: 999,
          padding: "3px 10px",
        }}>
          {voteCount} {voteCount === 1 ? "vote" : "votes"}
        </span>
      </form>
    </div>
  );
}
