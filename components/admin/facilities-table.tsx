"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { PageHeader } from "@/components/admin/admin-header";
import { Badge, pillTone } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const FACILITY_TYPES = [
  { value: "", labelMy: "အမျိုးအစားအားလုံး", labelEn: "All types" },
  { value: "PUBLIC_HOSPITAL", labelMy: "အစိုးရဆေးရုံ", labelEn: "Public Hospital" },
  { value: "PRIVATE_HOSPITAL", labelMy: "ပုဂ္ဂလိကဆေးရုံ", labelEn: "Private Hospital" },
  { value: "HEALTH_CENTER", labelMy: "ကျန်းမာရေးဌာန", labelEn: "Health Center" },
  { value: "RED_CROSS_TEAM", labelMy: "ကြက်ခြေနီအဖွဲ့", labelEn: "Red Cross Team" },
];

type Facility = {
  id: string;
  name_mm: string | null;
  name_en: string;
  facility_type: string;
  region_name: string | null;
};

export function FacilitiesTable({
  facilities: initial,
  q,
  type,
}: {
  facilities: Facility[];
  q?: string;
  type?: string;
}) {
  const { lang } = usePreferences();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [facilities, setFacilities] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/admin/facilities?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(confirmId);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/admin/facilities/${confirmId}`, { method: "DELETE" });
      if (res.ok) {
        setFacilities((prev) => prev.filter((f) => f.id !== confirmId));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        titleMy="ဆေးရုံ စီမံခန့်ခွဲမှု"
        titleEn="Facilities"
        actions={
          <Link
            href="/admin/facilities/new"
            className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {lang === "en" ? "New facility" : "ဆေးရုံအသစ်"}
          </Link>
        }
      />

      {/* Filters — auto-apply on change */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          type="text"
          defaultValue={q}
          placeholder={lang === "en" ? "Search names…" : "အမည် ရှာဖွေရန်…"}
          onChange={(e) => updateFilter("q", e.target.value)}
          className="w-56 rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
        />
        <select
          value={type ?? ""}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
        >
          {FACILITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {lang === "en" ? t.labelEn : t.labelMy}
            </option>
          ))}
        </select>
        {isPending && (
          <svg className="animate-spin text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
          </svg>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmId !== null}
        title={lang === "en" ? "Delete facility?" : "ဆေးရုံ ဖျက်မလား?"}
        description={lang === "en" ? "This action cannot be undone." : "ဤလုပ်ဆောင်ချက်ကို ပြန်ဖျက်၍ မရပါ။"}
        confirmLabel={lang === "en" ? "Delete" : "ဖျက်ရန်"}
        cancelLabel={lang === "en" ? "Cancel" : "ပယ်ဖျက်ရန်"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        danger
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius)] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-deep/50">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "en" ? "Name" : "အမည်"}
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:table-cell">
                {lang === "en" ? "Type" : "အမျိုးအစား"}
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">
                {lang === "en" ? "Region" : "ဒေသ"}
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "en" ? "Actions" : "လုပ်ဆောင်ချက်"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {facilities.map((f) => (
              <tr key={f.id} className="group transition-colors hover:bg-paper-deep/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{f.name_en}</p>
                  {f.name_mm && <p className="truncate text-xs text-muted">{f.name_mm}</p>}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Badge tone={pillTone[f.facility_type] ?? "neutral"}>
                    {f.facility_type.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-sm text-muted">{f.region_name || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/facilities/${f.id}`}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sky hover:text-teal-dark"
                      title={lang === "en" ? "Edit" : "ပြင်ဆင်ရန်"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setConfirmId(f.id)}
                      disabled={deleting === f.id}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-severe-soft hover:text-severe disabled:opacity-50"
                      title={lang === "en" ? "Delete" : "ဖျက်ရန်"}
                    >
                      {deleting === f.id ? (
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {facilities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  {lang === "en" ? "No facilities match these filters." : "ဤအမျိုးအစားနှင့် ကိုက်ညီသည့် ဆေးရုံ မရှိပါ။"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
