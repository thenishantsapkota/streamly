import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { Reveal, SplitTitle } from "@/components/motion";

const INPUT =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base text-text placeholder:text-text-dim/60 transition-colors focus:border-brand focus:outline-none focus:ring-0";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in · Streamly" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const sp = Route.useSearch();
  const nextParam = sp.next ?? "/";
  const errored = sp.error === "1";

  return (
    <div className="relative isolate grid min-h-dvh overflow-hidden lg:grid-cols-12">
      {/* Ambient amber light, low and to the left like a projector spill */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 bottom-[-30%] -z-10 size-[80vmax] bg-[radial-gradient(closest-side,rgb(240_162_59/0.16),transparent)]"
      />

      {/* Editorial panel */}
      <section className="relative flex flex-col justify-between gap-12 px-4 pb-10 pt-8 sm:px-10 sm:pt-10 lg:col-span-7 lg:border-r lg:border-border lg:px-14 lg:pb-14">
        <Reveal y={0}>
          <Logo size={32} />
        </Reveal>

        <div>
          <SplitTitle
            text="Your private screening room."
            className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-tighter sm:text-7xl xl:text-8xl"
          />
          <Reveal delay={0.35} y={12}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-text-dim sm:text-base">
              Films, series and anime in one place. Sign in to pick up where you left off.
            </p>
          </Reveal>
        </div>

        {/* Outlined wordmark ticker */}
        <div aria-hidden className="marquee -mx-4 hidden overflow-hidden sm:-mx-10 sm:block lg:-mx-14">
          <div className="marquee-track flex w-max">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0">
                {Array.from({ length: 4 }).map((__, i) => (
                  <span
                    key={i}
                    className="pr-10 font-display text-7xl font-extrabold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--color-border)] lg:text-8xl"
                  >
                    STREAMLY
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center px-4 pb-16 sm:px-10 lg:col-span-5 lg:px-14 lg:py-14">
        <Reveal delay={0.2} className="w-full max-w-sm lg:mx-auto">
          <div className="flex items-center gap-2 text-sm text-text-dim">
            <LockSimpleIcon className="size-4 text-brand" weight="bold" aria-hidden />
            Members only
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h2>

          <form method="POST" action="/api/login" className="mt-8 space-y-6">
            <input type="hidden" name="next" value={nextParam} />

            <label className="block">
              <span className="block text-xs font-medium text-text-dim">Username</span>
              <input
                name="username"
                required
                autoFocus
                autoComplete="username"
                className={INPUT}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-text-dim">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={INPUT}
              />
            </label>

            {errored && (
              <div role="alert" className="border-l-2 border-brand bg-brand/10 px-3 py-2.5 text-sm text-brand">
                Incorrect username or password.
              </div>
            )}

            <button
              type="submit"
              className="rounded-btn group flex w-full items-center justify-between bg-brand px-5 py-3.5 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
            >
              Sign in
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" aria-hidden />
            </button>

            <p className="text-xs text-text-dim">You will stay signed in for 30 days.</p>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
