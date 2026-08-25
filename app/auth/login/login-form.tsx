"use client";

import { useState } from "react";
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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = usePreferences();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const redirect = searchParams.get("redirect") ?? "/";
  const callbackError = searchParams.get("error");

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setServerError(authErrorMessage(error, lang));
        return;
      }
      // Admins go straight to the dashboard (Continuation Spec §7)
      if (redirect === "/") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.role === "ADMIN") {
            router.push("/admin");
            router.refresh();
            return;
          }
        }
      }
      router.push(redirect);
      router.refresh();
    } catch (e) {
      // TypeError "Failed to fetch" etc. — never surface raw errors
      setServerError(authErrorMessage(e, lang));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {callbackError && (
        <p className={`rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe ${lang === "my" ? "leading-[1.9]" : ""}`}>
          {lang === "en"
            ? "Sign-in link expired. Enter your email and password again."
            : "ဝင်ရောက်မှု လင့်ခ် သက်တမ်းကုန်သွားပါသည်။ အီးမေးလ်နှင့် စကားဝှက်ကို ထပ်မံထည့်သွင်းပါ။"}
        </p>
      )}
      {serverError && (
        <p className={`rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe ${lang === "my" ? "leading-[1.9]" : ""}`}>
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
          placeholder={lang === "en" ? "you@gmail.com" : "you@gmail.com"}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-severe">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold">
          {lang === "en" ? "Password" : "စကားဝှက်"}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={lang === "en" ? "Enter your password" : "စကားဝှက်ထည့်ပါ"}
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

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-teal focus:ring-teal"
          />
          <span className="text-muted">{lang === "en" ? "Remember me" : "မှတ်ထားရန်"}</span>
        </label>
        <a
          href="/auth/forgot-password"
          className="text-sm font-semibold text-teal hover:underline"
        >
          {lang === "en" ? "Forgot password?" : "စကားဝှက်မေ့နေပါသလား?"}
        </a>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? lang === "en"
            ? "Signing in…"
            : "ဝင်ရောက်နေသည်…"
          : lang === "en"
            ? "Sign in"
            : "ဝင်ရောက်ရန်"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {lang === "en" ? "or" : "သို့"}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton
        label={
          lang === "en" ? "Continue with Google" : "Google ဖြင့် ဆက်လက်လုပ်ဆောင်ရန်"
        }
      />

      <p className="text-center text-sm text-muted-foreground">
        {lang === "en" ? "No account yet? " : "အကောင့် မရှိသေးပါက "}
        <a href="/auth/signup" className="font-semibold text-teal hover:underline">
          {lang === "en" ? "Sign up" : "အကောင့်ဖွင့်ရန်"}
        </a>
      </p>
    </form>
  );
}
