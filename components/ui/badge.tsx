import { forwardRef } from "react";

export type Tone = "neutral" | "teal" | "saffron" | "severe" | "moss";

const tones: Record<Tone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-paper-deep text-muted border-line", dot: "bg-line" },
  teal: { pill: "bg-sky text-teal-dark border-teal/30", dot: "bg-teal" },
  saffron: { pill: "bg-saffron/15 text-saffron border-saffron/40", dot: "bg-saffron" },
  severe: { pill: "bg-severe-soft text-severe border-severe/30", dot: "bg-severe" },
  moss: { pill: "bg-moss text-ink border-teal/20", dot: "bg-teal-dark/60" },
};

/** Shared taxonomy: every category/status in the app maps to one of these tones. */
export const pillTone: Record<string, Tone> = {
  PUBLIC_HOSPITAL: "teal",
  PRIVATE_HOSPITAL: "saffron",
  HEALTH_CENTER: "moss",
  RED_CROSS_TEAM: "severe",
  SUBMITTED: "neutral",
  UNDER_REVIEW: "saffron",
  VERIFIED: "moss",
  REJECTED: "severe",
  MILD: "neutral",
  MODERATE: "saffron",
  SEVERE: "severe",
  PREVENTION: "teal",
  DISEASE_INFO: "saffron",
  HEALTH_TIPS: "moss",
};

export const Badge = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    tone?: Tone;
    /** show the colored status dot */
    dot?: boolean;
  }
>(function Badge({ tone = "neutral", dot = false, className = "", children, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone].pill} ${className}`}
      {...props}
    >
      {dot && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${tones[tone].dot}`} />}
      {children}
    </span>
  );
});
