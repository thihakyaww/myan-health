"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";

/** Shared empty state — shows only the selected language. */
export function EmptyState({
  titleMy,
  titleEn,
  hintMy,
  hintEn,
  action,
}: {
  titleMy: string;
  titleEn: string;
  hintMy?: string;
  hintEn?: string;
  action?: { href: string; label: string };
}) {
  const { lang } = usePreferences();
  const title = lang === "en" ? titleEn : titleMy;
  const hint = lang === "en" ? hintEn : hintMy;

  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-line bg-card/60 px-6 py-14 text-center">
      <svg
        aria-hidden
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4 opacity-70"
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8M8 13h6" />
      </svg>
      <p className="font-bold leading-[1.75]">{title}</p>
      {hint && (
        <p className="mt-2 max-w-sm text-sm leading-[1.75] text-muted">
          {hint}
        </p>
      )}
      {action && (
        <Link href={action.href} className="mt-5 text-sm font-semibold text-teal hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
