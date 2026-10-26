import { forwardRef, useMemo } from "react";
import { Link as RouterLink, useRouter as useTanstackRouter, useRouterState } from "@tanstack/react-router";

/**
 * Small layer over TanStack Router exposing the href-string APIs the
 * components were written against (Link href, router.push, usePathname,
 * useSearchParams). Search params are plain strings throughout; see
 * `parseSearch` / `stringifySearch` in src/router.tsx.
 */

function splitHref(href: string) {
  const url = new URL(href, "http://x");
  return {
    to: url.pathname,
    search: Object.fromEntries(url.searchParams),
    hash: url.hash ? url.hash.slice(1) : undefined,
  };
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Next-only options, accepted and ignored. */
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _prefetch, scroll = true, replace, ...rest },
  ref,
) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return <a ref={ref} href={href} {...rest} />;
  const { to, search, hash } = splitHref(href);
  return (
    <RouterLink
      ref={ref}
      to={to}
      search={search}
      hash={hash}
      replace={replace}
      resetScroll={scroll}
      preload="intent"
      {...rest}
    />
  );
});

export function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname });
}

/** Stable across renders until the query string actually changes (safe as an effect dependency). */
export function useSearchParams() {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export function useRouter() {
  const router = useTanstackRouter();
  return {
    push: (href: string, opts?: { scroll?: boolean }) =>
      router.navigate({ href, resetScroll: opts?.scroll ?? true }),
    replace: (href: string, opts?: { scroll?: boolean }) =>
      router.navigate({ href, replace: true, resetScroll: opts?.scroll ?? true }),
    back: () => router.history.back(),
    refresh: () => router.invalidate(),
  };
}
