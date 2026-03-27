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
  const imageId = body?.imageId;

  if (typeof imageId !== "string" || !imageId.trim()) {
    return NextResponse.json(
      { error: "imageId is required." },
      { status: 400 },
    );
  }

  const result = await postAlmostCrackd<unknown[]>(
    "/pipeline/generate-captions",
    { imageId },
    accessToken,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to generate captions." },
      { status: result.status },
    );
  }

  if (!Array.isArray(result.data)) {
    return NextResponse.json(
      { error: "Invalid response from caption API." },
      { status: 502 },
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
