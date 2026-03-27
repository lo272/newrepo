"use server";

import { createSupabaseServerClient } from "../utils/supabase/server";

const API_BASE = "https://api.almostcrackd.ai";

export async function generateCaptions(formData: FormData) {
  // Get the user's JWT from Supabase
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

  // Step 1: Get presigned URL
  const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!presignRes.ok) return { error: `Step 1 failed: ${await presignRes.text()}` };
  const { presignedUrl, cdnUrl } = await presignRes.json();

  // Step 2: Upload image bytes to S3
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) return { error: `Step 2 failed: ${await uploadRes.text()}` };

  // Step 3: Register image URL
  const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });
  if (!registerRes.ok) return { error: `Step 3 failed: ${await registerRes.text()}` };
  const { imageId } = await registerRes.json();

  // Step 4: Generate captions
  const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageId }