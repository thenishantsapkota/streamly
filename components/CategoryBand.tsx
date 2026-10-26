import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { Link } from "@/lib/router-compat";
import { Reveal } from "./motion";

/**
 * Opens a category block on the home page: an oversized word with an amber
 * full stop, a short line and a link into the full category.
 */
export function CategoryBand({
  word,
  line,
  href,
  cta,
}: {
  word: string;
  line: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="relative mt-28 overflow-hidden border-t border-border px-4 pt-10 sm:px-6">
      <Reveal y={24}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[20vw] font-extrabold leading-[0.85] tracking-tight sm:text-[8rem] lg:text-[10rem]">
              {word}
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-text-dim sm:text-base">{line}</p>
          </div>
          <Link
            href={href}
            className="rounded-btn group inline-flex shrink-0 items-center gap-2 self-start bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98] sm:self-end"
          >
            {cta}
            <ArrowUpRightIcon
              className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              weight="bold"
              aria-hidden
            />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
