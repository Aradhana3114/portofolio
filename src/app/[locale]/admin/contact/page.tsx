import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { ContactAdmin } from "@/components/admin/contact-admin";

// Nothing here should ever be cached or indexed.
export const metadata: Metadata = {
  title: "Contact Admin",
  robots: { index: false, follow: false, nocache: true },
};

// This page is a client-side shell only: it fetches nothing on the server, so no
// contact data can leak into the HTML. force-dynamic keeps it off the
// prerender cache so a stale shell is never served after an env change.
export const dynamic = "force-dynamic";

export default async function ContactAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ThemeProvider>
      {/* No navbar on this route, so no top offset here — ContactAdmin owns
          the full viewport and centres itself. */}
      <main>
        <ContactAdmin />
      </main>
    </ThemeProvider>
  );
}
