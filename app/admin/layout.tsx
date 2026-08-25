import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell, AdminSidebarRail, AdminMain } from "@/components/admin/admin-shell";
import { AdminSidebar, AdminMobileBar } from "./admin-nav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=%2Fadmin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "ADMIN") redirect("/");

  return (
    <AdminShell>
      {/* Desktop sidebar rail */}
      <AdminSidebarRail>
        <AdminSidebar />
      </AdminSidebarRail>

      {/* Mobile: top bar + drawer */}
      <div className="lg:hidden">
        <AdminMobileBar />
      </div>

      <AdminMain>{children}</AdminMain>
    </AdminShell>
  );
}
