"use client";

import { useState } from "react";
import { FileText, Lock, ExternalLink, Loader2 } from "lucide-react";

export type PublicVaultDoc = {
  id: string;
  title: string;
  is_confidential: boolean;
  file_url: string | null;
};

export function VaultPublicView({ documents }: { documents: PublicVaultDoc[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-neutral-400">No documents have been shared for this project yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {documents.map((d) => (
        <DocTile key={d.id} doc={d} />
      ))}
    </div>
  );
}

function DocTile({ doc }: { doc: PublicVaultDoc }) {
  const [key, setKey] = useState("");
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, key: key.trim() }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't unlock this document.");
        return;
      }
      setUnlockedUrl(data.url);
      window.open(data.url, "_blank", "noreferrer");
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setChecking(false);
    }
  }

  const url = doc.file_url ?? unlockedUrl;

  return (
    <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]">
        <FileText size={20} />
      </span>
      <p className="flex-1 text-sm font-semibold text-neutral-900">{doc.title}</p>

      <div className="w-full">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-primary,#7f1d1d)] px-4 py-2 text-xs font-semibold text-white"
          >
            <ExternalLink size={13} /> Open
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setEntering((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700"
          >
            <Lock size={13} /> Confidential
          </button>
        )}

        {!url && entering && (
          <form onSubmit={unlock} className="mt-2.5 flex items-center gap-1.5">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter access key"
              className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs outline-none"
            />
            <button
              type="submit"
              disabled={checking || !key.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {checking ? <Loader2 size={12} className="animate-spin" /> : "Unlock"}
            </button>
          </form>
        )}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
