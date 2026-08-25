import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/admin-header";
import { UserActions } from "@/components/admin/user-actions";
import { formatDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);

  const [{ data: users }, { count: total }] = await Promise.all([
    query,
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Access"
        titleMy="အသုံးပြုသူ စီမံခန့်ခွဲမှု"
        titleEn={`Users (${total ?? 0})`}
      />

      <form className="mb-5 flex flex-wrap items-center gap-2" action="/admin/users">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="w-64 rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
        />
        <button className="rounded-[var(--radius)] bg-paper-deep px-4 py-2 text-sm font-semibold hover:bg-moss">
          Search
        </button>
      </form>

      <div className="space-y-2.5">
        {(users ?? []).map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={u.role === "ADMIN" ? "saffron" : "neutral"} dot>
                  {u.role.toLowerCase()}
                </Badge>
                <span className="truncate text-sm font-semibold">{u.full_name || "—"}</span>
              </div>
              <p className="truncate text-sm text-muted">{u.email}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(u.created_at, "en")}
              </p>
            </div>
            <UserActions userId={u.id} role={u.role} />
          </Card>
        ))}
        {(users ?? []).length === 0 && (
          <p className="py-12 text-center text-muted">No users found.</p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Deleting a user removes their auth account; profiles and reports cascade with it.
        Passwords are never displayed.
      </p>
    </>
  );
}
