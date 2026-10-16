import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ContactMessage } from "@/data/types";

const MESSAGE_COLUMNS = "id, name, email, subject, message, created_at";

/**
 * Single choke point for every handler. `requireAdmin` fails closed on a missing
 * passcode *or* a missing service role key, so the 503 happens before any query.
 */
function guard(request: Request): NextResponse | null {
  const auth = requireAdmin(request);
  return auth.ok ? null : auth.response;
}

function db() {
  return getSupabaseAdmin();
}

// GET — every contact message, newest first. RLS blocks anon reads entirely,
// so this list only exists behind the admin guard.
export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const { data, error } = await db()
    .from("contact_messages")
    .select(MESSAGE_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: (data ?? []) as ContactMessage[] });
}

// PATCH — edit a message's subject and/or body.
export async function PATCH(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "").trim();

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const patch: Record<string, string> = {};

  if (body?.subject !== undefined) {
    const subject = String(body.subject).trim();
    if (!subject || subject.length > 150) {
      return NextResponse.json({ error: "Subject must be 1-150 characters." }, { status: 400 });
    }
    patch.subject = subject;
  }

  if (body?.message !== undefined) {
    const message = String(body.message).trim();
    if (!message || message.length > 5000) {
      return NextResponse.json({ error: "Message must be 1-5000 characters." }, { status: 400 });
    }
    patch.message = message;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await db()
    .from("contact_messages")
    .update(patch)
    .eq("id", id)
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}

// DELETE — drop a single message (?id=).
export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const { error } = await db().from("contact_messages").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
