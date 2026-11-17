import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client using the secret key. Bypasses RLS — never import from
 * a Client Component, only from Route Handlers / Server Actions.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
