"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/lib/i18n/preferences";

/**
 * "Sign in with Google" via Supabase Auth OAuth (Continuation Spec §2.2).
 */
export function GoogleButton({ label }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("redirect") ?? "/";
  const { lang } = usePreferences();

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (error) {
      setError(
        error.message.includes("provider")
          ? (lang === "en" ? "Google sign-in is temporarily unavailable." : "Google ဖြင့် ဝင်ရောက်ခြင်းကို ယာယီရပ်တန့်ထားပါသည်။")
          : (lang === "en" ? "Could not start Google sign-in." : "Google ဝင်ရောက်မှု မအောင်မြင်ပါ။")
      );
      setLoading(false);
    }
    // On success the browser redirects to Google — nothing else to do.
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-deep disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3.1 0 5.9 1.2 8 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 29l-6.6 5A20 20 0 0 0 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
        {loading
          ? "…"
          : (label ??
            (lang === "en" ? "Continue with Google" : "Google ဖြင့် ဆက်လက်လုပ်ဆောင်ရန်"))}
      </button>
      {error && (
        <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm leading-[1.75] text-severe">
          {error}
        </p>
      )}
    </div>
  );
}
