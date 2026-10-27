import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100";

type LabelProps = {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ id, label, hint, children }: LabelProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${fieldClass} min-h-28 resize-y ${className}`}
      {...props}
    />
  );
}
