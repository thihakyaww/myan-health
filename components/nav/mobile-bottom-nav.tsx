"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type DictKey } from "@/lib/i18n/dictionary";
import { usePreferences } from "@/lib/i18n/preferences";
import {
  ChatIcon,
  HealthcareIcon,
  NewsIcon,
  ProfileIcon,
  ReportsIcon,
} from "@/components/icons";

const TABS: {
  key: DictKey;
  href: string;
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}[] = [
  { key: "nav.news", href: "/news", Icon: NewsIcon },
  { key: "nav.healthcare", href: "/healthcare", Icon: HealthcareIcon },
  { key: "nav.reports", href: "/reports", Icon: ReportsIcon },
  { key: "nav.chat", href: "/chat", Icon: ChatIcon },
  { key: "nav.profile", href: "/profile", Icon: ProfileIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = usePreferences();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-paper/85 md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ key, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold leading-none transition-colors ${
                  active ? "text-teal" : "text-muted/70"
                }`}
              >
                <Icon width={22} height={22} />
                <span>{t(lang, key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
