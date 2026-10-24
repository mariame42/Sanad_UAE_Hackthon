export function LadderBadge({ level }: { level: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#E8F4F3] px-2.5 py-0.5 text-xs font-semibold text-[#1F7A7A] dark:bg-[#1A3D3A] dark:text-[#4DB3B0]">
      {level}
    </span>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </span>
  );
}
