import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { ErrorPage } from "@/components/ErrorPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = `${SITE_NAME}: Watch movies, TV & anime`;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0a0a" },
      { title: TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "application-name", content: SITE_NAME },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: SITE_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no, address=no, email=no" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/opengraph-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Billboard trailers: warm up YouTube before the iframe mounts.
      { rel: "preconnect", href: "https://www.youtube-nocookie.com" },
      { rel: "preconnect", href: "https://i.ytimg.com" },
      { rel: "preconnect", href: "https://image.tmdb.org" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(websiteJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(orgJsonLd) },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => (
    <ErrorPage error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  pendingComponent: PageSkeleton,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-bg text-text">
        <AppShell>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </AppShell>
        <Scripts />
      </body>
    </html>
  );
}

/** Re-keys on every navigation so each page fades and settles into place. */
function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
