"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

const OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED"] as const;

export function StatusChanger({
  table,
  id,
  status,
  reviewedBy,
}: {
  table: "disease_reports" | "health_reports";
  id: string;
  status: string;
  reviewedBy: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && value !== "SUBMITTED") {
      setError("You must be logged in to review reports.");
      setSaving(false);
      return;
    }

    const updateData: Record<string, unknown> = {
      status: value,
      reviewed_at: new Date().toISOString(),
    };

    // Set reviewed_by when status is not SUBMITTED
    if (value !== "SUBMITTED") {
      updateData.reviewed_by = user!.id;
    } else {
      updateData.reviewed_by = null;
    }

    const { error: err } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", id);
    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">Set status</span>
          <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-52"
          >
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
          </Select>
        </label>
        <Button size="sm" onClick={save} disabled={saving || value === status}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      {error && <p className="text-sm text-severe">{error}</p>}
    </div>
  );
}
