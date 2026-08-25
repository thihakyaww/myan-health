"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { Card, mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { FacilityType } from "@/lib/types";

export interface FacilityListItem {
  id: string;
  name_mm: string;
  name_en: string;
  facility_type: FacilityType;
  description_mm: string | null;
  description_en: string | null;
  city_name_en: string | null;
  city_name_mm: string | null;
  township_name_en: string | null;
  township_name_mm: string | null;
  is_24_7: boolean;
}

const TABS: { id: FacilityType | "ALL"; labelMy: string; labelEn: string }[] = [
  { id: "ALL", labelMy: "အားလုံး", labelEn: "All" },
  { id: "PUBLIC_HOSPITAL", labelMy: "အစိုးရဆေးရုံ", labelEn: "Public Hospitals" },
  { id: "PRIVATE_HOSPITAL", labelMy: "ပုဂ္ဂလိကဆေးရုံ", labelEn: "Private Hospitals" },
  { id: "HEALTH_CENTER", labelMy: "ကျန်းမာရေးဌာန", labelEn: "Health Centers" },
  { id: "RED_CROSS_TEAM", labelMy: "ကြက်ခြေနီအဖွဲ့", labelEn: "Red Cross Teams" },
];

const TYPE_LABEL: Record<FacilityType, { my: string; en: string }> = {
  PUBLIC_HOSPITAL: { my: "အစိုးရဆေးရုံ", en: "Public Hospital" },
  PRIVATE_HOSPITAL: { my: "ပုဂ္ဂလိကဆေးရုံ", en: "Private Hospital" },
  HEALTH_CENTER: { my: "ကျန်းမာရေးဌာန", en: "Health Center" },
  RED_CROSS_TEAM: { my: "ကြက်ခြေနီအဖွဲ့", en: "Red Cross Team" },
};

function FacilityCard({ f }: { f: FacilityListItem }) {
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
  const city = lang === "en" ? f.city_name_en : f.city_name_mm || f.city_name_en;
  const township =
    lang === "en" ? f.township_name_en : f.township_name_mm || f.township_name_en;

  return (
    <Link
      href={`/healthcare/${f.id}`}
      className="group block rounded-[var(--radius)] focus-visible:outline-2"
    >
      <Card className="flex h-full flex-col p-5 transition-all hover:border-teal/30 hover:shadow-[0_8px_30px_rgba(11,103,96,0.12)]">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <Badge tone={pillTone[f.facility_type] ?? "teal"} dot>
            {TYPE_LABEL[f.facility_type][lang]}
          </Badge>
          {f.is_24_7 && <Badge tone="saffron">24/7</Badge>}
        </div>
        <h3 className="font-bold leading-snug group-hover:text-teal-dark">{name}</h3>
        {cleanDesc && (
          <p className={`mt-3 line-clamp-2 flex-1 text-sm text-muted ${mmLineHeight}`}>{cleanDesc}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal group-hover:underline">
          {lang === "en" ? "View details" : "အသေးစိတ်ကြည့်ရန်"} →
        </span>
      </Card>
    </Link>
  );
}

export function FacilityDirectory({ facilities }: { facilities: FacilityListItem[] }) {
  const { lang } = usePreferences();
  const [tab, setTab] = useState<FacilityType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c = new Map<FacilityType | "ALL", number>();
    c.set("ALL", facilities.length);
    for (const f of facilities) c.set(f.facility_type, (c.get(f.facility_type) ?? 0) + 1);
    return c;
  }, [facilities]);

  const filtered = useMemo(() => {
    let result = tab === "ALL" ? facilities : facilities.filter((f) => f.facility_type === tab);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name_en.toLowerCase().includes(q) ||
          a.name_mm?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [facilities, tab, search]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "en" ? "Search facilities…" : "ဆေးရုံ ရှာဖွေရန်…"}
          className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-teal"
        />
      </div>

      {/* Segmented filter */}
      <div
        role="tablist"
        aria-label={lang === "en" ? "Facility categories" : "ဆေးရုံ အမျိုးအစား"}
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tb) => {
          const active = tb.id === tab;
          const count = counts.get(tb.id) ?? 0;
          return (
            <button
              key={tb.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tb.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-teal bg-teal text-white"
                  : "border-line bg-card text-muted hover:border-teal/40 hover:text-teal-dark"
              }`}
            >
              {lang === "en" ? tb.labelEn : tb.labelMy}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                  active ? "bg-white/20" : "bg-paper-deep"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            titleMy="ဤအမျိုးအစားတွင် ဒေတာ မရှိသေးပါ"
            titleEn="Nothing in this category yet"
            hintMy="ဒေတာများကို စစ်ဆေးအတည်ပြုပြီးမှသာ ထည့်သွင်းပါမည်။"
            hintEn="Entries are added only after their details are verified."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <FacilityCard key={f.id} f={f} />
          ))}
        </div>
      )}
    </>
  );
}
