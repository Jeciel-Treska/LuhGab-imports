import type { ReactNode } from "react";
import { buildWhatsAppUrl } from "@/data/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

interface InfoPageProps {
  title: string;
  intro?: string;
  children: ReactNode;
  whatsappMessage?: string;
  whatsappLabel?: string;
}

/** Layout das páginas institucionais e legais. */
export default function InfoPage({
  title,
  intro,
  children,
  whatsappMessage,
  whatsappLabel = "Falar no WhatsApp",
}: InfoPageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white">
        {title}
      </h1>
      {intro && <p className="mt-3 text-base leading-relaxed text-zinc-400">{intro}</p>}
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-200 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      {whatsappMessage && (
        <a
          href={buildWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          <WhatsAppIcon className="h-4 w-4" aria-hidden />
          {whatsappLabel}
        </a>
      )}
    </article>
  );
}
