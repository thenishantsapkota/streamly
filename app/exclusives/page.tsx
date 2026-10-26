import { IMG } from "@/lib/tmdb";
import { ProviderRow } from "@/components/ProviderRow";
import { PageHeader } from "@/components/PageHeader";
import { PROVIDERS } from "@/lib/providers";

export const revalidate = 3600;

export const metadata = {
  title: "Streaming Exclusives",
  description:
    "Browse exclusive movies and shows from Netflix, Disney+, Max, Prime Video, Apple TV+, Paramount+, and Hotstar.",
  alternates: { canonical: "/exclusives" },
  openGraph: {
    title: "Streaming Exclusives · Streamly",
    description:
      "Browse exclusive movies and shows from Netflix, Disney+, Max, Prime Video, Apple TV+, Paramount+, and Hotstar.",
    url: "/exclusives",
  },
};

export default function ExclusivesPage() {
  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Streaming exclusives"
        subline="Originals from the big services, all in one place. Jump to a platform."
        meta={`${PROVIDERS.length} services`}
      >
        <nav aria-label="Platforms" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max divide-x divide-border border border-border">
            {PROVIDERS.map((p) => (
              <li key={p.slug}>
                <a
                  href={`#${p.slug}`}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm text-text-dim transition-colors hover:bg-white hover:text-bg"
                >
                  <img src={`${IMG}/w92${p.logo}`} alt="" width={20} height={20} loading="lazy" className="size-5 shrink-0" />
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {PROVIDERS.map((p) => (
        <ProviderRow key={p.slug} provider={p} variant="full" />
      ))}
    </div>
  );
}
