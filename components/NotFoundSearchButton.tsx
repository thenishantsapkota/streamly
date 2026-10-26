import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/** Opens the global search overlay. */
export function NotFoundSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className="rounded-btn inline-flex items-center gap-2.5 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
    >
      <MagnifyingGlassIcon className="size-4" weight="bold" aria-hidden />
      Search titles
    </button>
  );
}
