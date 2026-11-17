// Machine translation via MyMemory's public translation API — a free, documented API
// meant for programmatic use (unlike Google's unofficial endpoint, which Cloudflare's
// shared egress IPs get blocked by as bot traffic). No key required for low volume.
// Result always lands in the rich text editor for the admin to review before publishing.

const LANG_TARGET: Record<"te" | "hi", string> = { te: "te-IN", hi: "hi-IN" };

async function translateChunk(text: string, targetLang: "te" | "hi"): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${LANG_TARGET[targetLang]}&de=admin@brkestates.com`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    throw new Error(`Translation request failed to reach the server: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Translation request failed (HTTP ${res.status})${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
  const data = (await res.json()) as { responseStatus: number | string; responseData?: { translatedText?: string } };
  if (Number(data.responseStatus) !== 200) {
    throw new Error(
      `Translation service declined the request (status ${data.responseStatus}) — daily free quota may be used up. Try again later or type it manually.`
    );
  }
  return data.responseData?.translatedText ?? "";
}

/** MyMemory's free tier caps requests around ~500 bytes, so longer text is split on
 *  paragraph/sentence boundaries into small chunks and translated in parallel. */
export async function translatePlainText(text: string, targetLang: "te" | "hi"): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const MAX = 450;
  if (trimmed.length <= MAX) return translateChunk(trimmed, targetLang);

  const parts: string[] = [];
  let remaining = trimmed;
  while (remaining.length > MAX) {
    let cut = remaining.lastIndexOf("\n", MAX);
    if (cut < MAX * 0.5) cut = remaining.lastIndexOf(". ", MAX);
    if (cut < MAX * 0.5) cut = MAX;
    parts.push(remaining.slice(0, cut + 1));
    remaining = remaining.slice(cut + 1);
  }
  if (remaining) parts.push(remaining);

  const translated: string[] = [];
  for (const part of parts) {
    translated.push(await translateChunk(part, targetLang));
  }
  return translated.join(" ");
}

/** Translates rich-text HTML paragraph-by-paragraph. Inline formatting/headings/lists are
 *  flattened to plain <p> blocks in the process — not lossless, but the result lands in the
 *  rich text editor for the admin to review and reformat, not published directly. */
export async function translateHtml(html: string, targetLang: "te" | "hi"): Promise<string> {
  if (!html.trim()) return "";

  const withBreaks = html.replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n");
  const plain = withBreaks.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
  const blocks = plain
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "";

  const translated: string[] = [];
  for (const block of blocks) {
    translated.push(await translatePlainText(block, targetLang));
  }
  return translated
    .filter(Boolean)
    .map((t) => `<p>${t}</p>`)
    .join("");
}
