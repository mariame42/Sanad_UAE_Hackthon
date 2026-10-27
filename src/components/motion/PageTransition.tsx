import { ViewTransition } from "react";

/**
 * Wrap each page (not the layout — layouts persist, so enter/exit never fire).
 * Navigations are transitions in Next.js, so the old page fades out and the
 * new one rises in. Browsers without View Transitions just swap instantly.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
