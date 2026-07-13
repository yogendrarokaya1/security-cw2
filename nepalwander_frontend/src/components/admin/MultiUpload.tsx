"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
}

export default function MultiImageUpload({
  values,
  onChange,
  folder = "nepalwander",
  label = "Additional Images",
  max = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (values.length + files.length > max) {
      setError(`Max ${max} images allowed.`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post(`/upload?folder=${folder}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(res.data.data.url);
      }
      onChange([...values, ...uploaded]);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Upload failed. Try again or paste a URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (values.length >= max) {
      setError(`Max ${max} images allowed.`);
      return;
    }
    onChange([...values, url]);
    setUrlInput("");
    setError("");
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
          {label}
          <span className="ml-1 font-normal" style={{ color: "var(--color-outline)" }}>
            ({values.length}/{max})
          </span>
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

      {/* File upload zone */}
      {mode === "file" && values.length < max && (
        <div
          className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            borderColor: "var(--color-outline-variant)",
            backgroundColor: "var(--color-surface-low)",
            minHeight: 80,
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs" style={{ color: "var(--color-outline)" }}>Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--color-outline)" }}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--color-outline)" }}>
                Click to select images (multiple)
              </p>
              <p className="text-xs" style={{ color: "var(--color-outline-variant)" }}>
                JPG, PNG, WebP — max 5MB each
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL input */}
      {mode === "url" && values.length < max && (
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="btn-primary shrink-0"
            style={{ height: 48, padding: "0 16px", fontSize: 13 }}
          >
            Add
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}

      {/* Image grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: 100 }}>
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                sizes="33vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                ✕
              </button>
              <div
                className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 font-medium"
                style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "white" }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {values.length === 0 && mode === "file" && !uploading && (
        <p className="text-xs" style={{ color: "var(--color-outline-variant)" }}>
          No images added yet.
        </p>
      )}
    </div>
  );
}