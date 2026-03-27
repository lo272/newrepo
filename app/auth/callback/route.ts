import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next");
  const redirectPath =
    nextPath && nextPath.startsWith("/") ? nextPath : "/posts";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
