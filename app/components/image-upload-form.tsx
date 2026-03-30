"use client";

import { useState, useRef } from "react";
import { generateCaptions } from "../actions/generate-captions";

export default function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setCaptions([]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setCaptions([]);

    const fd = new FormData();
    fd.append("image", file);
    const result = await generateCaptions(fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCaptions(Array.isArray(result.captions) ? result.captions : []);
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <h2 style={{ marginTop: 0, fontSize: 16, fontWeight: 600 }}>Generate Captions from Image</h2>
      <form onSubmit={handleSubmit}>

        {/* File picker area */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed #ddd",
            borderRadius: 10,
            padding: "20px 16px",
            marginBottom: 12,
            cursor: "pointer",
            textAlign: "center",
            background: "#fafafa",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
          <p style={{ margin: 0, fontSize: 14, color: "#555", fontWeight: 500 }}>
            {fileName ? fileName : "Click to choose an image"}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#aaa" }}>
            JPEG, PNG, WEBP, GIF, HEIC supported
          </p>
        </div>

        {/* Hidden actual file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Image preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 8, marginBottom: 12, display: "block" }}
          />
        )}

        <button
          type="submit"
          disabled={loading || !preview}
          style={{
            width: "100%",
            padding: "10px 0",
            background: loading || !preview ? "#ccc" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading || !preview ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loading ? "Generating… (may take ~30s)" : "Generate Captions"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 12, fontSize: 13 }}>{error}</p>}

      {captions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#555" }}>Generated Captions:</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {captions.map((c, i) => (
              <li key={i} style={{ background: "#f5f5f5", borderRadius: 8, padding: "10px 14px", fontSize: 14 }}>
                {typeof c === "string" ? c : c.content ?? JSON.stringify(c)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}