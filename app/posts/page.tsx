import AuthButton from "../components/auth-button";
import CaptionVoteForm from "../components/caption-vote-form";
import { createSupabaseServerClient } from "../utils/supabase/server";

export default async function PostsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;

    if (!user) {
        return (
            <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
                <h1>Caption Ratings</h1>
                <p style={{ color: "#444", lineHeight: 1.6 }}>
                    Sign in with Google to view captions and submit votes.
                </p>
                <div style={{ marginTop: 16 }}>
                    <AuthButton />
                </div>
            </main>
        );
    }

    const { data, error } = await supabase
        .from("captions")
        .select("*")
        .limit(50);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Caption Ratings</h1>
                <p>Could not load captions.</p>
                <pre>{error.message}</pre>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <h1>Caption Ratings</h1>
                <AuthButton userEmail={user.email} />
            </div>

            {!data || data.length === 0 ? (
                <p>No captions found.</p>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {data.map((row: any, idx: number) => {
                        const captionId = row.id;
                        const captionText =
                            typeof row.caption === "string" ? row.caption : null;

                        return (
                            <div
                                key={row.id ?? idx}
                                style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}
                            >
                                {captionText ? (
                                    <p style={{ marginTop: 0, fontSize: 16 }}>{captionText}</p>
                                ) : (
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                        {JSON.stringify(row, null, 2)}
                                    </pre>
                                )}
                                {captionId ? (
                                    <div style={{ marginTop: 12 }}>
                                        <CaptionVoteForm captionId={String(captionId)} />
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                                        Missing caption id.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
