import { ProviderRow } from "@/components/ProviderRow";
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
    <div className="mx-auto max-w-7xl">
      <header className="px-4 sm:px-6 pt-8 pb-2">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Streaming Exclusives</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-dim">
          Originals and exclusives from the major streaming services. Jump to a platform:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-dim hover:text-white hover:border-text-dim"
              style={{ borderColor: p.color + "40" }}
            >
              {p.name}
            </a>
          ))}
        </div>
      </header>

      {PROVIDERS.map((p) => (
        <ProviderRow key={p.slug} provider={p} variant="full" />
      ))}
    </div>
  );
}
