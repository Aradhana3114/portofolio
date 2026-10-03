import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import type { Metadata } from "next";
import { MusicPlayer } from "@/components/music-player";
import { Providers } from "@/components/providers";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "../globals.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/images/mark-ink.png", type: "image/png" },
      { url: "/images/mark-cream.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/images/mark-ink.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
      <html lang={locale} className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})();",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ScrollProgress />
            {children}
            <MusicPlayer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
