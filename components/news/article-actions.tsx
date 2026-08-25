"use client";

import { useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";

/**
 * Like / Save / Share action bar on article detail (Continuation Spec §8).
 * Writes go straight to PostgREST — RLS restricts rows to the owner.
 */
export function ArticleActions({
  articleId,
  slug,
  title,
  likeCount,
  initiallyLiked,
  initiallySaved,
  isLoggedIn,
}: {
  articleId: string;
  slug: string;
  title: string;
  likeCount: number;
  initiallyLiked: boolean;
  initiallySaved: boolean;
  isLoggedIn: boolean;
}) {
  const { lang } = usePreferences();
  const [liked, setLiked] = useState(initiallyLiked);
  const [saved, setSaved] = useState(initiallySaved);
  const [count, setCount] = useState(likeCount);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function toggle(
    table: "article_likes" | "article_bookmarks",
    isOn: boolean,
    apply: (v: boolean) => void
  ) {
    if (!isLoggedIn) {
      flash(lang === "en" ? "Sign in to save your reactions." : "သိမ်းဆည်းရန် အကောင့်ဝင်ပါ။");
      return;
    }
    // optimistic
    apply(!isOn);
    if (table === "article_likes") setCount((c) => c + (isOn ? -1 : 1));

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let error = null;
    if (isOn) {
      const res = await supabase.from(table).delete().eq("article_id", articleId).eq("user_id", user.id);
      error = res.error;
    } else {
      const res = await supabase.from(table).insert({ article_id: articleId, user_id: user.id });
      error = res.error;
    }

    if (error) {
      // revert optimistic
      apply(isOn);
      if (table === "article_likes") setCount((c) => c + (isOn ? 1 : -1));
      flash(lang === "en" ? "Failed. Try again." : "မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။");
    }
  }

  async function share() {
    const url = `${window.location.origin}/news/${slug}`;
    const shareData = { title, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      throw new Error("no-web-share");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(url);
        flash(lang === "en" ? "Link copied to clipboard" : "လင့်ခ် ကော်ပီကူးပြီးပါပြီ");
      } catch {
        flash(url);
      }
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => toggle("article_likes", liked, setLiked)}
        aria-pressed={liked}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          liked
            ? "border-severe/40 bg-severe-soft text-severe"
            : "border-line bg-card text-muted hover:border-teal/40 hover:text-teal"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .7-4.5 2.2C10.5 3.7 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z" />
        </svg>
        {count > 0 ? count.toLocaleString() : lang === "en" ? "Like" : "ကြိုက်တယ်"}
      </button>

      <button
        onClick={() => toggle("article_bookmarks", saved, setSaved)}
        aria-pressed={saved}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          saved
            ? "border-teal bg-sky text-teal-dark"
            : "border-line bg-card text-muted hover:border-teal/40 hover:text-teal"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 4h12a1 1 0 0 1 1 1v17l-7-4.5L5 22V5a1 1 0 0 1 1-1z" />
        </svg>
        {saved
          ? lang === "en"
            ? "Saved"
            : "သိမ်းပြီး"
          : lang === "en"
            ? "Save"
            : "သိမ်းရန်"}
      </button>

      <button
        onClick={share}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-teal/40 hover:text-teal"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {lang === "en" ? "Share" : "မျှဝေ"}
      </button>

      {!isLoggedIn && (
        <Link href="/auth/login?redirect=%2Fnews" className="ml-1 text-xs font-semibold text-teal hover:underline">
          {lang === "en" ? "Sign in" : "ဝင်ရောက်ရန်"}
        </Link>
      )}

      {toast && (
        <span role="status" className={`absolute -top-9 left-0 rounded-full bg-ink px-3 py-1.5 text-xs text-white shadow ${lang === "my" ? "" : ""}`}>
          {toast}
        </span>
      )}
    </div>
  );
}
