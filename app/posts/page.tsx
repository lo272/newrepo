import { supabase } from "../../lib/supabase";

export default async function PostsPage() {
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
            <h1>Sidechat Posts</h1>

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
