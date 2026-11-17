import Image from "next/image";
import Link from "next/link";
import { Folder, FileText } from "lucide-react";
import { getVaultFolders } from "@/lib/admin-queries";

export default async function VaultPage() {
  const folders = await getVaultFolders();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">Vault</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Store contracts, approvals and brochures per project. Share a file directly, or share the whole project&apos;s
        vault as one link.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((f) => (
          <Link
            key={f.id}
            href={`/vault-admin/${f.id}`}
            className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
              {f.cover_image ? (
                <Image src={f.cover_image} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-300">
                  <Folder size={22} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">{f.title}</p>
              <p className="truncate text-xs text-neutral-400">{f.property_type?.name ?? "—"}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                <FileText size={12} /> {f.documentCount} document{f.documentCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
        {folders.length === 0 && <p className="text-sm text-neutral-400">No properties yet.</p>}
      </div>
    </div>
  );
}
