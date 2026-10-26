import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY } from "@/lib/brand-mark";
type Props = {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  showMark?: boolean;
  /** When true, the wordmark hides on screens smaller than `sm` (≤640px). */
  wordmarkResponsive?: boolean;
};

export function Logo({
  className = "text-sm",
  size = 28,
  showWordmark = true,
  showMark = true,
  wordmarkResponsive = false,
}: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showMark && (
        <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-label="Streamly"
        role="img"
      >
        <path d={MARK_BARS} fill={MARK_LIGHT} fillRule="evenodd" />
        <path d={MARK_PLAY} fill={MARK_ACCENT} stroke={MARK_ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
      )}
      {showWordmark && (
        <span
          className={`font-display font-bold tracking-[0.2em] ${wordmarkResponsive ? "hidden sm:inline" : ""}`}
        >
          STREAM<span className="text-brand">LY</span>
        </span>
      )}
    </span>
  );
}
