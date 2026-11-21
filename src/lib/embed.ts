export const OURPLOTS_URL = "https://ourplots.com";

/** Pasted "embed code" can be a full <iframe>/<script> snippet or just a bare URL — turn a bare URL
 *  into an iframe so it still shows instead of being silently ignored. */
export function normalizeEmbed(code: string): string {
  const c = (code ?? "").trim();
  if (!c) return "";
  if (!c.includes("<") && /^https?:\/\/\S+$/i.test(c)) {
    return `<iframe src="${c.replace(/"/g, "&quot;")}" loading="lazy" allowfullscreen style="border:0"></iframe>`;
  }
  return c;
}

export function isOurPlotsEmbed(code: string | null | undefined): boolean {
  return /ourplots/i.test(code ?? "");
}

/** Tab title used when the admin pastes an embed but leaves the title empty. */
export function defaultTourTitle(code: string): string {
  if (isOurPlotsEmbed(code)) return "Plot View";
  if (/youtube|youtu\.be|vimeo/i.test(code)) return "Video";
  return "360° Tour";
}
