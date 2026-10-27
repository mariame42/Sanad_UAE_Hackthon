import { AdjustmentRequests } from "@/features/passport/AdjustmentRequests";
import { PageTransition } from "@/components/motion/PageTransition";

export default function AdjustmentsPage() {
  return (
    <PageTransition>
      <AdjustmentRequests />
    </PageTransition>
  );
}
