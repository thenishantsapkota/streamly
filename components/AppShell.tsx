
import { Suspense } from "react";
import { usePathname } from "@/lib/router-compat";
import { Link } from "@/lib/router-compat";
import { Navbar } from "./Navbar";
import { Logo } from "./Logo";
import { RegisterSW } from "./RegisterSW";
import { SplashScreen } from "./SplashScreen";
import { BackToTop } from "./BackToTop";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { ToastContainer } from "./Toast";

const CHROMELESS_ROUTES = new Set(["/login"]);

const FOOTER_LINKS: { title: string; links: [string, string][] }[] = [
  {
    title: "Browse",
    links: [["/movies", "Films"], ["/tv", "Series"], ["/anime", "Anime"], ["/trending", "Trending"]],
  },
  {
    title: "Discover",
    links: [["/genre/action", "Action"], ["/genre/comedy", "Comedy"], ["/genre/drama", "Drama"], ["/country", "By country"]],
  },
  {
    title: "Categories",
    links: [["/movies/now-playing", "Now playing"], ["/movies/top-rated", "Top rated"], ["/tv/airing-today", "Airing today"], ["/exclusives", "Exclusives"]],
  },
  {
    title: "Yours",
    links: [["/my-list", "My list"], ["/history", "History"], ["/search", "Search"]],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_ROUTES.has(pathname);

  if (chromeless) return <>{children}</>;

  return (
    <>
      <SplashScreen />
      <RegisterSW />
      <KeyboardShortcuts />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main id="main-content" className="pt-16">{children}</main>
      <BackToTop />
      <ToastContainer />
      <footer className="mt-32 border-t border-border pb-24">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Logo size={32} />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-dim">
                Films, series and anime in one place, with your progress saved as you watch.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4 lg:col-span-7">
              {FOOTER_LINKS.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 text-white">{col.title}</h3>
                  <ul className="space-y-2.5">
                    {col.links.map(([href, label]) => (
                      <li key={href}>
                        <Link href={href} className="text-text-dim transition-colors hover:text-brand">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-text-dim sm:flex-row sm:items-center sm:justify-between">
            <p>
              Built by{" "}
              <a
                href="https://snishant.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline-offset-4 hover:underline"
              >
                Nishant
              </a>
            </p>
            <p className="max-w-xl sm:text-right">
              Personal, non-commercial project. Uses the TMDB and AniList APIs but is not endorsed or certified by either.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
