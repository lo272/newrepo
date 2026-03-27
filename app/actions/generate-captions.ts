"use server";

export async function generateCaptions(formData: FormData) {
  const file = formData.get("image") as File | null;
  if (!file) return { error: "No image provided" };

  const body = new FormData();
  body.append("image", file);

  try {
    const res = await fetch("https://api.almostcrackd.ai", {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `API error ${res.status}: ${text}` };
    }

    const json = await res.json();
    return { captions: json };
  } catch (err: any) {
    return { error: err.message ?? "Unknown error" };
  }
}