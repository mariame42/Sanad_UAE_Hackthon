import { PassportView } from "@/features/passport/PassportView";
import { PageTransition } from "@/components/motion/PageTransition";

export default function PassportPage() {
  return (
    <PageTransition>
      <PassportView />
    </PageTransition>
  );
}
