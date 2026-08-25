"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/lib/i18n/preferences";
import { formatDate } from "@/lib/utils/date";
import { Card, mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type ReportRow = {
  id: string;
  kind: "DISEASE" | "HEALTH";
  created_at: string;
  status: string;
  titleEn: string;
  titleMy: string;
  place: string | null;
};

const STATUS_LABEL: Record<string, { my: string; en: string }> = {
  SUBMITTED: { my: "ပေးပို့ပြီး", en: "Submitted" },
  UNDER_REVIEW: { my: "စစ်ဆေးနေပါသည်", en: "Under review" },
  VERIFIED: { my: "စစ်ဆေးအတည်ပြုပြီး", en: "Verified (admin-reviewed)" },
  REJECTED: { my: "ပယ်ဖျက်ပြီး", en: "Rejected" },
};

export function MyReports({ refreshKey }: { refreshKey: number }) {
  const { lang } = usePreferences();
  const [rows, setRows] = useState<ReportRow[] | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const disease = supabase
      .from("disease_reports")
      .select("id, created_at, status, formatted_address, disease_types ( name_en, name_mm )")
      .order("created_at", { ascending: false })
      .limit(25);
    const health = supabase
      .from("health_reports")
      .select("id, created_at, status, formatted_address, report_type")
      .order("created_at", { ascending: false })
      .limit(25);

    const [d, h] = await Promise.all([disease, health]);
    const merged: ReportRow[] = [
      ...(d.data ?? []).map((r: Record<string, unknown>) => {
        const dt = r.disease_types as { name_en: string; name_mm: string | null } | null;
        return {
          id: r.id as string,
          kind: "DISEASE" as const,
          created_at: r.created_at as string,
          status: r.status as string,
          titleEn: dt?.name_en ?? "Disease report",
          titleMy: dt?.name_mm ?? dt?.name_en ?? "Disease report",
          place: (r.formatted_address as string | null) ?? null,
        };
      }),
      ...(h.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        kind: "HEALTH" as const,
        created_at: r.created_at as string,
        status: r.status as string,
        titleEn: String(r.report_type ?? "Health report")
          .toLowerCase()
          .replace(/_/g, " "),
        titleMy: String(r.report_type ?? "Health report")
          .toLowerCase()
          .replace(/_/g, " "),
        place: (r.formatted_address as string | null) ?? null,
      })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at));

    setRows(merged);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (rows === null) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-[var(--radius)] border border-line bg-sky/20" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        titleMy="မင်းရဲ့ အစီရင်ခံချက် မရှိသေးပါ"
        titleEn="No reports yet"
        hintMy="အပေါ်ရှိ ဖောင်မှတဆင့် ပထမဆုံး အစီရင်ခံချက် ပေးပို့ပါ။"
        hintEn="Submit your first report using the forms above."
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={`${r.kind}-${r.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={r.kind === "DISEASE" ? "severe" : "teal"} dot>
                {r.kind === "DISEASE" ? (lang === "en" ? "Disease report" : "ရောဂါ") : lang === "en" ? "Health report" : "ကျန်းမာရေး"}
              </Badge>
              <Badge tone={pillTone[r.status] ?? "neutral"} dot>
                {STATUS_LABEL[r.status]?.[lang] ?? r.status}
              </Badge>
            </div>
            <p className={`mt-2 truncate font-semibold ${mmLineHeight}`}>{lang === "en" ? r.titleEn : r.titleMy}</p>
            {r.place && <p className="truncate text-sm text-muted">📍 {r.place}</p>}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">{formatDate(r.created_at, lang)}</time>
        </Card>
      ))}
      <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
        {lang === "en"
          ? "“Verified” means an admin has reviewed the report — it is not a lab-confirmed diagnosis."
          : "“စစ်ဆေးအတည်ပြုပြီး” ဆိုသည်မှာ စီမံခန့်ခွဲသူမှ စစ်ဆေးပြီးကြောင်း အဓိပ္ပာယ်ရှိပြီး ဓာတ်ခွဲခန်း အတည်ပြုချက် မဟုတ်ပါ။"}
      </p>
    </div>
  );
}
