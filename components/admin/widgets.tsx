import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  accent = "teal",
  href,
}: {
  label: string;
  value: number | string;
  accent?: "teal" | "saffron" | "severe" | "moss";
  href?: string;
}) {
  const bar: Record<string, string> = {
    teal: "bg-teal",
    saffron: "bg-saffron",
    severe: "bg-severe",
    moss: "bg-moss",
  };
  const inner = (
    <Card className="group h-full p-5">
      <div className={`mb-4 h-1 w-8 rounded-full ${bar[accent]}`} />
      <p className="text-3xl font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
  return href ? (
    <a href={href} className="block rounded-[var(--radius)] transition-shadow hover:shadow-[0_20px_44px_rgba(36,50,43,.16)]">
      {inner}
    </a>
  ) : (
    inner
  );
}

/** Clean horizontal bar chart. */
export function BarChart({
  title,
  data,
  max: maxIn,
}: {
  title: string;
  data: { label: string; value: number }[];
  max?: number;
}) {
  const max = maxIn ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((d) => (
            <li key={d.label} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-2 text-sm">
              <span className="truncate text-muted" title={d.label}>
                {d.label}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-paper-deep">
                <span
                  className="block h-full rounded-full bg-teal transition-all"
                  style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">{d.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
