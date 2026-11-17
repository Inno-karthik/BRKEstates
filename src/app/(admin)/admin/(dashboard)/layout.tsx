import { AdminSidebar } from "@/components/admin/sidebar";
import { getMyProfile } from "@/lib/admin-queries";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getMyProfile();

  return (
    <div className="flex min-h-screen bg-neutral-50 md:flex-row flex-col">
      <AdminSidebar profile={profile} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
