import { CrmSidebar } from "@/components/crm/crm-sidebar";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      <CrmSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
