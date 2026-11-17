"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Languages, Loader2, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormField, inputClass } from "@/components/admin/modal";
import { upsertBlogPost, translateBlogFields } from "@/app/(admin)/admin/(dashboard)/blog/actions";
import type { BlogPost } from "@/lib/types";

export function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(post?.cover_image ?? null);
  const [gallery, setGallery] = useState<{ url: string; caption: string | null }[]>(post?.gallery_images ?? []);
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [tagsText, setTagsText] = useState(post?.tags.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [teTitle, setTeTitle] = useState(post?.translations?.te?.title ?? "");
  const [teContent, setTeContent] = useState(post?.translations?.te?.content ?? "");
  const [hiTitle, setHiTitle] = useState(post?.translations?.hi?.title ?? "");
  const [hiContent, setHiContent] = useState(post?.translations?.hi?.content ?? "");
  const [translationTab, setTranslationTab] = useState<"te" | "hi">("te");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function autoTranslate(lang: "te" | "hi") {
    if (!title.trim() && !content.trim()) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const result = await translateBlogFields(title, content, lang);
      if (!result.ok) {
        setTranslateError(result.error);
        return;
      }
      if (lang === "te") {
        setTeTitle(result.title);
        setTeContent(result.content);
      } else {
        setHiTitle(result.title);
        setHiContent(result.content);
      }
    } catch (e) {
      setTranslateError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  function addGalleryImage(url: string) {
    setGallery((prev) => [...prev, { url, caption: null }]);
  }
  function updateGalleryCaption(index: number, caption: string) {
    setGallery((prev) => prev.map((g, i) => (i === index ? { ...g, caption: caption || null } : g)));
  }
  function removeGalleryImage(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await upsertBlogPost({
        id: post?.id,
        title,
        slug,
        excerpt,
        content,
        cover_image: coverImage,
        status,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        meta_title: metaTitle,
        meta_description: metaDescription,
        gallery_images: gallery,
        translations: {
          ...(teTitle.trim() || teContent.trim() ? { te: { title: teTitle, content: teContent } } : {}),
          ...(hiTitle.trim() || hiContent.trim() ? { hi: { title: hiTitle, content: hiContent } } : {}),
        },
      });
    } catch (e) {
      const digest = (e as { digest?: string })?.digest;
      if (digest?.startsWith("NEXT_REDIRECT")) throw e;
      setError(e instanceof Error ? e.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 space-y-4 pb-16 lg:max-w-3xl">
      <FormField label="Title">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!post) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
          }}
          className={inputClass}
          placeholder="e.g. 5 Things to Check Before Buying a Plot"
        />
      </FormField>
      <FormField label="URL Slug">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label="Excerpt (shown in listings)">
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} />
      </FormField>
      <FormField label="Cover Image">
        <ImageUploader value={coverImage} onChange={setCoverImage} folder="blog" aspect="aspect-[16/10]" />
        <p className="mt-1 text-[11px] text-neutral-400">Recommended: 1200×750px (16:10) — shown on the blog list card</p>
      </FormField>
      <FormField label="Content">
        <RichTextEditor value={content} onChange={setContent} allowImages uploadFolder="blog-content" />
      </FormField>

      <FormField label="Gallery (optional)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          Add extra photos here and the post displays them as a styled gallery at the end, separate from images
          placed inline in the content above.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((g, i) => (
            <div key={i} className="space-y-1.5">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-black/10 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <X size={13} />
                </button>
              </div>
              <input
                value={g.caption ?? ""}
                onChange={(e) => updateGalleryCaption(i, e.target.value)}
                placeholder="Caption (optional)"
                className={`${inputClass} text-xs`}
              />
            </div>
          ))}
          <ImageUploader value={null} onChange={(url) => url && addGalleryImage(url)} folder="blog-gallery" aspect="aspect-[4/3]" />
        </div>
        <p className="mt-2 text-[11px] text-neutral-400">Recommended: 1200×900px (4:3) each</p>
      </FormField>

      <FormField label="Tags (comma-separated)">
        <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass} />
      </FormField>

      <div className="rounded-xl border border-black/5 bg-neutral-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Translations (optional)
        </p>
        <p className="-mt-0.5 mb-3 text-xs text-neutral-400">
          Only the title and body translate — everything else (SEO, gallery, tags) stays as above.
          Leave blank to fall back to English.
        </p>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTranslationTab("te")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${translationTab === "te" ? "bg-[#7f1d1d] text-white" : "border border-black/10 text-neutral-600"}`}
            >
              Telugu
            </button>
            <button
              type="button"
              onClick={() => setTranslationTab("hi")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${translationTab === "hi" ? "bg-[#7f1d1d] text-white" : "border border-black/10 text-neutral-600"}`}
            >
              Hindi
            </button>
          </div>
          <button
            type="button"
            onClick={() => autoTranslate(translationTab)}
            disabled={translating || (!title.trim() && !content.trim())}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#7f1d1d] hover:text-[#7f1d1d] disabled:opacity-50"
          >
            {translating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
            Translate from English
          </button>
        </div>
        {translateError && <p className="mb-2 text-xs text-red-600">{translateError}</p>}
        {translationTab === "te" ? (
          <>
            <FormField label="Telugu Title">
              <input value={teTitle} onChange={(e) => setTeTitle(e.target.value)} className={inputClass} placeholder={title} />
            </FormField>
            <FormField label="Telugu Content">
              <RichTextEditor value={teContent} onChange={setTeContent} />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Hindi Title">
              <input value={hiTitle} onChange={(e) => setHiTitle(e.target.value)} className={inputClass} placeholder={title} />
            </FormField>
            <FormField label="Hindi Content">
              <RichTextEditor value={hiContent} onChange={setHiContent} />
            </FormField>
          </>
        )}
      </div>

      <div className="rounded-xl border border-black/5 bg-neutral-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">SEO (optional overrides)</p>
        <FormField label="Meta Title">
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className={inputClass}
            placeholder={title || "Auto-generated from the title"}
          />
        </FormField>
        <FormField label="Meta Description">
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Shown in search results and social shares — leave blank to use the excerpt"
          />
        </FormField>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <aside className="sticky top-6 w-full shrink-0 space-y-4 rounded-2xl border border-black/5 bg-white p-5 lg:w-64">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <FormField label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </FormField>

        <button
          onClick={save}
          disabled={saving || !title || !content}
          className="w-full rounded-full bg-[#7f1d1d] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Post"}
        </button>
      </aside>
    </div>
  );
}
