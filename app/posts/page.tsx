import AuthButton from "../components/auth-button";
import CaptionVoteForm from "../components/caption-vote-form";
import ImageUploadForm from "../components/image-upload-form";
import { createSupabaseServerClient } from "../utils/supabase/server";

export default async function PostsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 48, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😂</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Caption Ratings</h1>
          <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
            Sign in to view AI-generated captions and vote on the funniest ones.
          </p>
          <AuthButton />
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("captions")
    .select("*, images(url)")
    .not("content", "is", null)
    .order("created_datetime_utc", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Caption Ratings</h1>
        <p style={{ color: "red" }}>Could not load captions: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>😂</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Caption Ratings</h1>
        </div>
        <AuthButton userEmail={user.email} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {/* Image upload + caption generation */}
        <ImageUploadForm />

        {/* Caption feed */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 16px" }}>
          Recent Captions
        </h2>

        {!data || data.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 48 }}>No captions found.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {data.map((row: any, idx: number) => {
              const captionText = typeof row.content === "string" ? row.content : null;
              const imageUrl = row.images?.url ?? null;
              const likeCount = row.like_count ?? 0;

              if (!captionText) return null;

              return (
                <div
                  key={row.id ?? idx}
                  style={{
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Image */}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Caption image"
                      style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
                    />
                  )}

                  <div style={{ padding: 16 }}>
                    {/* Caption text */}
                    <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.5, color: "#1a1a1a" }}>
                      "{captionText}"
                    </p>

                    {/* Footer row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#999" }}>
                        {likeCount > 0 ? `👍 ${likeCount}` : likeCount < 0 ? `👎 ${Math.abs(likeCount)}` : "No votes yet"}
                      </span>
                      {row.id && <CaptionVoteForm captionId={String(row.id)} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}