import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/chat/chat-panel";

export const metadata = {
  title: "AI Chat",
  description:
    "Ask health questions in Burmese or English",
};

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessions: { id: string; title: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, title")
      .order("updated_at", { ascending: false })
      .limit(20);
    sessions = data ?? [];
  }

  return (
    <div className="fixed inset-0 z-10 pt-16 pb-[calc(56px+env(safe-area-inset-bottom))] md:static md:inset-auto md:z-auto md:p-0">
      <ChatPanel isLoggedIn={!!user} initialSessions={sessions} />
    </div>
  );
}
