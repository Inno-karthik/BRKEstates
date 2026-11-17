import { VaultTopbar } from "@/components/vault/vault-topbar";

export default function VaultAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <VaultTopbar />
      <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
    </div>
  );
}
