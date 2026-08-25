type P = React.SVGProps<SVGSVGElement>;

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function NewsIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 9h3v8a2 2 0 0 1-2 2h-1" />
      <path d="M7 8.5h7M7 12h7M7 15.5h4" />
    </svg>
  );
}

export function HealthcareIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 21V8l8-5 8 5v13" />
      <path d="M12 11v6M9 14h6" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function ReportsIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function ChatIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" />
      <path d="M9 11h6M9 14h4" />
    </svg>
  );
}

export function ProfileIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function ContrastIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GlobeIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.6-4-9s1.5-6.4 4-9Z" />
    </svg>
  );
}
