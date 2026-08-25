import type { Lang } from "@/lib/i18n/dictionary";

/**
 * Bilingual, user-friendly auth error messages (Continuation Spec §2).
 * Never surface raw Supabase/network error objects to users.
 */
export function authErrorMessage(error: unknown, lang: Lang): string {
  const my = lang !== "en";
  const err = error as { code?: string; message?: string } | null;

  // Network-level failure ("Failed to fetch", offline, DNS/CORS blocking)
  if (
    error instanceof TypeError ||
    !err ||
    /failed to fetch|networkerror|load failed|fetch failed/i.test(err.message ?? "")
  ) {
    return my
      ? "ဆက်သွယ်မှု မအောင်မြင်ပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။"
      : "Connection failed. Check your internet connection and try again.";
  }

  switch (err.code) {
    case "invalid_credentials":
    case "user_not_found":
      return my
        ? "အီးမေးလ် သို့မဟုတ် စကားဝှက် မမှန်ကန်ပါ။"
        : "Incorrect email or password.";
    case "email_exists":
    case "user_already_exists":
      return my
        ? "ဤအီးမေးလ်ဖြင့် အကောင့် ရှိပြီးသားဖြစ်ပါသည်။ ဝင်ရောက်ပါ သို့မဟုတ် အခြားအီးမေးလ် သုံးပါ။"
        : "An account with this email already exists. Sign in or use another email.";
    case "weak_password":
      return my
        ? "စကားဝှက်သည် အနည်းဆုံး စာလုံး ၈ လုံး ရှိရမည်။"
        : "Password must be at least 8 characters.";
    case "over_email_send_rate_limit":
      return my
        ? "စကားလုံးပို့မှု ကြိမ်နှုန်း ကျော်လွန်နေပါသည်။ ခဏနေပြီး ထပ်စမ်းပါ။"
        : "Too many emails sent. Please wait a moment and try again.";
    case "email_not_confirmed":
      return my
        ? "အီးမေးလ် အတည်ပြုခြင်း မပြီးဆုံးသေးပါ။ သင့်အီးမေးလ်ကို စစ်ဆေးပါ။"
        : "Your email isn't confirmed yet — please check your inbox.";
    case "user_banned":
      return my ? "ဤအကောင့်ကို ပိတ်ထားပါသည်။" : "This account has been disabled.";
    case "captcha_failed":
      return my ? "လူဖြစ်ကြောင်း အတည်ပြုမှု မအောင်မြင်ပါ။" : "Human verification failed.";
  }

  const msg = err.message ?? "";
  if (/rate limit/i.test(msg)) {
    return my
      ? "ကြိမ်နှုန်း များနေပါသည်။ ခဏနေပြီး ထပ်စမ်းပါ။"
      : "Too many attempts. Please wait a moment and try again.";
  }
  if (/password/i.test(msg) && /short|weak/i.test(msg)) {
    return my
      ? "စကားဝှက်သည် အနည်းဆုံး စာလုံး ၈ လုံး ရှိရမည်။"
      : "Password must be at least 8 characters.";
  }
  if (/already registered|already exists/i.test(msg)) {
    return my
      ? "ဤအီးမေးလ်ဖြင့် အကောင့် ရှိပြီးသားဖြစ်ပါသည်။"
      : "An account with this email already exists.";
  }
  if (/invalid login credentials/i.test(msg)) {
    return my
      ? "အီးမေးလ် သို့မဟုတ် စကားဝှက် မမှန်ကန်ပါ။"
      : "Incorrect email or password.";
  }

  return my
    ? "တစ်စုံတစ်ခု မှားယွင်းနေပါသည်။ ခဏနေရင် ထပ်မံကြိုးစားပေးပါ။"
    : "Something went wrong. Please try again in a moment.";
}
