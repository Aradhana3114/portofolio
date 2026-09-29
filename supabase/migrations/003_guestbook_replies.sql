-- Replies to guestbook entries.
--
-- Security model: this table is read-only over the public API. There is
-- deliberately NO insert/update/delete policy for the anon key, so even though
-- the anon key ships in the browser, nobody can write here directly. All writes
-- go through /api/admin/guestbook, which holds the service role key and verifies
-- the admin passcode. RLS is the second lock, not the only one.

create table if not exists guestbook_replies (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references guestbook(id) on delete cascade,
  reply text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guestbook_replies_entry_id_idx
  on guestbook_replies (entry_id);

alter table guestbook_replies enable row level security;

-- Public can read replies so they can be shown next to each entry.
create policy "Allow public read" on guestbook_replies
  for select using (true);

-- Keep updated_at honest without relying on the client sending it.
create or replace function public.set_guestbook_reply_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guestbook_replies_set_updated_at on guestbook_replies;

create trigger guestbook_replies_set_updated_at
  before update on guestbook_replies
  for each row
  execute function public.set_guestbook_reply_updated_at();
