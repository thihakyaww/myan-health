import { LANG_DEFAULT } from "@/lib/i18n/dictionary";

// Runs before paint to apply persisted preferences without a flash.
// Mirrors lib/i18n/preferences.tsx — keep in sync.
export const prePaintPreferences = `(function(){try{
var l=localStorage.getItem('myanhealth.lang')||'${LANG_DEFAULT}';
var h=localStorage.getItem('myanhealth.high-contrast')==='1';
document.documentElement.lang=l==='en'?'en':'my';
document.documentElement.classList.toggle('high-contrast',h);
}catch(e){}})();`;
