import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/nav/site-header";
import { MobileBottomNav } from "@/components/nav/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChatWidgetMount } from "@/components/chat/chat-widget-mount";

/**
 * Public site shell. Admins are locked out of the public site — they live
 * in /admin only (user request: admins never see news / chat / etc.).
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "ADMIN") redirect("/admin");
  }

  return (
    <>
      <SiteHeader />
      <div id="main" className="flex flex-1 flex-col pb-[68px] md:pb-0">
        {children}
      </div>
      <SiteFooter />
      <MobileBottomNav />
      <ChatWidgetMount />
    </>
  );
}
