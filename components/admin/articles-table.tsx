"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { PageHeader } from "@/components/admin/admin-header";
import { Badge, pillTone } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CATEGORIES = [
  { value: "", labelMy: "အမျိုးအစားအားလုံး", labelEn: "All categories" },
  { value: "DISEASE_INFO", labelMy: "ရောဂါ အချက်အလက်", labelEn: "Disease Info" },
  { value: "HEALTH_TIPS", labelMy: "ကျန်းမာရေး အကြံပြုချက်", labelEn: "Health Tips" },
  { value: "PREVENTION", labelMy: "ကာကွယ်ရေး", labelEn: "Prevention" },
  { value: "NEWS", labelMy: "သတင်း", labelEn: "News" },
  { value: "ANNOUNCEMENT", labelMy: "ကြေညာချက်", labelEn: "Announcement" },
];

const STATUSES = [
  { value: "", labelMy: "အခြေအနေအားလုံး", labelEn: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
];

type Article = {
  id: string;
  title_mm: string | null;
  title_en: string | null;
  slug: string;
  category: string | null;
  status: string;
  published_at: string | null;
};

export function ArticlesTable({
  articles: initial,
  q,
  status,
  category,
}: {
  articles: Article[];
  q?: string;
  status?: string;
  category?: string;
}) {
  const { lang } = usePreferences();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [articles, setArticles] = useState(initial);
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
        router.push(`/admin/articles?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(confirmId);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/admin/articles/${confirmId}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== confirmId));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Content"
        titleMy="သတင်း စီမံခန့်ခွဲမှု"
        titleEn="Posts"
        actions={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {lang === "en" ? "New post" : "ဆောင်းပါးအသစ်"}
          </Link>
        }
      />

      {/* Filters — auto-apply on change */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          type="text"
          defaultValue={q}
          placeholder={lang === "en" ? "Search titles…" : "ခေါင်းစဉ် ရှာဖွေရန်…"}
          onChange={(e) => updateFilter("q", e.target.value)}
          className="w-56 rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
        />
        <select
          value={status ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {"label" in s ? s.label : lang === "en" ? s.labelEn : s.labelMy}
            </option>
          ))}
        </select>
        <select
          value={category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {lang === "en" ? c.labelEn : c.labelMy}
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
        title={lang === "en" ? "Delete article?" : "ဆောင်းပါး ဖျက်မလား?"}
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
                {lang === "en" ? "Post" : "ဆောင်းပါး"}
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:table-cell">
                {lang === "en" ? "Category" : "အမျိုးအစား"}
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">
                {lang === "en" ? "Status" : "အခြေအနေ"}
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground lg:table-cell">
                {lang === "en" ? "Date" : "ရက်စွဲ"}
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "en" ? "Actions" : "လုပ်ဆောင်ချက်"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {articles.map((a) => (
              <tr key={a.id} className="group transition-colors hover:bg-paper-deep/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{a.title_en || a.title_mm}</p>
                  <p className="truncate text-xs text-muted">/{a.slug}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {a.category && <Badge tone={pillTone[a.category] ?? "neutral"}>{a.category}</Badge>}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge tone={pillTone[a.status] ?? "neutral"} dot>
                    {a.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                  {a.published_at ? formatDate(a.published_at, lang) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sky hover:text-teal-dark"
                      title={lang === "en" ? "Edit" : "ပြင်ဆင်ရန်"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setConfirmId(a.id)}
                      disabled={deleting === a.id}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-severe-soft hover:text-severe disabled:opacity-50"
                      title={lang === "en" ? "Delete" : "ဖျက်ရန်"}
                    >
                      {deleting === a.id ? (
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
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  {lang === "en" ? "No articles match these filters." : "ဤအမျိုးအစားနှင့် ကိုက်ညီသည့် ဆောင်းပါး မရှိပါ။"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
