"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Search, Star } from "lucide-react";
import { deleteProperty } from "@/app/(admin)/admin/(dashboard)/properties/actions";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/lib/types";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  published: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  sold: "bg-blue-100 text-blue-700",
  archived: "bg-neutral-100 text-neutral-400",
};

export function PropertiesList({ properties }: { properties: Property[] }) {
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (status && p.status !== status) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [properties, q, status]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
          <Search size={14} className="text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search properties…"
            className="text-sm outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="paused">Paused</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {p.cover_image && <Image src={p.cover_image} alt="" fill className="object-cover" unoptimized />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium text-neutral-900">
                {p.featured && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                {p.title}
              </p>
              <p className="truncate text-xs text-neutral-400">
                {p.property_type?.name} · {formatPrice(p.price, p.price_label, true, p.area_unit, p.property_type?.slug)}
                {p.available_units != null && ` · ${p.available_units}/${p.total_units ?? p.available_units} available`}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLORS[p.status]}`}>
              {p.status}
            </span>
            <Link href={`/admin/properties/${p.id}/edit`} className="text-neutral-400 hover:text-neutral-700">
              <Pencil size={15} />
            </Link>
            <button
              onClick={async () => { if (await confirm(`Delete "${p.title}"?`)) startTransition(async () => { await deleteProperty(p.id); toast.success("Deleted"); }); }}
              className="text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-neutral-400">No properties found.</p>}
      </div>
    </div>
  );
}
