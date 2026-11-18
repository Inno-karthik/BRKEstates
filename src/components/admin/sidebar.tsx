"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Tags,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Newspaper,
  ArrowUpRight,
  PartyPopper,
  Lock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { CmsArea, Profile } from "@/lib/types";

const links: { href: string; label: string; icon: typeof LayoutDashboard; area?: CmsArea; ownerOnly?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2, area: "properties" },
  { href: "/admin/property-types", label: "Specifications", icon: Tags, area: "property-types" },
  { href: "/admin/amenities", label: "Amenities", icon: Sparkles, area: "amenities" },
  { href: "/admin/locations", label: "Locations", icon: MapPin, area: "locations" },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, area: "blog" },
  { href: "/admin/popups", label: "Popups", icon: PartyPopper, area: "popups" },
  { href: "/admin/settings", label: "Settings", icon: Settings, area: "settings" },
];

export function AdminSidebar({ profile }: { profile?: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOwner = !profile || profile.role === "admin";
  const visibleLinks = links.filter((l) => {
    if (l.ownerOnly) return isOwner;
    return !l.area || isOwner || profile?.cms_areas.includes(l.area);
  });
  const hasCrm = isOwner || profile?.sections.includes("crm");
  const hasVault = isOwner || profile?.sections.includes("vault");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const content = (
    <nav className="flex h-full flex-col">
      <div className="px-4 py-5">
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
          <Image src="/brand/logo-v2.png" alt="BKR Estates" width={220} height={59} className="h-auto w-full object-contain" />
        </div>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {visibleLinks.map(({ href, label, icon: IconC }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <IconC size={17} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3">
        {hasCrm && (
          <Link
            href="/crm"
            className="mb-1 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/15"
          >
            <span className="flex items-center gap-3">
              <Users size={17} /> Leads CRM
            </span>
            <ArrowUpRight size={14} />
          </Link>
        )}
        {hasVault && (
          <Link
            href="/vault-admin"
            className="mb-1 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/15"
          >
            <span className="flex items-center gap-3">
              <Lock size={17} /> Vault
            </span>
            <ArrowUpRight size={14} />
          </Link>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto bg-[#14307e] md:block">{content}</aside>

      <div className="flex items-center justify-between border-b border-black/5 bg-[#14307e] px-4 py-3 md:hidden">
        <div className="rounded-lg bg-white px-2 py-1">
          <Image src="/brand/logo-v2.png" alt="BKR Estates" width={140} height={37} className="h-9 w-auto object-contain" />
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#14307e]">
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
