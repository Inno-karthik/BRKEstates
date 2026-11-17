"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { addLeadNote } from "@/app/crm/leads/actions";
import { Modal } from "@/components/admin/modal";
import type { Lead } from "@/lib/types";

export function LeadNotesContent({ lead }: { lead: Lead }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(lead.notes ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const result = await addLeadNote(lead.id, note.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotes((prev) => [
        { id: crypto.randomUUID(), lead_id: lead.id, note: note.trim(), created_at: new Date().toISOString() },
        ...prev,
      ]);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="mb-4 flex items-start gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add a note…"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#9b1c1c]"
        />
        <button
          type="submit"
          disabled={saving || !note.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#9b1c1c] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Add"}
        </button>
      </form>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="max-h-72 space-y-2.5 overflow-y-auto">
        {notes.length === 0 && <p className="text-sm text-neutral-400">No notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg bg-neutral-50 p-3">
            <p className="text-sm text-neutral-800">{n.note}</p>
            <p className="mt-1 text-[11px] text-neutral-400">
              {new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotesModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <Modal title={`Notes — ${lead.name}`} onClose={onClose}>
      <LeadNotesContent lead={lead} />
    </Modal>
  );
}
