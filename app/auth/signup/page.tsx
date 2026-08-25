"use client";

import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { LogoMark } from "@/components/ui/logo";
import { usePreferences } from "@/lib/i18n/preferences";

export default function SignupPage() {
  const { lang } = usePreferences();
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 pt-12 md:pt-16">
      <div className="mb-7 text-center">
        <div className="mb-3 flex justify-center">
          <LogoMark size={44} />
        </div>
        <p className="eyebrow mb-2 text-teal-dark/70">MyanHealth</p>
        <h1 className="text-2xl font-bold leading-[1.6]">
          {lang === "en" ? "Create account" : "အကောင့်အသစ်ဖွင့်ရန်"}
        </h1>
        {lang === "en" && (
          <p className="mt-1 text-lg italic text-teal-dark/80">
            Create your account
          </p>
        )}
      </div>
      <div className="rounded-[var(--radius)] border border-line bg-card p-7 shadow-[var(--shadow)]">
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}
