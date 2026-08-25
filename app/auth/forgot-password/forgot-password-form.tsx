"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreferences } from "@/lib/i18n/preferences";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const { lang } = usePreferences();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      setSent(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">
          {lang === "en" ? "Check your email" : "အီးမေးလ် စစ်ဆေးပါ"}
        </h1>
        <p className={`text-sm text-muted ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {lang === "en"
            ? "We sent a password reset link to your email. Click the link to set a new password."
            : "စကားဝှက်အသစ်သတ်မှတ်ရန် လင့်ခ်ကို သင့်အီးမေးလ်သို့ ပေးပို့ထားပါသည်။"}
        </p>
        <Link href="/auth/login" className="inline-block font-semibold text-teal hover:underline">
          {lang === "en" ? "Back to sign in" : "ဝင်ရောက်ရန် ပြန်သွားရန်"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h1 className="text-xl font-bold">
          {lang === "en" ? "Forgot password?" : "စကားဝှက်မေ့နေပါသလား?"}
        </h1>
        <p className={`mt-1 text-sm text-muted ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {lang === "en"
            ? "Enter your email and we'll send you a reset link."
            : "သင့်အီးမေးလ်ထည့်ပြီး စကားဝှက်အသစ်သတ်မှတ်ရန် လင့်ခ် ရယူပါ။"}
        </p>
      </div>

      {serverError && (
        <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">
          {serverError}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold">
          {lang === "en" ? "Email" : "အီးမေးလ်"}
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={lang === "en" ? "you@example.com" : "you@example.com"}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-severe">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? lang === "en"
            ? "Sending…"
            : "ပေးပို့နေသည်…"
          : lang === "en"
            ? "Send reset link"
            : "လင့်ခ်ပေးပို့ရန်"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <a href="/auth/login" className="font-semibold text-teal hover:underline">
          {lang === "en" ? "Back to sign in" : "ဝင်ရောက်ရန် ပြန်သွားရန်"}
        </a>
      </p>
    </form>
  );
}
