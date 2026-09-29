import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Never prefix this with NEXT_PUBLIC_. The service role key bypasses RLS
// entirely, so leaking it would let anyone write replies and delete entries
// without the passcode. This module is marked "server-only" so a mistake here
// fails the build instead of shipping the key to the browser.
export const missingAdminEnv: string[] = [
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
  ["ADMIN_PASSCODE", process.env.ADMIN_PASSCODE ?? ""],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

export const isAdminConfigured = missingAdminEnv.length === 0;

function getClient() {
  if (!isAdminConfigured) {
    throw new Error(
      "Admin access is not configured. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSCODE."
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Lazily-built service role client. Reading env at module scope would evaluate
 * during `next build`, before .env is guaranteed to be loaded, which would bake
 * an unconfigured singleton into the bundle.
 */
let cached: ReturnType<typeof getClient> | null = null;

export function getSupabaseAdmin() {
  if (!cached) cached = getClient();
  return cached;
}
