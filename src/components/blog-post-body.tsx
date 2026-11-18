"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Lightbox } from "@/components/flipbook/lightbox";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const LANGS = [
  { code: "te", label: "TE" },
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

/** Title + body only translate between Telugu/English/Hindi — everything else on the post
 *  (date, gallery, tags, SEO) stays as authored, per the admin's requirement. */
export function BlogPostBody({ post }: { post: BlogPost }) {
  const [lang, setLang] = useState<LangCode>("en");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryImages = post.gallery_images ?? [];

  // Only offer a tab for a language that actually has a translation — no point showing
  // a Hindi tab when just Telugu was filled in, or any tabs at all when neither was.
  const availableLangs = LANGS.filter(
    (l) => l.code === "en" || !!(post.translations?.[l.code]?.title || post.translations?.[l.code]?.content)
  );
  const showSwitcher = availableLangs.length > 1;

  const title = lang === "en" ? post.title : post.translations?.[lang]?.title || post.title;
  const content = lang === "en" ? post.content : post.translations?.[lang]?.content || post.content;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary,#d0191f)]">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {showSwitcher && (
          <div className="flex shrink-0 gap-1 rounded-full border border-black/10 p-0.5">
            {availableLangs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  lang === l.code ? "bg-[var(--color-primary,#d0191f)] text-white" : "text-neutral-500 hover:bg-neutral-50"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <CalendarDays size={12} />
        {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        {post.author && <span>· {post.author}</span>}
      </p>
      <h1 className="mt-2 text-xl font-bold text-neutral-900 md:text-2xl">{title}</h1>

      {galleryImages.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleryImages.map((g, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group overflow-hidden rounded-xl bg-neutral-100 text-left"
              aria-label="View fullscreen"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={g.url}
                  alt={g.caption ?? post.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {g.caption && <p className="px-2.5 py-2 text-xs text-neutral-500">{g.caption}</p>}
            </button>
          ))}
        </div>
      )}

      <article className="prose prose-neutral mt-8 max-w-none break-words prose-headings:font-semibold prose-a:text-[var(--color-primary,#d0191f)] prose-img:max-w-full prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto">
        {/* New posts are saved as rich-text HTML (always starts with a tag); older
            posts predate the rich text editor and are still plain Markdown. */}
        {content.trim().startsWith("<") ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </article>

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages.map((g) => g.url)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
