"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, LogOut, Menu, X, ArrowLeft, ArrowUpRight, Megaphone } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/crm", label: "Overview", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/marketing", label: "Marketing Settings", icon: Megaphone },
];

export function CrmSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const content = (
    <nav className="flex h-full flex-col">
      <div className="px-5 py-5">
        <p className="text-sm font-semibold text-white">BKR Estates</p>
        <p className="text-[11px] text-indigo-200">Leads CRM</p>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: IconC }) => {
          const active = href === "/crm" ? pathname === "/crm" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/10 text-white" : "text-indigo-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <IconC size={17} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-100/70 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={17} /> Back to CMS
        </Link>
        <Link
          href="/vault-admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-100/70 hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight size={17} /> Vault
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-100/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto bg-indigo-950 md:block">{content}</aside>

      <div className="flex items-center justify-between border-b border-black/5 bg-indigo-950 px-4 py-3 md:hidden">
        <span className="text-sm font-semibold text-white">BKR CRM</span>
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-indigo-950">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-white/70">
              <X size={20} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
