import { forwardRef } from "react";

export const inputClass =
  "w-full rounded-[var(--radius)] border border-line bg-card px-4 py-2.5 outline-none transition-shadow focus:border-teal focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/60 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  }
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`${inputClass} appearance-none pr-10 ${className}`}
        {...props}
      />
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`${inputClass} min-h-28 ${className}`} {...props} />;
});
