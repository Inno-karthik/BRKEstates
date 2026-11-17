import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free client for public, read-only queries (property types, listings, site
 * settings, blog, popups — anything gated only by RLS on published/active rows, not
 * by who's logged in). The cookie-bound SSR client (lib/supabase/server.ts) calls
 * next/headers' cookies(), which forces Next.js to render the whole route dynamically
 * on every request — no Data Cache, no ISR, full Supabase round-trip every single
 * time. Using this client instead lets pages that don't otherwise need per-request
 * state (see `revalidate` exports) actually get cached.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
