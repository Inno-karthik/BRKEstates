import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Icon } from "@/components/icon";
import { NavTypesDropdown } from "@/components/nav/nav-types-dropdown";
import { NavLocationsDropdown } from "@/components/nav/nav-locations-dropdown";
import { MobileMenuButton } from "@/components/nav/mobile-menu";
import { FavoritesLink } from "@/components/nav/favorites-link";
import { TrackedLink } from "@/components/tracked-link";
import type { Location, PropertyType, SiteSettings } from "@/lib/types";

/** Receives types/settings as props (fetched once in SiteLayout) rather than fetching its
 *  own copy — avoids each of Navbar/Footer/PixelScripts/WhatsappFloat round-tripping to
 *  Supabase independently, which was adding up to seconds of extra latency per page. */
export function Navbar({
  types,
  locations = [],
  settings,
}: {
  types: PropertyType[];
  locations?: Location[];
  settings: SiteSettings;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src={settings.logo_url || "/brand/logo.png"}
            alt={settings.site_name}
            width={48}
            height={48}
            className="h-11 w-11 object-contain md:h-12 md:w-12"
            priority
          />
          <span className="text-base font-semibold tracking-tight text-[var(--color-secondary,#0f3d26)] sm:text-lg">
            {settings.site_name}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          <Link href="/" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#1b5e3a)]">
            Home
          </Link>
          {types.length > 0 && <NavTypesDropdown types={types} />}
          {locations.length > 0 && <NavLocationsDropdown locations={locations} />}
          <Link
            href="/listings"
            className="text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#1b5e3a)]"
          >
            All Listings
          </Link>
          <Link href="/blog" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#1b5e3a)]">
            Blog
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#1b5e3a)]"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#1b5e3a)]"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <FavoritesLink className="hidden lg:flex" />
          <Link
            href="/contact"
            className="hidden rounded-full bg-[var(--color-primary,#1b5e3a)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 lg:block"
          >
            Enquire Now
          </Link>
          {settings.phone && (
            <TrackedLink
              href={`tel:${settings.phone}`}
              event="call_click"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)] lg:hidden"
            >
              <Phone size={17} />
            </TrackedLink>
          )}
          <MobileMenuButton types={types} locations={locations} siteName={settings.site_name} logoUrl={settings.logo_url} />
        </div>
      </div>
    </header>
  );
}

export function TypeIcon({ name, url }: { name?: string | null; url?: string | null }) {
  return <Icon name={name} url={url} size={18} />;
}
