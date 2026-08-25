"use client";

import { useRef, useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";

function MyanmarFlag({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 12" aria-hidden>
      <rect y="0" width="18" height="4" fill="#FECB00" />
      <rect y="4" width="18" height="4" fill="#34B233" />
      <rect y="8" width="18" height="4" fill="#EA2839" />
      <circle cx="9" cy="6" r="2.2" fill="white" />
    </svg>
  );
}

function UKFlag({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 12" aria-hidden>
      <rect width="18" height="12" fill="#012169" />
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="white" strokeWidth="2" />
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="#C8102E" strokeWidth="1" />
      <path d="M9,0 V12 M0,6 H18" stroke="white" strokeWidth="3.5" />
      <path d="M9,0 V12 M0,6 H18" stroke="#C8102E" strokeWidth="2" />
    </svg>
  );
}

export function LangToggle() {
  const { lang, setLang } = usePreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-line/60 px-2.5 py-1.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
        aria-label="Change language"
      >
        {lang === "my" ? <MyanmarFlag /> : <UKFlag />}
        <span className="hidden sm:inline">{lang === "my" ? "မြန်မာ" : "English"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow)]">
            <button
              onClick={() => { setLang("my"); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep ${
                lang === "my" ? "text-teal" : "text-ink"
              }`}
            >
              <MyanmarFlag />
              မြန်မာ
              {lang === "my" && (
                <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <button
              onClick={() => { setLang("en"); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep ${
                lang === "en" ? "text-teal" : "text-ink"
              }`}
            >
              <UKFlag />
              English
              {lang === "en" && (
                <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
