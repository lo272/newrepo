"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  initialCaptionVoteState,
  submitCaptionVote,
} from "../actions/caption-vote";

type CaptionVoteFormProps = {
  captionId: string;
};

function VoteButtons() {
  const { pending } = useFormStatus();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        }}
      >
        Downvote
      </button>
      {pending ? (
        <span style={{ fontSize: 12, color: "#666" }}>Submitting...</span>
      ) : null}
    </div>
  );
}

export default function CaptionVoteForm({ captionId }: CaptionVoteFormProps) {
  const [state, formAction] = useFormState(
    submitCaptionVote,
    initialCaptionVoteState,
  );

  return (
    <form action={formAction} style={{ display: "grid", gap: 6 }}>
      <input type="hidden" name="captionId" value={captionId} />
      <VoteButtons />
      {state.error ? (
        <p style={{ margin: 0, fontSize: 12, color: "#b42318" }}>
          {state.error}
        </p>
      ) : state.success ? (
        <p style={{ margin: 0, fontSize: 12, color: "#0f5132" }}>
          Vote recorded.
        </p>
      ) : null}
    </form>
  );
}
