import { useId } from "react";

type LogoSize = "small" | "medium" | "large";

interface LogoProps {
  size?: LogoSize;
  withWordmark?: boolean;
  className?: string;
}

const markSize: Record<LogoSize, string> = {
  small: "h-8 w-8",
  medium: "h-12 w-12",
  large: "h-20 w-20",
};

const wordmarkSize: Record<LogoSize, { name: string; sub: string }> = {
  small: { name: "text-sm", sub: "text-[0.5rem]" },
  medium: { name: "text-xl", sub: "text-xs" },
  large: { name: "text-4xl", sub: "text-xs" },
};

export default function Logo({ size = "medium", withWordmark = true, className = "" }: LogoProps) {
  const gradientId = `lg-gold-${useId().replace(/:/g, "")}`;

  return (
    <div
      className={`group inline-flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      role={withWordmark ? undefined : "img"}
      aria-label={withWordmark ? undefined : "LuhGab Imports"}
    >
      <svg
        viewBox="0 0 64 64"
        className={`${markSize[size]} shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]`}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5C158" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="#070A11" stroke={`url(#${gradientId})`} strokeWidth="1.5" />

        {/* L */}
        <path
          d="M22 16 V46 H40"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4.5"
          strokeLinejoin="miter"
        />

        {/* G entrelaçado com o L */}
        <path
          d="M45.96 23.64 A13 13 0 1 0 49 32 H40"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4.5"
        />

        {/* Acento rubi */}
        <path d="M32 52 L35 55 L32 58 L29 55 Z" fill="#DC2626" />
      </svg>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`${wordmarkSize[size].name} font-black tracking-tight text-zinc-100 transition-colors duration-300 group-hover:text-gold-300`}
          >
            LUHGAB
          </span>
          <span
            className={`${wordmarkSize[size].sub} mt-1 font-medium uppercase tracking-[0.35em] text-gold/80 transition-colors duration-300 group-hover:text-gold`}
          >
            IMPORTS
          </span>
        </span>
      )}
    </div>
  );
}
