import Link from "next/link";

const QUOTES = [
  { text: "I'm gonna make him an offer he can't refuse.", film: "The Godfather" },
  { text: "Here's looking at you, kid.", film: "Casablanca" },
  { text: "May the Force be with you.", film: "Star Wars" },
  { text: "You talking to me?", film: "Taxi Driver" },
  { text: "Houston, we have a problem.", film: "Apollo 13" },
  { text: "To infinity and beyond!", film: "Toy Story" },
  { text: "I see dead pages.", film: "The Sixth Sense (almost)" },
  { text: "You shall not pass! ...to this page.", film: "The Lord of the Rings (kinda)" },
];

export default function NotFound() {
  // Pick a random quote at build time (SSG)
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <span className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter text-surface-2 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="size-24 sm:size-32 text-brand/60">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h.01M16 12h.01M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <p className="mt-2 text-xl sm:text-2xl font-bold">Lost in the multiverse</p>
      <p className="mt-2 text-sm text-text-dim max-w-md">
        The page you&apos;re looking for has vanished like a post-credits scene nobody stayed for.
      </p>

      <blockquote className="mt-6 max-w-sm italic text-text-dim text-sm">
        &ldquo;{quote.text}&rdquo;
        <footer className="mt-1 text-xs not-italic text-text-dim/60">— {quote.film}</footer>
      </blockquote>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface hover:bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-dim hover:text-white transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          Search
        </Link>
      </div>
    </div>
  );
}
