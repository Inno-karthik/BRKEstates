export function EmbedBlock({ code }: { code: string }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/5 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
