"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "nepalwander",
  label = "Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(`/upload?folder=${folder}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload response:", res.data);
      const url = res.data.data.url;
      console.log("✅ URL to set:", url);
      onChange(url);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Upload failed. Try again or paste a URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
          {label}
        </label>
        <div className="flex gap-1">
          {(["file", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="text-xs px-2 py-1 rounded font-medium transition-all"
              style={{
                backgroundColor: mode === m ? "var(--color-primary)" : "var(--color-surface-high)",
                color: mode === m ? "white" : "var(--color-outline)",
              }}
            >
              {m === "file" ? "📁 Upload" : "🔗 URL"}
            </button>
          ))}
        </div>
      </div>

      {/* File upload mode */}
      {mode === "file" && (
        <div
          className="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            borderColor: "var(--color-outline-variant)",
            backgroundColor: "var(--color-surface-low)",
            minHeight: 100,
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs" style={{ color: "var(--color-outline)" }}>Uploading to Cloudinary...</p>
            </div>
          ) : value ? (
            // Show preview inside the upload zone when file mode is active
            <div className="w-full h-full relative" style={{ minHeight: 100 }}>
              <p className="text-xs text-center pt-2 pb-1 font-medium" style={{ color: "var(--color-success)" }}>
                ✓ Image uploaded
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--color-outline)" }}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--color-outline)" }}>
                Click to select image
              </p>
              <p className="text-xs" style={{ color: "var(--color-outline-variant)" }}>
                JPG, PNG, WebP — max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <input
          className="input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
      )}

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}

      {/* Preview — always shown when value exists */}
      {value && (
        <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
          <Image
            src={value}
            alt="Preview"
            fill
            sizes="100vw"
            className="object-cover"
            onError={() => setError("Invalid image URL")}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}