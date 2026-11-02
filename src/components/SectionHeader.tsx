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
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-200/80 pb-4">
      <span aria-hidden className="h-6 w-1.5 rounded-full bg-zinc-950" />
      <h2 id={id} className="font-display text-2xl font-black uppercase tracking-tight text-zinc-950 sm:text-3xl">
        {title}
      </h2>
      {children}
      {href && (
        <Link
          href={href}
          className="ml-auto inline-flex min-h-11 items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-900 transition hover:text-zinc-600"
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
