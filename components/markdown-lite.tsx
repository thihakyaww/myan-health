"use client";

/**
 * Lightweight markdown-ish renderer for assistant/article text:
 * **heading lines**, "- bullet" blocks, *italic disclaimers*, plain paragraphs.
 */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        return (
          <div key={i} className="space-y-2 leading-[1.8]">
            {lines.map((line, j) => {
              const trimmed = line.trim();
              if (
                trimmed.startsWith("**") &&
                trimmed.endsWith("**") &&
                trimmed.replace(/\*/g, "").trim() === trimmed.slice(2, -2)
              ) {
                return (
                  <h3 key={j} className="pt-1 font-bold text-teal-dark">
                    {trimmed.replaceAll("*", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ")) {
                return (
                  <ul key={j} className="list-disc space-y-1.5 pl-6 marker:text-teal">
                    {trimmed.split(/(?=- )/).map((li, k) =>
                      li.trim() ? (
                        <li key={k}>{li.replace(/^-\s*/, "").replaceAll("**", "")}</li>
                      ) : null
                    )}
                  </ul>
                );
              }
              const italic = trimmed.startsWith("*") && trimmed.endsWith("*");
              return (
                <p key={j} className={italic ? "text-sm italic leading-[1.75] text-muted" : ""}>
                  {italic ? trimmed.replaceAll("*", "") : trimmed.replaceAll("**", "")}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
