import { AlertCircle } from "lucide-react";

/** Admin-written note shown under the configurations: medium-red border, black text on a
 *  highlighter-yellow marker, one paragraph per line. Renders nothing when empty. */
export function VariantNotes({ notes }: { notes?: string | null }) {
  const lines = (notes ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <aside
      aria-label="Important notes"
      className="mb-8 rounded-2xl border-2 border-red-500 bg-red-50/60 p-4 shadow-sm sm:p-5"
    >
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600">
        <AlertCircle size={14} /> Note
      </p>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-black sm:text-[15px]">
            <span className="box-decoration-clone rounded-sm bg-yellow-200 px-1 py-0.5 font-semibold">{line}</span>
          </p>
        ))}
      </div>
    </aside>
  );
}
