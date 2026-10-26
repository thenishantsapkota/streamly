import { Link } from "@/lib/router-compat";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { COUNTRIES } from "@/lib/countries";
import { PageHeader } from "@/components/PageHeader";
import { StaggerItem } from "@/components/motion";

export const metadata = {
  title: "Browse by Country",
  description: "Discover movies and TV shows from around the world on Streamly.",
  alternates: { canonical: "/country" },
  openGraph: { title: "Browse by Country · Streamly", url: "/country" },
};

export default function CountryIndexPage() {
  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Browse by country"
          subline="Films and series from around the world. Pick a country to see what is popular there."
          meta={`${COUNTRIES.length} countries`}
        />

        <ul className="grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-3 lg:grid-cols-4 sm:mx-6 sm:border-x">
          {COUNTRIES.map((c, i) => (
            <li key={c.code} className="bg-bg">
              <StaggerItem index={i % 4} className="h-full">
                <Link
                  href={`/country/${c.code}`}
                  className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden p-4 transition-colors duration-500 hover:bg-surface sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <span className="tabular-nums text-xs text-text-dim">{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRightIcon
                      className="size-4 text-text-dim transition duration-300 ease-cinema group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                      weight="bold"
                      aria-hidden
                    />
                  </div>
                  <div>
                    <div className="font-display text-5xl font-semibold leading-none tracking-tighter text-text/15 transition-colors duration-500 group-hover:text-brand sm:text-6xl">
                      {c.code}
                    </div>
                    <div className="mt-3 truncate text-sm font-medium">{c.name}</div>
                  </div>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand transition-transform duration-500 ease-cinema group-hover:scale-x-100"
                  />
                </Link>
              </StaggerItem>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
