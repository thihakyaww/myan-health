"use client";

import { usePathname } from "next/navigation";
import { usePreferences } from "@/lib/i18n/preferences";
import { LogoMark } from "@/components/ui/logo";

const EXPLORE = [
  { href: "/news", my: "သတင်းများ", en: "News" },
  { href: "/healthcare", my: "ဆေးရုံ လမ်းညွှန်", en: "Facilities & Teams" },
  { href: "/reports", my: "အစီရင်ခံချက်", en: "Reports" },
  { href: "/chat", my: "AI အကူအညီ", en: "AI Chat" },
];

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function SiteFooter() {
  const { lang } = usePreferences();
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return (
    <footer id="contact" className="border-t border-line bg-paper-deep">
      {/* Contact us (§11) */}
      <section
        aria-labelledby="contact-heading"
        className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14"
      >
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)] md:p-10">
          <p className="eyebrow text-teal-dark/70">Get in touch</p>
          <h2
            id="contact-heading"
            className={`mt-2 text-xl font-bold md:text-2xl ${lang === "my" ? "leading-[1.9]" : ""}`}
          >
            {lang === "en" ? "Contact us" : "ဆက်သွယ်ရန်"}
          </h2>
          <p className={`mt-2 max-w-2xl text-sm text-muted ${lang === "my" ? "leading-[1.95]" : ""}`}>
            {lang === "en"
              ? "Questions, feedback or partnership ideas — we'd love to hear from you."
              : "မေးခွန်းများ၊ အကြံပြုချက်များ သို့မဟုတ် ပူးပေါင်းဆောင်ရွက်လိုပါက ကျွန်ုပ်တို့ထံ ဆက်သွယ်ပါ။"}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <a
              href="mailto:hello@myanhealth.example"
              className="group flex items-start gap-3 rounded-[calc(var(--radius)-4px)] border border-line bg-paper p-4 transition-colors hover:border-teal/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-teal-dark">
                <MailIcon />
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-teal-dark/60">
                  {lang === "en" ? "Email" : "အီးမေးလ်"}
                </span>
                <span className="mt-0.5 block truncate text-sm font-semibold group-hover:text-teal">
                  hello@myanhealth.example
                </span>
              </span>
            </a>

            <div className="flex items-start gap-3 rounded-[calc(var(--radius)-4px)] border border-line bg-paper p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-teal-dark">
                <PinIcon />
              </span>
              <span>
                <span className="eyebrow block text-teal-dark/60">
                  {lang === "en" ? "Location" : "တည်နေရာ"}
                </span>
                <span className={`mt-0.5 block text-sm font-semibold ${lang === "my" ? "leading-[1.9]" : ""}`}>
                  Yangon, Myanmar
                </span>
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-[calc(var(--radius)-4px)] border border-line bg-paper p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-teal-dark">
                <ClockIcon />
              </span>
              <span>
                <span className="eyebrow block text-teal-dark/60">
                  {lang === "en" ? "Response time" : "ပြန်ကြားချိန်"}
                </span>
                <span className={`mt-0.5 block text-sm font-semibold ${lang === "my" ? "leading-[1.9]" : ""}`}>
                  {lang === "en" ? "Within 2–3 working days" : "အလုပ်ချိန် ၂–၃ ရက်အတွင်း"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <p className="font-serif text-xl text-teal-dark">MyanHealth</p>
          </div>
          <p className={`mt-2 max-w-sm text-sm text-muted ${lang === "my" ? "leading-[1.95]" : ""}`}>
            {lang === "my"
              ? "မြန်မာနိုင်ငံအတွက် ကျန်းမာရေး သတင်းအချက်အလက် ပလက်ဖောင်း။"
              : "A Burmese-first digital health platform for Myanmar."}
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="eyebrow mb-3 text-teal-dark/80">Explore</h2>
          <ul className="space-y-2 text-sm font-semibold">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-teal hover:underline">
                  {lang === "en" ? l.en : l.my}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className={`text-xs leading-relaxed text-muted-foreground ${lang === "my" ? "leading-[1.9]" : ""}`}>
            {lang === "en"
              ? "MyanHealth AI provides health information only and is not a substitute for professional medical care."
              : "MyanHealth AI သည် ကျန်းမာရေး အချက်အလက်များသာ ပေးအပ်ပါသည်။ ပရော်ဖက်ရှင်နယ် ဆေးပညာရှင်၏ စစ်ဆေးမှုကို အစားမထိုးပါ။"}
          </p>
        </div>
      </div>
      <div className="border-t border-line/60 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MyanHealth
        </p>
      </div>
    </footer>
  );
}
