import { NextResponse } from "next/server";
import { postAlmostCrackd } from "../../../utils/almostcrackd";
import { createSupabaseServerClient } from "../../../utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = body?.contentType;

  if (typeof contentType !== "string" || !contentType.trim()) {
    return NextResponse.json(
      { error: "contentType is required." },
      { status: 400 },
    );
  }

  const result = await postAlmostCrackd<{ presignedUrl: string; cdnUrl: string }>(
    "/pipeline/generate-presigned-url",
    { contentType },
    accessToken,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to generate presigned URL." },
      { status: result.status },
    );
  }

  if (!result.data?.presignedUrl || !result.data?.cdnUrl) {
    return NextResponse.json(
      { error: "Invalid response from caption API." },
      { status: 502 },
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
