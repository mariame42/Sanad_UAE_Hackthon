import { DashboardView } from "@/features/analytics/DashboardView";
import { PageTransition } from "@/components/motion/PageTransition";

export default function DashboardPage() {
  return (
    <PageTransition>
      <DashboardView />
    </PageTransition>
  );
}
