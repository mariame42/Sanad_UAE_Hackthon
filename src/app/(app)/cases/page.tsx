import { CaseHub } from "@/features/sas-triage/CaseHub";
import { PageTransition } from "@/components/motion/PageTransition";

export default function CasesPage() {
  return (
    <PageTransition>
      <CaseHub />
    </PageTransition>
  );
}
