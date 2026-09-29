"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, LogOut, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import type { AdminGuestbookEntry, GuestbookReply } from "@/data/types";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";

const STORAGE_KEY = "guestbook-admin-key";
const OWNER_LABEL = profile.name.split(" ")[0];

type GateState = "loading" | "locked" | "unlocked" | "misconfigured";

type Misconfigured = { missing: string[] };

export function GuestbookAdmin() {
  const t = useTranslations();
  const [gate, setGate] = useState<GateState>("loading");
  const [missing, setMissing] = useState<string[]>([]);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [entries, setEntries] = useState<AdminGuestbookEntry[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  // Request helper: attaches the passcode, and hard-locks the UI on 401/503 so a
  // wrong or revoked passcode can never leave the form in a half-authed state.
  const request = useCallback(
    async (path: string, init?: RequestInit) => {
      const key =
        typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!key) throw new Error("NO_KEY");

      const res = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key,
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        window.localStorage.removeItem(STORAGE_KEY);
        setGate("locked");
        throw new Error("UNAUTHORIZED");
      }
      if (res.status === 503) {
        const body = (await res.json().catch(() => ({}))) as Misconfigured;
        setMissing(Array.isArray(body.missing) ? body.missing : []);
        setGate("misconfigured");
        throw new Error("MISCONFIGURED");
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Request failed.");
      return data;
    },
    []
  );

  const loadEntries = useCallback(async () => {
    setLoadError("");
    try {
      const data = await request("/api/admin/guestbook");
      setEntries(data.entries ?? []);
    } catch (err) {
      if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "NO_KEY")) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load.");
    }
  }, [request]);

  // On mount: validate any stored passcode before showing the editor.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setGate("locked");
      return;
    }
    request("/api/admin/guestbook")
      .then((data) => {
        setEntries(data.entries ?? []);
        setGate("unlocked");
      })
      .catch((err) => {
        // `request` already switched the gate to "misconfigured" for a 503.
        if (err instanceof Error && err.message === "MISCONFIGURED") return;
        setGate("locked");
      });
    // Runs once on mount: re-running would re-probe the auth on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAuthError("");

    const candidate = passcode.trim();
    if (!candidate) {
      setBusy(false);
      return;
    }

    const res = await fetch("/api/admin/guestbook", {
      headers: { "x-admin-key": candidate },
      cache: "no-store",
    });

    if (res.status === 503) {
      const body = (await res.json().catch(() => ({}))) as Misconfigured;
      setMissing(Array.isArray(body.missing) ? body.missing : []);
      setGate("misconfigured");
      setBusy(false);
      return;
    }
    if (!res.ok) {
      setAuthError(t("admin.invalidPasscode"));
      setBusy(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    // Only persist after the server has accepted it.
    window.localStorage.setItem(STORAGE_KEY, candidate);
    setPasscode("");
    setEntries(data.entries ?? []);
    setGate("unlocked");
    setBusy(false);
  }

  function lock() {
    window.localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
    setGate("locked");
  }

  return (
    <section className="border-b border-border py-24">
      <div className="container-editorial">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 text-h2 font-display">{t("admin.title")}</h1>
            <p className="text-body text-foreground/70">{t("admin.subtitle")}</p>
          </div>
          {gate === "unlocked" && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={loadEntries} className="gap-2 px-4 py-2 text-caption">
                <RefreshCw size={14} />
                {t("admin.refresh")}
              </Button>
              <Button variant="secondary" onClick={lock} className="gap-2 px-4 py-2 text-caption">
                <LogOut size={14} />
                {t("admin.lock")}
              </Button>
            </div>
          )}
        </header>

        {gate === "loading" && (
          <p className="text-body text-foreground/50">{t("admin.checking")}</p>
        )}

        {gate === "misconfigured" && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6">
            <p className="mb-2 text-body font-medium">{t("admin.misconfiguredTitle")}</p>
            <p className="mb-3 text-caption text-foreground/70">{t("admin.misconfiguredBody")}</p>
            {missing.length > 0 && (
              <ul className="space-y-1">
                {missing.map((name) => (
                  <li key={name}>
                    <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-metadata text-foreground">
                      {name}
                    </code>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-metadata text-foreground/50">{t("admin.misconfiguredHint")}</p>
          </div>
        )}

        {gate === "locked" && (
          <form onSubmit={handleUnlock} className="flex max-w-sm flex-col gap-4">
            <p className="text-body text-foreground/70">{t("admin.prompt")}</p>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder={t("admin.passcodePlaceholder")}
              autoComplete="current-password"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-body text-foreground placeholder:text-foreground/40 outline-none transition-colors duration-200 focus:border-accent"
            />
            {authError && <p className="text-caption text-red-600">{authError}</p>}
            <Button type="submit" disabled={busy}>
              <Lock size={14} />
              {busy ? t("admin.checking") : t("admin.unlock")}
            </Button>
          </form>
        )}

        {gate === "unlocked" && (
          <>
            {loadError && <p className="mb-4 text-caption text-red-600">{loadError}</p>}

            {entries.length === 0 && (
              <p className="text-body text-foreground/50">{t("admin.empty")}</p>
            )}

            <div className="flex flex-col gap-6">
              {entries.map((entry) => (
                <EntryEditor key={entry.id} entry={entry} request={request} onChanged={loadEntries} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type EntryEditorProps = {
  entry: AdminGuestbookEntry;
  request: (path: string, init?: RequestInit) => Promise<unknown>;
  onChanged: () => void;
};

function EntryEditor({ entry, request, onChanged }: EntryEditorProps) {
  const t = useTranslations();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const replied = entry.replies.length > 0;
  const latest = entry.replies[entry.replies.length - 1] as GuestbookReply | undefined;

  async function run(action: () => Promise<unknown>, after?: () => void) {
    setBusy(true);
    setError("");
    try {
      await action();
      after?.();
      onChanged();
    } catch (err) {
      if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "NO_KEY")) return;
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  const submitNew = () =>
    run(
      () =>
        request("/api/admin/guestbook", {
          method: "POST",
          body: JSON.stringify({ entryId: entry.id, reply: draft }),
        }),
      () => setDraft("")
    );

  const submitEdit = (replyId: string) =>
    run(
      () =>
        request("/api/admin/guestbook", {
          method: "PATCH",
          body: JSON.stringify({ replyId, reply: draft }),
        }),
      () => {
        setEditingId(null);
        setDraft("");
      }
    );

  const removeReply = (replyId: string) =>
    run(() => request(`/api/admin/guestbook?replyId=${replyId}`, { method: "DELETE" }));

  const removeEntry = () => {
    const message = t("admin.confirmDeleteEntry").replace("{name}", entry.name);
    if (!window.confirm(message)) return;
    run(() => request(`/api/admin/guestbook?entryId=${entry.id}`, { method: "DELETE" }));
  };

  return (
    <article className="rounded-lg border border-border p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-body font-medium">{entry.name}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-metadata uppercase tracking-widest",
              replied ? "bg-accent-secondary/15 text-accent-secondary" : "bg-muted text-foreground/50"
            )}
          >
            {replied ? t("admin.replied") : t("admin.pending")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-metadata text-foreground/40">
            {new Date(entry.created_at).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={removeEntry}
            disabled={busy}
            className="text-foreground/40 transition-colors hover:text-red-600 disabled:opacity-40"
            aria-label={t("admin.deleteEntry")}
            title={t("admin.deleteEntry")}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="text-body text-foreground/70">{entry.message}</p>

      {entry.replies.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-l-2 border-accent-secondary/40 pl-4">
          {entry.replies.map((reply) => (
            <li key={reply.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-caption font-semibold uppercase tracking-widest text-accent-secondary">
                    {OWNER_LABEL}
                  </span>
                  <p className="mt-1 text-body text-foreground/80">{reply.reply}</p>
                  <span className="mt-1 block text-metadata text-foreground/40">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(reply.id);
                      setDraft(reply.reply);
                    }}
                    className="text-foreground/40 transition-colors hover:text-foreground"
                    aria-label={t("admin.editReply")}
                    title={t("admin.editReply")}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReply(reply.id)}
                    disabled={busy}
                    className="text-foreground/40 transition-colors hover:text-red-600 disabled:opacity-40"
                    aria-label={t("admin.deleteReply")}
                    title={t("admin.deleteReply")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingId ? (
        <div className="mt-4 flex flex-col gap-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={t("admin.replyPlaceholder")}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => submitEdit(editingId)}
              disabled={busy || !draft.trim()}
              className="px-4 py-2 text-caption"
            >
              {t("admin.save")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setDraft("");
              }}
              className="gap-2 px-4 py-2 text-caption"
            >
              <X size={14} />
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={t("admin.replyPlaceholder")}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={submitNew}
              disabled={busy || !draft.trim()}
              className="gap-2 px-4 py-2 text-caption"
            >
              <Plus size={14} />
              {latest ? t("admin.addAnother") : t("admin.reply")}
            </Button>
            {draft.trim() && (
              <span className="text-metadata text-foreground/40">
                {draft.trim().length}/1000
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-caption text-red-600">{error}</p>}
    </article>
  );
}
