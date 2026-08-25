"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { t, type DictKey } from "@/lib/i18n/dictionary";
import { usePreferences } from "@/lib/i18n/preferences";
import { buttonClass } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { LangToggle } from "./lang-toggle";

const LINKS: { key: DictKey; href: string }[] = [
  { key: "nav.news", href: "/news" },
  { key: "nav.healthcare", href: "/healthcare" },
  { key: "nav.reports", href: "/reports" },
  { key: "nav.chat", href: "/chat" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = usePreferences();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overHero
          ? "text-white"
           : "border-b border-line/60 bg-paper/70 text-ink backdrop-blur-xl supports-[backdrop-filter]:bg-paper/60"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="MyanHealth home">
          <LogoMark size={28} />
          <span className="font-serif text-xl tracking-wide">MyanHealth</span>
        </Link>

        {/* Desktop section links */}
        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {LINKS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                isActive(href)
                  ? overHero
                    ? "bg-white/15 text-white"
                    : "bg-sky text-teal-dark"
                  : overHero
                    ? "hover:bg-white/10"
                    : "text-muted hover:bg-paper-deep"
              }`}
            >
              {t(lang, key)}
            </Link>
          ))}
        </nav>

        {/* Right cluster: lang toggle + auth */}
        <div className="flex items-center gap-2">
          <LangToggle />

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/profile" className={buttonClass(overHero ? "outline-light" : "secondary", "sm")}>
                  {t(lang, "nav.profile")}
                </Link>
                <button onClick={signOut} className={buttonClass("ghost", "sm")}>
                  {t(lang, "auth.logout")}
                </button>
              </>
            ) : (
              <>
                <a href="/#contact" className={`hidden px-3 py-1.5 font-semibold xl:block hover:underline ${overHero ? "" : ""}`}>
                  {t(lang, "nav.contact")}
                </a>
                <Link href="/auth/signup" className={buttonClass(overHero ? "outline-light" : "secondary", "sm")}>
                  {t(lang, "auth.signup")}
                </Link>
                <Link href="/auth/login" className={buttonClass("primary", "sm")}>
                  {t(lang, "auth.login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
