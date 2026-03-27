import AuthButton from "./components/auth-button";
import CaptionPipeline from "./components/caption-pipeline";
import { createSupabaseServerClient } from "./utils/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef4e8_0%,_#f6f0e7_38%,_#eef3f7_100%)] text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-slate-950">
            Caption Pipeline
          </h1>
          <AuthButton userEmail={user?.email} redirectPath="/" />
        </div>
        {user ? (
          <CaptionPipeline />
        ) : (
          <section className="grid gap-3 rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_30px_120px_-80px_rgba(15,23,42,0.35)]">
            <p className="text-base font-semibold text-slate-900">
              Sign in to access the caption pipeline.
            </p>
            <p>
              Use your Google account to upload an image and generate captions.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
