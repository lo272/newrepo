"use client";

import { useEffect, useState } from "react";

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

const TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
};

type CaptionRecord = Record<string, unknown> | string;

type Phase = "idle" | "presign" | "upload" | "register" | "captions" | "done";

function normalizeContentType(file: File) {
  if (file.type) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) {
    return "";
  }

  return TYPE_BY_EXTENSION[extension] ?? "";
}

function extractCaption(item: CaptionRecord) {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const candidates = [
      record.caption,
      record.text,
      record.generated_caption,
      record.generatedCaption,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  }

  return null;
}

async function readErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) {
    return "Unexpected response from the server.";
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed?.error && typeof parsed.error === "string") {
      return parsed.error;
    }
    if (parsed?.message && typeof parsed.message === "string") {
      return parsed.message;
    }
    return text;
  } catch {
    return text;
  }
}

export default function CaptionPipeline() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionRecord[] | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const canSubmit =
    Boolean(file) &&
    phase !== "upload" &&
    phase !== "presign" &&
    phase !== "register" &&
    phase !== "captions";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
    setPhase("idle");
    setCaptions(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Choose an image file to upload.");
      return;
    }

    const contentType = normalizeContentType(file);
    if (!contentType || !SUPPORTED_TYPES.includes(contentType)) {
      setError(
        "Unsupported file type. Use JPEG, PNG, WEBP, GIF, or HEIC images.",
      );
      return;
    }

    setError(null);
    setCaptions(null);

    try {
      setPhase("presign");
      const presignResponse = await fetch("/api/pipeline/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType }),
      });

      if (!presignResponse.ok) {
        const message = await readErrorMessage(presignResponse);
        throw new Error(message || "Failed to generate upload URL.");
      }

      const presignData = (await presignResponse.json()) as {
        presignedUrl: string;
        cdnUrl: string;
      };

      if (!presignData?.presignedUrl || !presignData?.cdnUrl) {
        throw new Error("Missing presigned upload details from the server.");
      }

      setPhase("upload");
      const uploadResponse = await fetch(presignData.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed. Please try again.");
      }

      setPhase("register");
      const registerResponse = await fetch("/api/pipeline/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: presignData.cdnUrl,
          isCommonUse: false,
        }),
      });

      if (!registerResponse.ok) {
        const message = await readErrorMessage(registerResponse);
        throw new Error(message || "Failed to register the uploaded image.");
      }

      const registerData = (await registerResponse.json()) as {
        imageId: string;
      };

      if (!registerData?.imageId) {
        throw new Error("Missing image id from the server.");
      }

      setPhase("captions");
      const captionsResponse = await fetch("/api/pipeline/captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: registerData.imageId }),
      });

      if (!captionsResponse.ok) {
        const message = await readErrorMessage(captionsResponse);
        throw new Error(message || "Failed to generate captions.");
      }

      const captionsData = (await captionsResponse.json()) as CaptionRecord[];
      setCaptions(Array.isArray(captionsData) ? captionsData : []);
      setPhase("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setPhase("idle");
    }
  };

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_30px_120px_-80px_rgba(15,23,42,0.35)]">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Image file</span>
          <input
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          {file ? (
            <span className="text-xs text-slate-500">Selected: {file.name}</span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {phase === "idle" || phase === "done" ? "Upload & Generate" : "Working..."}
        </button>

        {phase !== "idle" && phase !== "done" ? (
          <p className="text-xs text-slate-500">Processing image...</p>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </form>

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <img src={previewUrl} alt="Uploaded preview" className="h-56 w-full object-cover" />
        </div>
      ) : null}

      <div className="grid gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Generated captions</h2>
        {captions && captions.length > 0 ? (
          <div className="grid gap-3">
            {captions.map((caption, index) => {
              const text = extractCaption(caption);
              return (
                <div
                  key={`${index}-${text ?? "caption"}`}
                  className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  {text ? (
                    <p className="leading-relaxed">{text}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs text-slate-500">
                      {JSON.stringify(caption, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-500">
            Captions will appear here once generation finishes.
          </p>
        )}
      </div>
    </section>
  );
}
