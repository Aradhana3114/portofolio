import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GuestbookEntry, GuestbookEntryWithReply, GuestbookReply } from "@/data/types";

const ENTRY_COLUMNS = "id, name, message, created_at";
const REPLY_COLUMNS = "id, entry_id, reply, created_at, updated_at";

export async function GET() {
  const { data, error } = await supabase
    .from("guestbook")
    .select(ENTRY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []) as GuestbookEntry[];

  // Replies are fetched separately and joined in JS rather than via a PostgREST
  // embed. The embedded resource name is derived from the FK and silently
  // changes if the schema is renamed, which would turn into a 400 at runtime;
  // this way a schema drift is just an empty reply column.
  const ids = entries.map((entry) => entry.id);
  if (ids.length === 0) {
    return NextResponse.json({ entries: [] });
  }

  const { data: replyData, error: replyError } = await supabase
    .from("guestbook_replies")
    .select(REPLY_COLUMNS)
    .in("entry_id", ids)
    .order("created_at", { ascending: true });

  if (replyError) {
    // The guestbook itself is still worth showing without replies.
    const withoutReplies: GuestbookEntryWithReply[] = entries.map((entry) => ({
      ...entry,
      reply: null,
    }));
    return NextResponse.json({ entries: withoutReplies });
  }

  // Keep only the newest reply per entry; that is what the public list renders.
  const latestByEntry = new Map<string, GuestbookReply>();
  for (const reply of (replyData ?? []) as GuestbookReply[]) {
    const current = latestByEntry.get(reply.entry_id);
    if (!current || current.created_at < reply.created_at) {
      latestByEntry.set(reply.entry_id, reply);
    }
  }

  const merged: GuestbookEntryWithReply[] = entries.map((entry) => ({
    ...entry,
    reply: latestByEntry.get(entry.id) ?? null,
  }));

  return NextResponse.json({ entries: merged });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || name.length > 50) {
    return NextResponse.json({ error: "Name must be 1-50 characters." }, { status: 400 });
  }
  if (!message || message.length > 500) {
    return NextResponse.json({ error: "Message must be 1-500 characters." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("guestbook")
    .insert({ name, message })
    .select(ENTRY_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entry: GuestbookEntryWithReply = { ...(data as GuestbookEntry), reply: null };
  return NextResponse.json({ entry }, { status: 201 });
}
