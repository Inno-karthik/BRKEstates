import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { VaultPublicView, type PublicVaultDoc } from "@/components/vault-public-view";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PublicVaultPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const supabase = createAdminClient();

  const [{ data: property }, { data: docs }] = await Promise.all([
    supabase.from("properties").select("id, title, slug, status").eq("id", propertyId).single(),
    supabase
      .from("property_documents")
      .select("id, title, file_url, is_confidential, sort_order")
      .eq("property_id", propertyId)
      .order("sort_order"),
  ]);

  if (!property || property.status !== "published") notFound();

  // Confidential docs never ship their file_url to the client until the key is verified
  // server-side via /api/vault/unlock.
  const documents: PublicVaultDoc[] = (docs ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    is_confidential: d.is_confidential,
    file_url: d.is_confidential ? null : d.file_url,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">{property.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">Shared documents for this project.</p>
      <div className="mt-6">
        <VaultPublicView documents={documents} />
      </div>

      <Link
        href={`/listings/${property.slug}`}
        className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[var(--color-primary,#d0191f)] p-6 text-white sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">View property</p>
          <p className="mt-0.5 text-lg font-bold">{property.title}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary,#d0191f)]">
          View Full Details <ArrowRight size={15} />
        </span>
      </Link>
    </div>
  );
}
