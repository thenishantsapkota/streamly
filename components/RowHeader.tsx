import { Link } from "@/lib/router-compat";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./motion";

/** Section title, a hairline that fills the gap, and an optional "See all" link. */
export function RowHeader({ title, href }: { title: string; href?: string }) {
  return (
    <Reveal y={16} className="mb-4 flex items-end gap-4 px-4 sm:px-6">
      <h2 className="shrink-0 text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
      <span aria-hidden className="mb-2 h-px flex-1 bg-border" />
      {href && (
        <Link
          href={href}
          className="group/link mb-0.5 inline-flex shrink-0 items-center gap-1 text-sm text-text-dim transition-colors hover:text-brand"
        >
          See all
          <ArrowUpRightIcon
            className="size-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            weight="bold"
            aria-hidden
          />
        </Link>
      )}
    </Reveal>
  );
}
