import { Link } from "@/lib/router-compat";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, SplitTitle } from "@/components/motion";
import { NotFoundSearchButton } from "./NotFoundSearchButton";

export function NotFoundPage() {
  return (
    <div className="relative isolate mx-auto flex min-h-[75vh] max-w-7xl flex-col justify-center overflow-hidden px-4 py-16 sm:px-6">
      <Reveal y={0} className="pointer-events-none absolute -right-4 top-1/2 -z-10 -translate-y-1/2 select-none sm:right-0">
        <span
          aria-hidden
          className="numeral-outline font-display text-[11rem] font-extrabold leading-none tracking-tighter opacity-40 sm:text-[18rem] lg:text-[24rem]"
        >
          404
        </span>
      </Reveal>

      <Reveal y={12}>
        <div className="flex items-center gap-3 tabular-nums text-xs text-text-dim">
          <span aria-hidden className="h-px w-10 bg-brand" />
          Error 404
        </div>
      </Reveal>
      <SplitTitle
        text="This scene was cut."
        delay={0.1}
        className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-7xl lg:text-8xl"
      />
      <Reveal delay={0.3} y={12}>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-text-dim sm:text-base">
          The page you wanted does not exist or has moved. Search for the title instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <NotFoundSearchButton />
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
          >
            <HouseIcon className="size-4" weight="bold" aria-hidden />
            Home
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
