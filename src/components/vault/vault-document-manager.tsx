"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Lock, Unlock, Link2, Trash2, Loader2, Upload, Check } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";
import { addDocument, deleteDocument, updateDocument } from "@/app/vault-admin/actions";
import type { PropertyDocument } from "@/lib/types";

export function VaultDocumentManager({
  propertyId,
  documents,
  vaultUrl,
}: {
  propertyId: string;
  documents: PropertyDocument[];
  vaultUrl: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!title.trim()) {
      setError("Give the document a title first.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file, "vault-documents");
      await addDocument({
        propertyId,
        title: title.trim(),
        fileUrl: url,
        isConfidential: confidential,
        accessKey: confidential ? accessKey.trim() || null : null,
      });
      setTitle("");
      setConfidential(false);
      setAccessKey("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Couldn't copy — select and copy manually.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Project Vault Link</p>
          <p className="text-xs text-neutral-400">Shows every non-confidential document; confidential ones need their access key.</p>
        </div>
        <button
          onClick={() => copy(vaultUrl, "vault")}
          className="flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
        >
          {copiedId === "vault" ? <Check size={13} /> : <Link2 size={13} />}
          {copiedId === "vault" ? "Copied" : "Copy Link"}
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-dashed border-black/10 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-neutral-900">Upload a document</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, e.g. Sale Agreement Draft"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1b5e3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Choose File"}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} />
            Confidential
          </label>
          {confidential && (
            <input
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Access key (shared separately with the recipient)"
              className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs outline-none"
            />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div className="space-y-2">
        {documents.map((d) => (
          <DocumentRow key={d.id} doc={d} propertyId={propertyId} vaultUrl={vaultUrl} onCopy={copy} copiedId={copiedId} />
        ))}
        {documents.length === 0 && <p className="text-sm text-neutral-400">No documents uploaded yet.</p>}
      </div>
    </div>
  );
}

function DocumentRow({
  doc,
  propertyId,
  vaultUrl,
  onCopy,
  copiedId,
}: {
  doc: PropertyDocument;
  propertyId: string;
  vaultUrl: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const router = useRouter();
  const [keyInput, setKeyInput] = useState(doc.access_key ?? "");
  const [busy, setBusy] = useState(false);

  async function toggleConfidential() {
    setBusy(true);
    try {
      await updateDocument(doc.id, propertyId, { isConfidential: !doc.is_confidential });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function saveKey() {
    await updateDocument(doc.id, propertyId, { accessKey: keyInput.trim() || null });
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setBusy(true);
    try {
      await deleteDocument(doc.id, propertyId, doc.file_url);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/5 bg-white p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          <FileText size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <a href={doc.file_url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-neutral-900 hover:underline">
            {doc.title}
          </a>
          <p className="text-xs text-neutral-400">{new Date(doc.created_at).toLocaleDateString("en-IN")}</p>
        </div>
        <button
          onClick={toggleConfidential}
          disabled={busy}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            doc.is_confidential ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {doc.is_confidential ? <Lock size={11} /> : <Unlock size={11} />}
          {doc.is_confidential ? "Confidential" : "Public"}
        </button>
        <button
          onClick={() => onCopy(doc.is_confidential ? vaultUrl : doc.file_url, doc.id)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600"
        >
          {copiedId === doc.id ? <Check size={11} /> : <Link2 size={11} />}
          {copiedId === doc.id ? "Copied" : "Copy Link"}
        </button>
        <button onClick={remove} disabled={busy} className="shrink-0 text-neutral-400 hover:text-red-600">
          <Trash2 size={15} />
        </button>
      </div>
      {doc.is_confidential && (
        <div className="mt-2 flex items-center gap-2 pl-12">
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onBlur={saveKey}
            placeholder="Access key"
            className="rounded-lg border border-black/10 px-2.5 py-1 text-xs outline-none"
          />
          <span className="text-[11px] text-neutral-400">Shared separately — the file link stays locked without it.</span>
        </div>
      )}
    </div>
  );
}
