"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, LogOut, Mail, Pencil, RefreshCw, Trash2, X, Eye, EyeOff, MessageSquare } from "lucide-react";
import type { ContactMessage } from "@/data/types";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADMIN_STORAGE_KEY } from "@/lib/admin-session";

type GateState = "loading" | "locked" | "unlocked" | "misconfigured";

type Misconfigured = { missing: string[] };

export function ContactAdmin() {
  const t = useTranslations();
  const locale = useLocale();
  const [gate, setGate] = useState<GateState>("loading");
  const [missing, setMissing] = useState<string[]>([]);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  // Request helper: attaches the passcode, and hard-locks the UI on 401/503 so a
  // wrong or revoked passcode can never leave the form in a half-authed state.
  const request = useCallback(
    async (path: string, init?: RequestInit) => {
      const key =
        typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_STORAGE_KEY) : null;
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
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
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

  const loadMessages = useCallback(async () => {
    setLoadError("");
    try {
      const data = await request("/api/admin/contact");
      setMessages(data.messages ?? []);
    } catch (err) {
      if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "NO_KEY")) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load.");
    }
  }, [request]);

  // On mount: validate any stored passcode before showing the editor.
  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!stored) {
      setGate("locked");
      return;
    }
    request("/api/admin/contact")
      .then((data) => {
        setMessages(data.messages ?? []);
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

    const res = await fetch("/api/admin/contact", {
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
    window.localStorage.setItem(ADMIN_STORAGE_KEY, candidate);
    setPasscode("");
    setMessages(data.messages ?? []);
    setGate("unlocked");
    setBusy(false);
  }

  function lock() {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    setMessages([]);
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
              {t("adminContact.title")}
            </h1>
            <p
              className={
                isLockedView
                  ? "mx-auto mt-2.5 max-w-md text-caption text-foreground/70"
                  : "mt-3 max-w-xl text-body text-foreground/70"
              }
            >
              {t("adminContact.subtitle")}
            </p>
          </div>
          {gate === "unlocked" && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                href={`/${locale}/admin/guestbook`}
                className="gap-2"
              >
                <MessageSquare size={14} strokeWidth={3} />
                {t("adminContact.navGuestbook")}
              </Button>
              <Button variant="secondary" size="sm" onClick={loadMessages} className="gap-2">
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

            {messages.length === 0 && (
              <p className="border-[3px] border-border bg-muted px-4 py-3 text-body font-bold">{t("admin.empty")}</p>
            )}

            <div className="flex flex-col gap-8">
              {messages.map((message) => (
                <MessageCard key={message.id} message={message} request={request} onChanged={loadMessages} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type MessageCardProps = {
  message: ContactMessage;
  request: (path: string, init?: RequestInit) => Promise<unknown>;
  onChanged: () => void;
};

// Gmail web compose link so the reply opens in Gmail directly instead of the
// OS mail client. `tf=cm` is the current reliable way to land on a compose
// window inside the main Gmail interface (like #inbox?compose=new) with the
// recipient prefilled — the older `view=cm&fs=1` form often redirects to a
// blank inbox compose, especially with multiple signed-in accounts.
function gmailComposeUrl(msg: ContactMessage): string {
  const params = new URLSearchParams({
    to: msg.email,
    su: `Re: ${msg.subject}`,
    tf: "cm",
  });
  return `https://mail.google.com/mail/u/0/?${params.toString()}`;
}

function MessageCard({ message, request, onChanged }: MessageCardProps) {
  const t = useTranslations();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(message.subject);
  const [draft, setDraft] = useState(message.message);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  const submitEdit = () =>
    run(
      () =>
        request("/api/admin/contact", {
          method: "PATCH",
          body: JSON.stringify({ id: message.id, subject: subject.trim(), message: draft }),
        }),
      () => setEditing(false)
    );

  const removeMessage = () => {
    const confirmText = t("adminContact.confirmDeleteMessage").replace("{name}", message.name);
    if (!window.confirm(confirmText)) return;
    run(() => request(`/api/admin/contact?id=${message.id}`, { method: "DELETE" }));
  };

  const cancelEdit = () => {
    setSubject(message.subject);
    setDraft(message.message);
    setEditing(false);
    setError("");
  };

  return (
    <article className="border-[3px] border-border bg-background p-5 shadow-brutal">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-border pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-body font-extrabold uppercase tracking-tight">{message.name}</span>
          <span className="rounded-sm border-[3px] border-border bg-brutal-blue px-2 py-0.5 text-metadata font-display font-extrabold uppercase tracking-widest text-brutal-ink">
            {message.subject}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-metadata font-bold text-foreground/40">
            {new Date(message.created_at).toLocaleString()}
          </span>
          <a
            href={gmailComposeUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-green text-brutal-ink transition-all duration-150 hover:-translate-y-[2px] hover:shadow-brutal-sm"
            aria-label={t("adminContact.replyEmail")}
            title={t("adminContact.replyEmail")}
          >
            <Mail size={15} strokeWidth={3} />
          </a>
          <button
            type="button"
            onClick={() => (editing ? cancelEdit() : setEditing(true))}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-background transition-all duration-150 hover:-translate-y-[2px] hover:bg-brutal-yellow hover:shadow-brutal-sm disabled:opacity-40"
            aria-label={editing ? t("admin.cancel") : t("adminContact.editMessage")}
            title={editing ? t("admin.cancel") : t("adminContact.editMessage")}
          >
            {editing ? <X size={15} strokeWidth={3} /> : <Pencil size={15} strokeWidth={3} />}
          </button>
          <button
            type="button"
            onClick={removeMessage}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-pink text-brutal-ink transition-all duration-150 hover:-translate-y-[2px] hover:shadow-brutal-sm disabled:opacity-40"
            aria-label={t("adminContact.deleteMessage")}
            title={t("adminContact.deleteMessage")}
          >
            <Trash2 size={15} strokeWidth={3} />
          </button>
        </div>
      </div>

      <a
        href={gmailComposeUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-metadata font-bold text-brutal-blue underline underline-offset-2 hover:text-foreground"
      >
        {message.email}
      </a>

      {editing ? (
        <div className="mt-3 flex flex-col gap-3">
          <label className="text-metadata font-display font-extrabold uppercase tracking-widest text-foreground/70">
            {t("adminContact.subjectLabel")}
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={150}
              className="mt-1.5"
            />
          </label>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            maxLength={5000}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={submitEdit} disabled={busy || !subject.trim() || !draft.trim()} size="sm">
              {t("admin.save")}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEdit} size="sm" className="gap-2">
              <X size={14} strokeWidth={3} />
              {t("admin.cancel")}
            </Button>
            <span className="border-[3px] border-border bg-muted px-2 py-0.5 text-metadata font-bold">
              {draft.trim().length}/5000
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-body text-foreground/75">{message.message}</p>
      )}

      {error && (
        <p className="mt-4 border-[3px] border-border bg-brutal-pink px-3 py-2 text-caption font-bold text-brutal-ink">
          {error}
        </p>
      )}
    </article>
  );
}
