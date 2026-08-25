"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ImageUpload({
  bucket = process.env.SUPABASE_STORAGE_BUCKET || "post-images",
  folder,
  value,
  onChange,
  label = "Cover image",
}: {
  bucket?: string;
  folder: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
        throw new Error("Only jpg / png / webp / gif allowed");
      }
      if (file.size > 5 * 1024 * 1024) throw new Error("Max size is 5 MB");

      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      {value && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-20 w-32 rounded-[var(--radius)] border border-line object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-semibold text-severe hover:underline"
          >
            Remove
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-[var(--radius)] bg-paper-deep px-4 py-2 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-60"
        >
          {uploading ? "Uploading…" : value ? "Replace image" : "Choose image"}
        </button>
      </div>
      {error && <p className="text-sm text-severe">{error}</p>}
    </div>
  );
}
