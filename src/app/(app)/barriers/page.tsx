import { BarrierMap } from "@/features/analytics/BarrierMap";
import { PageTransition } from "@/components/motion/PageTransition";

export default function BarriersPage() {
  return (
    <PageTransition>
      <BarrierMap />
    </PageTransition>
  );
}
