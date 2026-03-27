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
  const imageUrl = body?.imageUrl;
  const isCommonUse = body?.isCommonUse ?? false;

  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return NextResponse.json(
      { error: "imageUrl is required." },
      { status: 400 },
    );
  }

  const result = await postAlmostCrackd<{ imageId: string }>(
    "/pipeline/upload-image-from-url",
    {
      imageUrl,
      isCommonUse: Boolean(isCommonUse),
    },
    accessToken,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to register image." },
      { status: result.status },
    );
  }

  if (!result.data?.imageId) {
    return NextResponse.json(
      { error: "Invalid response from caption API." },
      { status: 502 },
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
