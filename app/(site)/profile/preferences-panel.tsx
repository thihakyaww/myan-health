"use client";

import { usePreferences } from "@/lib/i18n/preferences";
import { GlobeIcon, ContrastIcon } from "@/components/icons";

function Toggle({
  checked,
  onChange,
  label,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-1 text-left"
    >
      <span className="flex items-center gap-3 font-semibold">{children}{label}</span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-teal" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function PreferencesPanel() {
  const { lang, setLang, highContrast, setHighContrast } = usePreferences();

  return (
    <section className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)]">
      <h2 className="eyebrow mb-4 text-teal-dark/70">
        {lang === "en" ? "Preferences" : "နှစ်သက်မှုများ"}
      </h2>
      <div className="space-y-5">
        {/* Language */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3 font-semibold">
            <GlobeIcon width={20} height={20} className="text-teal" />
            {lang === "en" ? "Language" : "ဘာသာစကား"}
          </span>
          <div className="flex overflow-hidden rounded-[var(--radius)] border border-line">
            {(["my", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  lang === l ? "bg-teal text-white" : "bg-card hover:bg-paper-deep"
                }`}
              >
                {l === "my" ? "မြန်မာ" : "English"}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <Toggle
            checked={highContrast}
            onChange={setHighContrast}
            label={lang === "en" ? "High contrast" : "မြင့်မားသော ကွဲပြားမှု"}
          >
            <ContrastIcon width={20} height={20} className="text-teal" />
          </Toggle>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Settings are saved on this device."
            : "ဆက်တင်များကို ဤစက်ပေါ်တွင် သိမ်းဆည်းထားပါသည်။"}
        </p>
      </div>
    </section>
  );
}
