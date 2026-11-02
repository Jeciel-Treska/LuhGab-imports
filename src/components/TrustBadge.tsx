import { useId } from "react";

interface TrustBadgeProps {
  className?: string;
}

const seal = "LUHGAB IMPORTS • 100% ORIGINAL & LACRADO • ";

export default function TrustBadge({ className = "" }: TrustBadgeProps) {
  const id = `trust-${useId().replace(/:/g, "")}`;

  return (
    <div
      role="img"
      aria-label="LuhGab Imports: 100% original e lacrado"
      className={`group inline-flex h-24 w-24 shrink-0 items-center justify-center transition-transform duration-500 hover:-rotate-6 hover:scale-105 ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5C158" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <path id={`${id}-path`} d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
        </defs>

        <circle cx="50" cy="50" r="48" fill="#070A11" stroke={`url(#${id}-gold)`} strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#DC2626"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        <text
          fill="#D4AF37"
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="1"
          className="font-sans"
        >
          <textPath href={`#${id}-path`} textLength="248" lengthAdjust="spacing">
            {seal}
          </textPath>
        </text>

        {/* Escudo com check de autenticidade */}
        <path
          d="M50 34 L63 38.5 V50 C63 58 57.5 63.5 50 67 C42.5 63.5 37 58 37 50 V38.5 Z"
          fill="#0B0B0F"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M44.5 50.5 L48.5 54.5 L55.5 46.5"
          fill="none"
          stroke="#DC2626"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
