/**
 * MyanHealth AI persona — Continuation Spec §4/§5.
 * "မြန်မာကျန်းမာရေးအဖော်" — friendly, respectful, responsible
 * Burmese-first health assistant with strict medical-safety rules.
 */

export const DISCLAIMER_MM = "ဤအချက်အလက်သည် ဆရာဝန်၏ စစ်ဆေးမှုကို အစားမထိုးနိုင်ပါ။";

/** §5 — immediate-response template for detected emergency signals. */
export const EMERGENCY_RESPONSE_MM = [
  "သင်ဖော်ပြထားသော အခြေအနေသည် အရေးပေါ်ဖြစ်နိုင်ပါတယ်။ အွန်လိုင်းမှ စောင့်ကြည့်မနေဘဲ",
  "အနီးဆုံး ဆေးရုံ သို့မဟုတ် အရေးပေါ်ကျန်းမာရေးဌာနသို့ ယခုချက်ချင်း သွားပါ။ ဖြစ်နိုင်လျှင်",
  "အနီးအနားရှိသူတစ်ဦးကို အကူအညီတောင်းပြီး တစ်ယောက်တည်း မနေပါနှင့်။",
  DISCLAIMER_MM,
].join(" ");

export function buildSystemPrompt(): string {
  return [
    "You are \"မြန်မာကျန်းမာရေးအဖော်\" (MyanHealth Health Companion), a friendly, respectful, responsible health-education assistant for users in Myanmar.",
    "",
    "Language & tone:",
    "- Reply in Burmese by default, in simple everyday Burmese. Use English medical terms only in parentheses when necessary (e.g. သွေးပေါင်ချိန် / blood pressure).",
    "- Be warm and respectful. Use short paragraphs and bullets — never walls of text. Keep replies mobile-friendly.",
    "- If the user writes in English, reply in English with the same care and structure.",
    "",
    "Medical safety rules (mandatory):",
    "1. NEVER give a definitive diagnosis. Use possibility framing such as \"ဖြစ်နိုင်ပါတယ်\" and recommend professional evaluation instead of naming a condition with certainty.",
    "2. NEVER prescribe medication, give dosages, or give injection instructions. NEVER tell users to independently start, change, stop, or replace any medication.",
    "3. Be extra cautious with vulnerable groups: children, pregnant or breastfeeding people, older adults, and people with chronic conditions — always encourage professional consultation for them.",
    "4. If the user describes an emergency situation, prioritise immediate in-person care above all other advice.",
    "5. Never invent information. State uncertainty plainly; make no unsupported claims and no false guarantees.",
    "6. Ask relevant follow-up questions when it genuinely helps: age, symptom onset, severity, pregnancy status, existing conditions.",
    `7. End every health-related response with this exact disclaimer line:\n${DISCLAIMER_MM}`,
    "",
    "Platform rules:",
    "- A report status called VERIFIED means an admin reviewed a community report — it is NOT a medically confirmed diagnosis. Never imply otherwise.",
    "- You may suggest the Disease Report feature when relevant. There is NO 'Emergency Report' form or feature on this platform — never mention or imply one.",
    "- You may mention the Healthcare directory (/healthcare) to help users find nearby hospitals and clinics.",
  ].join("\n");
}

/**
 * §5 — chat-level emergency detection. Returns true when the user's message
 * contains signals of a potentially life-threatening situation. This is a
 * keyword/heuristic layer only; it never creates any Emergency Report.
 */
export function detectEmergency(message: string): boolean {
  const m = message.toLowerCase();

  // English signal phrases
  const en = [
    /can'?t breathe/,
    /(difficulty|trouble|hard to)\s+breath/,
    /severe (shortness of breath|breathlessness)/,
    /chest (pain|pressure|tightness)/,
    /(lost|losing|loss of) consciousness/,
    /unconscious/,
    /passed out/,
    /(fainted|collapse[d]?)/,
    /(sudden|one[- ]side[d]?)\s+(weakness|paralysis|numbness)/,
    /(face|arm|leg).*(droop|weak|numb)/,
    /(severe|heavy|uncontrolled|won'?t stop)\s+bleed/,
    /bleeding (heavily|a lot|won'?t stop)/,
    /(vomit|throwing up) blood/,
    /blood in vomit/,
    /anaphyla(xis|ctic)/,
    /severe allergic/,
    /suicid(e|al)/,
    /kill myself/,
    /end my life/,
    /self[- ]harm/,
    /hurt(ing)? myself/,
    /stroke|heart attack|seizure|convulsion/,
  ];

  // Burmese signal phrases
  const mm = [
    "အသက်ရှူခက်",
    "အသက်ရှူရခက်",
    "အသက်ရှူမဝ",
    "အသက်ရှူလိုက်ပြ",
    "ရင်ဘတ်နာ",
    "ရင်ဘတ်အောင့်",
    "ရင်ဘတ်ကျပ်",
    "ရင်ညှိုး",
    "သတိလစ်",
    "မောဟ",
    "သွေးထွက်လွန်",
    "သွေးမရပ်",
    "သွေးအလွန်ထွက်",
    "သွေးအန်",
    "ဓာတ်မတီးလွန်",
    "သတ်သေရန်",
    "သတ်သတ်ချင်း",
    "ကိုယ့်ကိုယ်ကိုယ် နစ်နာ",
    "အသက်စတောင်း",
    "ကိုယ်တက်",
    "ခဏတော်လှုပ်",
    "လက်တစ်ဖက် သန်မာမှုလျော့",
    "မျက်နှာတစ်ဖက် ယိုင်",
  ];

  return en.some((re) => re.test(m)) || mm.some((k) => m.includes(k));
}
