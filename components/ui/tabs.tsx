"use client";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1 rounded-[var(--radius)] bg-paper-deep p-1"
    >
      {tabs.map((tb) => {
        const active = tb.id === value;
        return (
          <button
            key={tb.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tb.id)}
            className={`flex-1 whitespace-nowrap rounded-[calc(var(--radius)-4px)] px-3 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-teal text-white shadow-sm" : "text-muted hover:bg-moss/40"
            }`}
          >
            {tb.label}
          </button>
        );
      })}
    </div>
  );
}
