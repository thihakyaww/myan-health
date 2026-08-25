export type Lang = "my" | "en";

export const LANG_DEFAULT: Lang = "my";

const dict = {
  my: {
    "nav.news": "သတင်း",
    "nav.healthcare": "ကျန်းမာရေး ဝန်ဆောင်မှု",
    "nav.reports": "အစီရင်ခံချက်",
    "nav.chat": "AI အကူအညီ",
    "nav.profile": "ပရိုဖိုင်",
    "nav.contact": "ဆက်သွယ်ရန်",
    "auth.login": "ဝင်ရောက်ရန်",
    "auth.signup": "အကောင့်ဖွင့်ရန်",
    "auth.logout": "ထွက်ရန်",
    "hero.title.en_line": "Myanmar's health, in your language.",
    "hero.body":
      "ကျန်းမာရေး သတင်းအချက်အလက်၊ ဆေးရုံနှင့် ကြက်ခြေနီ စုစည်းရမှု၊ ရောဂါအစီရင်ခံချက်နှင့် AI ကျန်းမာရေး အကူအညီ — အားလုံး တစ်နေရာတည်းမှာ။",
    "hero.cta.news": "သတင်း ဖတ်ရန်",
    "hero.cta.healthcare": "ဆေးရုံ ရှာရန်",
    "home.features_title": "ဘာတွေ ရှိလဲ",
    "common.loading": "ခဏ စောင့်ပါ…",
  },
  en: {
    "nav.news": "News",
    "nav.healthcare": "Healthcare",
    "nav.reports": "Reports",
    "nav.chat": "AI Chat",
    "nav.profile": "Profile",
    "nav.contact": "Contact us",
    "auth.login": "Sign in",
    "auth.signup": "Sign up",
    "auth.logout": "Sign out",
    "hero.title.en_line": "Myanmar's health, in your language.",
    "hero.body":
      "Health news, a facility & Red Cross directory, disease and health reports, and an AI health assistant — all in one place.",
    "hero.cta.news": "Read the news",
    "hero.cta.healthcare": "Find facilities",
    "home.features_title": "What's inside",
    "common.loading": "Loading…",
  },
} as const;

export type DictKey = keyof (typeof dict)["my"];

export function t(lang: Lang, key: DictKey): string {
  return dict[lang][key] ?? dict.my[key];
}
