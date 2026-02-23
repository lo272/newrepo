"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../utils/supabase/server";

type CaptionVoteState = {
  error: string | null;
  success: boolean;
};

export async function submitCaptionVote(
    _prevState: CaptionVoteState,
    formData: FormData,
): Promise<CaptionVoteState> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  if (!user) {
    return { error: "You must be signed in to vote.", success: false };
  }

  const captionId = formData.get("captionId");
  const voteValue = formData.get("vote");

  if (typeof captionId !== "string" || typeof voteValue !== "string") {
    return { error: "Missing vote information.", success: false };
  }

  const vote = Number(voteValue);

  if (!Number.isFinite(vote) || (vote !== 1 && vote !== -1)) {
    return { error: "Vote must be 1 or -1.", success: false };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("caption_votes").insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: vote,
    created_datetime_utc: now,
    modified_datetime_utc: now,
  });



  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/posts");

  return { error: null, success: true };
}
