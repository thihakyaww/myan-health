"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";
import { ChatIcon, HealthcareIcon, NewsIcon } from "@/components/icons";

const FEATURES = [
  {
    Icon: NewsIcon,
    my: "ကျန်းမာရေး သတင်းများ",
    en: "Health news",
    dMy: "ကာကွယ်ရေးနှင့် ကုသမှု သတင်းအချက်အလက်များ မြန်မာဘာသာဖြင့်။",
    dEn: "Prevention and care updates, written in Burmese first.",
    href: "/news",
    ctaMy: "သတင်း ဖတ်ရန်",
    ctaEn: "Read the news",
  },
  {
    Icon: HealthcareIcon,
    my: "ဆေးရုံနှင့် ကြက်ခြေနီ အဖွဲ့များ",
    en: "Facilities & Teams",
    dMy: "နေရာဒေသအလိုက် ဆေးရုံ၊ ကျန်းမာရေးဌာနနှင့် ကြက်ခြေနီအဖွဲ့များ ရှာဖွေပါ။",
    dEn: "Find hospitals, health centers and Red Cross teams near you.",
    href: "/healthcare",
    ctaMy: "စာရင်း ကြည့်ရန်",
    ctaEn: "Browse the directory",
  },
  {
    Icon: ChatIcon,
    my: "AI ကျန်းမာရေး အကူအညီ",
    en: "AI health assistant",
    dMy: "ကျန်းမာရေး မေးခွန်းများကို မြန်မာဘာသာဖြင့် မေးမြန်းနိုင်ပါသည်။",
    dEn: "Ask health questions in Burmese or English.",
    href: "/chat",
    ctaMy: "မေးခွန်း မေးရန်",
    ctaEn: "Ask a question",
  },
];

export function HomeContent() {
  const { lang } = usePreferences();
  const isEn = lang === "en";

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,81,75,.88) 0%, rgba(7,81,75,.82) 50%, rgba(7,81,75,.30) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-6 pt-16 text-center text-white">
          <p className="eyebrow rise rise-1 text-saffron">MyanHealth</p>
          <h1 className="rise rise-2 mt-4 font-serif text-4xl leading-tight md:text-6xl">
            {isEn
              ? "Care you understand, wherever you are"
              : "နေရာမရွေး နားလည်နိုင်သော ကျန်းမာရေး ဆောင်ရွက်မှု"}
          </h1>
          <p className="rise rise-3 mx-auto mt-5 max-w-xl leading-[1.8] opacity-90">
            {isEn
              ? "Health news, facility directory, disease reports and AI health assistant — all in one place."
              : "ကျန်းမာရေး သတင်းအချက်အလက်၊ ဆေးရုံနှင့် ကြက်ခြေနီ စုစည်းရမှု၊ ရောဂါအစီရင်ခံချက်နှင့် AI ကျန်းမာရေး အကူအညီ — အားလုံး တစ်နေရာတည်းမှာ။"}
          </p>
          <div className="rise rise-4 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/news"
              className="rounded-[var(--radius)] bg-teal px-7 py-3 font-semibold text-white shadow-[var(--shadow)] transition-colors hover:bg-teal-dark"
            >
              {isEn ? "Read the news" : "သတင်း ဖတ်ရန်"}
            </Link>
            <Link
              href="/healthcare"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-white/60 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {isEn ? "Find facilities" : "ဆေးရုံ ရှာရန်"}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow mb-3 text-teal-dark/70">
              {isEn ? "What you can do" : "ဘာတွေ လုပ်နိုင်လဲ"}
            </p>
            <h2 className="text-2xl font-bold leading-[1.5] md:text-3xl">
              {isEn
                ? "Health information you can trust"
                : "သင်လိုအပ်တဲ့ ကျန်းမာရေး အချက်အလက်"}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group flex flex-col rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)] transition-all hover:border-teal/30 hover:shadow-[0_8px_30px_rgba(11,103,96,0.12)]"
              >
                <span aria-hidden className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky text-teal-dark">
                  <c.Icon width={22} height={22} />
                </span>
                <h3 className="font-bold leading-[1.75]">
                  {isEn ? c.en : c.my}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-[1.75] text-muted">
                  {isEn ? c.dEn : c.dMy}
                </p>
                <span className="mt-4 text-sm font-semibold text-teal group-hover:underline">
                  {isEn ? c.ctaEn : c.ctaMy} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
