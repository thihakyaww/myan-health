"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/lib/i18n/preferences";
import { buttonClass } from "@/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();
  const { lang } = usePreferences();

  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className={buttonClass("danger", "sm")}
    >
      {lang === "en" ? "Sign out" : "ထွက်ရန်"}
    </button>
  );
}
