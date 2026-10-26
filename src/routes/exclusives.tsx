import { createFileRoute } from "@tanstack/react-router";
import { IMG } from "@/lib/tmdb";
import { ProviderRow, providerQuery } from "@/components/ProviderRow";
import { PageHeader } from "@/components/PageHeader";
import { PROVIDERS } from "@/lib/providers";

const DESCRIPTION =
  "Browse exclusive movies and shows from Netflix, Disney+, Max, Prime Video, Apple TV+, Paramount+, and Hotstar.";

/** Providers rendered before the fold: wait for these, stream the rest. */
const ABOVE_FOLD = 2;

export const Route = createFileRoute("/exclusives")({
  loader: async ({ context: { queryClient } }) => {
    const queries = PROVIDERS.flatMap((p) => [providerQuery("movie", p), providerQuery("tv", p)]);
    for (const query of queries.slice(ABOVE_FOLD * 2)) void queryClient.prefetchQuery(query);
    await Promise.all(queries.slice(0, ABOVE_FOLD * 2).map((query) => queryClient.ensureQueryData(query)));
  },
  head: () => ({
    meta: [
      { title: "Streaming Exclusives · Streamly" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Streaming Exclusives · Streamly" },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/exclusives" }],
  }),
  component: ExclusivesPage,
});

function ExclusivesPage() {
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
