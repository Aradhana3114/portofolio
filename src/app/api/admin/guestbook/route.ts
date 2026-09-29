import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { AdminGuestbookEntry, GuestbookEntry, GuestbookReply } from "@/data/types";

const ENTRY_COLUMNS = "id, name, message, created_at";
const REPLY_COLUMNS = "id, entry_id, reply, created_at, updated_at";

type EntryRow = Pick<GuestbookEntry, "id" | "name" | "message" | "created_at">;
type ReplyRow = GuestbookReply;

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

// GET — every entry with all its replies. No 50-row cap, unlike the public list.
export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const { data: entries, error: entriesError } = await db()
    .from("guestbook")
    .select(ENTRY_COLUMNS)
    .order("created_at", { ascending: false });

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { data: replies, error: repliesError } = await db()
    .from("guestbook_replies")
    .select(REPLY_COLUMNS)
    .order("created_at", { ascending: true });

  if (repliesError) {
    return NextResponse.json({ error: repliesError.message }, { status: 500 });
  }

  const byEntry = new Map<string, ReplyRow[]>();
  for (const reply of (replies ?? []) as ReplyRow[]) {
    const list = byEntry.get(reply.entry_id);
    if (list) list.push(reply);
    else byEntry.set(reply.entry_id, [reply]);
  }

  const merged: AdminGuestbookEntry[] = ((entries ?? []) as EntryRow[]).map((entry) => ({
    ...entry,
    replies: byEntry.get(entry.id) ?? [],
  }));

  return NextResponse.json({ entries: merged });
}

// POST — add a reply to an entry.
export async function POST(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const entryId = String(body?.entryId ?? "").trim();
  const reply = String(body?.reply ?? "").trim();

  if (!entryId) {
    return NextResponse.json({ error: "entryId is required." }, { status: 400 });
  }
  if (!reply || reply.length > 1000) {
    return NextResponse.json({ error: "Reply must be 1-1000 characters." }, { status: 400 });
  }

  const { data, error } = await db()
    .from("guestbook_replies")
    .insert({ entry_id: entryId, reply })
    .select(REPLY_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reply: data }, { status: 201 });
}

// PATCH — edit an existing reply.
export async function PATCH(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const replyId = String(body?.replyId ?? "").trim();
  const reply = String(body?.reply ?? "").trim();

  if (!replyId) {
    return NextResponse.json({ error: "replyId is required." }, { status: 400 });
  }
  if (!reply || reply.length > 1000) {
    return NextResponse.json({ error: "Reply must be 1-1000 characters." }, { status: 400 });
  }

  // updated_at is set by a DB trigger so it cannot be spoofed by the client.
  const { data, error } = await db()
    .from("guestbook_replies")
    .update({ reply })
    .eq("id", replyId)
    .select(REPLY_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reply: data });
}

// DELETE — drop a single reply (?replyId=) or a whole entry and its replies
// (?entryId=). Replies cascade with the entry via the FK.
export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const replyId = url.searchParams.get("replyId");
  const entryId = url.searchParams.get("entryId");

  if (replyId) {
    const { error } = await db().from("guestbook_replies").delete().eq("id", replyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (entryId) {
    const { error } = await db().from("guestbook").delete().eq("id", entryId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Provide either replyId or entryId." },
    { status: 400 }
  );
}
