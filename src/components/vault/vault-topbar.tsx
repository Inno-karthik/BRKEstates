"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogOut, LayoutDashboard, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function VaultTopbar() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-black/5 bg-amber-950 px-4 py-3 md:px-6">
      <Link href="/vault-admin" className="flex items-center gap-2 text-white">
        <Lock size={18} />
        <span className="text-sm font-semibold">BRK Estates Vault</span>
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/admin"
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-100/70 hover:bg-white/5 hover:text-white sm:flex"
        >
          <LayoutDashboard size={14} /> CMS
        </Link>
        <Link
          href="/crm"
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-100/70 hover:bg-white/5 hover:text-white sm:flex"
        >
          <Users size={14} /> CRM
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-100/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={14} /> Sign out
        </button>
      </nav>
    </header>
  );
}
