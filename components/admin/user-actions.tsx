"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserActions({
  userId,
  role,
}: {
  userId: string;
  role: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeRole() {
    setBusy(true);
    setError(null);
    const { error: err } = await createClient()
      .from("profiles")
      .update({ role: value })
      .eq("id", userId);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
  }

  async function deleteUser() {
    if (
      !confirm(
        "Delete this user permanently? Their profile and reports will be removed."
      )
    )
      return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Delete failed");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value as "USER" | "ADMIN")}
        className="w-28 py-1.5 text-xs"
        aria-label="Role"
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </Select>
      <Button size="sm" variant="secondary" onClick={changeRole} disabled={busy || value === role}>
        Set
      </Button>
      <Button size="sm" variant="danger" onClick={deleteUser} disabled={busy}>
        Delete
      </Button>
      {error && <span className="text-xs text-severe">{error}</span>}
    </div>
  );
}
