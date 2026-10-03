"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, LogOut, Pencil, Plus, RefreshCw, Trash2, X, Eye, EyeOff } from "lucide-react";
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
  const [showPasscode, setShowPasscode] = useState(false);
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

  const isLockedView = gate !== "unlocked";

  return (
    <section
      className={
        isLockedView
          ? "relative flex min-h-svh items-center justify-center py-10"
          : "relative py-24"
      }
    >
      <div className="container-editorial w-full">
        <header
          className={
            isLockedView
              ? "mb-7 flex flex-col items-center gap-3 text-center"
              : "mb-10 flex flex-wrap items-end justify-between gap-4"
          }
        >
          <div>
            <h1 className="inline-block -rotate-1 border-[3px] border-border bg-brutal-yellow px-4 py-1.5 font-display text-h1 font-extrabold uppercase leading-none tracking-tighter text-brutal-ink shadow-brutal-md">
              {t("admin.title")}
            </h1>
            <p
              className={
                isLockedView
                  ? "mx-auto mt-2.5 max-w-md text-caption text-foreground/70"
                  : "mt-3 max-w-xl text-body text-foreground/70"
              }
            >
              {t("admin.subtitle")}
            </p>
          </div>
          {gate === "unlocked" && (
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={loadEntries} className="gap-2">
                <RefreshCw size={14} strokeWidth={3} />
                {t("admin.refresh")}
              </Button>
              <Button variant="secondary" size="sm" onClick={lock} className="gap-2">
                <LogOut size={14} strokeWidth={3} />
                {t("admin.lock")}
              </Button>
            </div>
          )}
        </header>

        {gate === "loading" && (
          <div className="mx-auto max-w-md border-[3px] border-border bg-muted px-5 py-4 text-center text-body font-bold">
            {t("admin.checking")}
          </div>
        )}

        {gate === "misconfigured" && (
          <div className="mx-auto max-w-2xl border-[3px] border-border bg-brutal-pink p-6 text-brutal-ink shadow-brutal-lg">
            <p className="mb-2 font-display text-body font-extrabold uppercase">{t("admin.misconfiguredTitle")}</p>
            <p className="mb-3 text-caption text-brutal-ink/80">{t("admin.misconfiguredBody")}</p>
            {missing.length > 0 && (
              <ul className="space-y-1">
                {missing.map((name) => (
                  <li key={name}>
                    <code className="border-[3px] border-border bg-background px-1.5 py-0.5 text-metadata text-foreground">
                      {name}
                    </code>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-metadata font-bold uppercase tracking-widest opacity-70">{t("admin.misconfiguredHint")}</p>
          </div>
        )}

        {gate === "locked" && (
          <form
            onSubmit={handleUnlock}
            className="mx-auto flex max-w-md flex-col items-stretch gap-4 border-[3px] border-border bg-muted p-5 shadow-brutal-lg sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center border-[3px] border-border bg-brutal-yellow text-brutal-ink shadow-brutal-sm"
                aria-hidden="true"
              >
                <Lock size={20} strokeWidth={3} />
              </span>
              <p className="text-caption font-bold">{t("admin.prompt")}</p>
            </div>

            <div className="relative">
              <input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={t("admin.passcodePlaceholder")}
                autoComplete="current-password"
                aria-label={t("admin.passcodePlaceholder")}
                className="w-full rounded-sm border-[3px] border-border bg-background py-2.5 pl-4 pr-14 text-body text-foreground placeholder:text-foreground/40 transition-all duration-150 focus:outline-none focus:shadow-brutal-sm"
              />
              <button
                type="button"
                onClick={() => setShowPasscode((v) => !v)}
                aria-label={showPasscode ? t("admin.hidePasscode") : t("admin.showPasscode")}
                aria-pressed={showPasscode}
                title={showPasscode ? t("admin.hidePasscode") : t("admin.showPasscode")}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border-[3px] border-border bg-background text-foreground transition-all duration-150 hover:bg-brutal-purple hover:text-brutal-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-brutal-blue"
              >
                {showPasscode ? <EyeOff size={16} strokeWidth={3} /> : <Eye size={16} strokeWidth={3} />}
              </button>
            </div>

            {authError && (
              <p className="border-[3px] border-border bg-brutal-pink px-3 py-2 text-caption font-bold text-brutal-ink">
                {authError}
              </p>
            )}

            <Button type="submit" size="md" disabled={busy} className="w-full">
              <Lock size={16} strokeWidth={3} />
              {busy ? t("admin.checking") : t("admin.unlock")}
            </Button>
          </form>
        )}

        {gate === "unlocked" && (
          <>
            {loadError && (
              <p className="mb-4 border-[3px] border-border bg-brutal-pink px-4 py-3 text-caption font-bold text-brutal-ink">
                {loadError}
              </p>
            )}

            {entries.length === 0 && (
              <p className="border-[3px] border-border bg-muted px-4 py-3 text-body font-bold">{t("admin.empty")}</p>
            )}

            <div className="flex flex-col gap-8">
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
    <article className="border-[3px] border-border bg-background p-5 shadow-brutal">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-border pb-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-body font-extrabold uppercase tracking-tight">{entry.name}</span>
          <span
            className={cn(
              "rounded-sm border-[3px] border-border px-2 py-0.5 text-metadata font-display font-extrabold uppercase tracking-widest",
              replied ? "bg-brutal-green text-brutal-ink" : "bg-muted text-foreground/50"
            )}
          >
            {replied ? t("admin.replied") : t("admin.pending")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-metadata font-bold text-foreground/40">
            {new Date(entry.created_at).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={removeEntry}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-pink text-brutal-ink transition-all duration-150 hover:-translate-y-[2px] hover:shadow-brutal-sm disabled:opacity-40"
            aria-label={t("admin.deleteEntry")}
            title={t("admin.deleteEntry")}
          >
            <Trash2 size={15} strokeWidth={3} />
          </button>
        </div>
      </div>

      <p className="text-body text-foreground/75">{entry.message}</p>

      {entry.replies.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3">
          {entry.replies.map((reply) => (
            <li key={reply.id} className="border-[3px] border-border bg-brutal-blue p-4 text-brutal-ink">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block border-[3px] border-border bg-brutal-ink px-2 py-0.5 font-display text-metadata font-extrabold uppercase text-brutal-yellow">
                    {OWNER_LABEL}
                  </span>
                  <p className="mt-2 text-body">{reply.reply}</p>
                  <span className="mt-1 block text-metadata font-bold opacity-60">
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
                    className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-background transition-all duration-150 hover:-translate-y-[2px] hover:bg-brutal-yellow hover:shadow-brutal-sm"
                    aria-label={t("admin.editReply")}
                    title={t("admin.editReply")}
                  >
                    <Pencil size={14} strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReply(reply.id)}
                    disabled={busy}
                    className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-pink transition-all duration-150 hover:-translate-y-[2px] hover:shadow-brutal-sm disabled:opacity-40"
                    aria-label={t("admin.deleteReply")}
                    title={t("admin.deleteReply")}
                  >
                    <Trash2 size={14} strokeWidth={3} />
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
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => submitEdit(editingId)}
              disabled={busy || !draft.trim()}
              size="sm"
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
              size="sm"
              className="gap-2"
            >
              <X size={14} strokeWidth={3} />
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
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={submitNew}
              disabled={busy || !draft.trim()}
              size="sm"
              className="gap-2"
            >
              <Plus size={14} strokeWidth={3} />
              {latest ? t("admin.addAnother") : t("admin.reply")}
            </Button>
            {draft.trim() && (
              <span className="border-[3px] border-border bg-muted px-2 py-0.5 text-metadata font-bold">
                {draft.trim().length}/1000
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 border-[3px] border-border bg-brutal-pink px-3 py-2 text-caption font-bold text-brutal-ink">
          {error}
        </p>
      )}
    </article>
  );
}
