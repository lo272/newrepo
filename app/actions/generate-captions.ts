"use server";

import { createSupabaseServerClient } from "../utils/supabase/server";

const API_BASE = "https://api.almostcrackd.ai";

export async function generateCaptions(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { error: "Not authenticated" };

  const file = formData.get("image") as File | null;
  if (!file) return { error: "No image provided" };

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!presignRes.ok) return { error: `Step 1 failed: ${await presignRes.text()}` };
  const { presignedUrl, cdnUrl } = await presignRes.json();

  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) return { error: `Step 2 failed: ${await uploadRes.text()}` };

  const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });
  if (!registerRes.ok) return { error: `Step 3 failed: ${await registerRes.text()}` };
  const { imageId } = await registerRes.json();

  const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageId }),
  });
  if (!captionRes.ok) return { error: `Step 4 failed: ${await captionRes.text()}` };
  const captions = await captionRes.json();

  return { captions };
}