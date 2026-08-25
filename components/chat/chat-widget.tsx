"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";
import { Button } from "@/components/ui/button";
import { MarkdownLite } from "@/components/markdown-lite";
import { ConsentModal, hasConsent, setConsentDismissed } from "./consent-modal";
import { useChatStream, type SessionChip } from "./use-chat-stream";

/**
 * Corner-anchored streaming AI chat widget.
 * Floating panel on desktop, full-screen sheet on mobile.
 * Hidden on /chat where the full-page panel already lives.
 */
export function ChatWidget({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { lang } = usePreferences();
  const [open, setOpen] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionChip[]>([]);
  const chat = useChatStream({ isLoggedIn, initialSessions: sessions });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved sessions on first open (logged-in only)
  useEffect(() => {
    if (!open || !isLoggedIn || sessions.length > 0) return;
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("chat_sessions")
        .select("id, title")
        .order("updated_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setSessions(data ?? []));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoggedIn]);

  function handleOpen() {
    setOpen(true);
    if (!hasConsent()) setShowConsent(true);
  }

  function handleConsentDismiss() {
    setConsentDismissed();
    setShowConsent(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      );
    }
  }, [chat.messages, chat.sending, open]);

  function switchSession(id: string) {
    chat.setSessionId(id);
    setSidebarOpen(false);
  }

  function newChat() {
    chat.newChat();
    setSidebarOpen(false);
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* ── Sidebar content ── */
  const sidebarContent = (
    <div className={`flex h-full flex-col bg-teal-dark text-white transition-all ${sidebarCollapsed ? "w-12" : "w-56"}`}>
      {/* New chat */}
      {!sidebarCollapsed && (
        <div className="p-2.5">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
            {lang === "en" ? "New chat" : "စကားအသစ်"}
          </button>
        </div>
      )}

      {/* Session list */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isLoggedIn && chat.sessions.length > 0 && (
            <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {lang === "en" ? "History" : "စကားဝိုင်းများ"}
            </p>
          )}
          {isLoggedIn &&
            chat.sessions.map((s) => (
              <div
                key={s.id}
                className={`group mb-0.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                  s.id === chat.sessionId
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <button
                  onClick={() => switchSession(s.id)}
                  className="min-w-0 flex-1 truncate text-left"
                >
                  {s.title}
                </button>
                <button
                  onClick={() => chat.deleteSession(s.id)}
                  aria-label={`Delete ${s.title}`}
                  className="shrink-0 rounded p-0.5 text-white/40 opacity-0 group-hover:opacity-100 hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            ))}
          {!isLoggedIn && (
            <div className="px-2 pt-2">
              <Link
                href="/auth/login?redirect=%2Fchat"
                className="block rounded-lg bg-white/10 px-2.5 py-2 text-center text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                {lang === "en" ? "Sign in" : "ဝင်ရောက်ပါ"}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Collapsed icons */}
      {sidebarCollapsed && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={newChat}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            title={lang === "en" ? "New chat" : "စကားအသစ်"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
          </button>
          {isLoggedIn && chat.sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => switchSession(s.id)}
              className={`rounded-lg p-2 text-[10px] ${
                s.id === chat.sessionId ? "bg-white/20 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
              title={s.title}
            >
              {s.title.charAt(0)}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="AI ကျန်းမာရေး အကူအညီ ဖွင့်ရန်"
          className="fixed bottom-[84px] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-[var(--shadow)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="12" rx="3" />
            <path d="M12 2v4" />
            <circle cx="12" cy="2" r="1.5" />
            <circle cx="9" cy="14" r="1.5" fill="currentColor" />
            <circle cx="15" cy="14" r="1.5" fill="currentColor" />
            <path d="M9 17.5c.8.6 1.8 1 3 1s2.2-.4 3-1" />
          </svg>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="ကျန်းမာရေးအဖော်"
          className="fixed inset-0 z-50 flex flex-col bg-paper md:inset-auto md:bottom-6 md:right-6 md:h-[600px] md:max-h-[calc(100dvh-48px)] md:w-[420px] md:rounded-[var(--radius)] md:border md:border-line md:shadow-[var(--shadow)]"
        >
          <div className="flex min-h-0 flex-1">
            {/* Desktop sidebar */}
            <div className="hidden md:flex">{sidebarContent}</div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div
                  className="absolute inset-0 bg-ink/30"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="relative flex h-full w-56 flex-col bg-teal-dark text-white animate-in slide-in-from-left shadow-lg">
                  {/* Close button */}
                  <div className="flex items-center justify-between p-2.5">
                    <p className="text-xs font-bold">ကျန်းမာရေးအဖော်</p>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
                      aria-label="Close menu"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  </div>
                  {/* New chat */}
                  <div className="px-2.5 pb-1">
                    <button
                      onClick={newChat}
                      className="flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
                      {lang === "en" ? "New chat" : "စကားအသစ်"}
                    </button>
                  </div>
                  {/* Session list */}
                  <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {isLoggedIn && chat.sessions.length > 0 && (
                      <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                        {lang === "en" ? "History" : "စကားဝိုင်းများ"}
                      </p>
                    )}
                    {isLoggedIn && chat.sessions.map((s) => (
                      <div
                        key={s.id}
                        className={`group mb-0.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                          s.id === chat.sessionId ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <button onClick={() => switchSession(s.id)} className="min-w-0 flex-1 truncate text-left">{s.title}</button>
                        <button onClick={() => chat.deleteSession(s.id)} className="shrink-0 rounded p-0.5 text-white/40 opacity-0 group-hover:opacity-100 hover:text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main area */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Header */}
              <div className="flex items-center gap-1.5 border-b border-line bg-teal px-2.5 py-2 text-white">
                {/* Sidebar toggle (desktop) */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white md:block"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                    {sidebarCollapsed && <path d="M13 9l-2 2 2 2" />}
                  </svg>
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
                  aria-label="Open menu"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                </button>

                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-bold">ကျန်းမာရေးအဖော်</p>
                  <p className="text-[9px] text-white/70">အထွေထွေကျန်းမာရေး အချက်အလက်</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {chat.messages.length === 0 && (
                  <div className="space-y-3">
                    {/* Greeting bubble */}
                    <div className="flex items-end gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                      </span>
                      <div className="max-w-[92%] rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-3 py-2 text-xs leading-[1.9]">
                        မင်္ဂလာပါ။ ကျန်းမာရေးနှင့် ပတ်သက်တဲ့ အထွေထွေမေးခွန်းတွေကို မြန်မာလို
                        မေးမြန်းလို့ရပါတယ်။ သင့်ခံစားနေရတာကို တတ်နိုင်သလောက် ရှင်းရှင်းလင်းလင်း
                        ပြောပြပေးပါနော်။
                      </div>
                    </div>

                    {/* Starter chips */}
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold text-muted">စတင်မေးမြန်းလို့ရတဲ့ အကြောင်းအရာများ</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          "အအေးမိ၊ လည်ချောင်းနာသလို ဖြစ်နေတယ်။ ဘာတွေဂရုစိုက်ရမလဲ?",
                          "နေ့စဉ် အာဟာရညီမျှအောင် ဘယ်လိုစားသောက်သင့်လဲ?",
                          "လက်ဆေးတာကို မှန်ကန်အောင် ဘယ်လိုလုပ်ရမလဲ?",
                          "အိပ်ရေးမဝရင် ကျန်းမာရေးကို ဘယ်လိုထိခိုက်နိုင်လဲ?",
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              chat.setInput(q);
                              setTimeout(() => chat.send(), 50);
                            }}
                            className="rounded-lg border border-line bg-card px-3 py-2 text-left text-xs font-semibold text-muted hover:border-teal/40 hover:text-teal transition-colors leading-[1.8]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!isLoggedIn && (
                      <Link
                        href="/auth/login?redirect=%2Fchat"
                        className="block text-center text-xs font-semibold text-teal underline"
                        onClick={() => setOpen(false)}
                      >
                        စကားဝိုင်းများ သိမ်းဆည်းရန် ဝင်ရောက်ပါ
                      </Link>
                    )}
                  </div>
                )}

                {chat.messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex items-end justify-end gap-2">
                      <div className="max-w-[85%] rounded-[var(--radius)] rounded-br-md bg-teal px-3 py-2 text-xs text-white leading-[1.9]">
                        {m.content}
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </span>
                    </div>
                  ) : (
                    <div key={i} className="flex items-end gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                      </span>
                      <div className="max-w-[92%] rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-3 py-2 text-xs">
                        <MarkdownLite text={m.content} />
                      </div>
                    </div>
                  )
                )}

                {chat.sending && (
                  <div className="flex items-end gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                    </span>
                    <div className="rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-3 py-2">
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal"
                            style={{ animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-line p-2.5">
                {chat.error && (
                  <p className="mb-1.5 rounded-lg bg-severe-soft px-2.5 py-1.5 text-xs text-severe leading-[1.8]">
                    {chat.error}
                  </p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void chat.send();
                  }}
                  className="flex items-end gap-1.5"
                >
                  <textarea
                    value={chat.input}
                    onChange={(e) => chat.setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void chat.send();
                      }
                    }}
                    rows={Math.min(3, Math.max(1, chat.input.split("\n").length))}
                    placeholder="မေးခွန်း ရိုက်ထည့်ပါ…"
                    maxLength={1200}
                    className="max-h-20 w-full resize-none rounded-lg border border-line bg-card px-3 py-2 text-xs outline-none focus:border-teal focus:ring-2 focus:ring-ring/40 leading-[1.9]"
                  />
                  {chat.sending ? (
                    <Button type="button" variant="outline" onClick={chat.stop} className="shrink-0 self-stretch px-2.5 py-1.5 text-xs">
                      ရပ်
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!chat.input.trim()} className="shrink-0 self-stretch px-3 py-1.5 text-xs">
                      ပေးပို့
                    </Button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConsent && <ConsentModal onDismiss={handleConsentDismiss} />}
    </>
  );
}
