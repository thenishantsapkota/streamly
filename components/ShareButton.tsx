
import { toast } from "./Toast";
import { ExportIcon } from "@phosphor-icons/react";

type Props = {
  title: string;
  text?: string;
  className?: string;
};

export function ShareButton({ title, text, className = "" }: Props) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy link", "info");
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share"
      className={`rounded-btn group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-text ring-1 ring-inset ring-white/25 transition duration-300 hover:bg-white hover:text-bg hover:ring-white active:scale-[0.98] ${className}`}
    >
      <ExportIcon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" weight="bold" aria-hidden />
      Share
    </button>
  );
}
