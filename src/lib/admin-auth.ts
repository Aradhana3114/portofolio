import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
import { isAdminConfigured, missingAdminEnv } from "@/lib/supabase-admin";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

type Bucket = { count: number; resetAt: number };

// In-memory only: on serverless this is per-instance, so it is a speed bump that
// makes online guessing tedious rather than a hard limit. A shared store (KV /
// Redis) would be the real fix if this ever needs to be airtight.
const attempts = new Map<string, Bucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = attempts.get(key);

  if (!bucket || now > bucket.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const bucket = attempts.get(key);
  if (bucket) bucket.count += 1;
}

function clearFailures(key: string) {
  attempts.delete(key);
}

/** Constant-time compare that does not leak length or content via early return. */
function safeEqual(a: string, b: string): boolean {
  // Hash first so both operands are the same fixed length. Without this,
  // `timingSafeEqual` throws on a length mismatch, which itself reveals whether
  // the guess was the right length.
  const hashA = createHash("sha256").update(a, "utf8").digest();
  const hashB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(hashA, hashB);
}

export type AdminAuthResult = { ok: true } | { ok: false; response: NextResponse };

/**
 * Guards every admin route. Callers must return `result.response` when `ok` is
 * false — a guard that can be ignored is not a guard.
 */
export function requireAdmin(request: Request): AdminAuthResult {
  // Covers a missing passcode *and* a missing service role key, so a
  // half-configured deploy fails closed instead of 500-ing mid-query.
  if (!isAdminConfigured) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Admin access is not configured.",
          // Names only, never values. Saves guessing which var was forgotten.
          missing: missingAdminEnv,
        },
        { status: 503 }
      ),
    };
  }

  const passcode = process.env.ADMIN_PASSCODE as string;
  const key = clientKey(request);

  if (isRateLimited(key)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
        }
      ),
    };
  }

  const provided = request.headers.get("x-admin-key") ?? "";
  if (!safeEqual(provided, passcode)) {
    recordFailure(key);
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid passcode." }, { status: 401 }),
    };
  }

  clearFailures(key);
  return { ok: true };
}
