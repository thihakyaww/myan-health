"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Msg = { role: "user" | "assistant"; content: string };
export type SessionChip = { id: string; title: string };

const MAX_CONTEXT = 12;
const MAX_MESSAGE_LENGTH = 1200;

/**
 * Shared streaming chat state (Continuation Spec §3/§6).
 * Progressive SSE rendering, optimistic send with rollback,
 * connection cancellation via AbortController.
 */
export function useChatStream({
  isLoggedIn,
  initialSessions = [],
}: {
  isLoggedIn: boolean;
  initialSessions?: SessionChip[];
}) {
  const [sessions, setSessions] = useState<SessionChip[]>(initialSessions);
  const [sessionId, setSessionId] = useState<string | null>(
    initialSessions[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Msg[]>(messages);
  messagesRef.current = messages;

  // Adopt sessions fetched asynchronously by a host component
  // (e.g. the floating widget loads them after mount).
  useEffect(() => {
    if (initialSessions.length === 0) return;
    setSessions((prev) => (prev.length > 0 ? prev : initialSessions));
    setSessionId((cur) => cur ?? initialSessions[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessions]);

  // Load history when switching to an existing session (logged-in only)
  useEffect(() => {
    if (!isLoggedIn || !sessionId) return;
    let cancelled = false;
    setMessages([]);
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (cancelled) return;
          setMessages(
            (data ?? []).map((m) => ({
              role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
              content: m.content,
            }))
          );
        });
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, isLoggedIn]);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setSessionId(null);
    setMessages([]);
    setInput("");
    setError(null);
  }, []);

  const deleteSession = useCallback(
    async (id: string) => {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().from("chat_sessions").delete().eq("id", id);
      setSessions((s) => s.filter((x) => x.id !== id));
      if (sessionId === id) newChat();
    },
    [sessionId, newChat]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(async () => {
    const text = input.trim().slice(0, MAX_MESSAGE_LENGTH);
    const baseMessages = messagesRef.current;
    if (!text || sending) return;

    setMessages([...baseMessages, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(
          isLoggedIn
            ? { message: text, ...(sessionId ? { sessionId } : {}) }
            : {
                message: text,
                history: baseMessages
                  .slice(-MAX_CONTEXT)
                  .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) })),
              }
        ),
      });

      if (!res.ok || !res.body) {
        let friendly =
          "လက်ရှိအချိန်တွင် အဖြေမပေးနိုင်သေးပါ။ ခဏနေရင် ထပ်မံမေးမြန်းပေးပါနော်။ (The assistant is unavailable right now — please try again in a moment.)";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) friendly = j.error;
        } catch {
          /* keep friendly default */
        }
        throw new Error(friendly);
      }

      // Progressive render — append assistant message once first token arrives,
      // then grow it chunk by chunk.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantStarted = false;
      let full = "";
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          for (const line of frame.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload) continue;
            if (payload === "[DONE]") continue;

            let event: { text?: string; error?: string; sessionId?: string | null };
            try {
              event = JSON.parse(payload);
            } catch {
              continue;
            }

            if (event.error && !event.text) {
              throw new Error(event.error);
            }
            const sid = typeof event.sessionId === "string" ? event.sessionId : null;
            if (sid && sid !== sessionId) {
              setSessionId(sid);
              const title = text.slice(0, 48) + (text.length > 48 ? "…" : "");
              setSessions((s) =>
                s.some((x) => x.id === sid) ? s : [{ id: sid, title }, ...s]
              );
            }
            if (typeof event.text === "string") {
              full += event.text;
              if (!assistantStarted) {
                assistantStarted = true;
                setSending(false); // typing dots → streamed bubble
              }
              setMessages((m) => {
                const next = [...m];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { role: "assistant", content: full };
                } else {
                  next.push({ role: "assistant", content: full });
                }
                return next;
              });
            }
          }
        }
      }

      if (!assistantStarted) throw new Error(full || "empty");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // User cancelled — keep whatever partial reply arrived.
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        // roll back the optimistic user message so it isn't lost silently
        setMessages(baseMessages);
      }
    } finally {
      abortRef.current = null;
      setSending(false);
    }
  }, [input, sending, sessionId, isLoggedIn]);

  return {
    sessions,
    sessionId,
    messages,
    input,
    setInput,
    sending,
    error,
    send,
    stop,
    newChat,
    deleteSession,
    setSessionId,
    setError,
  };
}
