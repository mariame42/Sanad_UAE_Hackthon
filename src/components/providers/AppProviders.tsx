"use client";

import { Suspense } from "react";
import { DemoConductor } from "@/components/demo/DemoConductor";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { MockStoreProvider } from "@/lib/mock/MockStoreProvider";
import { RoleProvider } from "@/lib/roles/RoleProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <RoleProvider>
        <MockStoreProvider>
          {children}
          <Suspense fallback={null}>
            <DemoConductor />
          </Suspense>
        </MockStoreProvider>
      </RoleProvider>
    </LocaleProvider>
  );
}
