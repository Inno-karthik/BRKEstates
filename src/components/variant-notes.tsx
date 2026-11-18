import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

/** Admin-written note under the configurations: red border, normal typography, one paragraph per
 *  line. A leading "Label:" (price, booking amount, payment schedule…) and any **bold** text are
 *  rendered in bold. Renders nothing when empty. */
function renderLine(line: string): ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const inline = (text: string, keyPrefix: string): ReactNode[] =>
    text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={keyPrefix + i} className="font-semibold text-neutral-900">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p
        )
      );

  // "Booking amount: ₹1 L" → bold label, normal value (only when no explicit ** markers are used)
  const labelled = parts.length === 1 && !line.includes("**") ? line.match(/^([^:*]{2,40}):\s*(.+)$/) : null;
  if (labelled) {
    return (
      <>
        <strong className="font-semibold text-neutral-900">{labelled[1]}:</strong> {labelled[2]}
      </>
    );
  }
  return inline(line, "l");
}

export function VariantNotes({ notes }: { notes?: string | null }) {
  const lines = (notes ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <aside aria-label="Important notes" className="mb-8 rounded-2xl border-2 border-red-500 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600">
        <AlertCircle size={14} /> Note
      </p>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-neutral-700 sm:text-[15px]">
            {renderLine(line)}
          </p>
        ))}
      </div>
    </aside>
  );
}
