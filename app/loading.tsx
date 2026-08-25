export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-16 md:pt-14">
      <div className="mb-8">
        <div className="h-4 w-28 animate-pulse rounded-full bg-paper-deep" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded-[var(--radius)] bg-paper-deep" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-[var(--radius)] border border-line bg-card"
          />
        ))}
      </div>
    </div>
  );
}
