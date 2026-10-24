"use client";

import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { MockStoreProvider } from "@/lib/mock/MockStoreProvider";
import { RoleProvider } from "@/lib/roles/RoleProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <RoleProvider>
        <MockStoreProvider>{children}</MockStoreProvider>
      </RoleProvider>
    </LocaleProvider>
  );
}
