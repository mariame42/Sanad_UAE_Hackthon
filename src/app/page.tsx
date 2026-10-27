import { Suspense } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { AppHeader } from "@/components/shell/AppHeader";
import { HowSanadHelps } from "@/components/welcome/HowSanadHelps";
import { WelcomeFooter } from "@/components/welcome/WelcomeFooter";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";

export default function WelcomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="h-20 border-b border-slate-100 dark:border-slate-800" />
        }
      >
        <AppHeader />
      </Suspense>
      <div aria-hidden className="ambient" />
      <PageTransition>
        <main className="flex-1">
          <WelcomeHero />
          <HowSanadHelps />
        </main>
        <WelcomeFooter />
      </PageTransition>
    </>
  );
}
