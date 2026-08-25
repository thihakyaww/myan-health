import Link from "next/link";

/**
 * MyanHealth mark (Continuation Spec §12) — teal rounded square with a
 * saffron-ticked medical cross. Extends existing tokens only.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="48" height="48" rx="12" fill="#0B6760" />
      <rect width="48" height="48" rx="12" fill="url(#mh-g)" />
      <path
        d="M24 13v22M13 24h22"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M9 40h14" stroke="#D4A73A" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="mh-g" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#0B6760" />
          <stop offset="1" stopColor="#07514B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoLink({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="MyanHealth home">
      <LogoMark size={size} />
      <span className="font-serif text-xl leading-none text-teal-dark">MyanHealth</span>
    </Link>
  );
}
