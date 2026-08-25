"use client";

import { useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SettingsForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const { lang, highContrast, setLang, setHighContrast } = usePreferences();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(null);

    if (newPw.length < 8) {
      setPwErr(lang === "en" ? "Password must be at least 8 characters" : "စကားဝှက်သည် အနည်းဆုံး ၈ လုံးရှိရမည်");
      return;
    }
    if (newPw !== confirmPw) {
      setPwErr(lang === "en" ? "Passwords do not match" : "စကားဝှက်များ မကိုက်ပါ");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        setPwErr(error.message.includes("same password")
          ? (lang === "en" ? "New password must differ from current" : "စကားဝှက်အသစ်သည် လက်ရှိစကားဝှက်နှင့် မတူညီရပါ")
          : error.message);
      } else {
        setPwMsg(lang === "en" ? "Password updated" : "စကားဝှက်အသစ် ပြောင်းပြီးပါပြီ");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch {
      setPwErr(lang === "en" ? "Unexpected error" : "မမျှော်လင့်သည့် အမှားတစ်ခု ဖြစ်ပွားပါသည်");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Profile info (read-only) */}
      <Card>
        <CardBody>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-teal-dark/50">
            {lang === "en" ? "Profile" : "ပရိုဖိုင်"}
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{lang === "en" ? "Name" : "အမည်"}</dt>
              <dd className="font-semibold">{name || "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{lang === "en" ? "Email" : "အီးမေးလ်"}</dt>
              <dd className="font-semibold">{email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{lang === "en" ? "Phone" : "ဖုန်း"}</dt>
              <dd className="font-semibold">{phone || "—"}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* Language + display */}
      <Card>
        <CardBody>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-teal-dark/50">
            {lang === "en" ? "Display" : "ပြသမှု"}
          </h3>
          <div className="space-y-4">
            {/* Language toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {lang === "en" ? "Language" : "ဘာသာစကား"}
              </label>
              <div className="flex rounded-xl border border-line bg-paper-deep p-0.5">
                <button
                  onClick={() => setLang("my")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    lang === "my" ? "bg-teal text-white shadow-sm" : "text-teal-dark/50 hover:text-teal-dark"
                  }`}
                >
                  မြန်မာ
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    lang === "en" ? "bg-teal text-white shadow-sm" : "text-teal-dark/50 hover:text-teal-dark"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {lang === "en" ? "High contrast" : "မြင့်မားသော ကွဲပြားမှု"}
              </label>
              <button
                role="switch"
                aria-checked={highContrast}
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  highContrast ? "bg-teal" : "bg-line"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    highContrast ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Change password */}
      <Card>
        <CardBody>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-teal-dark/50">
            {lang === "en" ? "Change password" : "စကားဝှက်ပြောင်းရန်"}
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder={lang === "en" ? "Current password" : "လက်ရှိ စကားဝှက်"}
              autoComplete="current-password"
              className="w-full rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder={lang === "en" ? "New password (min 8 chars)" : "စကားဝှက်အသစ် (အနည်းဆုံး ၈ လုံး)"}
              autoComplete="new-password"
              className="w-full rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder={lang === "en" ? "Confirm new password" : "စကားဝှက်အသစ် အတည်ပြုရန်"}
              autoComplete="new-password"
              className="w-full rounded-[var(--radius)] border border-line bg-card px-3.5 py-2 text-sm outline-none focus:border-teal"
            />

            {pwErr && (
              <p className="text-sm font-medium text-severe">{pwErr}</p>
            )}
            {pwMsg && (
              <p className="text-sm font-medium text-teal">{pwMsg}</p>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving
                ? (lang === "en" ? "Saving…" : "သိမ်းဆည်းနေသည်…")
                : (lang === "en" ? "Update password" : "စကားဝှက်ပြောင်းရန်")}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
