"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { usePreferences } from "@/lib/i18n/preferences";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = usePreferences();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", searchParams.get("redirect") ?? "/");
    try {
      const { data, error } = await createClient().auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: redirectTo.toString(),
        },
      });
      if (error) {
        setServerError(authErrorMessage(error, lang));
        return;
      }
      if (data.session) {
        router.push(searchParams.get("redirect") ?? "/");
        router.refresh();
        return;
      }
      setNeedsConfirmation(true);
    } catch (e) {
      // TypeError "Failed to fetch" etc. — bilingual, user-friendly only
      setServerError(authErrorMessage(e, lang));
    }
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-bold">
          {lang === "en" ? "Check your email" : "စစ်ဆေးပါ"}
        </h1>
        <p className={`text-muted-foreground text-sm ${lang === "my" ? "leading-[1.9]" : "leading-relaxed"}`}>
          {lang === "en"
            ? "We sent a confirmation link to your email address. Click it to activate your account."
            : "အတည်ပြုချက် လင့်ခ်ကို သင်၏ အီးမေးလ်သို့ ပေးပို့ထားပါသည်။ အကောင့် ဖွင့်ရန် လင့်ခ်ကို နှိပ်ပါ။"}
        </p>
        <Link href="/" className="inline-block font-semibold text-teal underline">
          {lang === "en" ? "Back to home" : "ပင်မစာမျက်နှာသို့"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className={`rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {serverError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="fullName" className="block text-sm font-semibold">
          {lang === "en" ? "Full name" : "အမည်"}
        </label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder={lang === "en" ? "Enter your full name" : "သင့်အမည် ထည့်သွင်းပါ"}
          {...register("fullName")}
        />
        {errors.fullName && <p className="text-sm text-severe">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1">
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

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-semibold">
          {lang === "en" ? "Password" : "စကားဝှက်"}
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? lang === "en"
            ? "Creating account…"
            : "ဖွင့်နေသည်…"
          : lang === "en"
            ? "Create account"
            : "အကောင့်ဖွင့်ရန်"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {lang === "en" ? "or" : "သို့"}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton
        label={
          lang === "en" ? "Sign up with Google" : "Google ဖြင့် အကောင့်ဖွင့်ရန်"
        }
      />

      <p className="text-center text-sm text-muted-foreground">
        {lang === "en" ? "Already registered? " : "အကောင့် ရှိပြီးသားလား "}
        <a href="/auth/login" className="font-semibold text-teal hover:underline">
          {lang === "en" ? "Sign in" : "ဝင်ရောက်ရန်"}
        </a>
      </p>
    </form>
  );
}
