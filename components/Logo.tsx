type Props = {
  className?: string;
  size?: number;
  showWordmark?: boolean;
};

export function Logo({ className = "", size = 28, showWordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-label="Streamly"
        role="img"
      >
        <defs>
          <linearGradient id="streamly-logo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1a22" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#streamly-logo-bg)" />
        <path
          d="M16 18 L30 32 L16 46"
          stroke="#e50914"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 18 L46 32 L32 46"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="font-bold text-xl tracking-tight">
          <span className="text-brand">Stream</span>ly
        </span>
      )}
    </span>
  );
}
