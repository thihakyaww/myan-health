import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-sky text-teal-dark",
  UNDER_REVIEW: "bg-saffron/20 text-saffron",
  VERIFIED: "bg-[#d4edda] text-[#155724]",
  REJECTED: "bg-severe-soft text-severe",
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "New — needs review",
  UNDER_REVIEW: "Under review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const [diseaseRes, healthRes] = await Promise.all([
    supabase
      .from("disease_reports")
      .select("id, created_at, status, reporter_name, severity, description")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("health_reports")
      .select("id, created_at, status, reporter_name, report_type, description")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const diseaseReports = diseaseRes.data ?? [];
  const healthReports = healthRes.data ?? [];

  const allReports = [
    ...diseaseReports.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      reporter_name: r.reporter_name,
      type: "disease" as const,
      label: r.severity ? `Disease — ${r.severity.toLowerCase()}` : "Disease report",
      description: r.description,
    })),
    ...healthReports.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      reporter_name: r.reporter_name,
      type: "health" as const,
      label: r.report_type ? r.report_type.replace(/_/g, " ").toLowerCase() : "Health report",
      description: r.description,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pendingReports = allReports.filter((r) => r.status === "SUBMITTED");
  const pendingCount = pendingReports.length;

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        titleMy="အကြောင်းကြားချက်များ"
        titleEn="Notifications"
      />

      {/* Pending summary card */}
      <div className="mb-6 rounded-[var(--radius)] border border-saffron/30 bg-saffron/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron/20 text-saffron">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {pendingCount === 0
                ? "No pending reports"
                : `${pendingCount} report${pendingCount > 1 ? "s" : ""} awaiting review`}
            </p>
            <p className="text-xs text-muted">
              User-submitted reports with status "Submitted" need your attention.
            </p>
          </div>
        </div>
      </div>

      {allReports.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-line bg-card p-12 text-center text-muted">
          No reports yet.
        </div>
      ) : (
        <div className="space-y-2">
          {allReports.map((report) => {
            const isPending = report.status === "SUBMITTED";
            return (
              <Link
                key={`${report.type}-${report.id}`}
                href={`/admin/reports/${report.type}/${report.id}`}
                className={`flex items-center gap-4 rounded-[var(--radius)] border px-4 py-3 transition-colors hover:bg-paper-deep/50 ${
                  isPending
                    ? "border-saffron/40 bg-saffron/5"
                    : "border-line bg-card"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {report.reporter_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted">•</span>
                    <span className="text-xs text-muted">{report.label}</span>
                  </div>
                  {report.description && (
                    <p className="mt-1 truncate text-xs text-muted">
                      {report.description.slice(0, 80)}
                      {report.description.length > 80 ? "…" : ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      STATUS_COLORS[report.status] ?? "bg-paper-deep text-muted"
                    }`}
                  >
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
