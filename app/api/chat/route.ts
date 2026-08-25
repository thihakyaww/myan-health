import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  streamChat,
  OpenRouterError,
  MAX_MESSAGE_COUNT,
  MAX_MESSAGE_LENGTH,
  type ChatTurn,
} from "@/lib/ai/openrouter";
import {
  buildSystemPrompt,
  detectEmergency,
  EMERGENCY_RESPONSE_MM,
} from "@/lib/ai/persona";

export const runtime = "nodejs";

/** §3 — the single friendly error surfaced to users, bilingual. */
const FRIENDLY_ERROR =
  "လက်ရှိအချိန်တွင် အဖြေမပေးနိုင်သေးပါ။ ခဏနေရင် ထပ်မံမေးမြန်းပေးပါနော်။ (The assistant is unavailable right now — please try again in a moment.)";

const bodySchema = z.object({
  message: z.string().trim().min(1, "empty").max(MAX_MESSAGE_LENGTH),
  sessionId: z.string().uuid().nullish(),
  // Guest-only ephemeral context (ignored for logged-in users)
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(MAX_MESSAGE_LENGTH),
      })
    )
    .max(MAX_MESSAGE_COUNT)
    .optional(),
});

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function encoder() {
  return new TextEncoder();
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  let { message, sessionId, history } = parsed.data;

  // §3 — truncate oversized input rather than failing outright
  message = message.slice(0, MAX_MESSAGE_LENGTH);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeSessionId: string | null = null;

  if (user) {
    // Resolve or create the session (RLS guarantees ownership)
    let sid = sessionId ?? null;
    if (sid) {
      const { data: owned } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sid)
        .maybeSingle();
      if (!owned) sid = null;
    }
    if (!sid) {
      const title = message.slice(0, 48) + (message.length > 48 ? "…" : "");
      const { data: created, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();
      if (error || !created) {
        return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 500 });
      }
      sid = created.id;
    }
    activeSessionId = sid;
  }

  // Build context turns
  let turns: ChatTurn[] = [];
  if (!detectEmergency(message)) {
    if (user && activeSessionId) {
      // Recent context only — never replay entire history (PRD §9)
      const { data: recent } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGE_COUNT);
      turns = (recent ?? [])
        .reverse()
        .map((m) => ({
          role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
          content: m.content.slice(0, MAX_MESSAGE_LENGTH),
        }));
    } else if (history?.length) {
      turns = history
        .slice(-MAX_MESSAGE_COUNT)
        .map((h) => ({ role: h.role, content: h.content }));
    }
    turns.push({ role: "user", content: message });
  }

  const enc = encoder();

  /** Persist USER + ASSISTANT messages after a successful reply. */
  async function persist(reply: string) {
    if (!user || !activeSessionId) return;
    await supabase.from("chat_messages").insert([
      { session_id: activeSessionId, role: "USER", content: message },
      { session_id: activeSessionId, role: "ASSISTANT", content: reply },
    ]);
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeSessionId);
  }

  // ---- Emergency short-circuit (§5): no model call at all -----------------
  if (detectEmergency(message)) {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: EMERGENCY_RESPONSE_MM })}\n\n`));
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
        controller.close();
        await persist(EMERGENCY_RESPONSE_MM);
      },
    });
    return sseResponse(stream);
  }

  // ---- Normal streamed response -------------------------------------------
  let upstream: AsyncIterable<string>;
  try {
    upstream = await streamChat(buildSystemPrompt(), turns, request.signal);
  } catch (e) {
    const oe = e instanceof OpenRouterError ? e : null;
    console.error("[chat]", oe?.code ?? "unknown", oe?.message ?? e);
    return NextResponse.json(
      { error: FRIENDLY_ERROR },
      { status: oe?.code === "config" ? 500 : 502 }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        enc.encode(`data: ${JSON.stringify({ sessionId: activeSessionId })}\n\n`)
      );
      let full = "";
      try {
        for await (const delta of upstream) {
          full += delta;
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
        }
      } catch (e) {
        console.error("[chat] stream interrupted:", e);
        // Surface only the friendly message; partial text already delivered stays.
        controller.enqueue(
          enc.encode(
            `data: ${JSON.stringify({ error: FRIENDLY_ERROR })}\n\n`
          )
        );
      } finally {
        if (full.trim()) {
          try {
            await persist(full);
          } catch (e) {
            console.error("[chat] persist failed:", e);
          }
        }
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
    cancel() {
      // Client disconnected — nothing further to clean up; persistence is
      // handled in `finally` only when a complete-ish reply exists.
    },
  });

  return sseResponse(stream);
}
