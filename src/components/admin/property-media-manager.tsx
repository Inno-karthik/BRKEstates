"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, FileText, X, Star, Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";
import {
  addPropertyImage,
  deletePropertyImage,
  setCoverImage,
  setPropertyBrochure,
} from "@/app/(admin)/admin/(dashboard)/properties/actions";
import { cn } from "@/lib/utils";
import type { ImageKind } from "@/lib/types";

type Img = { id: string; url: string; sort_order: number; kind: ImageKind };

const KIND_TABS: { key: ImageKind; label: string }[] = [
  { key: "photo", label: "Photos" },
  { key: "floor_plan", label: "Floor Plans" },
  { key: "render", label: "Renders" },
];

export function PropertyMediaManager({
  propertyId,
  images,
  coverImage,
  onSetCover,
  brochureUrl,
}: {
  propertyId: string;
  images: Img[];
  coverImage: string | null;
  onSetCover: (url: string | null) => void;
  brochureUrl?: string;
}) {
  const [kind, setKind] = useState<ImageKind>("photo");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function handleFiles(files: FileList | File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, `properties/${propertyId}`);
        await addPropertyImage(propertyId, url, kind);
        if (!coverImage && kind === "photo") {
          onSetCover(url);
          await setCoverImage(propertyId, url);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleBrochure(file: File) {
    setUploadingBrochure(true);
    setError(null);
    try {
      const url = await uploadFile(file, `properties/${propertyId}/brochure`);
      await setPropertyBrochure(propertyId, url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingBrochure(false);
    }
  }

  const byKind = {
    photo: images.filter((i) => i.kind === "photo"),
    floor_plan: images.filter((i) => i.kind === "floor_plan"),
    render: images.filter((i) => i.kind === "render"),
  };
  const activeImages = byKind[kind];

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Media</h2>

      <div className="mb-4 inline-flex rounded-full bg-neutral-100 p-1">
        {KIND_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setKind(t.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              kind === t.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
            )}
          >
            {t.label} {byKind[t.key].length > 0 && <span className="text-neutral-400">({byKind[t.key].length})</span>}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 text-center transition-colors",
          dragOver ? "border-[#1b5e3a] bg-[#1b5e3a]/5" : "border-black/10 bg-neutral-50 hover:border-black/20"
        )}
      >
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-neutral-400" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <ImagePlus size={18} className="text-neutral-400" />
          </span>
        )}
        <p className="text-sm font-medium text-neutral-600">
          {uploading ? "Uploading…" : `Drop ${KIND_TABS.find((t) => t.key === kind)?.label.toLowerCase()} here, or click to browse`}
        </p>
        <p className="text-xs text-neutral-400">You can select multiple files at once</p>
        <p className="text-[11px] text-neutral-300">Recommended: at least 1600×1200px, landscape (4:3) works best</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {activeImages.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
          {activeImages.map((img) => (
            <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
              <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <div className="flex justify-end gap-1">
                  {img.kind === "photo" && (
                    <button
                      onClick={() => {
                        onSetCover(img.url);
                        startTransition(() => setCoverImage(propertyId, img.url));
                      }}
                      title="Set as cover"
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full bg-white/90",
                        coverImage === img.url && "bg-amber-400"
                      )}
                    >
                      <Star size={12} className={coverImage === img.url ? "fill-white text-white" : "text-neutral-600"} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      startTransition(() => {
                        deletePropertyImage(img.id, img.url, propertyId);
                        if (coverImage === img.url) onSetCover(null);
                      })
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {coverImage === img.url && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-semibold text-white shadow">
                  <Star size={9} className="fill-white" /> Cover
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-neutral-400">
          No {KIND_TABS.find((t) => t.key === kind)?.label.toLowerCase()} yet.
        </p>
      )}

      <div className="mt-6 border-t border-black/5 pt-5">
        <p className="mb-2 text-xs font-medium text-neutral-500">Brochure PDF (for the flipbook viewer)</p>
        {brochureUrl ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-black/10 bg-neutral-50 px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1b5e3a]/10 text-[#1b5e3a]">
              <FileText size={15} />
            </span>
            <a href={brochureUrl} target="_blank" rel="noreferrer" className="flex-1 truncate text-sm text-[#1b5e3a] hover:underline">
              {brochureUrl.split("/").pop()}
            </a>
            <button
              onClick={() => startTransition(() => setPropertyBrochure(propertyId, null))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => brochureInputRef.current?.click()}
            disabled={uploadingBrochure}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 py-4 text-xs font-medium text-neutral-500 transition hover:border-black/20 disabled:opacity-50"
          >
            {uploadingBrochure ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload PDF Brochure
          </button>
        )}
        <input
          ref={brochureInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleBrochure(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
