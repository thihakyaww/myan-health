"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/i18n/preferences";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = usePreferences();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-lg font-bold leading-[1.75]">
        {lang === "en" ? "Something went wrong" : "တစ်ခုခု မှားယွင်းနေပါသည်"}
      </p>
      <p className="font-serif italic text-teal-dark/80">Something went wrong</p>
      <p className="max-w-sm text-sm leading-[1.75] text-muted">
        {lang === "en"
          ? "The page failed to load. Check your connection and try again."
          : "စာမျက်နှာ ဖွင့်မရပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။"}
      </p>
      <button
        onClick={reset}
        className="mt-3 rounded-[var(--radius)] bg-teal px-6 py-2.5 font-semibold text-white hover:bg-teal-dark transition-colors"
      >
        {lang === "en" ? "Try again" : "ပြန်စမ်းကြည့်ရန်"}
      </button>
    </main>
  );
}
