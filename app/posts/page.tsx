import AuthButton from "../components/auth-button";
import { createSupabaseServerClient } from "../utils/supabase/server";

export default async function PostsPage() {
    const supabase = createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;

    if (!user) {
        return (
            <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
                <h1>Sidechat Posts</h1>
                <p style={{ color: "#444", lineHeight: 1.6 }}>
                    This page is gated. Sign in with Google to view the latest posts.
                </p>
                <div style={{ marginTop: 16 }}>
                    <AuthButton />
                </div>
            </main>
        );
    }

    const { data, error } = await supabase
        .from("sidechat_posts")
        .select("*")
        .limit(50);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Sidechat Posts</h1>
                <p>Could not load posts.</p>
                <pre>{error.message}</pre>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <h1>Sidechat Posts</h1>
                <AuthButton userEmail={user.email} />
            </div>

            {!data || data.length === 0 ? (
                <p>No posts found.</p>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {data.map((row: any, idx: number) => (
                        <div
                            key={row.id ?? idx}
                            style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}
                        >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(row, null, 2)}
              </pre>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}


//
