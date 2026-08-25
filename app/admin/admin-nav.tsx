"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/ui/logo";
import { useAdminSidebar } from "@/components/admin/admin-shell";

const GROUPS: {
  labelMy: string;
  labelEn: string;
  items: { href: string; labelMy: string; labelEn: string; icon: React.ReactNode }[];
}[] = [
  {
    labelMy: "ခြုံငုံသုံးသပ်ချက်",
    labelEn: "Overview",
    items: [
      {
        href: "/admin",
        labelMy: "ဒက်ရ်ဗိုးဒ်",
        labelEn: "Overview",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    labelMy: "အကြောင်းအရာ",
    labelEn: "Content",
    items: [
      {
        href: "/admin/articles",
        labelMy: "သတင်းဆောင်းပါး",
        labelEn: "News",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
          </svg>
        ),
      },
      {
        href: "/admin/facilities",
        labelMy: "ကျန်းမာရေးဌာနများ",
        labelEn: "Facilities",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M12 7v6M9 10h6" />
          </svg>
        ),
      },
    ],
  },
  {
    labelMy: "စစ်ဆေးအတည်ပြုခြင်း",
    labelEn: "Moderation",
    items: [
      {
        href: "/admin/reports/disease",
        labelMy: "ရောဂါ အစီရင်ခံချက်",
        labelEn: "Disease Reports",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 12h-4l-3 8L9 4l-3 8H2" />
          </svg>
        ),
      },
      {
        href: "/admin/reports/health",
        labelMy: "ကျန်းမာရေး အစီရင်ခံချက်",
        labelEn: "Health Reports",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        ),
      },
      {
        href: "/admin/users",
        labelMy: "အသုံးပြုသူများ",
        labelEn: "Users & roles",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        ),
      },
    ],
  },
  {
    labelMy: "အကြောင်းကြားချက်",
    labelEn: "Notifications",
    items: [
      {
        href: "/admin/notifications",
        labelMy: "အကြောင်းကြားချက်များ",
        labelEn: "Notifications",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
    ],
  },
  {
    labelMy: "ဆက်တင်",
    labelEn: "Settings",
    items: [
      {
        href: "/admin/settings",
        labelMy: "ဆက်တင်များ",
        labelEn: "Settings",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

const LS_KEY = "myanhealth.admin.sidebar";

/* ---------- Desktop sidebar ---------- */
export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = usePreferences();
  const { collapsed, toggle } = useAdminSidebar();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Admin" className="flex h-full flex-col bg-sidebar">
      {/* Header + toggle */}
      <div className="flex items-center gap-3 px-4 pb-5 pt-5">
        <LogoMark size={36} />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate font-bold tracking-wide text-sidebar-foreground">MYANHEALTH</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40">
              {lang === "en" ? "Admin panel" : "စီမံခန့်ခွဲမှု"}
            </p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <div className="mb-2 px-3">
        <button
          onClick={toggle}
          className="flex h-9 w-full items-center justify-center rounded-xl text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-1">
        {GROUPS.map((g) => (
          <div key={g.labelEn}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                {lang === "en" ? g.labelEn : g.labelMy}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {g.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? (lang === "en" ? item.labelEn : item.labelMy) : undefined}
                    className={`flex items-center gap-3 rounded-xl transition-all ${
                      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                    } ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/55 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <span className={`shrink-0 ${active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/40"}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate text-sm font-semibold">
                        {lang === "en" ? item.labelEn : item.labelMy}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={async () => {
            await createClient().auth.signOut();
            router.push("/auth/login");
          }}
          title={collapsed ? (lang === "en" ? "Sign out" : "ထွက်ရန်") : undefined}
          className={`flex w-full items-center gap-3 rounded-xl text-sm font-semibold text-severe transition-colors hover:bg-sidebar-accent/50 ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && (
            <span>{lang === "en" ? "Sign out" : "ထွက်ရန်"}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

/* ---------- Mobile top bar + drawer ---------- */
export function AdminMobileBar() {
  const router = useRouter();
  const { lang } = usePreferences();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/auth/login");
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(true)}
            aria-label={lang === "en" ? "Open menu" : "မီနူးဖွင့်ရန်"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <div className="leading-tight">
              <p className="text-sm font-bold text-sidebar-foreground">MyanHealth</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40">Admin</p>
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-severe hover:bg-white/70"
        >
          {lang === "en" ? "Sign out" : "ထွက်ရန်"}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div className="leading-tight">
              <p className="font-bold tracking-wide text-sidebar-foreground">MYANHEALTH</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40">
                {lang === "en" ? "Admin panel" : "စီမံခန့်ခွဲမှု"}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label={lang === "en" ? "Close menu" : "မီနူးပိတ်ရန်"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-2 py-1">
          {GROUPS.map((g) => (
            <div key={g.labelEn}>
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                {lang === "en" ? g.labelEn : g.labelMy}
              </p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/55 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <span className={active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/40"}>
                        {item.icon}
                      </span>
                      <span className="truncate">
                        {lang === "en" ? item.labelEn : item.labelMy}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-severe transition-colors hover:bg-sidebar-accent/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {lang === "en" ? "Sign out" : "ထွက်ရန်"}
          </button>
        </div>
      </div>
    </>
  );
}
