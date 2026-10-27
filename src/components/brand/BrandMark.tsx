/** Two leaves holding a drop — vector version of /logo.png that works in dark mode. */
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="sanad-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2BB3A6" />
          <stop offset="1" stopColor="#1F7A7A" />
        </linearGradient>
        <linearGradient id="sanad-leaf-2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5FCF9E" />
          <stop offset="1" stopColor="#2BA59B" />
        </linearGradient>
      </defs>
      <path d="M22 38C10 38 2 30 2 19 2 11 6 5 9 2c3 6 13 10 13 22 0 6-2 10 0 14Z" fill="url(#sanad-leaf)" />
      <path d="M26 38c12 0 20-8 20-19 0-8-4-14-7-17-3 6-13 10-13 22 0 6 2 10 0 14Z" fill="url(#sanad-leaf-2)" />
      <path d="M24 22c2.5 3.5 4 6.5 4 9a4 4 0 0 1-8 0c0-2.5 1.5-5.5 4-9Z" className="fill-[#F9FBFC] dark:fill-[#0B1615]" />
    </svg>
  );
}
