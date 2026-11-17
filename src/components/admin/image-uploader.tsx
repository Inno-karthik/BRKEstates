"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X, RefreshCw } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

export function ImageUploader({
  value,
  onChange,
  folder,
  className,
  aspect = "aspect-video",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  className?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-neutral-50 transition-colors",
          aspect,
          dragOver ? "border-[#7f1d1d] bg-[#7f1d1d]/5" : "border-black/10"
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow"
                title="Replace"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-2 p-6 text-neutral-400 transition hover:text-[#7f1d1d]"
          >
            {uploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                <ImagePlus size={18} />
              </span>
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading…" : "Drop an image, or click to browse"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
