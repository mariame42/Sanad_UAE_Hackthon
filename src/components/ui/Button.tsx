import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-gradient-to-b from-[#1A5152] to-[#0F3D3E] text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_8px_20px_-8px_rgb(15_61_62/0.6)] hover:-translate-y-px hover:shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_12px_24px_-8px_rgb(15_61_62/0.65)] dark:from-[#5FC4C1] dark:to-[#4DB3B0] dark:text-[#0B1615] dark:shadow-[0_8px_20px_-8px_rgb(77_179_176/0.5)]",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-px hover:border-slate-300 hover:shadow dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:translate-y-0 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
