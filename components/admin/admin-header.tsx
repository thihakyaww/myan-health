"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";

/**
 * Admin page header — shows only the selected language.
 */
export function PageHeader({
  eyebrow,
  titleMy,
  titleEn,
  ledeMy,
  ledeEn,
  actions,
}: {
  eyebrow?: string;
  titleMy: string;
  titleEn?: string;
  ledeMy?: string;
  ledeEn?: string;
  actions?: React.ReactNode;
}) {
  const { lang } = usePreferences();
  const title = lang === "en" ? (titleEn ?? titleMy) : titleMy;
  const lede = lang === "en" ? (ledeEn ?? ledeMy) : ledeMy;

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          {eyebrow && (
            <p className="eyebrow mb-2 text-teal-dark/50">{eyebrow}</p>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[2.5rem] md:leading-tight">
            {title}
          </h1>
          {lede && <p className="mt-2 max-w-2xl leading-relaxed text-muted">{lede}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function PageContainer({ children }: { children: React.ReactNode; width?: "wide" | "reading" }) {
  return <div className="mx-auto w-full max-w-6xl">{children}</div>;
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-teal-dark/60 transition-colors hover:bg-white hover:text-teal-dark"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}
