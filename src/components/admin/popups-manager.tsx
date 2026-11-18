"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, ImageIcon, Search, X, Video, Loader2, Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { upsertPopup, deletePopup, togglePopupActive } from "@/app/(admin)/admin/(dashboard)/popups/actions";
import type { Popup, PopupPage, Property } from "@/lib/types";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

const PAGE_LABELS: Record<PopupPage, string> = {
  home: "Home",
  listings: "All Listings",
  property: "Property Pages",
  locations: "Location Pages",
  blog: "Blog",
  blog_post: "Blog Posts",
  about: "About",
  contact: "Contact",
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export function PopupsManager({ popups, properties }: { popups: Popup[]; properties: Property[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Popup | "new" | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <button
        onClick={() => setEditing("new")}
        className="mb-5 flex items-center gap-2 rounded-full bg-[#d0191f] px-4 py-2 text-sm font-semibold text-white"
      >
        <Plus size={15} /> Add Popup
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {popups.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {p.media_type === "video" && p.video_url ? (
                <video src={p.video_url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : p.image_url ? (
                <Image src={p.image_url} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-300">
                  <ImageIcon size={16} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{p.title}</p>
              <p className="truncate text-xs text-neutral-400">
                {p.property_id
                  ? `Only: ${p.property?.title ?? "one property"}`
                  : p.pages.length === 0
                    ? "All pages"
                    : p.pages.map((pg) => PAGE_LABELS[pg]).join(", ")}
                {p.starts_at || p.ends_at ? ` · ${p.starts_at ? new Date(p.starts_at).toLocaleDateString() : "…"} → ${p.ends_at ? new Date(p.ends_at).toLocaleDateString() : "…"}` : ""}
              </p>
            </div>
            <button
              onClick={() => startTransition(() => togglePopupActive(p.id, !p.is_active))}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {p.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
              {p.is_active ? "Active" : "Hidden"}
            </button>
            <button onClick={() => setEditing(p)} className="text-neutral-400 hover:text-neutral-700">
              <Pencil size={15} />
            </button>
            <button
              onClick={async () => { if (await confirm(`Delete "${p.title}"?`)) startTransition(async () => { await deletePopup(p.id); toast.success("Deleted"); }); }}
              className="text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {popups.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            No popups yet. Add one for a festival greeting or a limited-time offer.
          </p>
        )}
      </div>

      {editing && (
        <PopupForm popup={editing === "new" ? null : editing} properties={properties} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function PopupForm({
  popup,
  properties,
  onClose,
}: {
  popup: Popup | null;
  properties: Property[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(popup?.title ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(popup?.image_url ?? null);
  const [mediaType, setMediaType] = useState<"image" | "video">(popup?.media_type ?? "image");
  const [videoUrl, setVideoUrl] = useState<string | null>(popup?.video_url ?? null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState(popup?.target_url ?? "");
  const [isActive, setIsActive] = useState(popup?.is_active ?? true);
  const [startsAt, setStartsAt] = useState(toLocalInput(popup?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(popup?.ends_at ?? null));
  const [mode, setMode] = useState<"global" | "property">(popup?.property_id ? "property" : "global");
  const [propertyId, setPropertyId] = useState<string | null>(popup?.property_id ?? null);
  const [propertySearch, setPropertySearch] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const filteredProperties = properties.filter((p) => p.title.toLowerCase().includes(propertySearch.toLowerCase()));

  async function onVideoPicked(file: File) {
    setVideoError(null);
    if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) {
      setVideoError("Please choose an MP4, WebM or MOV video.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setVideoError("Video is larger than 25 MB — compress it (a 10–20 second clip at 720p is plenty) and try again.");
      return;
    }
    setUploadingVideo(true);
    try {
      setVideoUrl(await uploadFile(file, "popups"));
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await upsertPopup({
        id: popup?.id,
        title,
        image_url: mediaType === "image" ? imageUrl : null,
        media_type: mediaType,
        video_url: mediaType === "video" ? videoUrl : null,
        target_url: targetUrl,
        is_active: isActive,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        pages: mode === "property" ? (["property"] as PopupPage[]) : [],
        property_id: mode === "property" ? propertyId : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={popup ? "Edit Popup" : "New Popup"} onClose={onClose}>
      <div className="space-y-3">
        <FormField label="Title (internal label)">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Diwali Greetings" />
        </FormField>
        <FormField label="Popup media">
          <div className="mb-2 inline-flex rounded-full bg-neutral-100 p-1">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMediaType(t)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  mediaType === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                {t === "image" ? <ImageIcon size={13} /> : <Video size={13} />}
                {t === "image" ? "Image" : "Video"}
              </button>
            ))}
          </div>

          {mediaType === "image" ? (
            <>
              <ImageUploader value={imageUrl} onChange={setImageUrl} folder="popups" aspect="aspect-[4/5]" />
              <p className="mt-1 text-[11px] text-neutral-400">
                Portrait or landscape — it is shown in its own shape, edge to edge, over a blurred page. Crop it exactly as
                you want it to appear (no extra margins).
              </p>
            </>
          ) : (
            <>
              {videoUrl ? (
                <div className="space-y-2">
                  <video src={videoUrl} controls muted playsInline className="max-h-64 w-full rounded-xl bg-black" />
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove video
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 bg-neutral-50 py-8 text-center hover:border-black/20">
                  {uploadingVideo ? <Loader2 size={20} className="animate-spin text-neutral-400" /> : <Upload size={20} className="text-neutral-400" />}
                  <span className="text-sm font-medium text-neutral-600">{uploadingVideo ? "Uploading…" : "Choose a video file"}</span>
                  <span className="text-[11px] text-neutral-400">MP4 / WebM / MOV, up to 25 MB — portrait or landscape</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    disabled={uploadingVideo}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onVideoPicked(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {videoError && <p className="mt-1 text-xs text-red-600">{videoError}</p>}
              <p className="mt-1 text-[11px] text-neutral-400">Plays automatically (muted, looping) with controls to unmute or pause.</p>
            </>
          )}
        </FormField>
        <FormField label="Target URL (optional — opens when clicked)">
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className={inputClass}
            placeholder="/listings?type=villa or https://..."
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Starts (optional)">
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Ends (optional)">
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
          </FormField>
        </div>
        <FormField label="Where to show">
          <p className="-mt-1 mb-2 text-[11px] text-neutral-400">Global shows on every page, including property pages.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("global")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                mode === "global" ? "bg-[#d0191f] text-white" : "border border-black/10 text-neutral-600"
              }`}
            >
              Global (every page)
            </button>
            <button
              type="button"
              onClick={() => setMode("property")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                mode === "property" ? "bg-[#d0191f] text-white" : "border border-black/10 text-neutral-600"
              }`}
            >
              One specific property
            </button>
          </div>
        </FormField>

        {mode === "property" && (
          <FormField label="Property">
            {selectedProperty ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#d0191f]/30 bg-[#d0191f]/5 px-3 py-2 text-sm text-[#d0191f]">
                <span className="min-w-0 flex-1 truncate">{selectedProperty.title}</span>
                <button type="button" onClick={() => setPropertyId(null)} className="shrink-0 text-neutral-400 hover:text-red-600">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2">
                  <Search size={14} className="shrink-0 text-neutral-400" />
                  <input
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    placeholder="Search properties…"
                    className="w-full text-sm outline-none"
                  />
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-black/5 p-1.5">
                  {filteredProperties.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPropertyId(p.id)}
                      className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <span className="truncate">{p.title}</span>
                    </button>
                  ))}
                  {filteredProperties.length === 0 && <p className="px-2.5 py-2 text-xs text-neutral-400">No properties found.</p>}
                </div>
              </div>
            )}
          </FormField>
        )}

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
        <button
          onClick={save}
          disabled={saving || !title}
          className="w-full rounded-full bg-[#d0191f] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Popup"}
        </button>
      </div>
    </Modal>
  );
}
