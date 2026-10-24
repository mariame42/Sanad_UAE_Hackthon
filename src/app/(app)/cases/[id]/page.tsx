import { Suspense } from "react";
import { CaseDetail } from "@/features/sas-triage/CaseDetail";

export default function CaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-5 py-10 text-sm text-slate-500">
          Loading case…
        </div>
      }
    >
      <CaseDetail />
    </Suspense>
  );
}
