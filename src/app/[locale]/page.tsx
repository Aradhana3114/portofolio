import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navigation/navbar";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Works } from "@/components/sections/works";
import { TechStack } from "@/components/sections/tech-stack";
import { Services } from "@/components/sections/services";
import { Journey } from "@/components/sections/journey";
import { Guestbook } from "@/components/sections/guestbook";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";
import { SplashScreen } from "@/components/splash-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicFavicon } from "@/components/dynamic-favicon";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SplashScreen />
      <ThemeProvider>
        <DynamicFavicon />
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Works />
          <TechStack />
          <Services />
          <Journey />
          <Guestbook />
          <Contact />
        </main>
        <Footer />
      </ThemeProvider>
    </>
  );
}
