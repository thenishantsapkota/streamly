import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const nextParam = typeof sp.next === "string" ? sp.next : "/";
  const errored = sp.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center">
            <Logo size={36} />
          </div>
          <p className="mt-3 text-sm text-text-dim">Sign in to continue.</p>
        </div>

        <form
          method="POST"
          action="/api/login"
          className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-2xl"
        >
          <input type="hidden" name="next" value={nextParam} />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-dim">Username</span>
            <input
              name="username"
              required
              autoFocus
              autoComplete="username"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-white placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-dim">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-white placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-transparent"
            />
          </label>

          {errored && (
            <div className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-brand">
              Incorrect username or password.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            Sign in
          </button>

          <p className="pt-1 text-center text-[11px] text-text-dim">
            You'll stay signed in for 30 days.
          </p>
        </form>
      </div>
    </div>
  );
}
