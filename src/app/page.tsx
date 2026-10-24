import { HowSanadHelps } from "@/components/welcome/HowSanadHelps";
import { WelcomeFooter } from "@/components/welcome/WelcomeFooter";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";

export default function WelcomePage() {
  return (
    <>
      <WelcomeHeader />
      <main className="flex-1 bg-[#F9FBFC] dark:bg-[#0B1615]">
        <WelcomeHero />
        <HowSanadHelps />
      </main>
      <WelcomeFooter />
    </>
  );
}
