"use client";

import { usePreferences } from "@/lib/i18n/preferences";

/**
 * Consent/disclaimer modal shown before chat is usable (Spec §1).
 * Persisted via sessionStorage key "myanhealth.chat.consentDismissed".
 */
export function ConsentModal({ onDismiss }: { onDismiss: () => void }) {
  const { lang } = usePreferences();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-sm rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)]">
        {/* Close */}
        <button
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-muted hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-severe-soft text-severe">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-lg font-bold">ကျန်းမာရေးဆိုင်ရာ အသိပေးချက်</h2>

        {/* Body */}
        <p className={`mb-4 text-sm text-muted ${lang === "my" ? "leading-[1.9]" : ""}`}>
          ဤအဖော်ကို အထွေထွေကျန်းမာရေးအချက်အလက်ကိုသာ ပေးပါသည်။ ရောဂါကို
          အတည်ပြုမပေးနိုင်သလို ဆရာဝန်၏ စစ်ဆေးမှုနှင့် ကုသမှုကိုလည်း အစား
          မထိုးနိုင်ပါ။
        </p>

        {/* Emergency callout */}
        <div className={`mb-5 rounded-lg bg-severe-soft p-3 text-sm text-severe ${lang === "my" ? "leading-[1.9]" : ""}`}>
          အရေးပေါ်လက္ခဏာများ ဖြစ်သည့် အသက်ရှုခက်ခြင်း၊ ရင်ဘတ်ပြင်းထန်စွာနာခြင်း၊
          သတိလစ်ခြင်း၊ ခန္ဓာကိုယ်တစ်ဖက်အားနည်းခြင်း၊ မရပ်နိုင်သော သွေးထွက်ခြင်း
          တို့ရှိလျှင် အနီးဆုံး အရေးပေါ်ဌာန သို့မဟုတ် ဆေးရုံသို့ ချက်ချင်းသွားပါ။
        </div>

        {/* Primary button */}
        <button
          onClick={onDismiss}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-teal px-4 py-3 text-sm font-bold text-white hover:bg-teal-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          နားလည်ပါပြီ၊ စတင်မေးမြန်းမည်
        </button>
      </div>
    </div>
  );
}

/**
 * Persistent compact banner shown above chat header (Spec §1).
 */
export function ConsentBanner() {
  const { lang } = usePreferences();

  return (
    <div className={`flex items-center gap-2 bg-severe-soft px-4 py-2 text-xs text-severe ${lang === "my" ? "leading-[1.8]" : ""}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        အသိပေးပါသည်။ ဤနေရာသည် အထွေထွေကျန်းမာရေးအချက်အလက်အတွက်သာ ဖြစ်ပြီး ဆရာဝန်၏
        စစ်ဆေးမှု၊ ရောဂါအတည်ပြု သို့မဟုတ် အရေးပေါ်ကူညီမှုကို အစားမထိုးနိုင်ပါ။
      </span>
    </div>
  );
}

/** Check if consent was already dismissed this session */
export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("myanhealth.chat.consentDismissed") === "1";
}

/** Mark consent as dismissed for this session */
export function setConsentDismissed() {
  sessionStorage.setItem("myanhealth.chat.consentDismissed", "1");
}
