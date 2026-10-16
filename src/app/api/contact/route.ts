import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const FORMSPREE_ENDPOINT = "https://formspree.io/f";
const FORMSPREE_TIMEOUT_MS = 10_000;

type FormspreeErrorBody = {
  errors?: Array<{ message?: string } | string>;
  error?: string;
};

function readFormspreeError(body: FormspreeErrorBody | null, status: number): string {
  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    const messages = body.errors
      .map((entry) => (typeof entry === "string" ? entry : entry?.message ?? ""))
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  if (typeof body?.error === "string" && body.error.trim()) {
    return body.error;
  }
  return `Formspree request failed (status ${status}).`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "General Inquiry").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Name is required (max 100 chars)." }, { status: 400 });
  }
  if (!email || !email.includes("@") || email.length > 255) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "Message is required (max 5000 chars)." }, { status: 400 });
  }

  const formspreeId = process.env.FORMSPREE_ID?.trim();
  if (!formspreeId) {
    return NextResponse.json(
      { error: "Formspree is not configured: set the FORMSPREE_ID environment variable." },
      { status: 500 }
    );
  }

  const { error: dbError } = await supabase
    .from("contact_messages")
    .insert({ name, email, subject, message });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  try {
    const res = await fetch(`${FORMSPREE_ENDPOINT}/${formspreeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        _subject: `[Portfolio] ${subject} — ${name}`,
      }),
      signal: AbortSignal.timeout(FORMSPREE_TIMEOUT_MS),
    });

    if (!res.ok) {
      let parsed: FormspreeErrorBody | null = null;
      try {
        parsed = (await res.json()) as FormspreeErrorBody;
      } catch {
        parsed = null;
      }
      const detail = readFormspreeError(parsed, res.status);
      console.error(`Formspree submission failed (${res.status}): ${detail}`);
      return NextResponse.json(
        { error: `Message could not be delivered via Formspree. ${detail}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    const detail = timedOut ? "Request to Formspree timed out." : "Could not reach Formspree.";
    console.error("Formspree submission error:", err);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
