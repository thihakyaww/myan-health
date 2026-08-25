export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border border-line bg-card shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

/* Burmese-first line-height utility — PRD §15 typography rule */
export const mmLineHeight = "leading-[1.75]";
