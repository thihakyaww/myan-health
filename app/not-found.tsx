import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="font-serif text-5xl text-teal-dark/40">404</p>
      <p className="text-lg font-bold leading-[1.75]">Page not found</p>
      <p className="font-serif italic text-teal-dark/80">Page not found</p>
      <Link
        href="/"
        className="mt-3 rounded-[var(--radius)] bg-teal px-6 py-2.5 font-semibold text-white hover:bg-teal-dark transition-colors"
      >
        Back to home
      </Link>
    </main>
  );
}
