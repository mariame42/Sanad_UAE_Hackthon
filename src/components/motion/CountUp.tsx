"use client";

import { useLayoutEffect, useRef } from "react";

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** ms */
  duration?: number;
};

function render(n: number, decimals: number, prefix: string, suffix: string) {
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

/**
 * Number that counts up on mount and glides between values. It animates the
 * text node directly (no re-renders), so SSR output and screen readers always
 * get the final value.
 */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 900 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useLayoutEffect(() => {
    const node = ref.current?.firstChild;
    const start = from.current;
    from.current = value;
    if (!node || start === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.nodeValue = render(start + (value - start) * eased, decimals, prefix, suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    node.nodeValue = render(start, decimals, prefix, suffix);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      node.nodeValue = render(value, decimals, prefix, suffix);
    };
  }, [value, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {render(value, decimals, prefix, suffix)}
    </span>
  );
}

/** CountUp for display strings like "3.6", "84%", "~53" or "3 / 4" (first number animates). */
export function CountUpText({ text }: { text: string }) {
  const m = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/.exec(text);
  if (!m) return <>{text}</>;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return <CountUp value={Number(m[2])} decimals={decimals} prefix={m[1]} suffix={m[3]} />;
}
