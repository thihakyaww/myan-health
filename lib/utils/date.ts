/**
 * Deterministic bilingual date formatting.
 *
 * Intl output differs between Node (SSR) and browser (hydration) ICU builds,
 * which causes hydration mismatches — so we format manually with fixed
 * month-name tables instead of relying on the runtime locale database.
 */

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_MY = [
  "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်",
  "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ",
];

export function formatDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const day = d.getUTCDate();
  const monthIdx = d.getUTCMonth();
  const year = d.getUTCFullYear();

  if (lang === "en") {
    return `${MONTHS_EN[monthIdx]} ${day}, ${year}`;
  }
  // Burmese-first: day + month + year (e.g. ၂၂ ... keep Western digits for clarity)
  return `${day} ${MONTHS_MY[monthIdx]} ${year}`;
}
