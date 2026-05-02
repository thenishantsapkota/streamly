import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";

export const metadata = {
  title: "Browse by Country",
  description: "Discover movies and TV shows from around the world on Streamly.",
  alternates: { canonical: "/country" },
  openGraph: { title: "Browse by Country · Streamly", url: "/country" },
};

export default function CountryIndexPage() {
  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse by Country</h1>
        <p className="mt-1 text-text-dim mb-8">
          Discover movies and TV shows from around the world
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {COUNTRIES.map((c) => (
            <Link
              key={c.code}
              href={`/country/${c.code}`}
              className="group flex items-center gap-3 rounded-xl bg-surface border border-border p-4 transition hover:bg-surface-2 hover:border-brand/50"
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-white">
                  {c.name}
                </div>
                <div className="text-xs text-text-dim">{c.code}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
