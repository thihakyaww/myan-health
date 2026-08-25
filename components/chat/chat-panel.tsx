"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";
import { Button } from "@/components/ui/button";
import { MarkdownLite } from "@/components/markdown-lite";
import { ConsentModal, hasConsent, setConsentDismissed } from "./consent-modal";
import { useChatStream, type SessionChip } from "./use-chat-stream";

export function ChatPanel({
  isLoggedIn,
  initialSessions,
}: {
  isLoggedIn: boolean;
  initialSessions: SessionChip[];
}) {
  const { lang } = usePreferences();
  const chat = useChatStream({ isLoggedIn, initialSessions });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!hasConsent()) setShowConsent(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages, chat.sending]);

  function switchSession(id: string) {
    chat.setSessionId(id);
    setSidebarOpen(false);
  }

  function newChat() {
    chat.newChat();
    setSidebarOpen(false);
  }

  /* ── Sidebar content ── */
  const sidebarContent = (
    <div className={`flex h-full flex-col bg-teal-dark text-white transition-all ${sidebarCollapsed ? "w-12" : "w-64"}`}>
      {/* New chat */}
      {!sidebarCollapsed && (
        <div className="p-3">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
            {lang === "en" ? "New chat" : "စကားအသစ်"}
          </button>
        </div>
      )}

      {/* Session list */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {isLoggedIn && chat.sessions.length > 0 && (
            <p className="mb-1 px-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {lang === "en" ? "History" : "စကားဝိုင်းများ"}
            </p>
          )}
          {isLoggedIn &&
            chat.sessions.map((s) => (
              <div
                key={s.id}
                className={`group mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            ))}
          {!isLoggedIn && (
            <div className="px-3 pt-4">
              <Link
                href="/auth/login?redirect=%2Fchat"
                className="block rounded-lg bg-white/10 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                {lang === "en" ? "Sign in to keep chats" : "စကားဝိုင်းများ သိမ်းဆည်းရန် ဝင်ရောက်ပါ"}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
          </button>
          {isLoggedIn && chat.sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => switchSession(s.id)}
              className={`rounded-lg p-2 text-xs ${
                s.id === chat.sessionId ? "bg-white/20 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
              title={s.title}
            >
              {s.title.charAt(0)}
            </button>
          ))}
        </div>
      )}

      {/* Sidebar footer */}
      {!sidebarCollapsed && (
        <div className="border-t border-white/10 p-3">
          <p className="text-[11px] text-white/50 text-center">ကျန်းမာရေးအဖော်</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex h-full overflow-hidden bg-paper md:h-dvh md:pt-16 md:pb-0">
        {/* ── Desktop sidebar ── */}
        <div className="hidden md:flex">{sidebarContent}</div>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 top-16 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-ink/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex h-[calc(100dvh-64px)] w-64 flex-col bg-teal-dark text-white animate-in slide-in-from-left shadow-lg">
              {/* Close button */}
              <div className="flex items-center justify-between p-3">
                <p className="text-sm font-bold">ကျန်းမာရေးအဖော်</p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              {/* New chat */}
              <div className="px-3 pb-2">
                <button
                  onClick={newChat}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14" /></svg>
                  {lang === "en" ? "New chat" : "စကားအသစ်"}
                </button>
              </div>

              {/* Session list */}
              <div className="flex-1 overflow-y-auto px-2 pb-3">
                {isLoggedIn && chat.sessions.length > 0 && (
                  <p className="mb-1 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    {lang === "en" ? "History" : "စကားဝိုင်းများ"}
                  </p>
                )}
                {isLoggedIn &&
                  chat.sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`group mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  ))}
                {!isLoggedIn && (
                  <div className="px-3 pt-4">
                    <Link
                      href="/auth/login?redirect=%2Fchat"
                      className="block rounded-lg bg-white/10 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    >
                      {lang === "en" ? "Sign in to keep chats" : "စကားဝိုင်းများ သိမ်းဆည်းရန် ဝင်ရောက်ပါ"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main area ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top bar — fixed */}
          <div className="flex shrink-0 items-center gap-2 border-b border-line bg-paper px-4 py-3">
            {/* Sidebar toggle (desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden rounded-lg p-1.5 text-muted hover:bg-paper-deep hover:text-ink md:block"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {sidebarCollapsed ? (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M13 9l-2 2 2 2" />
                  </>
                )}
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted hover:bg-paper-deep hover:text-ink md:hidden"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>

            <h1 className="truncate text-sm font-bold">ကျန်းမာရေးအဖော်</h1>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {chat.messages.length === 0 && (
              <div className="space-y-4">
                {/* Greeting bubble */}
                <div className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                  </span>
                  <div className="max-w-[92%] rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-4 py-3 text-sm md:max-w-[80%] leading-[1.9]">
                    မင်္ဂလာပါ။ ကျန်းမာရေးနှင့် ပတ်သက်တဲ့ အထွေထွေမေးခွန်းတွေကို မြန်မာလို
                    မေးမြန်းလို့ရပါတယ်။ သင့်ခံစားနေရတာကို တတ်နိုင်သလောက် ရှင်းရှင်းလင်းလင်း
                    ပြောပြပေးပါနော်။
                  </div>
                </div>

                {/* Starter chips */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted">စတင်မေးမြန်းလို့ရတဲ့ အကြောင်းအရာများ</p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
                        className="rounded-[var(--radius)] border border-line bg-card px-4 py-3 text-left text-sm font-semibold text-muted hover:border-teal/40 hover:text-teal transition-colors leading-[1.8]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chat.messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex items-end justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-[var(--radius)] rounded-br-md bg-teal px-4 py-2.5 text-sm text-white md:max-w-[70%] leading-[1.9]">
                    {m.content}
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </span>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                  </span>
                  <div className="max-w-[92%] rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-4 py-3 text-sm md:max-w-[80%]">
                    <MarkdownLite text={m.content} />
                  </div>
                </div>
              )
            )}

            {chat.sending && (
              <div className="flex items-end gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
                </span>
                <div className="rounded-[var(--radius)] rounded-bl-md border border-line bg-card px-4 py-3">
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

          {/* Composer — fixed bottom */}
          <div className="shrink-0 border-t border-line bg-paper p-3 md:p-4">
            {chat.error && (
              <p className="mb-2 rounded-[var(--radius)] bg-severe-soft px-3 py-2 text-sm text-severe leading-[1.8]">
                {chat.error}
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void chat.send();
              }}
              className="flex items-end gap-2"
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
                rows={Math.min(4, Math.max(1, chat.input.split("\n").length))}
                placeholder="မေးခွန်း ရိုက်ထည့်ပါ…"
                maxLength={1200}
                className="max-h-32 w-full resize-none rounded-[var(--radius)] border border-line bg-card px-4 py-2.5 outline-none focus:border-teal focus:ring-2 focus:ring-ring/40"
              />
              {chat.sending ? (
                <Button type="button" variant="outline" onClick={chat.stop} className="shrink-0 self-stretch px-4">
                  ရပ်တန့်
                </Button>
              ) : (
                <Button type="submit" disabled={!chat.input.trim()} className="shrink-0 self-stretch px-5">
                  ပေးပို့
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>

      {showConsent && (
        <ConsentModal
          onDismiss={() => {
            setConsentDismissed();
            setShowConsent(false);
          }}
        />
      )}
    </>
  );
}
