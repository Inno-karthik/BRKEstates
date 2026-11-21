"use client";

import { useEffect, useRef } from "react";

/** Renders pasted embed HTML (iframe or script-based snippets). Plain innerHTML never runs <script>
 *  tags, so script-based embeds (e.g. a one-snippet map widget) would silently show nothing — here the
 *  scripts are re-created so they execute. */
export function EmbedHtml({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = html;
    host.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.text = old.text;
      old.replaceWith(s);
    });
    return () => {
      host.innerHTML = "";
    };
  }, [html]);

  return <div ref={ref} className={className} />;
}
