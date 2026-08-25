import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "outline-light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-teal text-white hover:bg-teal-dark",
  secondary: "bg-paper-deep text-ink hover:bg-moss",
  ghost: "bg-transparent text-ink hover:bg-paper-deep",
  danger: "bg-severe text-white hover:bg-severe/90",
  outline: "border border-line bg-card text-ink hover:bg-paper-deep",
  "outline-light":
    "border border-white/60 bg-transparent text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md") =>
  `inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 ${variants[variant]} ${sizes[size]}`;

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ variant = "primary", size = "md", className = "", ...props }, ref) {
  return <button ref={ref} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
});
