import { Suspense } from "react";
import { AppHeader } from "@/components/shell/AppHeader";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div className="h-20 border-b border-slate-100 dark:border-slate-800" />
        }
      >
        <AppHeader />
      </Suspense>
      <main className="flex-1 bg-[#F9FBFC] dark:bg-[#0B1615]">{children}</main>
    </>
  );
}
