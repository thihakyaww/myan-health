"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";

/**
 * Page header — shows only the selected language.
 * Pass `titleMy`/`titleEn` and `ledeMy`/`ledeEn`; the component picks one.
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
    <header className="mb-8 md:mb-10">
      {eyebrow && <p className="eyebrow mb-3 text-teal-dark/70">{eyebrow}</p>}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="max-w-2xl text-3xl font-bold leading-[1.4] tracking-tight text-ink md:text-4xl">
            {title}
          </h1>
          {lede && (
            <p className="mt-3 max-w-2xl leading-[1.75] text-muted">{lede}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function PageContainer({ children, width = "wide" }: { children: React.ReactNode; width?: "wide" | "reading" }) {
  return (
    <main
      className={`mx-auto w-full flex-1 px-4 pt-20 pb-16 md:pt-24 ${
        width === "reading" ? "max-w-3xl" : "max-w-6xl"
      }`}
    >
      {children}
    </main>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}
