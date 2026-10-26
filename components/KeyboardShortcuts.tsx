
import { useEffect } from "react";
import { useRouter } from "@/lib/router-compat";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new Event("open-search"));
      }

      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur?.();
      }

      // Alt+H → Home
      if (e.altKey && e.key === "h") {
        e.preventDefault();
        router.push("/");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}
