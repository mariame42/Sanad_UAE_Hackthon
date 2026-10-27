import { ConcernDeskForm } from "@/features/concern-intake/ConcernDeskForm";
import { PageTransition } from "@/components/motion/PageTransition";

export default function ConcernPage() {
  return (
    <PageTransition>
      <ConcernDeskForm />
    </PageTransition>
  );
}
