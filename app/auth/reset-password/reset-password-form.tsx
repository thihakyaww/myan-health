"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreferences } from "@/lib/i18n/preferences";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { lang } = usePreferences();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">
          {lang === "en" ? "Password updated!" : "စကားဝှက်အသစ် သတ်မှတ်ပြီးပါပြီ!"}
        </h1>
        <p className={`text-sm text-muted ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {lang === "en"
            ? "Your password has been reset. Redirecting to sign in…"
            : "သင့်စကားဝှက်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။ ဝင်ရောက်ရန် စာမျက်နှာသို့ ပြောင်းနေပါသည်…"}
        </p>
        <Link href="/auth/login" className="inline-block font-semibold text-teal hover:underline">
          {lang === "en" ? "Sign in now" : "အခုပဲ ဝင်ရောက်ရန်"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h1 className="text-xl font-bold">
          {lang === "en" ? "Set new password" : "စကားဝှက်အသစ် သတ်မှတ်ရန်"}
        </h1>
        <p className={`mt-1 text-sm text-muted ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {lang === "en"
            ? "Enter your new password below."
            : "သင့်စကားဝှက်အသစ်ကို အောက်တွင် ထည့်သွင်းပါ။"}
        </p>
      </div>

      {serverError && (
        <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">
          {serverError}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold">
          {lang === "en" ? "New password" : "စကားဝှက်အသစ်"}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={lang === "en" ? "At least 8 characters" : "အနည်းဆုံး အက္ခရာ ၈ လုံး"}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-sm text-severe">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold">
          {lang === "en" ? "Confirm password" : "စကားဝှက်အတည်ပြုရန်"}
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder={lang === "en" ? "Re-enter your password" : "စကားဝှက်ကို ထပ်မံထည့်သွင်းပါ"}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {showConfirm ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-severe">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? lang === "en"
            ? "Updating…"
            : "ပြောင်းနေသည်…"
          : lang === "en"
            ? "Update password"
            : "စကားဝှက်ပြောင်းရန်"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <a href="/auth/login" className="font-semibold text-teal hover:underline">
          {lang === "en" ? "Back to sign in" : "ဝင်ရောက်ရန် ပြန်သွားရန်"}
        </a>
      </p>
    </form>
  );
}
