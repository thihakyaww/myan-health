"use client";

import { usePreferences } from "@/lib/i18n/preferences";
import { Card, mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { MapView } from "@/components/maps/map-view";

export interface FacilityDetailData {
  id: string;
  name_mm: string;
  name_en: string;
  facility_type: string;
  organization: string | null;
  address: string | null;
  formatted_address: string | null;
  phone: string | null;
  description_mm: string | null;
  description_en: string | null;
  opening_hours: string | null;
  is_24_7: boolean;
  services: string[];
  latitude: number | null;
  longitude: number | null;
  source_url: string | null;
  confidence: string | null;
}

const TYPE_LABEL: Record<string, { my: string; en: string }> = {
  PUBLIC_HOSPITAL: { my: "အစိုးရဆေးရုံ", en: "Public Hospital" },
  PRIVATE_HOSPITAL: { my: "ပုဂ္ဂလိကဆေးရုံ", en: "Private Hospital" },
  HEALTH_CENTER: { my: "ကျန်းမာရေးဌာန", en: "Health Center" },
  RED_CROSS_TEAM: { my: "ကြက်ခြေနီအဖွဲ့", en: "Red Cross Team" },
};

function InfoRow({
  label,
  children,
}: {
  label: { my: string; en: string };
  children: React.ReactNode;
}) {
  const { lang } = usePreferences();
  return (
    <div className="flex gap-3 py-3">
      <span className="w-20 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label[lang]}
      </span>
      <div className={`min-w-0 flex-1 text-sm ${mmLineHeight}`}>{children}</div>
    </div>
  );
}

export function FacilityView({ f }: { f: FacilityDetailData }) {
  const { lang } = usePreferences();
  const name = lang === "en" ? f.name_en : f.name_mm || f.name_en;
  const desc =
    (lang === "en" ? f.description_en : f.description_mm) ??
    f.description_en ??
    f.description_mm;

  const cleanDesc = desc
    ?.replace(/Source[:\s]*—?\s*https?:\/\/[^\s]*/gi, "")
    ?.replace(/https?:\/\/[^\s]*wikipedia[^\s]*/gi, "")
    ?.trim();

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* Left: identity + details */}
        <div className="p-6 md:p-9">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={pillTone[f.facility_type]} dot>
              {TYPE_LABEL[f.facility_type]?.[lang] ?? f.facility_type}
            </Badge>
            {f.is_24_7 && <Badge tone="saffron">24/7</Badge>}
            {f.organization && (
              <Badge tone={pillTone[f.facility_type]}>
                {f.organization.replace(/_/g, " ").toLowerCase()}
              </Badge>
            )}
          </div>

          <h1
            className={`font-bold tracking-tight text-ink ${
              lang === "my" ? `text-2xl ${mmLineHeight}` : "font-serif text-4xl"
            }`}
          >
            {name}
          </h1>

          {cleanDesc && (
            <p className={`mt-5 leading-[1.8] text-muted ${lang === "my" ? "" : ""}`}>{cleanDesc}</p>
          )}

          <div className="mt-6 divide-y divide-line border-y border-line">
            {(f.address || f.formatted_address) && (
              <InfoRow label={{ my: "လိပ်စာ", en: "Address" }}>
                {f.formatted_address ?? f.address}
              </InfoRow>
            )}
            {f.phone && (
              <InfoRow label={{ my: "ဖုန်း", en: "Phone" }}>
                <a href={`tel:${f.phone}`} className="font-semibold text-teal hover:underline">
                  {f.phone}
                </a>
              </InfoRow>
            )}
            {f.opening_hours && (
              <InfoRow label={{ my: "ဖွင့်ချိန်", en: "Hours" }}>{f.opening_hours}</InfoRow>
            )}
            {f.services.length > 0 && (
              <InfoRow label={{ my: "ဝန်ဆောင်မှု", en: "Services" }}>
                <div className="flex flex-wrap gap-1.5">
                  {f.services.map((s) => (
                    <Badge key={s} tone="moss">
                      {s}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            )}
          </div>

          {f.source_url && !f.source_url.includes("wikipedia.org") && (
            <p className="mt-5 break-all text-xs leading-relaxed text-muted-foreground">
              {lang === "en" ? "Source: " : "အရင်းအမြစ် — "}
              <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-teal underline">
                {f.source_url}
              </a>
            </p>
          )}
        </div>

        {/* Right: sticky map panel */}
        <div className="border-t border-line bg-sky/25 p-6 md:p-9 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-24">
            <h2 className="eyebrow mb-3 text-teal-dark/70">
              {lang === "en" ? "Location" : "တည်နေရာ"}
            </h2>
            {f.latitude != null && f.longitude != null ? (
              <MapView
                latitude={f.latitude}
                longitude={f.longitude}
                label={name}
                className="h-72 rounded-[var(--radius)] border border-line"
              />
            ) : (
              <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-line bg-card/60 p-6 text-center">
                <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.6" strokeLinecap="round" opacity=".65">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <p className={`max-w-xs text-sm text-muted ${mmLineHeight}`}>
                  {lang === "en"
                    ? "Coordinates for this entry are not verified yet."
                    : "ဤနေရာအတွက် တည်နေရာ အချက်အလက်ကို အတည်ပြုထားခြင်း မရှိသေးပါ။"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
