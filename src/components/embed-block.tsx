import { EmbedHtml } from "@/components/embed-html";

export function EmbedBlock({ code }: { code: string }) {
  return (
    <EmbedHtml
      html={code}
      className="overflow-hidden rounded-2xl border border-black/5 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-2xl"
    />
  );
}
