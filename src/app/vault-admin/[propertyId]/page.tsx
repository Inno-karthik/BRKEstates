import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPropertyById, getVaultDocuments } from "@/lib/admin-queries";
import { VaultDocumentManager } from "@/components/vault/vault-document-manager";

export default async function VaultFolderPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const [property, documents] = await Promise.all([
    getPropertyById(propertyId),
    getVaultDocuments(propertyId),
  ]);
  if (!property) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bkrestates.com";
  const vaultUrl = `${siteUrl}/vault/${propertyId}`;

  return (
    <div>
      <Link href="/vault-admin" className="mb-4 flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={13} /> Vault
      </Link>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">{property.title}</h1>
      <p className="mb-6 text-sm text-neutral-500">Documents for this project.</p>

      <VaultDocumentManager propertyId={propertyId} documents={documents} vaultUrl={vaultUrl} />
    </div>
  );
}
