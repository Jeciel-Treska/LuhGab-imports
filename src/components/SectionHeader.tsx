import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  id: string;
  title: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}

export default function SectionHeader({
  id,
  title,
  href,
  linkLabel = "Ver todos",
  children,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 pb-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span aria-hidden className="h-7 w-1.5 rounded-sm bg-[#D4AF37]" />
        <h2 id={id} className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {children}
        {href && (
          <Link
            href={href}
            className="ml-auto inline-flex min-h-11 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] transition-colors duration-200 hover:text-[#E8D8B5]"
          >
            {linkLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div aria-hidden className="divider-gold mt-4 opacity-70" />
    </div>
  );
}
