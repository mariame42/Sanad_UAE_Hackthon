import { Suspense } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { CaseDetail } from "@/features/sas-triage/CaseDetail";

export default function CaseDetailPage() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-5 py-10 sm:px-8" aria-label="Loading case">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-9 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        }
      >
        <CaseDetail />
      </Suspense>
    </PageTransition>
  );
}
