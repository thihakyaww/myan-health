import type { Metadata } from "next";
import Script from "next/script";
import { DM_Serif_Display, Manrope, Noto_Sans_Myanmar } from "next/font/google";
import { PreferencesProvider } from "@/lib/i18n/preferences";
import { prePaintPreferences } from "@/lib/i18n/pre-paint";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--sans-latin",
  display: "swap",
});

const notoMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--sans-myanmar",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyanHealth — ကျန်းမာရေး အချက်အလက် ပလက်ဖောင်း",
    template: "%s · MyanHealth",
  },
  description:
    "Burmese-first digital health platform for Myanmar: health news, facility directory, disease & health reports, AI health assistant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      suppressHydrationWarning
      className={`${dmSerif.variable} ${manrope.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <head>
        <Script id="pre-paint-preferences" strategy="beforeInteractive">
          {prePaintPreferences}
        </Script>
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius)] focus:bg-teal focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
