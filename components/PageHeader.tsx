import { Reveal, SplitTitle } from "./motion";

type Props = {
  title: string;
  /** Short plain-language line under the title. */
  subline?: React.ReactNode;
  /** Small tabular metadata shown on the right, e.g. a count. */
  meta?: React.ReactNode;
  /** Optional row under the header, e.g. category tabs or actions. */
  children?: React.ReactNode;
};

/**
 * Editorial page header: oversized display title that rises word by word,
 * a dim subline, and a hairline that draws in underneath.
 */
export function PageHeader({ title, subline, meta, children }: Props) {
  return (
    <header className="px-4 pb-10 sm:px-6 sm:pb-12">
      <SplitTitle
        text={title}
        className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl"
      />
      {(subline || meta) && (
        <Reveal delay={0.2} y={12} className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          {subline && <p className="max-w-xl text-sm leading-relaxed text-text-dim sm:text-base">{subline}</p>}
          {meta && <div className="tabular-nums text-xs text-text-dim">{meta}</div>}
        </Reveal>
      )}
      <Reveal delay={0.3} y={0} className="mt-6">
        <div className="relative h-px bg-border">
          <span aria-hidden className="absolute left-0 top-0 h-px w-16 bg-brand" />
        </div>
      </Reveal>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
