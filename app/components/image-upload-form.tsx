"use client";

import { useState, useRef } from "react";
import { generateCaptions } from "../actions/generate-captions";

export default function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("image", file);

    const response = await generateCaptions(fd);

    setLoading(false);
    if (response.error) {
      setError(response.error);
    } else {
      setResult(response.captions);
    }
  }

  const captions: string[] = Array.isArray(result)
    ? result
    : result?.captions ?? result?.data ?? [];

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Generate Captions from Image</h2>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: 12 }}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, marginBottom: 12, display: "block" }}
          />
        )}
        <button
          type="submit"
          disabled={loading || !preview}
          style={{
            padding: "8px 20px",
            background: loading ? "#aaa" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "Generating…" : "Generate Captions"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>{error}</p>
      )}

      {captions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Generated Captions:</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {captions.map((c, i) => (
              <li
                key={i}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 14,
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && captions.length === 0 && (
        <pre style={{ marginTop: 12, fontSize: 12, background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}