"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";

const DescriptionContext = createContext<{ expanded: boolean; setExpanded: (v: boolean) => void } | null>(null);

export function DescriptionProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <DescriptionContext.Provider value={{ expanded, setExpanded }}>{children}</DescriptionContext.Provider>;
}

function firstParagraphs(html: string, count: number) {
  const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (matches && matches.length > 0) return matches.slice(0, count).join("");
  return html;
}

/** Near the top of the page: a short preview (first couple of paragraphs) with a "Read
 *  more" button. Clicking it reveals the full description further down the page (see
 *  DescriptionFull) rather than expanding in place — the content can be long, and this
 *  keeps the page from suddenly growing right where you're reading. */
export function DescriptionPreview({ html }: { html: string }) {
  const ctx = useContext(DescriptionContext);
  if (!ctx) return null;
  const { expanded, setExpanded } = ctx;

  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const preview = firstParagraphs(html, 2);
  const previewPlain = preview.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const hasMore = previewPlain.length < plain.length;

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-neutral-900">About this property</h2>
      <div
        className="prose prose-sm max-w-none text-neutral-600 prose-headings:text-neutral-900 prose-a:text-[var(--color-primary,#1b5e3a)]"
        dangerouslySetInnerHTML={{ __html: preview }}
      />
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            requestAnimationFrame(() =>
              document.getElementById("full-description")?.scrollIntoView({ behavior: "smooth", block: "start" })
            );
          }}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-[var(--color-primary,#1b5e3a)]"
        >
          Read more <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}

/** Placed at the end of the page's content column — only renders once "Read more" above
 *  has been clicked, and offers a Close button to collapse it again. */
export function DescriptionFull({ html }: { html: string }) {
  const ctx = useContext(DescriptionContext);
  if (!ctx?.expanded) return null;

  return (
    <div id="full-description" className="scroll-mt-24 border-t border-black/5 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Full Description</h2>
        <button
          type="button"
          onClick={() => ctx.setExpanded(false)}
          className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-300"
        >
          <X size={13} /> Close
        </button>
      </div>
      <div
        className="prose prose-sm mt-3 max-w-none text-neutral-600 prose-headings:text-neutral-900 prose-a:text-[var(--color-primary,#1b5e3a)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
