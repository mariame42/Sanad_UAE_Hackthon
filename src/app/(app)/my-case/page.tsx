import { MyCaseView } from "@/features/check-in/MyCaseView";
import { PageTransition } from "@/components/motion/PageTransition";

export default function MyCasePage() {
  return (
    <PageTransition>
      <MyCaseView />
    </PageTransition>
  );
}
