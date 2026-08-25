import "server-only";

/**
 * OpenRouter client (Continuation Spec §3).
 * OpenAI-compatible chat completions with `stream: true`.
 * Server-only: OPENROUTER_API_KEY must never reach the browser.
 */

export const OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Limits enforced server-side before anything reaches OpenRouter (§3). */
export const MAX_MESSAGE_COUNT = 12;
export const MAX_MESSAGE_LENGTH = 1200;

export class OpenRouterError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Streams assistant text deltas from OpenRouter.
 * Returns an async iterable of string chunks; throws OpenRouterError on
 * timeout / bad status / interrupted streams.
 */
export async function streamChat(
  systemPrompt: string,
  turns: ChatTurn[],
  signal?: AbortSignal
): Promise<AsyncIterable<string>> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new OpenRouterError(
      "config",
      "OPENROUTER_API_KEY is missing. Add it to .env.local."
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // Optional attribution headers per OpenRouter docs
        "HTTP-Referer": "https://myanhealth.app",
        "X-Title": "MyanHealth",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        stream: true,
        temperature: 0.4,
        max_tokens: 1024,
        messages: [{ role: "system", content: systemPrompt }, ...turns],
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    const aborted = e instanceof Error && e.name === "AbortError";
    throw new OpenRouterError(
      aborted ? "timeout" : "network",
      aborted
        ? "The AI service took too long to respond."
        : "Could not reach the AI service."
    );
  }

  if (!res.ok || !res.body) {
    clearTimeout(timer);
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      detail = j.error?.message ?? "";
    } catch {
      /* keep default */
    }
    throw new OpenRouterError(
      res.status === 429 ? "rate_limit" : String(res.status),
      detail || `OpenRouter request failed (${res.status})`
    );
  }

  async function* iterate(): AsyncIterable<string> {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          for (const line of frame.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
                error?: { message?: string };
              };
              if (json.error?.message) {
                throw new OpenRouterError("stream", json.error.message);
              }
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) yield delta;
            } catch (e) {
              if (e instanceof OpenRouterError) throw e;
              // Ignore malformed frames
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof OpenRouterError) throw e;
      const aborted = e instanceof Error && e.name === "AbortError";
      throw new OpenRouterError(
        aborted ? "cancelled" : "stream",
        "The AI response stream was interrupted."
      );
    } finally {
      clearTimeout(timer);
      reader.releaseLock();
    }
  }

  return iterate();
}
